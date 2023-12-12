import { reloadConfig } from "./config";
import { int } from "../lib"

process.lock = false
process.configdir = "config.ts"

global.int = int

process.on('SIGHUP',async () => {
  if (process.lock) { return }

  let max = 10;

  while (max-- > 0 && process.server.pendingRequests > 0) {
    await Bun.sleep(500)
  }

  process.lock = true
  const { data, err } = await reloadConfig().handle()

  if (err) {
    console.error("Failed to reload config,",err)
  } else {
    process.cfg = data
  }

  process.lock = false
})

process.on("SIGINT",() => {
  process.server?.stop()
})
