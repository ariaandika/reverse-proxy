import type { Config } from "../type"
import { Result, SyncResult } from "../lib"

function loadConfig() {
  return new Result()
    .pipe(async () => {
      await Result.file(process.configdir).unwrap("Config file not found")

      const tmp = "/tmp/.bun/config.ts"

      await Bun.write(tmp,`\
      import conf from "${process.cwd()}/config.ts"
      console.log(JSON.stringify(conf))
      `)

      return JSON.parse(Bun.spawnSync([process.argv[0],tmp]).stdout.toString()) as Config
    })
}

export function reloadConfig() {
  return loadConfig()
    .pipe(async config => {
      process.env.PORT = int(process.env.PORT).unwrap("PORT env variable is required")

      SyncResult.nonNull(config.servers)// .unwrap("No server configured")

      return SyncResult.find(config.servers!, e => e.port === process.env.PORT)
        .unwrap(`Config for port ${process.env.PORT} not found`)
    })
}

export function loadTls() {
  return new Result()
    .pipe(async () => {
      SyncResult.nonNull(
        process.cfg.domain &&
        process.cfg.domain.tlsKey &&
        process.cfg.domain.tlsCert
      )

      const key = await Result.file(process.cfg.domain!.tlsKey!).unwrap()
      const cert = await Result.file(process.cfg.domain!.tlsCert!).unwrap()
      
      console.log("Tls enabled!")

      return { key, cert }
    })
}

export function loadAction() {
  return new Result()
    .pipe(()=>import("../actions"))
    .pipe(()=>{
      if (!process.action) {
        throw new Error("No action registered")
      }
    })
}
