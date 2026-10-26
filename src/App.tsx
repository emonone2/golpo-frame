import { useEffect } from 'react'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import { AuthProvider } from './context/AuthContext'
import { LangProvider } from './context/LangContext'
import { useRoute } from './lib/router'
import Dashboard from './pages/Dashboard'
import Diary from './pages/Diary'
import DiaryEditor from './pages/DiaryEditor'
import Gallery from './pages/Gallery'
import Generator from './pages/Generator'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Studio from './pages/Studio'
import StoryDetail from './pages/StoryDetail'

export default function App() {
  const route = useRoute()
  const routeKey = `${route.page}-${route.id ?? ''}-${route.genre ?? ''}-${route.username ?? ''}`

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [routeKey])

  return (
    <LangProvider>
      <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar page={route.page} />
          <main className="flex-1">
            <div key={routeKey} className="animate-page-enter">
              {route.page === 'home' && <Landing />}
              {route.page === 'generate' && <Generator />}
              {route.page === 'dashboard' && <Dashboard />}
              {route.page === 'studio' && <Studio key={route.id ?? `new-${route.genre}`} route={route} />}
              {route.page === 'login' && <Login />}
              {route.page === 'gallery' && <Gallery />}
              {route.page === 'story' && <StoryDetail key={route.id} id={route.id} />}
              {route.page === 'profile' && <Profile key={route.username} username={route.username} />}
              {route.page === 'diary' &&
                (route.id ? <DiaryEditor key={route.id} id={route.id} /> : <Diary />)}
            </div>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </LangProvider>
  )
}

