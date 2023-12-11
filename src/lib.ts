
type PassConfig = {
  port: number
  domain?: string
  path?: string
  pass: string
}

type StaticConfig = {
  port: number
  domain?: string
  path?: string
  static: string
}

declare global {
  interface Process {
    configuration: {
      server: (PassConfig | StaticConfig)[]
      tls_key?: string
      tls_cert?: string
    }
    configdir: string
    server: ReturnType<typeof Bun.serve>
    lock: boolean
  }
  
  interface Request {
    u: URL
  }
}

export function postResponse(res: Response) {
  
  // @TODO: maybe there better approach
  if (res.headers.has("date")) {
    res.headers.delete("date")
  }

  return res
}

export async function proxyPass(req: Request, config: PassConfig) {
  if (!validatePass(req, config)) {
    return new Response("Forbidden", { status: 403 })
  }

  try {
    return await fetch(config.pass,{
      headers: req.headers,
      method: req.method,
      body: req.method === "GET" ? undefined : await req.blob(),
    })
  } catch (e) {
    return new Response("Service Unavailable", { status: 503 })
  }
}

export function validatePass(req: Request, config: PassConfig) {
  let ok = true

  if (config.domain) {
    ok = req.headers.get("host") === config.domain
  }

  return ok
}

export async function serveStatic(req: Request, config: StaticConfig) {
  const file = Bun.file(config.static + req.u.pathname)

  if (await file.exists()) {
    return new Response(file)
  }

  return new Response(`Not Found: ${req.u.pathname}`,{ status: 404 })
}



