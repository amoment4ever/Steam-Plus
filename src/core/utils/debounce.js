export function debounce(func, wait, ...parameter) {
  let timeout
  return function time() {
    clearTimeout(timeout)
    return new Promise((resolve) => {
      timeout = setTimeout(function deb() {
        func.call(this, parameter)
        resolve()
      }, wait)
    })
  }
}
