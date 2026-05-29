const MISSING = Symbol("missing");

function decodeToken(token: string): string {
  return token.replace(/~1/g, "/").replace(/~0/g, "~");
}

export function getAtPath(root: unknown, path: string): unknown {
  if (path === "" || path === "/") return root;
  if (!path.startsWith("/")) return MISSING;
  const tokens = path.slice(1).split("/").map(decodeToken);
  let cur: unknown = root;
  for (const token of tokens) {
    if (cur === null || cur === undefined) return MISSING;
    if (Array.isArray(cur)) {
      if (token === "-") return MISSING;
      const idx = Number(token);
      if (!Number.isInteger(idx) || idx < 0 || idx >= cur.length) return MISSING;
      cur = cur[idx];
      continue;
    }
    if (typeof cur === "object") {
      const obj = cur as Record<string, unknown>;
      if (!Object.prototype.hasOwnProperty.call(obj, token)) return MISSING;
      cur = obj[token];
      continue;
    }
    return MISSING;
  }
  return cur;
}

export function isMissing(value: unknown): boolean {
  return value === MISSING;
}
