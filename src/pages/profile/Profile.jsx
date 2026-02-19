import { useState } from 'react'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import { useDarkMode } from '../../hooks/useDarkMode'

export default function Profile() {
  const { user, setAuth } = useAuthStore()
  const { card, text, textMuted, input, label, darkMode } = useDarkMode()
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    password_confirmation: '',
  })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setSuccess('')
    try {
      const res = await api.put('/profile', form)
      setSuccess('Perfil actualizado correctamente ✅')
      setAuth({
        user: res.data.user,
        token: useAuthStore.getState().token,
        roles: useAuthStore.getState().roles,
        permissions: useAuthStore.getState().permissions,
      })
      setForm({ ...form, password: '', password_confirmation: '' })
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className={`text-2xl font-bold ${text} mb-6`}>Mi Perfil</h2>
      <div className={`${card} rounded-2xl shadow p-6 max-w-lg`}>

        <div className={`flex items-center gap-4 mb-6 pb-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className={`font-semibold text-lg ${text}`}>{user?.name}</p>
            <p className={`text-sm ${textMuted}`}>{user?.email}</p>
          </div>
        </div>

        {success && (
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${label} mb-1`}>Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
          </div>

          <div>
            <label className={`block text-sm font-medium ${label} mb-1`}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
          </div>

          <div className={`pt-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <p className={`text-sm ${textMuted} mb-3`}>Cambiar contraseña (opcional)</p>
            <div className="space-y-3">
              <div>
                <label className={`block text-sm font-medium ${label} mb-1`}>Nueva Contraseña</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
                  placeholder="Dejar vacío para no cambiar"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
              </div>
              <div>
                <label className={`block text-sm font-medium ${label} mb-1`}>Confirmar Contraseña</label>
                <input
                  type="password"
                  value={form.password_confirmation}
                  onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Actualizar Perfil'}
          </button>
        </form>
      </div>
    </div>
  )
}