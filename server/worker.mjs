import { ApiError, fail, json, readJson, finish } from "./http.mjs";
export const SERVER_VERSION = "backend-2026-11-11.2.1";
import { init, cleanup, readiness } from "./database.mjs";
import { mark } from "./account-grant.mjs";
import { messages, answer, MODEL, AI_LIMITS } from "./assistant.mjs";
const COOKIE = "__Host-matclub_session",
  TTL = 30 * 86400,
  ITERATIONS = 100000,
  LIMIT = 1024 * 1024;
export const KEYS = [
  "matclub-saved",
  "matclub-solved",
  "matclub-workbook",
  "matclub-python-v1",
  "matclub-cpp-v1",
  "matclub-laboratory-v1",
  "matclub-settings-v1",
  "matclub-graphs-v1",
];
const now = () => Math.floor(Date.now() / 1000),
  enc = new TextEncoder();
const hex = (bytes) =>
  Array.from(new Uint8Array(bytes), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
const unhex = (s) =>
  Uint8Array.from(s.match(/../g) || [], (b) => parseInt(b, 16));
const random = (n = 32) => hex(crypto.getRandomValues(new Uint8Array(n)));
async function digest(s) {
  return hex(await crypto.subtle.digest("SHA-256", enc.encode(s)));
}
async function passwordHash(password, salt) {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return hex(
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: unhex(salt),
        iterations: ITERATIONS,
        hash: "SHA-256",
      },
      key,
      256,
    ),
  );
}
function equal(a, b) {
  let mismatch = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++)
    mismatch |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return mismatch === 0;
}
function cookie(token, maxAge = TTL) {
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}
function body(request) {
  const path = new URL(request.url).pathname,
    limit =
      path === "/api/progress"
        ? LIMIT + 4096
        : path === "/api/assistant"
          ? 131072
          : 24000;
  return readJson(request, limit);
}
function credentials(data) {
  const login =
    typeof data.login === "string" ? data.login.trim().toLowerCase() : "";
  if (!/^[a-z0-9_]{3,24}$/.test(login))
    fail(400, "Логин: 3–24 латинских буквы, цифры или _.");
  const password = data.password;
  if (
    typeof password !== "string" ||
    password.length < 10 ||
    password.length > 128
  )
    fail(400, "Пароль: от 10 до 128 символов.");
  return { login, password };
}
function profile(data) {
  const name = typeof data.name === "string" ? data.name.trim() : "";
  if (name.length > 60 || /[\u0000-\u001f]/.test(name))
    fail(400, "Имя: до 60 символов.");
  const grade = Number(data.grade ?? 7);
  if (!Number.isInteger(grade) || grade < 6 || grade > 11)
    fail(400, "Выбери класс с 6 по 11.");
  return { name, grade };
}
async function userView(row, db) {
  return {
    ...(await mark(db, row.id)),
    id: row.id,
    login: row.login,
    name: row.name,
    grade: row.grade,
    createdAt: row.created_at,
  };
}
async function rate(
  db,
  kind,
  identity,
  max,
  period,
  message = "Лимит запросов достигнут. Попробуй позже.",
) {
  const bucket = Math.floor(now() / period),
    key = await digest(`${kind}:${identity}:${bucket}`);
  const r = await db
    .prepare(
      "INSERT INTO limits (key,hits,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET hits=hits+1 RETURNING hits",
    )
    .bind(key, (bucket + 2) * period)
    .first();
  if (r.hits > max)
    throw new ApiError(429, message, {
      "retry-after": String((bucket + 1) * period - now()),
    });
}
async function session(request, db) {
  const token = request.headers
    .get("cookie")
    ?.split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(COOKIE + "="))
    ?.slice(COOKIE.length + 1);
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  return db
    .prepare(
      "SELECT users.*,sessions.token_hash FROM sessions JOIN users ON users.id=sessions.user_id WHERE token_hash=? AND expires_at>?",
    )
    .bind(await digest(token), now())
    .first();
}
async function requireUser(request, db) {
  const u = await session(request, db);
  if (!u) fail(401, "Войди в аккаунт.");
  return u;
}
async function createSession(db, id, expectedHash) {
  const token = random(),
    result = await db
      .prepare(
        "INSERT INTO sessions (token_hash,user_id,expires_at) SELECT ?,id,? FROM users WHERE id=? AND password_hash=?",
      )
      .bind(await digest(token), now() + TTL, id, expectedHash)
      .run();
  if (!result.meta.changes)
    fail(401, "Данные входа изменились. Войди ещё раз.");
  return token;
}
function validateDocument(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    fail(400, "Неверный формат прогресса.");
  const out = {};
  for (const [key, text] of Object.entries(value).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    if (!KEYS.includes(key) || typeof text !== "string")
      fail(400, "Неизвестные данные прогресса.");
    try {
      JSON.parse(text, (key, value) => {
        if (["__proto__", "prototype", "constructor"].includes(key))
          throw Error();
        return value;
      });
    } catch {
      fail(400, "Повреждённые данные прогресса.");
    }
    out[key] = text;
  }
  const document = JSON.stringify(out);
  if (enc.encode(document).length > LIMIT)
    fail(413, "Прогресс превышает 1 МБ. Скачай и сократи большие черновики.");
  return document;
}
async function api(request, env, ctx) {
  const path = new URL(request.url).pathname,
    method = request.method;
  if (path === "/api/health") {
    if (!["GET", "HEAD"].includes(method))
      throw new ApiError(405, "Метод запроса не поддерживается.", {
        allow: "GET, HEAD",
      });
    return json({ status: "ok", scope: "worker", version: SERVER_VERSION });
  }
  if (path === "/api/ready") {
    if (!["GET", "HEAD"].includes(method))
      throw new ApiError(405, "Метод запроса не поддерживается.", {
        allow: "GET, HEAD",
      });
    const ready = await readiness(env.DB);
    return json(
      {
        status: ready ? "ok" : "unavailable",
        scope: "database",
        version: SERVER_VERSION,
      },
      ready ? 200 : 503,
      ready ? {} : { "retry-after": "5" },
    );
  }
  const routes = {
    "/api/me": ["GET"],
    "/api/assistant": ["GET", "POST"],
    "/api/register": ["POST"],
    "/api/login": ["POST"],
    "/api/logout": ["POST"],
    "/api/profile": ["PUT"],
    "/api/password": ["POST"],
    "/api/account": ["DELETE"],
    "/api/progress": ["GET", "PUT"],
  };
  if (!routes[path]) fail(404, "Метод API не найден.");
  if (!routes[path].includes(method))
    throw new ApiError(405, "Метод запроса не поддерживается.", {
      allow: routes[path].join(", "),
    });

  if (!env.DB)
    return json(
      {
        error: "Личный кабинет готовится: база данных ещё не подключена.",
        ready: false,
      },
      503,
    );
  if (!["GET", "HEAD"].includes(method)) {
    const origin = request.headers.get("origin");
    if (
      origin !== new URL(request.url).origin ||
      request.headers.get("sec-fetch-site") === "cross-site"
    )
      fail(403, "Запрос с другого сайта отклонён.");
  }
  await init(env.DB);
  const db = env.DB,
    ip = request.headers.get("CF-Connecting-IP") || "unknown";
  if (path === "/api/assistant" && method === "GET")
    return json({
      ready: !!env.AI,
      model: MODEL,
      modelLabel: "Gemma 4",
      limits: AI_LIMITS,
    });
  if (path === "/api/assistant" && method === "POST") {
    if (!env.AI) fail(503, "ИИ-помощник пока не подключён.");
    const data = await body(request);
    let input;
    try {
      input = messages(data);
    } catch (e) {
      fail(400, e.message);
    }
    const u = await session(request, db);
    await rate(
      db,
      "ai-burst",
      u?.id || ip,
      AI_LIMITS.burst,
      AI_LIMITS.burstSeconds,
      "Слишком много вопросов подряд. Дай помощнику небольшую паузу.",
    );
    await rate(
      db,
      "ai-daily",
      u?.id || ip,
      u ? AI_LIMITS.accountDaily : AI_LIMITS.guestDaily,
      86400,
      "Достигнут суточный лимит вопросов " +
        (u
          ? "аккаунта."
          : "гостя. После входа в кабинет доступно больше вопросов."),
    );
    await rate(
      db,
      "ai-total",
      "site",
      AI_LIMITS.siteDaily,
      86400,
      "Суточный запас запросов сайта исчерпан. Он обновится после 03:00 по Минску.",
    );
    try {
      return json(await answer(env.AI, input));
    } catch (e) {
      const message = String(e.message).toLowerCase();
      if (/terms|agreement|not enabled|activation/.test(message))
        fail(
          503,
          "Нужно активировать Workers AI в панели Cloudflare владельца сайта.",
        );
      if (/quota|neurons|allocation|daily/.test(message))
        throw new ApiError(
          429,
          "Общая суточная квота Cloudflare AI исчерпана. Смена модели её не увеличивает; обновление после 03:00 по Минску.",
          { "retry-after": String(86400 - (now() % 86400)) },
        );
      if (/rate.?limit|429|too many|busy/.test(message))
        throw new ApiError(
          429,
          "ИИ-сервис сейчас перегружен. Повтори вопрос немного позже.",
          { "retry-after": "60" },
        );
      fail(503, "ИИ-сервис временно недоступен. Попробуй позже.");
    }
  }
  if (path === "/api/me" && method === "GET") {
    const u = await session(request, db);
    return json({ ready: true, user: u ? await userView(u, db) : null });
  }
  if (path === "/api/register" && method === "POST") {
    await rate(db, "register", ip, 5, 3600);
    const data = await body(request),
      { login, password } = credentials(data),
      p = profile(data),
      salt = random(16),
      id = crypto.randomUUID(),
      hash = await passwordHash(password, salt),
      token = random(),
      tokenHash = await digest(token);
    // batch is atomic: a duplicate login cannot leave an orphan progress row.
    try {
      await db.batch([
        db
          .prepare(
            "INSERT INTO users (id,login,password_hash,salt,name,grade,created_at) VALUES (?,?,?,?,?,?,?)",
          )
          .bind(id, login, hash, salt, p.name, p.grade, now()),
        db
          .prepare("INSERT INTO progress (user_id,updated_at) VALUES (?,?)")
          .bind(id, now()),
        db
          .prepare(
            "INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (?,?,?)",
          )
          .bind(tokenHash, id, now() + TTL),
      ]);
    } catch (e) {
      if (String(e).includes("UNIQUE")) fail(409, "Этот логин уже занят.");
      throw e;
    }
    return json({ user: { id, login, ...p, createdAt: now() } }, 201, {
      "set-cookie": cookie(token),
    });
  }
  if (path === "/api/login" && method === "POST") {
    await rate(db, "login-ip", ip, 30, 600);
    const data = await body(request),
      { login, password } = credentials(data);
    await rate(db, "login-name", login, 20, 600);
    const u = await db
      .prepare("SELECT * FROM users WHERE login=?")
      .bind(login)
      .first();
    const hash = await passwordHash(
      password,
      u?.salt || "00000000000000000000000000000000",
    );
    if (!u || !equal(hash, u.password_hash))
      fail(401, "Неверный логин или пароль.");
    const token = await createSession(db, u.id, u.password_hash);
    return json({ user: await userView(u, db) }, 200, {
      "set-cookie": cookie(token),
    });
  }
  if (path === "/api/logout" && method === "POST") {
    const u = await session(request, db);
    if (u)
      await db
        .prepare("DELETE FROM sessions WHERE token_hash=?")
        .bind(u.token_hash)
        .run();
    return json({ ok: true }, 200, { "set-cookie": cookie("", 0) });
  }
  if (path === "/api/profile" && method === "PUT") {
    const u = await requireUser(request, db),
      p = profile(await body(request));
    await rate(db, "profile", u.id, 120, 600);
    const result = await db
      .prepare(
        "UPDATE users SET name=?,grade=? WHERE id=? AND EXISTS (SELECT 1 FROM sessions WHERE token_hash=? AND user_id=users.id AND expires_at>?)",
      )
      .bind(p.name, p.grade, u.id, u.token_hash, now())
      .run();
    if (!result.meta.changes) fail(401, "Аккаунт недоступен. Войди ещё раз.");
    return json({ user: await userView({ ...u, ...p }, db) });
  }
  if (path === "/api/password" && method === "POST") {
    const u = await requireUser(request, db);
    await rate(db, "password", u.id, 5, 600);
    const data = await body(request);
    if (
      typeof data.currentPassword !== "string" ||
      data.currentPassword.length > 128 ||
      !equal(await passwordHash(data.currentPassword, u.salt), u.password_hash)
    )
      fail(401, "Текущий пароль неверен.");
    const { password } = credentials({
        login: u.login,
        password: data.password,
      }),
      salt = random(16),
      hash = await passwordHash(password, salt),
      token = random(),
      tokenHash = await digest(token);
    const result = await db.batch([
      db
        .prepare(
          "UPDATE users SET password_hash=?,salt=? WHERE id=? AND password_hash=? AND EXISTS (SELECT 1 FROM sessions WHERE token_hash=? AND user_id=users.id AND expires_at>?)",
        )
        .bind(hash, salt, u.id, u.password_hash, u.token_hash, now()),
      db
        .prepare(
          "DELETE FROM sessions WHERE user_id=? AND EXISTS (SELECT 1 FROM users WHERE id=? AND password_hash=?)",
        )
        .bind(u.id, u.id, hash),
      db
        .prepare(
          "INSERT INTO sessions (token_hash,user_id,expires_at) SELECT ?,id,? FROM users WHERE id=? AND password_hash=?",
        )
        .bind(tokenHash, now() + TTL, u.id, hash),
    ]);
    if (!result[0].meta.changes)
      fail(409, "Пароль уже изменён другим запросом. Войди ещё раз.");
    return json({ ok: true }, 200, { "set-cookie": cookie(token) });
  }
  if (path === "/api/account" && method === "DELETE") {
    const u = await requireUser(request, db);
    await rate(db, "delete", u.id, 5, 600);
    const data = await body(request);
    if (
      typeof data.password !== "string" ||
      data.password.length > 128 ||
      !equal(await passwordHash(data.password, u.salt), u.password_hash)
    )
      fail(401, "Пароль неверен.");
    const result = await db
      .prepare(
        "DELETE FROM users WHERE id=? AND password_hash=? AND EXISTS (SELECT 1 FROM sessions WHERE token_hash=? AND user_id=users.id AND expires_at>?)",
      )
      .bind(u.id, u.password_hash, u.token_hash, now())
      .run();
    if (!result.meta.changes)
      fail(409, "Данные аккаунта изменились. Войди ещё раз перед удалением.");
    return json({ ok: true }, 200, { "set-cookie": cookie("", 0) });
  }
  if (path === "/api/progress" && method === "GET") {
    const u = await requireUser(request, db),
      p = await db
        .prepare(
          "SELECT revision,document,updated_at FROM progress WHERE user_id=?",
        )
        .bind(u.id)
        .first();
    if (!p) fail(503, "Не удалось загрузить прогресс. Повтори попытку.");
    return json({
      revision: p.revision,
      data: JSON.parse(p.document),
      updatedAt: p.updated_at,
    });
  }
  if (path === "/api/progress" && method === "PUT") {
    const u = await requireUser(request, db);
    await rate(db, "sync", u.id, 120, 600);
    const data = await body(request);
    if (
      !Number.isSafeInteger(data.revision) ||
      data.revision < 0 ||
      data.revision === Number.MAX_SAFE_INTEGER
    )
      fail(400, "Неверная версия прогресса.");
    const document = validateDocument(data.data),
      updatedAt = now();
    const result = await db
      .prepare(
        "UPDATE progress SET revision=revision+1,document=?,updated_at=? WHERE user_id=? AND revision=? AND EXISTS (SELECT 1 FROM sessions WHERE token_hash=? AND user_id=progress.user_id AND expires_at>?)",
      )
      .bind(document, updatedAt, u.id, data.revision, u.token_hash, now())
      .run();
    if (result.meta.changes)
      return json({ revision: data.revision + 1, updatedAt });
    // A lost success response may cause an identical retry. Acknowledge only the
    // immediately following revision, and only while this session is still valid.
    const current = await db
      .prepare(
        "SELECT revision,document,updated_at FROM progress WHERE user_id=? AND EXISTS (SELECT 1 FROM sessions WHERE token_hash=? AND user_id=progress.user_id AND expires_at>?)",
      )
      .bind(u.id, u.token_hash, now())
      .first();
    if (!current) fail(401, "Сессия завершилась. Войди ещё раз.");
    if (current.revision === data.revision + 1 && current.document === document)
      return json({
        revision: current.revision,
        updatedAt: current.updated_at,
      });
    return json(
      {
        error:
          "Прогресс изменён на другом устройстве. Выбери версию в кабинете.",
        conflict: true,
      },
      409,
    );
  }
  fail(404, "Метод API не найден.");
}
function hasSessionCookie(request) {
  return /(?:^|;\s*)__Host-matclub_session=[a-f0-9]{64}(?:;|$)/.test(
    request.headers.get("cookie") || "",
  );
}
async function page(request, env) {
  const response = await env.ASSETS.fetch(request),
    path = new URL(request.url).pathname;
  if (
    !["/", "/index.html"].includes(path) ||
    !response.headers.get("content-type")?.includes("text/html")
  )
    return response;
  const headers = new Headers(response.headers);
  headers.set("cache-control", "private, no-store");
  headers.append("vary", "Cookie");
  headers.delete("etag");
  headers.delete("last-modified");
  headers.delete("content-length");
  if (request.method === "HEAD")
    return new Response(null, { status: response.status, headers });
  let boot = { ready: false, user: null };
  let bootTimer;
  try {
    if (env.DB && !hasSessionCookie(request)) {
      boot = { ready: true, user: null };
    } else if (env.DB) {
      const ready = await Promise.race([
        (async () => {
          await init(env.DB);
          const u = await session(request, env.DB);
          const state = {
            ready: true,
            user: u ? await userView(u, env.DB) : null,
          };
          if (u) {
            const p = await env.DB.prepare(
              "SELECT revision,document,updated_at FROM progress WHERE user_id=?",
            )
              .bind(u.id)
              .first();
            state.progress = {
              revision: p.revision,
              data: JSON.parse(p.document),
              updatedAt: p.updated_at,
            };
          }
          return state;
        })(),
        new Promise((_, reject) => {
          bootTimer = setTimeout(
            () => reject(Error("bootstrap timeout")),
            3500,
          );
        }),
      ]);
      boot = ready;
    }
  } catch {
  } finally {
    clearTimeout(bootTimer);
  }
  const payload = JSON.stringify(boot).replace(/</g, "\\u003c"),
    html = (await response.text()).replace(
      "<head>",
      "<head><script>window.matclubBoot=" + payload + ";</script>",
    );
  headers.delete("content-encoding");
  return new Response(html, { status: response.status, headers });
}
export default {
  async fetch(request, env, ctx) {
    const requestId = crypto.randomUUID();
    let response;
    try {
      response = new URL(request.url).pathname.startsWith("/api/")
        ? await api(request, env, ctx)
        : await page(request, env);
    } catch (e) {
      if (e instanceof ApiError)
        response = json({ error: e.message }, e.status, e.headers);
      else {
        console.error(
          JSON.stringify({
            event: "server_error",
            requestId,
            method: request.method,
            errorType: e instanceof Error ? e.name : "UnknownError",
          }),
        );
        response = json(
          {
            error:
              "Сервер временно недоступен. Прогресс на устройстве сохранён.",
          },
          503,
          { "retry-after": "15" },
        );
      }
    } finally {
      cleanup(env.DB, ctx);
    }
    return finish(response, requestId, request.method);
  },
};
