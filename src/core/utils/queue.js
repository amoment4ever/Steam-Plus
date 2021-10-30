import queue from 'queue'

export const priceQueue = queue({
  results: [],
  autostart: true,
  concurrency: 25,
})

export const inventoryLoadQueue = queue({
  results: [],
  autostart: true,
  concurrency: 1,
})
