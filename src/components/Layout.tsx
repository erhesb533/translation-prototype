import type { ReactNode } from 'react'
import type { Route, ScreenId } from '../router'
import { SCREEN_IDS, SCREEN_LABELS, href } from '../router'

export function Layout({ route, children }: { route: Route; children: ReactNode }) {
  return (
    <div className="app">
      <div className="proto-banner" role="note">
        Прототип — үнэ жишээ. Бүх нэр, өгөгдөл зохиомол.
      </div>
      <header className="topbar">
        <a className="brand" href="#/">
          <span className="brand-mark" aria-hidden>
            文
          </span>
          Орчуулга<span className="brand-dot">.mn</span>
        </a>
        <nav className="tabs" aria-label="Дэлгэцүүд">
          {SCREEN_IDS.map((id: ScreenId) => (
            <a
              key={id}
              href={href({ name: id } as Route)}
              className={route.name === id ? 'tab active' : 'tab'}
              aria-current={route.name === id ? 'page' : undefined}
            >
              {SCREEN_LABELS[id]}
            </a>
          ))}
        </nav>
      </header>
      <main className="content">{children}</main>
    </div>
  )
}
