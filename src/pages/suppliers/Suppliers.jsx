import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useDarkMode } from '../../hooks/useDarkMode'

export default function Suppliers() {
  const { card, tableHead, text, textMuted, input, label, darkMode } = useDarkMode()
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })
  const [errors, setErrors] = useState({})

  const fetchSuppliers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/suppliers')
      setSuppliers(res.data.data ?? res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSuppliers() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', email: '', phone: '', address: '' })
    setErrors({})
    setShowForm(true)
  }

  const openEdit = (sup) => {
    setEditing(sup)
    setForm({ name: sup.name, email: sup.email, phone: sup.phone || '', address: sup.address || '' })
    setErrors({})
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    try {
      if (editing) {
        await api.put(`/suppliers/${editing.id}`, form)
      } else {
        await api.post('/suppliers', form)
      }
      setShowForm(false)
      fetchSuppliers()
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este proveedor?')) return
    await api.delete(`/suppliers/${id}`)
    fetchSuppliers()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${text}`}>Proveedores</h2>
        <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Nuevo Proveedor
        </button>
      </div>

      {showForm && (
        <div className={`${card} rounded-2xl shadow p-6 mb-6 max-w-lg`}>
          <h3 className={`font-semibold ${text} mb-4`}>{editing ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            {[['Nombre', 'name'], ['Email', 'email'], ['Teléfono', 'phone'], ['Dirección', 'address']].map(([lbl, key]) => (
              <div key={key}>
                <label className={`block text-sm font-medium ${label} mb-1`}>{lbl}</label>
                <input
                  type="text"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
                />
                {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key][0]}</p>}
              </div>
            ))}
            <div className="flex gap-3">
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
              <th className="px-6 py-3 text-left">Teléfono</th>
              <th className="px-6 py-3 text-left">Productos</th>
              <th className="px-6 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            {loading ? (
              <tr><td colSpan="5" className={`text-center py-8 ${textMuted}`}>Cargando...</td></tr>
            ) : suppliers.map((sup) => (
              <tr key={sup.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                <td className={`px-6 py-4 font-medium ${text}`}>{sup.name}</td>
                <td className={`px-6 py-4 ${textMuted}`}>{sup.email}</td>
                <td className={`px-6 py-4 ${textMuted}`}>{sup.phone || '-'}</td>
                <td className={`px-6 py-4 ${textMuted}`}>{sup.products_count}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(sup)} className="text-blue-500 hover:underline text-xs">Editar</button>
                    <button onClick={() => handleDelete(sup.id)} className="text-red-500 hover:underline text-xs">Eliminar</button>
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