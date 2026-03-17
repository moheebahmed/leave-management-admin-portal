import { useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'

const INITIAL_NOTIFICATIONS = [
  { id: 1, title: 'Leave Request Submitted', desc: 'Ali Hassan submitted a leave request for 3 days.', time: '2 min ago', read: false },
  { id: 2, title: 'New Employee Added', desc: 'Sara Khan has been added to the system.', time: '1 hr ago', read: false },
  { id: 3, title: 'Leave Approved', desc: "Ahmed Raza's leave request has been approved.", time: '3 hr ago', read: true },
  { id: 4, title: 'Leave Balance Updated', desc: 'Annual leave balance updated for all employees.', time: 'Yesterday', read: true },
  { id: 5, title: 'Leave Rejected', desc: "Usman Ali's leave request was rejected.", time: '2 days ago', read: true },
]

const Notifications = () => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))

  const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))

  return (
    <div className="animate-fade-slide space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">
            <span className="text-[#E04D33] font-bold">Notifications</span>{' '}
            {/* <span className="text-white font-bold">Center</span> */}
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
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-600">
            <Bell size={32} className="mb-3 opacity-30" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`flex gap-4 px-5 py-4 hover:bg-card/50 transition-colors cursor-pointer ${!n.read ? 'bg-accent/5' : ''}`}
            >
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-accent' : 'bg-transparent'}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${!n.read ? 'text-slate-100' : 'text-slate-400'}`}>{n.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
                <p className="text-[11px] text-slate-600 mt-1.5">{n.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Notifications
