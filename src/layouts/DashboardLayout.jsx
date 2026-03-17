import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'

// Context to share toast and data across pages
import { createContext, useContext } from 'react'
import { INITIAL_EMPLOYEES, INITIAL_LEAVE_BALANCES } from '../data/initialData'

export const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES)
  const [leaveBalances, setLeaveBalances] = useState(INITIAL_LEAVE_BALANCES)
  const { toast, showToast, hideToast } = useToast()

  return (
    <AppContext.Provider value={{ employees, setEmployees, leaveBalances, setLeaveBalances, showToast }}>
      <div className="flex h-screen overflow-hidden app-bg">
        <Sidebar collapsed={collapsed} />

        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar toggleSidebar={() => setCollapsed((c) => !c)} />

          <main className="flex-1 overflow-y-auto p-6 bg-transparent">
            <Outlet />
          </main>
        </div>

        <Toast toast={toast} onClose={hideToast} />
      </div>
    </AppContext.Provider>
  )
}

export default DashboardLayout
