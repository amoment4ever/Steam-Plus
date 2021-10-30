import { useEffect } from 'react'

export function useOutsideClickHandler(ref, callback) {
  function handleClickOutside(event) {
    if (event.target.tagName === 'HTML') return
    // if (event.target.closest('#tooltips')) return
    // if (event.target.closest('#item_popover')) return

    if (ref.current && !ref.current.contains(event.target)) {
      callback()
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  })
}
