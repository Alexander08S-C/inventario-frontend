import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import Sales from './pages/sales/Sales'
import StockMovements from './pages/Stock/StockMovements'
import Dashboard from './pages/Dashboard'
import Products from './pages/products/Products'
import ProductForm from './pages/products/ProductForm'
import Categories from './pages/categories/Categories'
import Suppliers from './pages/suppliers/Suppliers'
import Reports from './pages/reports/Reports'
import Users from './pages/users/Users'
import Profile from './pages/profile/Profile'
import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="sales" element={<Sales />} />
          <Route path="stock-movements" element={<StockMovements />} />
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/create" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="categories" element={<Categories />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<Users />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}