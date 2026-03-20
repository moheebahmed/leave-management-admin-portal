import { useState, useEffect } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import axios from 'axios'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` }

  useEffect(() => {
    axios.get('http://localhost:3000/api/employee/notifications', { headers })
      .then(res => setNotifications(res.data.data.notifications || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const markAllRead = async () => {
    await axios.put('http://localhost:3000/api/employee/notifications/read-all', {}, { headers })
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const markRead = async (id) => {
    await axios.put(`http://localhost:3000/api/employee/notifications/${id}/read`, {}, { headers })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`
    if (diff < 172800) return 'Yesterday'
    return date.toLocaleDateString()
  }

  return (
    <div className="animate-fade-slide space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">
            <span className="text-[#E04D33] font-bold">Notifications</span>
          </h2>
          <p className="page-subtitle font-semibold text-[rgb(173,173,173)]">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors"
          >
            <CheckCheck size={13} />
            Mark all as read
          </button>
        )}
      </div>

      {/* List */}
      <div className="card-base overflow-hidden divide-y divide-border">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-600">
            <p className="text-sm">Loading...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-600">
            <Bell size={32} className="mb-3 opacity-30" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`flex gap-4 px-5 py-4 hover:bg-card/50 transition-colors cursor-pointer ${!n.is_read ? 'bg-accent/5' : ''}`}
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.is_read ? 'bg-accent' : 'bg-transparent'}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${!n.is_read ? 'text-slate-100' : 'text-slate-400'}`}>{n.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                <p className="text-[11px] text-slate-600 mt-1.5">{formatTime(n.created_at)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Notifications
