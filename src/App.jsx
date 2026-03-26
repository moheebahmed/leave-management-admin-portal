import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import AddEmployee from './pages/AddEmployee'
import LeaveRequests from './pages/LeaveRequests'
import LeaveBalance from './pages/LeaveBalance'
import AddLeaveBalance from './pages/AddLeaveBalance'
import LeaveTypes from './pages/LeaveTypes'
import Login from './pages/Login'
import Notifications from './pages/Notifications'
import ProtectedRoute from './components/ProtectedRoute'

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('isAuthenticated') === 'true'
  )

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(sessionStorage.getItem('isAuthenticated') === 'true')
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('auth-change', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('auth-change', handleStorageChange)
    }
  }, [])

  return (
    <Routes>
      {/* Login Route */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
      />

      {/* Protected Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="employees" element={<Employees />} />
        <Route path="add-employee" element={<AddEmployee />} />
        <Route path="edit-employee/:id" element={<AddEmployee />} />
        <Route path="leave-requests" element={<LeaveRequests />} />
        <Route path="leave-balance" element={<LeaveBalance />} />
        <Route path="add-leave" element={<AddLeaveBalance />} />
        <Route path="edit-leave/:empId" element={<AddLeaveBalance />} />
        <Route path="leave-types" element={<LeaveTypes />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
