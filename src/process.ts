import { reloadConfig } from "./config";

process.lock = false
process.configdir = "config.ts"


process.on('SIGHUP',async () => {
  if (process.lock) { return }

  let max = 10;

  while (max-- > 0 && process.server.pendingRequests > 0) {
    await Bun.sleep(500)
  }

  process.lock = true
  await reloadConfig()
  process.lock = false
})

process.on("SIGINT",() => {
  process.server?.stop()
})
