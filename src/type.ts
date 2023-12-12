import type { Actions, AutoConfig } from "./config";
export type { Actions, Action, AutoConfig, Config } from "./config";

declare global {
  interface Process {
    configdir: string
    server: ReturnType<typeof Bun.serve>
    lock: boolean
  }

  interface Process {
    configuration: typeof process.cfg
    cfg: AutoConfig
    action: (req: Request, config: Actions[keyof Actions]) => Promise<Response>
  }
  
  interface Request {
    u: URL
  }

  namespace NodeJS {
    interface ProcessEnv {
      PORT: number
    }
  }
}

export function register<T extends keyof Actions>(
  type: T,
  action: (req: Request, config: Actions[T]) => Promise<Response>
) {
  if (process.cfg.type === type) {
    process.action = action as any
  }
}

