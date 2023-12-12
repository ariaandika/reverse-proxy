import type { Actions, AutoConfig } from "../lib/config";

declare global {
  interface Process {
    configdir: string
    server: ReturnType<typeof Bun.serve>
    lock: boolean
  }

  interface Process {
    configuration: typeof process.cfg
    cfg: AutoConfig
  }
  
  interface Request {
    u: URL
  }

  type Action = (req: Request, config: Actions[keyof Actions]) => (Response|Promise<Response>)
}


let currentAction: Action | undefined = undefined

export function getAction() {
  return currentAction
}

export function register<T extends keyof Actions>(
  type: T,
  action: Action
) {
  if (process.cfg.type === type) {
    currentAction = action
  }
}

