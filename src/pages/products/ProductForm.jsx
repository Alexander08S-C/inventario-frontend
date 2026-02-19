import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import { useDarkMode } from '../../hooks/useDarkMode'

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const { card, text, input, label, darkMode } = useDarkMode()

  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [form, setForm] = useState({
    name: '', sku: '', description: '', price: '', cost: '',
    stock: '', stock_min: '', category_id: '', supplier_id: '', active: true,
  })

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.data ?? r.data))
    api.get('/suppliers').then(r => setSuppliers(r.data.data ?? r.data))
    if (isEdit) {
      api.get(`/products/${id}`).then(r => {
        const p = r.data.data ?? r.data
        setForm(p)
        if (p.image) setImagePreview(`http://127.0.0.1:8000/storage/${p.image}`)
      })
    }
  }, [id, isEdit])

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (key === 'active') {
            formData.append(key, value ? 1 : 0)
          } else {
            formData.append(key, value)
          }
        }
      })
      if (imageFile) formData.append('image', imageFile)
      if (isEdit) formData.append('_method', 'PUT')
      await api.post(isEdit ? `/products/${id}` : '/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      navigate('/products')
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors)
    } finally {
      setLoading(false)
    }
  }

  const field = (lbl, key, type = 'text') => (
    <div>
      <label className={`block text-sm font-medium ${label} mb-1`}>{lbl}</label>
      <input
        type={type}
        value={form[key] ?? ''}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
      />
      {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key][0]}</p>}
    </div>
  )

  return (
    <div>
      <h2 className={`text-2xl font-bold ${text} mb-6`}>
        {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
      </h2>
      <div className={`${card} rounded-2xl shadow p-4 lg:p-6 max-w-2xl`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('Nombre', 'name')}
            {field('SKU', 'sku')}
            {field('Precio', 'price', 'number')}
            {field('Costo', 'cost', 'number')}
            {field('Stock', 'stock', 'number')}
            {field('Stock Mínimo', 'stock_min', 'number')}
          </div>

          <div>
            <label className={`block text-sm font-medium ${label} mb-1`}>Descripción</label>
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${label} mb-1`}>Categoría</label>
              <select
                value={form.category_id ?? ''}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
              >
                <option value="">Seleccionar...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id[0]}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium ${label} mb-1`}>Proveedor</label>
              <select
                value={form.supplier_id ?? ''}
                onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${input}`}
              >
                <option value="">Seleccionar...</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${label} mb-1`}>Imagen</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className={`w-full border rounded-lg px-3 py-2 text-sm ${input}`}
            />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-2 h-32 w-32 object-cover rounded-lg border" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.active ?? true}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="w-4 h-4"
            />
            <label className={`text-sm ${text}`}>Producto activo</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/products')}
              className={`px-6 py-2 rounded-lg font-medium ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}