export class Result<T> {
  public _pipes: CallableFunction[] = [];

  async handle() {
    let i = 0
    let data
    try {
      for (let len = this.handle.length;i < len;i++) {
        data = this._pipes[i]
      }
      return { data: data as T, err: void 0 }
    } catch (e) {
      return { data: void 0, err: e as Error }
    }
  }

  async unwrap(msg = "Panic:") {
    const { data, err } = await this.handle()
    if (err) {
      console.error(msg, err)
      process.exit(1)
    }
    return data
  }

  async nullable() {
    const { data } = await this.handle()
    return data
  }

  async unwrapErr(handle: (err: Error) => T) {
    const { data, err } = await this.handle()
    return err ? await handle(err) : data
  }

  unwrapPipe<T>(res: Result<T> | SyncResult<T>) {
    this._pipes.push(...res._pipes)
    return this as any as Result<Awaited<T>>
  }

  pipe<U>(cb: (val: T) => U ) {
    this._pipes.push(cb)
    return this as any as Result<Awaited<U>>
  }

  static file(path: string) {
    return new Result()
      .pipe(async () => {
        const file = Bun.file(path)
        if (await file.exists()) {
          throw new Error("Not found")
        }
        return file
      })
  }

  static File = {
    text(path: string) {
      return Result.file(path)
      .pipe(e=>e.text())
    },
    json(path: string) {
      return Result.file(path)
      .pipe(e=>e.json())
    }
  }

  static fetch(...opt: Parameters<typeof fetch>) {
    return new Result()
      .pipe(async () => fetch(...opt))
  }

  static Fetch = {
    text(...opt: Parameters<typeof fetch>) {
      return Result.fetch(...opt)
      .pipe(e=>e.text())
    },
    json(...opt: Parameters<typeof fetch>) {
      return Result.fetch(...opt)
      .pipe(e=>e.json())
    }
  }
}

export class SyncResult<T> {
  public _pipes: CallableFunction[] = [];

  unwrap(msg = "Panic:") {
    const { data, err } = this.handle()
    if (err) {
      console.error(msg, err)
      process.exit(1)
    }
    return data
  }

  nullable() {
    const { data } = this.handle()
    return data
  }

  static nonNull<T>(val: T) {
    return new SyncResult()
      .pipe(() => {
        if (!val) throw new Error("Value is undefined")
        return val
      })
  }

  handle() {
    try {
      let data
      for (let i = 0, len = this.handle.length;i < len;i++) {
        data = this._pipes[i]
      }
      return { data: data as T, err: void 0 }
    } catch (e) {
      return { data: void 0, err: e as Error }
    }
  }

  pipe<U>(cb: (val: T) => U ) {
    this._pipes.push(cb)
    return this as any as SyncResult<U>
  }

  static find<T>(arr: T[], cb: (e: T) => boolean) {
    return new SyncResult()
      .pipe(() => {
        const r = arr.find(cb)
        if (!r) throw new Error("Element not found")
        return r as T
      })
  }
}
