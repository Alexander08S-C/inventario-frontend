import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useDarkMode } from '../hooks/useDarkMode'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Dashboard() {
  const { darkMode, card, tableHead, tableRow, text, textMuted } = useDarkMode()
  const [summary, setSummary] = useState(null)
  const [byCategory, setByCategory] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/reports/summary'),
      api.get('/reports/by-category'),
      api.get('/reports/low-stock'),
    ]).then(([s, c, l]) => {
      setSummary(s.data)
      setByCategory(c.data)
      setLowStock(l.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <p className={textMuted}>Cargando...</p>

  const pieData = byCategory.filter(c => c.products_count > 0).map(c => ({ name: c.name, value: c.products_count }))
  const barData = byCategory.filter(c => c.products_sum_stock > 0).map(c => ({ name: c.name, stock: c.products_sum_stock }))

  const statCards = [
    { icon: '📦', label: 'Total Productos', value: summary?.total_products, color: 'border-blue-500' },
    { icon: '🏷️', label: 'Categorías', value: summary?.total_categories, color: 'border-green-500' },
    { icon: '🚚', label: 'Proveedores', value: summary?.total_suppliers, color: 'border-purple-500' },
    { icon: '⚠️', label: 'Stock Bajo', value: summary?.low_stock, color: 'border-red-500' },
    { icon: '💰', label: 'Valor Total', value: `$${Number(summary?.total_value).toFixed(2)}`, color: 'border-yellow-500' },
  ]

  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${text}`}>Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((item) => (
          <div key={item.label} className={`${card} rounded-2xl shadow p-6 border-l-4 ${item.color}`}>
            <div className="flex items-center gap-4">
              <span className="text-4xl">{item.icon}</span>
              <div>
                <p className={`text-sm ${textMuted}`}>{item.label}</p>
                <p className={`text-2xl font-bold ${text}`}>{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${card} rounded-2xl shadow p-6`}>
          <h3 className={`font-semibold ${text} mb-4`}>📊 Stock por Categoría</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: darkMode ? '#9ca3af' : '#6b7280' }} />
              <YAxis tick={{ fontSize: 12, fill: darkMode ? '#9ca3af' : '#6b7280' }} />
              <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', border: 'none', color: darkMode ? '#fff' : '#000' }} />
              <Bar dataKey="stock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={`${card} rounded-2xl shadow p-6`}>
          <h3 className={`font-semibold ${text} mb-4`}>🥧 Productos por Categoría</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', border: 'none' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className={`${card} rounded-2xl shadow overflow-hidden`}>
          <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <h3 className={`font-semibold ${text}`}>⚠️ Productos con Stock Bajo</h3>
          </div>
          <table className="w-full text-sm">
            <thead className={tableHead}>
              <tr>
                <th className="px-6 py-3 text-left uppercase text-xs">Producto</th>
                <th className="px-6 py-3 text-left uppercase text-xs">Categoría</th>
                <th className="px-6 py-3 text-left uppercase text-xs">Stock Actual</th>
                <th className="px-6 py-3 text-left uppercase text-xs">Stock Mínimo</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
              {lowStock.map((p) => (
                <tr key={p.id} className={tableRow.split(' ')[0]}>
                  <td className={`px-6 py-4 font-medium ${text}`}>{p.name}</td>
                  <td className={`px-6 py-4 ${textMuted}`}>{p.category?.name}</td>
                  <td className="px-6 py-4 text-red-600 font-semibold">{p.stock}</td>
                  <td className={`px-6 py-4 ${textMuted}`}>{p.stock_min}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}