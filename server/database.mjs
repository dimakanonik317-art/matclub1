import { ApiError } from "./http.mjs";
import { applyGrant } from "./account-grant.mjs";

const schema = [
  `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, login TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, salt TEXT NOT NULL, name TEXT NOT NULL DEFAULT '', grade INTEGER NOT NULL DEFAULT 7, created_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id)`,
  `CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at)`,
  `CREATE TABLE IF NOT EXISTS progress (user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, revision INTEGER NOT NULL DEFAULT 0, document TEXT NOT NULL DEFAULT '{}', updated_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS limits (key TEXT PRIMARY KEY, hits INTEGER NOT NULL, expires_at INTEGER NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS limits_expiry ON limits(expires_at)`,
];
const states = new WeakMap();
const clock = () => Math.floor(Date.now() / 1000);

// Share initialization across concurrent requests. Failed initialization backs off
// per isolate; the next request after the cooldown retries, without a redeploy.
export async function init(db) {
  let state = states.get(db);
  if (!state) {
    state = { promise: null, retryAt: 0, ready: false, cleanupAt: 0 };
    states.set(db, state);
  }
  if (clock() < state.retryAt) {
    throw new ApiError(503, "База временно недоступна. Попробуй позже.", {
      "retry-after": String(Math.max(1, state.retryAt - clock())),
    });
  }
  if (!state.promise) {
    state.promise = Promise.resolve()
      .then(async () => {
        await db.batch(schema.map((sql) => db.prepare(sql)));
        await applyGrant(db);
        state.ready = true;
      })
      .catch((error) => {
        state.promise = null;
        state.retryAt = clock() + 15;
        throw error;
      });
  }
  await state.promise;
}

// Separate dependency readiness from Worker liveness. This is a read-only probe,
// coalesced and cached for five seconds per isolate, with a two-second deadline.
const probes = new WeakMap();
export async function readiness(db, timeoutMs = 2000) {
  if (!db) return false;
  let probe = probes.get(db);
  if (probe && Date.now() < probe.expires) return probe.promise;
  probe = { expires: Infinity, promise: null };
  probes.set(db, probe);
  probe.promise = (async () => {
    let timer;
    try {
      const row = await Promise.race([
        Promise.resolve().then(() =>
          db
            .prepare(
              `SELECT
          (SELECT count(*) FROM users WHERE 0) AS users,
          (SELECT count(*) FROM sessions WHERE 0) AS sessions,
          (SELECT count(*) FROM progress WHERE 0) AS progress,
          (SELECT count(*) FROM limits WHERE 0) AS limits`,
            )
            .first(),
        ),
        new Promise((_, reject) => {
          timer = setTimeout(
            () => reject(Error("readiness timeout")),
            timeoutMs,
          );
        }),
      ]);
      return !!row;
    } catch {
      return false;
    } finally {
      clearTimeout(timer);
      probe.expires = Date.now() + 5000;
    }
  })();
  return probe.promise;
}

export function cleanup(db, ctx) {
  const state = db && states.get(db);
  if (!state?.ready || !ctx?.waitUntil || clock() < state.cleanupAt) return;
  state.cleanupAt = clock() + 900;
  const retry = () => {
    state.cleanupAt = clock() + 60;
  };
  try {
    ctx.waitUntil(
      Promise.resolve()
        .then(() =>
          db.batch([
            db
              .prepare(
                "DELETE FROM sessions WHERE token_hash IN (SELECT token_hash FROM sessions WHERE expires_at<=? LIMIT 200)",
              )
              .bind(clock()),
            db
              .prepare(
                "DELETE FROM limits WHERE key IN (SELECT key FROM limits WHERE expires_at<=? LIMIT 200)",
              )
              .bind(clock()),
          ]),
        )
        .catch(retry),
    );
  } catch {
    retry();
  }
}
