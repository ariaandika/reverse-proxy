import "./process"
import "./action";
import { reloadConfig } from "./config"
import { postResponse } from "./lib"
import { getAction } from "./type";

async function main() {
  const port = process.env.PORT;

  if (!port) {
    console.error("PORT env variable is required")
    process.exit(1)
  }

  // CONFIG
  console.log("Api Gateway Server")
  await reloadConfig(true)

  // TLS
  const tlsKey = process.cfg.domain?.tlsKey
  const tlsCert = process.cfg.domain?.tlsCert

  const tls = tlsCert && tlsKey ? {
    key: Bun.file(tlsKey),
    cert: Bun.file(tlsCert),
  } : void 0;

  const isTls = tls && await tls.key.exists() && await tls.cert.exists();

  isTls && console.log(`tls key: ${tlsKey}, tls cert: ${tlsCert}`);

  const action = getAction()

  if (!action) {
    console.error("Unhandled error, no action found for current config",process.cfg)
    process.exit(1)
  }

  const server = Bun.serve({
    tls: isTls ? tls : undefined,
    port,
    async fetch(request) {
      try {
        if (process.lock) {
          return new Response("Service Unavailable", { status: 503 })
        }

        request.u = new URL(request.url)
        const res = await action(request, process.cfg)
        return postResponse(res)

      } catch (e) {
        console.error(e)
        return new Response("Internal Server Error", { status: 500 })

      }
    },
  })


  console.log("pid:",process.pid);
  console.log(`Listening in ${server.port}...`);

  process.server = server
  return server
}

{
  await main()
}

