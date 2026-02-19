import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useDarkMode } from '../../hooks/useDarkMode'

export default function StockMovements() {
  const { card, tableHead, text, textMuted, input, label, darkMode } = useDarkMode()
  const [movements, setMovements] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ product_id: '', type: 'entrada', quantity: '', reason: '' })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [filterType, setFilterType] = useState('')

  useEffect(() => {
    api.get('/products', { params: { page: 1 } }).then(r => setProducts(r.data.data))
    const fetchMovements = async () => {
      setLoading(true)
      try {
        const res = await api.get('/stock-movements', { params: { type: '' } })
        setMovements(res.data.data)
      } finally {
        setLoading(false)
      }
    }
    fetchMovements()
  }, [])

  useEffect(() => {
    const fetchMovements = async () => {
      setLoading(true)
      try {
        const res = await api.get('/stock-movements', { params: { type: filterType } })
        setMovements(res.data.data)
      } finally {
        setLoading(false)
      }
    }
    fetchMovements()
  }, [filterType])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSuccess('')
    try {
      await api.post('/stock-movements', form)
      setSuccess('Movimiento registrado correctamente ✅')
      setShowForm(false)
      setForm({ product_id: '', type: 'entrada', quantity: '', reason: '' })
      setFilterType('')
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors)
      if (err.response?.data?.message) setErrors({ general: err.response.data.message })
    }
  }

  const typeColor = (type) => {
    if (type === 'entrada') return 'bg-green-100 text-green-700'
    if (type === 'salida') return 'bg-red-100 text-red-600'
    return 'bg-yellow-100 text-yellow-700'
  }

  const typeIcon = (type) => {
    if (type === 'entrada') return '⬆️'
    if (type === 'salida') return '⬇️'
    return '🔄'
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${text}`}>Movimientos de Stock</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Registrar Movimiento
        </button>
      </div>

      {success && <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg mb-4 text-sm">{success}</div>}

      {showForm && (
        <div className={`${card} rounded-2xl shadow p-6 mb-6 max-w-lg`}>
          <h3 className={`font-semibold ${text} mb-4`}>Nuevo Movimiento</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}
            <div>
              <label className={`block text-sm font-medium ${label} mb-1`}>Producto</label>
              <select
                value={form.product_id}
                onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
              >
                <option value="">Seleccionar...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
              </select>
              {errors.product_id && <p className="text-red-500 text-xs mt-1">{errors.product_id[0]}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium ${label} mb-1`}>Tipo</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
              >
                <option value="entrada">⬆️ Entrada</option>
                <option value="salida">⬇️ Salida</option>
                <option value="ajuste">🔄 Ajuste</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium ${label} mb-1`}>
                {form.type === 'ajuste' ? 'Nuevo Stock' : 'Cantidad'}
              </label>
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
              />
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity[0]}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium ${label} mb-1`}>Motivo (opcional)</label>
              <input
                type="text"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
                placeholder="Ej: Compra a proveedor, Venta, Daño..."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Guardar</button>
              <button type="button" onClick={() => setShowForm(false)} className={`px-4 py-2 rounded-lg text-sm font-medium ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={`border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
        >
          <option value="">Todos los tipos</option>
          <option value="entrada">⬆️ Entradas</option>
          <option value="salida">⬇️ Salidas</option>
          <option value="ajuste">🔄 Ajustes</option>
        </select>
      </div>

      <div className={`${card} rounded-2xl shadow overflow-hidden`}>
        <table className="w-full text-sm">
          <thead className={`${tableHead} uppercase text-xs`}>
            <tr>
              <th className="px-6 py-3 text-left">Producto</th>
              <th className="px-6 py-3 text-left">Tipo</th>
              <th className="px-6 py-3 text-left">Cantidad</th>
              <th className="px-6 py-3 text-left">Stock Antes</th>
              <th className="px-6 py-3 text-left">Stock Después</th>
              <th className="px-6 py-3 text-left">Motivo</th>
              <th className="px-6 py-3 text-left">Usuario</th>
              <th className="px-6 py-3 text-left">Fecha</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            {loading ? (
              <tr><td colSpan="8" className={`text-center py-8 ${textMuted}`}>Cargando...</td></tr>
            ) : movements.length === 0 ? (
              <tr><td colSpan="8" className={`text-center py-8 ${textMuted}`}>No hay movimientos</td></tr>
            ) : movements.map((m) => (
              <tr key={m.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                <td className={`px-6 py-4 font-medium ${text}`}>{m.product?.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColor(m.type)}`}>
                    {typeIcon(m.type)} {m.type}
                  </span>
                </td>
                <td className={`px-6 py-4 font-semibold ${text}`}>{m.quantity}</td>
                <td className={`px-6 py-4 ${textMuted}`}>{m.stock_before}</td>
                <td className={`px-6 py-4 ${text}`}>{m.stock_after}</td>
                <td className={`px-6 py-4 ${textMuted}`}>{m.reason || '-'}</td>
                <td className={`px-6 py-4 ${textMuted}`}>{m.user?.name}</td>
                <td className={`px-6 py-4 ${textMuted}`}>{new Date(m.created_at).toLocaleDateString('es-ES')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}