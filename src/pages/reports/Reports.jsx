import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useDarkMode } from '../../hooks/useDarkMode'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export default function Reports() {
  const { card, tableHead, text, textMuted, darkMode } = useDarkMode()
  const [summary, setSummary] = useState(null)
  const [lowStock, setLowStock] = useState([])
  const [byCategory, setByCategory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/reports/summary'),
      api.get('/reports/low-stock'),
      api.get('/reports/by-category'),
    ]).then(([s, l, c]) => {
      setSummary(s.data)
      setLowStock(l.data)
      setByCategory(c.data)
    }).finally(() => setLoading(false))
  }, [])

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Reporte de Inventario', 14, 20)
    doc.setFontSize(11)
    doc.text(`Total Productos: ${summary?.total_products}`, 14, 35)
    doc.text(`Categorías: ${summary?.total_categories}`, 14, 42)
    doc.text(`Proveedores: ${summary?.total_suppliers}`, 14, 49)
    doc.text(`Stock Bajo: ${summary?.low_stock}`, 14, 56)
    doc.text(`Valor Total: $${Number(summary?.total_value).toFixed(2)}`, 14, 63)
    doc.setFontSize(14)
    doc.text('Productos con Stock Bajo', 14, 78)
    autoTable(doc, {
      startY: 83,
      head: [['Producto', 'SKU', 'Categoría', 'Stock Actual', 'Stock Mínimo']],
      body: lowStock.map(p => [p.name, p.sku, p.category?.name, p.stock, p.stock_min]),
    })
    const finalY = doc.lastAutoTable.finalY + 15
    doc.setFontSize(14)
    doc.text('Productos por Categoría', 14, finalY)
    autoTable(doc, {
      startY: finalY + 5,
      head: [['Categoría', 'Total Productos', 'Stock Total']],
      body: byCategory.map(c => [c.name, c.products_count, c.products_sum_stock ?? 0]),
    })
    doc.save('reporte-inventario.pdf')
  }

  const exportExcel = () => {
    const wb = XLSX.utils.book_new()
    const resumenData = [
      ['Métrica', 'Valor'],
      ['Total Productos', summary?.total_products],
      ['Categorías', summary?.total_categories],
      ['Proveedores', summary?.total_suppliers],
      ['Stock Bajo', summary?.low_stock],
      ['Valor Total', `$${Number(summary?.total_value).toFixed(2)}`],
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumenData), 'Resumen')
    const stockData = [
      ['Producto', 'SKU', 'Categoría', 'Stock Actual', 'Stock Mínimo'],
      ...lowStock.map(p => [p.name, p.sku, p.category?.name, p.stock, p.stock_min])
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(stockData), 'Stock Bajo')
    const catData = [
      ['Categoría', 'Total Productos', 'Stock Total'],
      ...byCategory.map(c => [c.name, c.products_count, c.products_sum_stock ?? 0])
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(catData), 'Por Categoría')
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'reporte-inventario.xlsx')
  }

  if (loading) return <p className={textMuted}>Cargando reportes...</p>

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className={`text-2xl font-bold ${text}`}>Reportes</h2>
        <div className="flex gap-3">
          <button onClick={exportPDF} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            📄 Exportar PDF
          </button>
          <button onClick={exportExcel} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            📊 Exportar Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Productos', value: summary?.total_products, color: 'border-blue-500' },
          { label: 'Categorías', value: summary?.total_categories, color: 'border-green-500' },
          { label: 'Proveedores', value: summary?.total_suppliers, color: 'border-purple-500' },
          { label: 'Stock Bajo', value: summary?.low_stock, color: 'border-red-500' },
        ].map((item) => (
          <div key={item.label} className={`${card} rounded-2xl shadow p-4 border-l-4 ${item.color}`}>
            <p className={`text-sm ${textMuted}`}>{item.label}</p>
            <p className={`text-2xl font-bold ${text}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className={`${card} rounded-2xl shadow overflow-hidden`}>
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <h3 className={`font-semibold ${text}`}>⚠️ Productos con Stock Bajo</h3>
        </div>
        <table className="w-full text-sm">
          <thead className={`${tableHead} uppercase text-xs`}>
            <tr>
              <th className="px-6 py-3 text-left">Producto</th>
              <th className="px-6 py-3 text-left">SKU</th>
              <th className="px-6 py-3 text-left">Categoría</th>
              <th className="px-6 py-3 text-left">Stock Actual</th>
              <th className="px-6 py-3 text-left">Stock Mínimo</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            {lowStock.length === 0 ? (
              <tr><td colSpan="5" className={`text-center py-6 ${textMuted}`}>Sin productos con stock bajo</td></tr>
            ) : lowStock.map((p) => (
              <tr key={p.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                <td className={`px-6 py-4 font-medium ${text}`}>{p.name}</td>
                <td className={`px-6 py-4 ${textMuted}`}>{p.sku}</td>
                <td className={`px-6 py-4 ${textMuted}`}>{p.category?.name}</td>
                <td className="px-6 py-4 text-red-500 font-semibold">{p.stock}</td>
                <td className={`px-6 py-4 ${textMuted}`}>{p.stock_min}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`${card} rounded-2xl shadow overflow-hidden`}>
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <h3 className={`font-semibold ${text}`}>📊 Productos por Categoría</h3>
        </div>
        <table className="w-full text-sm">
          <thead className={`${tableHead} uppercase text-xs`}>
            <tr>
              <th className="px-6 py-3 text-left">Categoría</th>
              <th className="px-6 py-3 text-left">Total Productos</th>
              <th className="px-6 py-3 text-left">Stock Total</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            {byCategory.map((cat) => (
              <tr key={cat.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                <td className={`px-6 py-4 font-medium ${text}`}>{cat.name}</td>
                <td className={`px-6 py-4 ${textMuted}`}>{cat.products_count}</td>
                <td className={`px-6 py-4 ${textMuted}`}>{cat.products_sum_stock ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}