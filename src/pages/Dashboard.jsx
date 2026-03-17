import { Users, Calendar, Briefcase, AlertCircle, CheckCircle } from 'lucide-react'
import StatCard from '../components/StatCard'
import Avatar from '../components/Avatar'
import { useApp } from '../layouts/DashboardLayout'
import { LEAVE_TYPES, getAvatarColor } from '../data/initialData'

const ACTIVITIES = [
  { color: '#3b82f6', text: 'Ayesha Khan applied for Annual Leave', time: '2 hours ago' },
  { color: '#10b981', text: "Bilal Ahmed's leave request approved", time: '5 hours ago' },
  { color: '#f59e0b', text: 'New employee Sara Malik added', time: 'Yesterday' },
  { color: '#8b5cf6', text: 'Leave balance updated for Usman Tariq', time: '2 days ago' },
  { color: '#ef4444', text: "Nadia Raza's emergency leave declined", time: '3 days ago' },
]

const PENDING_REQUESTS = [
  { name: 'Ayesha Khan', type: 'Annual Leave', days: 3, status: 'pending' },
  { name: 'Usman Tariq', type: 'Sick Leave', days: 1, status: 'pending' },
  { name: 'Sara Malik', type: 'Emergency Leave', days: 2, status: 'pending' },
]

const Dashboard = () => {
  const { employees, leaveBalances } = useApp()
  const onLeaveCount = leaveBalances.filter((l) => l.used > 0).length

  // Department breakdown
  const depts = ['Engineering', 'Design', 'Marketing', 'HR', 'Finance']
  const deptData = depts.map((d, i) => ({
    name: d,
    count: employees.filter((e) => e.department === d).length,
    color: getAvatarColor(i),
  }))
  const maxCount = Math.max(...deptData.map((d) => d.count), 1)

  return (
    <div className="animate-fade-slide space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="page-title">
          <span className="text-accent font-bold">Admin</span>
          {' '}
          <span className="text-white font-bold">Dashboard</span>
        </h2>
        <p className="page-subtitle font-semibold text-[rgb(173,173,173)]">
          Here's what's happening across your organization today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          value={employees.length}
          label="Total Employees"
          icon={Users}
          color="blue"
          delta="+2 this month"
          deltaType="up"
        />
        <StatCard
          value={LEAVE_TYPES.length}
          label="Leave Types"
          icon={Calendar}
          color="cyan"
          delta="Configured"
          deltaType="up"
        />
        <StatCard
          value={onLeaveCount}
          label="Employees on Leave"
          icon={Briefcase}
          color="purple"
          delta="Active now"
          deltaType="down"
        />
        <StatCard
          value={PENDING_REQUESTS.length}
          label="Pending Requests"
          icon={AlertCircle}
          color="amber"
          delta="Awaiting review"
          deltaType="down"
        />
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card-base p-5">
          <h3 className="section-title mb-4">Recent Activity</h3>
          <div className="space-y-0">
            {ACTIVITIES.map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-3 py-3 border-b border-border last:border-0"
              >
                <div
                  className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                  style={{ background: a.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300">{a.text}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="card-base p-5">
          <h3 className="section-title mb-4">Department Breakdown</h3>
          <div className="space-y-4">
            {deptData.map((d, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-slate-300">{d.name}</span>
                  <span className="text-xs text-slate-500">{d.count} emp</span>
                </div>
                <div className="h-1 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.max((d.count / maxCount) * 100, 4)}%`,
                      background: d.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Summary pill */}
          <div className="mt-5 p-3 bg-surface/70 rounded-xl border border-border text-center">
            <div className="font-syne text-2xl font-bold text-accent">{employees.length}</div>
            <div className="text-xs text-slate-500 mt-0.5">Total headcount</div>
          </div>
        </div>
      </div>

      {/* Pending Requests Table */}
      <div className="card-base overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="section-title">Pending Leave Requests</h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
            {PENDING_REQUESTS.length} pending
          </span>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-th">Employee</th>
              <th className="table-th">Leave Type</th>
              <th className="table-th">Days</th>
              <th className="table-th">Status</th>
              <th className="table-th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {PENDING_REQUESTS.map((req, i) => (
              <tr key={i} className="table-row-hover last:[&>td]:border-0">
                <td className="table-td">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={req.name} index={i} size="sm" />
                    <span className="font-medium text-slate-200">{req.name}</span>
                  </div>
                </td>
                <td className="table-td text-slate-400">{req.type}</td>
                <td className="table-td font-semibold text-slate-300">{req.days}d</td>
                <td className="table-td">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-accent/10 text-accent">
                    Pending
                  </span>
                </td>
                <td className="table-td">
                  <div className="flex items-center justify-end gap-2">
                    <button className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald/10 text-emerald hover:bg-emerald/20 transition-colors">
                      <CheckCircle size={11} /> Approve
                    </button>
                    <button className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors">
                      Rejected
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Dashboard
