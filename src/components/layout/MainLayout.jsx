import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import useAuthStore from '../../store/authStore'

export default function MainLayout() {
  const [open, setOpen] = useState(false)
  const darkMode = useAuthStore((state) => state.darkMode)

  return (
    <div className={`flex min-h-screen ${darkMode ? 'bg-gray-950' : 'bg-gray-100'}`}>
      <Sidebar open={open} setOpen={setOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header móvil */}
        <header className={`lg:hidden flex items-center gap-4 px-4 py-3 border-b ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <button
            onClick={() => setOpen(true)}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ☰
          </button>
          <h1 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            🏪 Inventario
          </h1>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}