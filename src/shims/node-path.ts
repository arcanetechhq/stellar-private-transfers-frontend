export function dirname(pathString: string): string {
  const normalized = pathString.replaceAll("\\", "/");
  const withoutTrailing = normalized.replace(/\/$/, "");
  const index = withoutTrailing.lastIndexOf("/");
  if (index === -1) {
    return ".";
  }
  if (index === 0) {
    return "/";
  }
  return withoutTrailing.slice(0, index);
}

export function resolve(...parts: string[]): string {
  const segments: string[] = [];
  let absolute = false;
  for (const part of parts) {
    const pieces = part.split(/[/\\]/);
    for (const segment of pieces) {
      if (segment === "") {
        if (part.startsWith("/")) {
          absolute = true;
          segments.length = 0;
        }
        continue;
      }
      if (segment === "..") {
        segments.pop();
      } else if (segment !== ".") {
        segments.push(segment);
      }
    }
  }
  const joined = segments.join("/");
  if (absolute) {
    return `/${joined}`;
  }
  return joined || ".";
}

export function join(...parts: string[]): string {
  return parts.join("/").replaceAll(/\/+/g, "/");
}
