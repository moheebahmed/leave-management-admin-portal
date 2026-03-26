import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, LogOut } from 'lucide-react'
import { useState } from 'react'

const PAGE_TITLES = {
  '/': 'Dashboard Overview',
  '/employees': 'Employee Directory',
  '/add-employee': 'Add New Employee',
  '/leave-balance': 'Leave Balance',
  '/add-leave': 'Add Leave Balance',
}

const Navbar = ({ toggleSidebar }) => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const title = PAGE_TITLES[pathname] || 'Dashboard'
  const [showLogoutMenu, setShowLogoutMenu] = useState(false)
  const userEmail = sessionStorage.getItem('userEmail') || 'hr@conceptrecall.com'

  const handleLogout = () => {
    sessionStorage.clear()
    window.dispatchEvent(new Event('auth-change'))
    navigate('/login')
  }

  return (
    <header className="h-14 flex items-center px-5 gap-4 bg-surface/75 backdrop-blur border-b border-border shrink-0">
      {/* Collapse button */}
      <button
        onClick={toggleSidebar}
        className="btn-ghost"
        aria-label="Toggle sidebar"
      >
        <Menu size={15} />
      </button>

      {/* Page title */}
      <h1 className="font-syne font-semibold text-[14px] text-slate-100 flex-1 truncate">{title}</h1>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Search bar */}
        <div className="hidden sm:flex items-center gap-2 bg-card/60 border border-border rounded-lg px-3 py-1.5 text-xs text-slate-500 cursor-pointer hover:border-border-bright transition-colors">
          <Search size={12} />
          <span>Quick search…</span>
          <span className="ml-1 text-[10px] bg-border px-1.5 py-0.5 rounded text-slate-600">⌘K</span>
        </div>

        {/* Bell */}
        <button className="btn-ghost relative">
          <Bell size={14} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent border-[1.5px] border-surface" />
        </button>

        {/* Avatar with dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowLogoutMenu(!showLogoutMenu)}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:opacity-90 transition-opacity"
          >
            AD
          </button>

          {/* Logout Dropdown */}
          {showLogoutMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowLogoutMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-56 card-base p-2 shadow-xl z-20 animate-fade-slide">
                <div className="px-3 py-2 border-b border-border mb-2">
                  <p className="text-xs font-semibold text-slate-300">Login as</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{userEmail}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-card-hover rounded-lg transition-colors"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
