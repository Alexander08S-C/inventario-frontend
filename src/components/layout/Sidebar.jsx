import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import api from '../../api/axios'

const links = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/products', icon: '📦', label: 'Productos' },
  { to: '/categories', icon: '🏷️', label: 'Categorías' },
  { to: '/suppliers', icon: '🚚', label: 'Proveedores' },
  { to: '/reports', icon: '📈', label: 'Reportes' },
  { to: '/users', icon: '👥', label: 'Usuarios' },
  { to: '/stock-movements', icon: '📋', label: 'Movimientos' },
  { to: '/sales', icon: '🛒', label: 'Ventas' },
]

export default function Sidebar({ open, setOpen }) {
  const navigate = useNavigate()
  const { user, logout, darkMode, toggleDarkMode } = useAuthStore()

  const handleLogout = async () => {
    try {
      await api.post('/logout')
    } catch (error) {
      console.error('Logout error:', error)
    }
    logout()
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <>
      {/* Overlay móvil */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 min-h-screen bg-gray-900 text-white flex flex-col
        transform transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">🏪 Inventario</h1>
            <p className="text-gray-400 text-sm mt-1">{user?.name}</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition text-sm font-medium ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`
              }
            >
              <span>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700 space-y-1">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 transition text-sm font-medium"
          >
            <span>{darkMode ? '☀️' : '🌙'}</span>
            {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
          </button>
          <NavLink
            to="/profile"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg transition text-sm font-medium ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`
            }
          >
            <span>👤</span> Mi Perfil
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition text-sm font-medium"
          >
            <span>🚪</span> Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  )
}