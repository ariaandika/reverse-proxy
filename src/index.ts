import "./process"
import { reloadConfig } from "./config"
import { proxyPass, postResponse, serveStatic } from "./lib"

async function main() {
  console.log("Api Gateway Server")
  await reloadConfig()

  const tls = process.configuration.tls_cert && process.configuration.tls_key ? {
    key: Bun.file(process.configuration.tls_key || ""),
    cert: Bun.file(process.configuration.tls_cert || ""),
  } : void 0


  const server = Bun.serve({
    tls,
    port: 443,
    async fetch(request) {
      try {
        if (process.lock) {
          return new Response("Service Unavailable", { status: 503 })
        }

        let res: Response

        request.u = new URL(request.url)

        // TODO: better config parsing
        // TODO: better config validation
        // TODO: better config error handling
        // TODO: better logging

        const originHeader = request.headers.get("origin")
        const domainConfig = process.configuration.server?.find(e=>e.domain === originHeader)

        if (!domainConfig) {
          res = new Response("Not Found", { status: 404 })

        } else if (originHeader && "pass" in domainConfig) { 
          res = await proxyPass(request, domainConfig)

        } else if ("static" in domainConfig) {
          res = await serveStatic(request, domainConfig)

        } else {
          res = new Response("Not Found", { status: 404 })
        }

        return postResponse(res)

      } catch (e) {
        console.error(e)
        return new Response("Internal Server Error", { status: 500 })

      }
    },
  })


  console.log("pid:",process.pid);
  tls && console.log(`tls key: ${process.configuration.tls_key}, tls cert: ${process.configuration.tls_cert}`);
  console.log(`Listening in ${server.port}...`);

  process.server = server
  return server
}

{
  await main()
}

