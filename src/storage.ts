import { useCallback, useEffect, useState } from 'react'

/** localStorage-д JSON хадгалах туслах. Алдаа гарвал (private горим гэх мэт) анхны утгаар ажиллана. */
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    window.dispatchEvent(new CustomEvent('tp-storage', { detail: key }))
  } catch {
    /* хадгалж чадахгүй бол санах ойд л үлдэнэ */
  }
}

/** localStorage-тай холбогдсон state; ижил key ашиглах бусад компонент мөн шинэчлэгдэнэ. */
export function useStored<T>(key: string, fallback: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => load(key, fallback))

  useEffect(() => {
    const onChange = (e: Event) => {
      if ((e as CustomEvent).detail === key) setValue(load(key, fallback))
    }
    window.addEventListener('tp-storage', onChange)
    return () => window.removeEventListener('tp-storage', onChange)
    // fallback нь эхний утга л тул dependency-д оруулахгүй
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      const next = typeof v === 'function' ? (v as (prev: T) => T)(load(key, fallback)) : v
      setValue(next)
      save(key, next)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  )

  return [value, set]
}

export function downloadFile(filename: string, content: string, type = 'application/json') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
