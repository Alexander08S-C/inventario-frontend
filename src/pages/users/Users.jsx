import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useDarkMode } from '../../hooks/useDarkMode'

export default function Users() {
  const { card, tableHead, text, textMuted, input, label, darkMode } = useDarkMode()
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' })
  const [errors, setErrors] = useState({})

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const [u, r] = await Promise.all([api.get('/users'), api.get('/roles')])
      setUsers(u.data)
      setRoles(r.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', email: '', password: '', role: '' })
    setErrors({})
    setShowForm(true)
  }

  const openEdit = (user) => {
    setEditing(user)
    setForm({ name: user.name, email: user.email, password: '', role: user.roles[0]?.name || '' })
    setErrors({})
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    try {
      if (editing) {
        await api.put(`/users/${editing.id}`, form)
      } else {
        await api.post('/users', form)
      }
      setShowForm(false)
      fetchUsers()
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este usuario?')) return
    await api.delete(`/users/${id}`)
    fetchUsers()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${text}`}>Usuarios</h2>
        <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Nuevo Usuario
        </button>
      </div>

      {showForm && (
        <div className={`${card} rounded-2xl shadow p-6 mb-6 max-w-lg`}>
          <h3 className={`font-semibold ${text} mb-4`}>{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            {[['Nombre', 'name', 'text'], ['Email', 'email', 'email'], ['Contraseña', 'password', 'password']].map(([lbl, key, type]) => (
              <div key={key}>
                <label className={`block text-sm font-medium ${label} mb-1`}>
                  {lbl} {key === 'password' && editing && <span className={`${textMuted} text-xs`}>(dejar vacío para no cambiar)</span>}
                </label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
                />
                {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key][0]}</p>}
              </div>
            ))}
            <div>
              <label className={`block text-sm font-medium ${label} mb-1`}>Rol</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
              >
                <option value="">Seleccionar...</option>
                {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select>
              {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role[0]}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Guardar</button>
              <button type="button" onClick={() => setShowForm(false)} className={`px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className={`${card} rounded-2xl shadow overflow-hidden`}>
        <table className="w-full text-sm">
          <thead className={`${tableHead} uppercase text-xs`}>
            <tr>
              <th className="px-6 py-3 text-left">Nombre</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Rol</th>
              <th className="px-6 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            {loading ? (
              <tr><td colSpan="4" className={`text-center py-8 ${textMuted}`}>Cargando...</td></tr>
            ) : users.map((user) => (
              <tr key={user.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                <td className={`px-6 py-4 font-medium ${text}`}>{user.name}</td>
                <td className={`px-6 py-4 ${textMuted}`}>{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.roles[0]?.name === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {user.roles[0]?.name || 'Sin rol'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(user)} className="text-blue-500 hover:underline text-xs">Editar</button>
                    <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:underline text-xs">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}