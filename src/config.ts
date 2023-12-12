import type { Config } from "../lib/config"

export async function reloadConfig(init = false) {
  try {
    // const configFile = Bun.file(process.configdir)

    console.log("loading config...")

    if (await Bun.file(process.configdir).exists()) { } else {
      return configError(
        init,
        "config file not found, please create ./config.json in current directory",
        "config file not found, no change made"
      )
    }

    const cwd = process.cwd()
    const tmp = "/tmp/.bun/config.ts"

    await Bun.write(tmp,`\
    import conf from "${cwd}/config.ts"
    console.log(JSON.stringify(conf))
    `)

    const conf = JSON.parse(Bun.spawnSync(["bun",tmp]).stdout.toString())

    let configData
    configData = conf as Config

    if (!configData.servers) {
      return configError(init, "No server config, no changes made")
    }

    configData = configData.servers.find(e => ""+e.port === process.env.PORT)

    if (!configData) {
      return configError(
        init,
        `config for port ${process.env.PORT} not found`,
      )
    }

    process.configuration = configData
    process.cfg = configData
  } catch (e) {
    configError(init, "failed to load config" +
      // @ts-ignore
      (console.error(e) || ''),
    )
  }
}

function configError(init: boolean, initMsg: string, reloadMsg = initMsg) {
  if (init) {
    console.error(initMsg)
    process.exit(1)
  }
  console.log(reloadMsg)
}




