import { loadAction, loadTls, reloadConfig } from "./config/config";

async function main() {
  console.log("Api Gateway Server")

  process.cfg = await reloadConfig().unwrap("Failed to load config,")

  await loadAction().unwrap(`No action found for port ${process.env.PORT}`)

  const server = Bun.serve({
    tls: await loadTls().nullable(),
    async fetch(request) {
      if (process.lock) {
        return new Response("Service Unavailable", { status: 503 })
      }

      request.u = new URL(request.url)

      return await process.action(request, process.cfg)
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

