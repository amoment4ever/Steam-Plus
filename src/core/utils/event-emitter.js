export class EventEmitter {
  constructor(name) {
    this.events = {}
    this.onceEvents = {}
    this.name = name

    if (typeof window !== 'undefined') {
      window[name] = this
    }
  }

  emit(eventName, data) {
    const event = this.events[eventName]
    const onceEvent = this.onceEvents[eventName]
    if (event) {
      event.forEach((fn) => {
        fn.call(null, data)
      })
    }
    if (onceEvent) {
      onceEvent.forEach((fn) => fn.call(null, data))
      this.onceEvents[eventName] = null
    }
  }

  on(eventName, fn) {
    if (!this.events[eventName]) this.events[eventName] = []

    this.events[eventName].push(fn)
    return () => {
      this.events[eventName] = this.events[eventName].filter(
        (eventFn) => fn !== eventFn
      )
    }
  }

  once(eventName, fn) {
    if (!this.onceEvents[eventName]) this.onceEvents[eventName] = []

    this.onceEvents[eventName].push(fn)
  }

  unsubscribe(eventName, fn) {
    this.events[eventName] = this.events[eventName].filter(
      (currentFn) => currentFn !== fn
    )
  }

  clearAllEvents() {
    this.events = {}
    this.onceEvents = {}
  }
}

export const mainEmitter = new EventEmitter('mainEmitter')
