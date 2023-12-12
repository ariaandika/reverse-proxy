import { Result } from "../lib";
import { register, Actions } from "../type"

register("static", serveStatic)
register("proxy", proxyPass)

export async function serveStatic(req: Request, config: Actions["static"]) {
  return await Result.file(config.root + req.u.pathname)
    .pipe(e => new Response(e))
    .unwrapErr(e => new Response(e.message,{ status: 404 }))
}

export async function proxyPass(req: Request, config: Actions['proxy']) {
// export function validatePass(req: Request, config: Actions['proxy']) {
//   let ok = true
//
//   if (config.domain) {
//     ok = req.headers.get("host") === config.domain.name
//   }
//
//   return ok
// }
  return await Result.fetch(config.pass + req.u.pathname,{
    headers: req.headers,
    method: req.method,
    body: req.method === "GET" ? undefined : await req.blob(),
    redirect: 'manual'
  })
  .unwrapErr(e => new Response("Service Unavailable"+(console.error(e) as any || ''), { status: 503 }))
}
