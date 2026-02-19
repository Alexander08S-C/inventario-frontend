import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useDarkMode } from '../../hooks/useDarkMode'

export default function Products() {
  const { card, tableHead, text, textMuted, input, darkMode } = useDarkMode()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const res = await api.get('/products', { params: { search, page } })
        setProducts(res.data.data)
        setMeta(res.data.meta)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [search, page])

  useEffect(() => { setPage(1) }, [search])

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return
    await api.delete(`/products/${id}`)
    setPage(1)
    setSearch('')
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${text}`}>Productos</h2>
        <a href="/products/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Nuevo Producto
        </a>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`border rounded-lg px-4 py-2 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
        />
      </div>

      <div className={`${card} rounded-2xl shadow overflow-hidden`}>
        <table className="w-full text-sm">
          <thead className={`${tableHead} uppercase text-xs`}>
            <tr>
              <th className="px-6 py-3 text-left">Producto</th>
              <th className="px-6 py-3 text-left">SKU</th>
              <th className="px-6 py-3 text-left">Categoría</th>
              <th className="px-6 py-3 text-left">Precio</th>
              <th className="px-6 py-3 text-left">Stock</th>
              <th className="px-6 py-3 text-left">Estado</th>
              <th className="px-6 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            {loading ? (
              <tr><td colSpan="7" className={`text-center py-8 ${textMuted}`}>Cargando...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan="7" className={`text-center py-8 ${textMuted}`}>No hay productos</td></tr>
            ) : products.map((p) => (
              <tr key={p.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {p.image ? (
                      <img src={`http://127.0.0.1:8000/storage/${p.image}`} alt={p.name} className="w-10 h-10 rounded-lg object-cover border" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-lg">📦</div>
                    )}
                    <span className={`font-medium ${text}`}>{p.name}</span>
                  </div>
                </td>
                <td className={`px-6 py-4 ${textMuted}`}>{p.sku}</td>
                <td className={`px-6 py-4 ${textMuted}`}>{p.category?.name}</td>
                <td className={`px-6 py-4 ${text}`}>${p.price}</td>
                <td className="px-6 py-4">
                  <span className={p.stock <= p.stock_min ? 'text-red-500 font-semibold' : text}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {p.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <a href={`/products/${p.id}/edit`} className="text-blue-500 hover:underline text-xs">Editar</a>
                    <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline text-xs">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {meta && meta.last_page > 1 && (
          <div className={`px-6 py-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex items-center justify-between`}>
            <p className={`text-sm ${textMuted}`}>
              Mostrando {meta.from} - {meta.to} de {meta.total} productos
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(page - 1)} disabled={page === 1} className={`px-3 py-1 rounded-lg border text-sm disabled:opacity-40 ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}>
                ← Anterior
              </button>
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`px-3 py-1 rounded-lg border text-sm ${page === p ? 'bg-blue-600 text-white border-blue-600' : darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(page + 1)} disabled={page === meta.last_page} className={`px-3 py-1 rounded-lg border text-sm disabled:opacity-40 ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}>
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}