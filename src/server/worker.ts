import type { RuntimeEnv } from "../config.js";
import { createHttpApp } from "./http.js";

export default {
  async fetch(request: Request, env: RuntimeEnv): Promise<Response> {
    return createHttpApp({ env }).fetch(request);
  },
};
