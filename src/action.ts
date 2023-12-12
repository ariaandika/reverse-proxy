import { register } from "./type"
import { proxyPass, serveStatic } from "./lib"

export function parseConfig() {
  register("proxy", proxyPass)
  register("static", serveStatic)
}

