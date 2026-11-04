import { Layout } from './components/Layout'
import { useRoute } from './router'
import { Home } from './screens/Home'
import { OrderScreen } from './screens/Order'

export default function App() {
  const route = useRoute()
  let screen
  switch (route.name) {
    case 'order':
      screen = <OrderScreen />
      break
    default:
      screen = <Home />
  }
  return <Layout route={route}>{screen}</Layout>
}
