import type { Actions } from "../lib/config"

export function postResponse(res: Response) {
  // maybe there better approach
  if (res.headers.has("date")) {
    res.headers.delete("date")
  }
  return res
}

export async function proxyPass(req: Request, config: Actions['proxy']) {
  if (!validatePass(req, config)) {
    return new Response("Forbidden", { status: 403 })
  }

  try {
    return await fetch(config.pass + req.u.pathname,{
      headers: req.headers,
      method: req.method,
      body: req.method === "GET" ? undefined : await req.blob(),
      redirect: 'manual'
    })
  } catch (e) {
    return new Response("Service Unavailable", { status: 503 })
  }
}

export function validatePass(req: Request, config: Actions['proxy']) {
  let ok = true

  if (config.domain) {
    ok = req.headers.get("host") === config.domain.name
  }

  return ok
}

export async function serveStatic(req: Request, config: Actions["static"]) {
  // @TODO
  const file = Bun.file(config.root + req.u.pathname)

  if (await file.exists()) {
    return new Response(file)
  }

  return new Response(`Not Found: ${req.u.pathname}`,{ status: 404 })
}



