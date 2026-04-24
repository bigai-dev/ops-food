import { useCallback, useSyncExternalStore } from 'react'

// Shared state so all components see the same value
let darkMode = (() => {
  if (typeof window === 'undefined') return false
  const saved = localStorage.getItem('darkMode')
  if (saved !== null) return saved === '1'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
})()

const listeners = new Set()

function subscribe(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function getSnapshot() {
  return darkMode
}

function setDarkMode(value) {
  darkMode = value
  const root = document.documentElement
  if (darkMode) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  localStorage.setItem('darkMode', darkMode ? '1' : '0')
  listeners.forEach(cb => cb())
}

// Apply initial state
if (typeof window !== 'undefined') {
  setDarkMode(darkMode)
}

export function useDarkMode() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot)
  const toggle = useCallback(() => setDarkMode(!darkMode), [])
  return { isDark, toggle }
}
