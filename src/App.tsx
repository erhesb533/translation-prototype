import { Layout } from './components/Layout'
import { useRoute } from './router'
import { Home } from './screens/Home'

export default function App() {
  const route = useRoute()
  let screen
  switch (route.name) {
    default:
      screen = <Home />
  }
  return <Layout route={route}>{screen}</Layout>
}
