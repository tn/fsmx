/* eslint-disable no-console */
export default function log(name, isEnable = false) {
  return function decorator(t, n, descriptor) {
    const original = descriptor.value

    if (typeof original === 'function') {
      descriptor.value = function(...args) {
        if (isEnable) {
          console.log(`Arguments for ${name}: ${args}`)
        }
        try {
          const result = original.apply(t, args)
          if (isEnable) {
            console.log(`Result from ${name}: ${result}`)
          }
          return result
        } catch (e) {
          if (isEnable) {
            console.log(`Error from ${name}: ${e}`)
          }
          throw e
        }
      }
    }
    return descriptor
  }
}
