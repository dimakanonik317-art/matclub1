import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import worker from "../server/worker.mjs";
import { init, readiness, cleanup } from "../server/database.mjs";
import { answer } from "../server/assistant.mjs";

const sql = new DatabaseSync(":memory:");
sql.exec("PRAGMA foreign_keys=ON");
let beforeRun;
class Statement {
  constructor(query, args = []) {
    this.query = query;
    this.args = args;
  }
  bind(...args) {
    return new Statement(this.query, args);
  }
  async first() {
    return sql.prepare(this.query).get(...this.args) || null;
  }
  async run() {
    beforeRun?.(this.query);
    return {
      meta: { changes: sql.prepare(this.query).run(...this.args).changes },
    };
  }
}
const DB = {
  prepare: (query) => new Statement(query),
  async batch(statements) {
    sql.exec("BEGIN");
    try {
      const results = [];
      for (const statement of statements) results.push(await statement.run());
      sql.exec("COMMIT");
      return results;
    } catch (error) {
      sql.exec("ROLLBACK");
      throw error;
    }
  },
};
const env = {
  DB,
  ASSETS: {
    fetch: async () =>
      new Response("<head></head>", {
        headers: {
          "content-type": "text/html",
          etag: "static",
          "last-modified": "yesterday",
          vary: "Accept-Encoding",
        },
      }),
  },
};
async function call(path, method = "GET", data, token) {
  const headers = {
    origin: "https://school.test",
    "content-type": "application/json",
    "CF-Connecting-IP": "test",
  };
  if (token) headers.cookie = "__Host-matclub_session=" + token;
  const response = await worker.fetch(
    new Request("https://school.test" + path, {
      method,
      headers,
      ...(data ? { body: JSON.stringify(data) } : {}),
    }),
    env,
  );
  const body = await response.json();
  return {
    response,
    body,
    token: response.headers
      .get("set-cookie")
      ?.match(/session=([a-f0-9]+)/)?.[1],
  };
}
const password = "backend-test-passphrase";
const originalNow = Date.now;
try {
  const registration = await call("/api/register", "POST", {
    login: "backenduser",
    password,
  });
  assert.equal(registration.response.status, 201);
  const user = registration.body.user.id;
  let token = registration.token;
  const data = { "matclub-workbook": "{}", "matclub-solved": '["task-1"]' };
  const first = await call(
    "/api/progress",
    "PUT",
    { revision: 0, data },
    token,
  );
  assert.equal(first.response.status, 200);
  const retry = await call(
    "/api/progress",
    "PUT",
    { revision: 0, data: Object.fromEntries(Object.entries(data).reverse()) },
    token,
  );
  assert.equal(retry.response.status, 200);
  assert.deepEqual(retry.body, first.body);
  assert.equal(
    (await call("/api/progress", "PUT", { revision: 0, data: {} }, token))
      .response.status,
    409,
  );
  assert.equal(
    (
      await call(
        "/api/progress",
        "PUT",
        { revision: Number.MAX_SAFE_INTEGER, data },
        token,
      )
    ).response.status,
    400,
  );
  const duplicates = await Promise.all(
    [1, 2].map(() =>
      call("/api/progress", "PUT", { revision: 1, data }, token),
    ),
  );
  assert.deepEqual(
    duplicates.map((x) => x.response.status),
    [200, 200],
  );
  assert.equal(
    (await call("/api/progress", "GET", null, token)).body.revision,
    2,
  );

  // Revoke after session lookup, immediately before the write. No endpoint may
  // commit using the stale identity, including password/account operations.
  for (const mode of ["revoke", "expire"]) {
    for (const [path, method, body, prefix, expected] of [
      [
        "/api/profile",
        "PUT",
        { name: "stale name", grade: 8 },
        "UPDATE users SET name=",
        401,
      ],
      [
        "/api/progress",
        "PUT",
        { revision: 2, data: {} },
        "UPDATE progress SET revision=",
        401,
      ],
      [
        "/api/password",
        "POST",
        { currentPassword: password, password: "changed-test-password" },
        "UPDATE users SET password_hash=",
        409,
      ],
      ["/api/account", "DELETE", { password }, "DELETE FROM users", 409],
    ]) {
      token = (
        await call("/api/login", "POST", { login: "backenduser", password })
      ).token;
      assert.ok(token);
      const oldHash = sql
        .prepare("SELECT password_hash FROM users WHERE id=?")
        .get(user).password_hash;
      beforeRun = (query) => {
        if (!query.startsWith(prefix)) return;
        beforeRun = null;
        if (mode === "revoke")
          sql.prepare("DELETE FROM sessions WHERE user_id=?").run(user);
        else
          sql
            .prepare("UPDATE sessions SET expires_at=0 WHERE user_id=?")
            .run(user);
      };
      const result = await call(path, method, body, token);
      assert.equal(result.response.status, expected, `${mode} ${path}`);
      assert.equal(
        sql.prepare("SELECT password_hash FROM users WHERE id=?").get(user)
          .password_hash,
        oldHash,
      );
      assert.equal(
        sql.prepare("SELECT name FROM users WHERE id=?").get(user).name,
        "",
      );
      assert.equal(
        sql.prepare("SELECT revision FROM progress WHERE user_id=?").get(user)
          .revision,
        2,
      );
    }
  }

  assert.equal((await call("/api/ready")).response.status, 200);
  const head = await worker.fetch(
    new Request("https://school.test/", { method: "HEAD" }),
    env,
  );
  assert.equal(head.headers.get("cache-control"), "private, no-store");
  assert.match(head.headers.get("vary"), /Accept-Encoding/);
  assert.match(head.headers.get("vary"), /Cookie/);
  assert.equal(head.headers.get("etag"), null);
  assert.equal(head.headers.get("last-modified"), null);
  assert.equal(await head.text(), "");

  // One initialization per concurrent cohort; bounded failure retry and recovery.
  let batches = 0,
    broken = true;
  const flapping = {
    prepare: DB.prepare,
    async batch(statements) {
      batches++;
      if (broken) throw Error("database unavailable");
      return DB.batch(statements);
    },
  };
  const attempts = await Promise.allSettled(
    Array.from({ length: 20 }, () => init(flapping)),
  );
  assert.ok(attempts.every((r) => r.status === "rejected"));
  assert.equal(batches, 1);
  await assert.rejects(init(flapping), (e) => e.status === 503);
  assert.equal(batches, 1);
  let time = originalNow() + 16000;
  Date.now = () => time;
  broken = false;
  await Promise.all(Array.from({ length: 20 }, () => init(flapping)));
  assert.equal(batches, 2);

  let probes = 0;
  const stuck = {
    prepare() {
      probes++;
      return { first: () => new Promise(() => {}) };
    },
  };
  assert.deepEqual(
    await Promise.all(Array.from({ length: 20 }, () => readiness(stuck, 10))),
    Array(20).fill(false),
  );
  assert.equal(probes, 1);
  await readiness(stuck, 10);
  assert.equal(probes, 1);
  time += 6000;
  stuck.prepare = () => {
    probes++;
    return { first: async () => ({ ok: 1 }) };
  };
  assert.equal(await readiness(stuck, 10), true);
  assert.equal(probes, 2);
  assert.equal(await readiness(undefined), false);

  // Expired rows are cleaned in bounded batches; a synchronous DB failure is
  // caught by waitUntil and does not escape the request lifecycle.
  for (let n = 0; n < 250; n++)
    sql.prepare("INSERT INTO limits VALUES (?,1,0)").run("expired-" + n);
  const pending = [];
  cleanup(DB, { waitUntil: (promise) => pending.push(promise) });
  await Promise.all(pending);
  assert.equal(
    sql.prepare("SELECT count(*) n FROM limits WHERE expires_at=0").get().n,
    50,
  );
  cleanup(DB, { waitUntil: (promise) => pending.push(promise) });
  assert.equal(pending.length, 1);

  const cleanupJobs = [];
  flapping.batch = () => { throw Error("temporary cleanup failure"); };
  cleanup(flapping, {waitUntil: promise => cleanupJobs.push(promise)});
  await Promise.all(cleanupJobs);
  cleanup(flapping, {waitUntil: promise => cleanupJobs.push(promise)});
  assert.equal(cleanupJobs.length, 1);
  time += 61000;
  flapping.batch = DB.batch;
  cleanup(flapping, {waitUntil: promise => cleanupJobs.push(promise)});
  await Promise.all(cleanupJobs);
  assert.equal(cleanupJobs.length, 2);
  assert.equal(sql.prepare("SELECT count(*) n FROM limits WHERE expires_at=0").get().n, 0);

  // A primary response arriving after timeout must not start a paid fallback.
  let rejectPrimary,
    invocations = 0;
  const late = answer(
    {
      run() {
        invocations++;
        return new Promise((_, reject) => {
          rejectPrimary = reject;
        });
      },
    },
    [],
    10,
  );
  await assert.rejects(late, /timeout/);
  rejectPrimary(Error("model not found"));
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.equal(invocations, 1);
  console.log(
    "PASS: lost-response retry, simultaneous identical saves, stale conflict, revoked/expired write guards, HEAD privacy, readiness deadlines/coalescing/recovery, initialization backoff, bounded cleanup, no late AI fallback.",
  );
} finally {
  beforeRun = null;
  Date.now = originalNow;
  sql.close();
}
