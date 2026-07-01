/// <reference types="vite/client" />

declare global {
  var Buffer: typeof import("buffer").Buffer;
}

declare module "*.wasm?url" {
  const url: string;
  export default url;
}

declare module "*.zkey?url" {
  const url: string;
  export default url;
}
