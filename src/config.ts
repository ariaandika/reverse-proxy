
process.configdir = "config.json"

export async function reloadConfig() {
  try {
    const config = Bun.file(process.configdir)

    if (await config.exists()) {
      console.log("loading config")
      process.configuration = await config.json()
    } else {
      console.log("config file not found, no change made")
    }

  } catch (e) {
    console.error("failed to load config")
    console.error(e)
  }
}
