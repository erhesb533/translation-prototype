import { Layout } from './components/Layout'
import { useRoute } from './router'
import { Home } from './screens/Home'
import { OrderScreen } from './screens/Order'
import { StatusScreen } from './screens/Status'

export default function App() {
  const route = useRoute()
  let screen
  switch (route.name) {
    case 'order':
      screen = <OrderScreen />
      break
    case 'status':
      screen = <StatusScreen id={route.id} />
      break
    default:
      screen = <Home />
  }
  return <Layout route={route}>{screen}</Layout>
}
