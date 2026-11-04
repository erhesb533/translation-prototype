import { useEffect, useState } from 'react'

/** Hash чиглүүлэлт: GitHub Pages дээр сервергүй ажиллана. */
export type Route =
  | { name: 'home' }
  | { name: 'order' }
  | { name: 'status'; id?: string }
  | { name: 'business' }
  | { name: 'translator' }

export const SCREEN_IDS = ['home', 'order', 'status', 'business', 'translator'] as const
export type ScreenId = (typeof SCREEN_IDS)[number]

export const SCREEN_LABELS: Record<ScreenId, string> = {
  home: 'Нүүр',
  order: 'Захиалга өгөх',
  status: 'Захиалгын төлөв',
  business: 'Компанийн самбар',
  translator: 'Орчуулагчийн самбар',
}

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  switch (parts[0]) {
    case 'order':
      return { name: 'order' }
    case 'status':
      return { name: 'status', id: parts[1] }
    case 'business':
      return { name: 'business' }
    case 'translator':
      return { name: 'translator' }
    default:
      return { name: 'home' }
  }
}

export function href(route: Route): string {
  if (route.name === 'home') return '#/'
  if (route.name === 'status' && route.id) return `#/status/${route.id}`
  return `#/${route.name}`
}

export function navigate(route: Route) {
  window.location.hash = href(route)
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash))
  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash))
      window.scrollTo?.(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
