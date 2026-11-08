// Shared HTTP boundaries. No request bodies, passwords or session tokens are logged.
export class ApiError extends Error {
  constructor(status, message, headers = {}) {
    super(message);
    this.status = status;
    this.headers = headers;
  }
}
export function fail(status, message) {
  throw new ApiError(status, message);
}
export function json(value, status = 200, headers = {}) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...headers,
    },
  });
}
export async function readJson(request, limit, timeoutMs = 10000) {
  if (
    (request.headers.get("content-type") || "")
      .split(";")[0]
      .trim()
      .toLowerCase() !== "application/json"
  )
    fail(415, "Ожидается JSON.");
  const tooLarge = () =>
    new ApiError(
      413,
      "Запрос слишком большой. Сократи объём отправляемых данных.",
    );
  if (Number(request.headers.get("content-length")) > limit) throw tooLarge();
  if (!request.body || request.signal.aborted)
    fail(400, "Запрос прерван или не содержит данных.");
  let reader;
  try {
    reader = request.body.getReader();
  } catch {
    fail(400, "Не удалось прочитать запрос.");
  }
  let timer, onAbort;
  const stop = () => {
    reader.cancel().catch(() => {});
  };
  try {
    const bytes = await Promise.race([
      (async () => {
        let size = 0;
        const parts = [];
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > limit) throw tooLarge();
          parts.push(value);
        }
        const out = new Uint8Array(size);
        let offset = 0;
        for (const p of parts) {
          out.set(p, offset);
          offset += p.length;
        }
        return out;
      })(),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          stop();
          reject(
            new ApiError(
              408,
              "Данные поступают слишком долго. Повтори запрос.",
            ),
          );
        }, timeoutMs);
        onAbort = () => {
          stop();
          reject(new ApiError(400, "Запрос прерван. Повтори попытку."));
        };
        request.signal.addEventListener("abort", onAbort, { once: true });
        if (request.signal.aborted) onAbort();
      }),
    ]);
    let data;
    try {
      data = JSON.parse(
        new TextDecoder("utf-8", { fatal: true }).decode(bytes),
      );
    } catch {
      fail(400, "Неверный JSON.");
    }
    if (!data || typeof data !== "object" || Array.isArray(data))
      fail(400, "Неверный формат запроса.");
    return data;
  } catch (e) {
    stop();
    if (e instanceof ApiError) throw e;
    fail(400, "Не удалось прочитать запрос. Повтори попытку.");
  } finally {
    clearTimeout(timer);
    if (onAbort) request.signal.removeEventListener("abort", onAbort);
    try {
      reader.releaseLock();
    } catch {}
  }
}
export function finish(response, requestId, method) {
  const headers = new Headers(response.headers);
  headers.set("x-request-id", requestId);
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  return new Response(method === "HEAD" ? null : response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
