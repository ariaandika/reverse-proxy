import { reloadConfig } from "./config";

process.lock = false

process.on('SIGHUP',async () => {
  if (process.lock) {
    return
  }

  let max = 10;

  while (max-- > 0 && process.server.pendingRequests > 0) {
    await new Promise(r => setTimeout(r, 500))
  }

  process.lock = true

  await reloadConfig()

  process.lock = false
})

process.on("SIGINT",() => {
  process.server?.stop()
})
