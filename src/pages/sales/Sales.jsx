import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useDarkMode } from '../../hooks/useDarkMode'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function Sales() {
  const { card, tableHead, text, textMuted, input, label, darkMode } = useDarkMode()
  const [sales, setSales] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({ customer_name: '', notes: '', items: [{ product_id: '', quantity: 1 }] })

  const fetchSales = async () => {
    setLoading(true)
    try {
      const res = await api.get('/sales')
      setSales(res.data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    api.get('/products', { params: { page: 1 } }).then(r => setProducts(r.data.data))
    fetchSales()
  }, [])

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { product_id: '', quantity: 1 }] })
  }

  const removeItem = (index) => {
    const items = form.items.filter((_, i) => i !== index)
    setForm({ ...form, items })
  }

  const updateItem = (index, field, value) => {
    const items = form.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    setForm({ ...form, items })
  }

  const getTotal = () => {
    return form.items.reduce((total, item) => {
      const product = products.find(p => p.id == item.product_id)
      if (!product || !item.quantity) return total
      return total + (product.price * item.quantity)
    }, 0).toFixed(2)
  }

  const exportSalePDF = async (saleId) => {
    const res = await api.get(`/sales/${saleId}`)
    const sale = res.data
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text('Recibo de Venta', 14, 20)
    doc.setFontSize(11)
    doc.text(`Venta #${sale.id}`, 14, 35)
    doc.text(`Cliente: ${sale.customer_name || 'Cliente general'}`, 14, 42)
    doc.text(`Vendedor: ${sale.user?.name}`, 14, 49)
    doc.text(`Fecha: ${new Date(sale.created_at).toLocaleDateString('es-ES')}`, 14, 56)
    doc.text(`Estado: ${sale.status}`, 14, 63)
    if (sale.notes) doc.text(`Notas: ${sale.notes}`, 14, 70)
    autoTable(doc, {
      startY: 78,
      head: [['Producto', 'Precio Unit.', 'Cantidad', 'Subtotal']],
      body: sale.items.map(item => [item.product?.name, `$${item.price}`, item.quantity, `$${item.subtotal}`]),
      foot: [['', '', 'Total:', `$${sale.total}`]],
      footStyles: { fontStyle: 'bold' },
    })
    doc.save(`venta-${sale.id}.pdf`)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await api.post('/sales', form)
      setSuccess('Venta registrada correctamente ✅')
      setShowForm(false)
      setForm({ customer_name: '', notes: '', items: [{ product_id: '', quantity: 1 }] })
      fetchSales()
    } catch (err) {
      if (err.response?.status === 422) {
        if (err.response.data.message) setError(err.response.data.message)
      }
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('¿Cancelar esta venta? El stock será restaurado.')) return
    try {
      await api.put(`/sales/${id}/cancel`)
      fetchSales()
    } catch (err) {
      alert(err.response?.data?.message || 'Error al cancelar')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${text}`}>Ventas</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Nueva Venta
        </button>
      </div>

      {success && <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg mb-4 text-sm">{success}</div>}
      {error && <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>}

      {showForm && (
        <div className={`${card} rounded-2xl shadow p-6 mb-6`}>
          <h3 className={`font-semibold ${text} mb-4`}>Nueva Venta</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${label} mb-1`}>Cliente (opcional)</label>
                <input
                  type="text"
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
                  placeholder="Nombre del cliente"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${label} mb-1`}>Notas (opcional)</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
                  placeholder="Notas adicionales"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className={`block text-sm font-medium ${label}`}>Productos</label>
                <button type="button" onClick={addItem} className="text-blue-500 hover:underline text-xs">
                  + Agregar producto
                </button>
              </div>
              <div className="space-y-2">
                {form.items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <select
                      value={item.product_id}
                      onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                      className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
                    >
                      <option value="">Seleccionar producto...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} - ${p.price} (Stock: {p.stock})</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      className={`w-24 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
                    />
                    <span className={`text-sm ${textMuted} w-24`}>
                      ${((products.find(p => p.id == item.product_id)?.price || 0) * item.quantity).toFixed(2)}
                    </span>
                    {form.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 text-lg">×</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className={`flex justify-between items-center pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <p className={`text-lg font-bold ${text}`}>Total: <span className="text-blue-500">${getTotal()}</span></p>
              <div className="flex gap-3">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
                  Registrar Venta
                </button>
                <button type="button" onClick={() => setShowForm(false)} className={`px-6 py-2 rounded-lg font-medium ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className={`${card} rounded-2xl shadow overflow-hidden`}>
        <table className="w-full text-sm">
          <thead className={`${tableHead} uppercase text-xs`}>
            <tr>
              <th className="px-6 py-3 text-left">#</th>
              <th className="px-6 py-3 text-left">Cliente</th>
              <th className="px-6 py-3 text-left">Productos</th>
              <th className="px-6 py-3 text-left">Total</th>
              <th className="px-6 py-3 text-left">Estado</th>
              <th className="px-6 py-3 text-left">Vendedor</th>
              <th className="px-6 py-3 text-left">Fecha</th>
              <th className="px-6 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            {loading ? (
              <tr><td colSpan="8" className={`text-center py-8 ${textMuted}`}>Cargando...</td></tr>
            ) : sales.length === 0 ? (
              <tr><td colSpan="8" className={`text-center py-8 ${textMuted}`}>No hay ventas</td></tr>
            ) : sales.map((sale) => (
              <tr key={sale.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                <td className={`px-6 py-4 ${textMuted}`}>#{sale.id}</td>
                <td className={`px-6 py-4 font-medium ${text}`}>{sale.customer_name || 'Cliente general'}</td>
                <td className={`px-6 py-4 ${textMuted}`}>{sale.items?.length} producto(s)</td>
                <td className={`px-6 py-4 font-semibold ${text}`}>${sale.total}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${sale.status === 'completada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {sale.status}
                  </span>
                </td>
                <td className={`px-6 py-4 ${textMuted}`}>{sale.user?.name}</td>
                <td className={`px-6 py-4 ${textMuted}`}>{new Date(sale.created_at).toLocaleDateString('es-ES')}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => exportSalePDF(sale.id)} className="text-green-500 hover:underline text-xs">PDF</button>
                    {sale.status === 'completada' && (
                      <button onClick={() => handleCancel(sale.id)} className="text-red-500 hover:underline text-xs">Cancelar</button>
                    )}
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