import { SyncResult } from ".";

declare global {
  var int: (val: unknown) => SyncResult<number>
}

export function int(val: unknown) {
  return new SyncResult()
  .pipe(() => {
    const int = parseInt(val as any)
    if (isNaN(int)) {
      throw new Error("Not a number")
    }
    return int
  })
}

