// type Infer<T extends Record<string,any>> = {
//   [x in keyof T]: InferProp<T[x]>
// }
//
// type InferProp<T extends (arg: any) => any> = T extends (arg: infer R) => any ?
//   R extends (arg: infer J) => any ? J extends Record<string,any> ? Infer<J> : never : R : never
// ;

export type CreateBuilder<T extends Record<string,any>> = {
  [x in keyof T]: CreateProp<T[x],CreateBuilder<T>>
}

type CreateProp<T,Pr> = T extends Record<string,any> ?
    (
      cb: (
        v: CreateBuilder<Required<T>>
      ) => CreateBuilder<Required<T>>
    ) => Pr
  : (v: T) => Pr;

export default <T extends Record<string,any>>() => {
  const noop: any = ()=>{};
  let target = noop
  let current = ""

  const builder: CreateBuilder<Required<T>> = new Proxy(noop,{
    get(_, p) {
      current = p.toString()
      return builder
    },
    apply(_, __, argArray) {
      if (current === 'build') {
        const r = Object.fromEntries(Object.entries(noop))
        console.log(JSON.stringify(r,null,2))
        return r
      }

      const inp = argArray[0]
      if (typeof inp === 'function') {
        target[current] ??= {}

        const parent = target
        const beforeCr = current

        target = target[current]

        inp(builder)

        target = parent
        current = beforeCr

        return builder
      } else {
        target[current] = inp
        return builder
      }
    },
  })

  return builder
}

