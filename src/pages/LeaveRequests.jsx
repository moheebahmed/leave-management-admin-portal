import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2, Copy, Search, ChevronDown } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useApp } from '../layouts/DashboardLayout'
import { TableWrapper, EmptyState } from '../components/Table'
import Avatar from '../components/Avatar'

const StatusBadge = ({ status, onStatusChange }) => {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  const colors = {
    APPROVED: 'bg-emerald/10 text-emerald border-emerald/20',
    PENDING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    REJECTED: 'bg-danger/10 text-danger border-danger/20',
  }

  const allStatuses = ['APPROVED', 'PENDING', 'REJECTED']

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <span
        className={`text-xs px-2 py-0.5 rounded-full border cursor-pointer select-none flex items-center gap-1 ${colors[status] || colors.PENDING}`}
        onClick={() => setOpen(!open)}
      >
        {status}
        <ChevronDown size={10} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </span>

      <div
        className="absolute z-50 mt-1 left-0 bg-[#1a1a1a] border border-border rounded-lg shadow-xl overflow-hidden min-w-[110px]"
        style={{
          transition: 'opacity 0.15s ease, transform 0.15s ease',
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0px) scale(1)' : 'translateY(-6px) scale(0.97)',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {allStatuses.map((s) => (
          <div
            key={s}
            className={`text-xs px-3 py-2 cursor-pointer hover:bg-white/5 flex items-center gap-2 transition-colors ${colors[s]} ${s === status ? 'opacity-100 font-semibold' : 'opacity-70'}`}
            onClick={() => {
              if (s !== status) onStatusChange(s)
              setOpen(false)
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {s}
          </div>
        ))}
      </div>
    </div>
  )
}

const LeaveRequests = () => {
  const navigate = useNavigate()
  const { showToast } = useApp()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedRows, setSelectedRows] = useState([])

  useEffect(() => {
    fetchLeaveRequests()
  }, [])

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true)
      const res = await axios.get('http://localhost:3000/api/hr/leave/requests', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      console.log('API Response:', res.data)
      setRequests(res.data.data.requests || [])
    } catch (error) {
      console.error('Error fetching leave requests:', error.response || error)
      showToast('Failed to fetch leave requests')
    } finally {
      setLoading(false)
    }
  }

  const filtered = requests.filter((req) =>
    req.Employee?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    req.LeaveType?.name?.toLowerCase().includes(search.toLowerCase()) ||
    req.status?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this leave request?')) return

    try {
      await axios.delete(`http://localhost:3000/api/hr/leave/requests/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      setRequests((prev) => prev.filter((r) => r.id !== id))
      showToast('Leave request deleted successfully')
    } catch (error) {
      console.log('Error deleting request:', error)
      showToast('Failed to delete leave request')
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    console.log('Updating status:', { id, newStatus })

    try {
      const response = await axios.put(
        `http://localhost:3000/api/hr/leave/requests/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      console.log('Status update response:', response.data)

      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      )
      showToast(`Status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating status:', error.response?.data || error)
      showToast(error.response?.data?.message || 'Failed to update status')
    }
  }

  const handleCopy = (request) => {
    const employeeName = request.Employee?.full_name || 'Unknown'
    const text = `Employee: ${employeeName}\nLeave Type: ${request.LeaveType?.name}\nDates: ${new Date(request.start_date).toLocaleDateString()} - ${new Date(request.end_date).toLocaleDateString()}\nDays: ${request.total_days}\nStatus: ${request.status}`
    navigator.clipboard.writeText(text)
    showToast('Request details copied to clipboard')
  }

  const toggleSelectAll = () => {
    if (selectedRows.length === filtered.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(filtered.map((r) => r.id))
    }
  }

  const toggleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    )
  }

  return (
    <div className="animate-fade-slide space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">
            <span className="text-accent font-bold">Leave</span>{' '}
            <span className="text-white font-bold">Requests</span>
          </h2>
          <p className="page-subtitle font-semibold text-[rgb(173,173,173)]">
            {requests.length} requests submitted
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedRows.length > 0 && (
            <button
              className="btn-ghost hover:!bg-danger/10 hover:!text-danger"
              onClick={() => {
                if (confirm(`Delete ${selectedRows.length} selected requests?`)) {
                  selectedRows.forEach((id) => handleDelete(id))
                  setSelectedRows([])
                }
              }}
            >
              <Trash2 size={14} />
              Delete Selected ({selectedRows.length})
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <TableWrapper
        title="All Leave Requests"
        action={
          <div className="flex items-center gap-2 bg-surface/70 border border-border rounded-lg px-3 py-1.5">
            <Search size={12} className="text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search requests…"
              className="bg-transparent text-xs text-slate-200 placeholder-slate-600 outline-none w-40"
            />
          </div>
        }
      >
        {loading ? (
          <EmptyState message="Loading leave requests..." />
        ) : filtered.length === 0 ? (
          <EmptyState message="No leave requests found." />
        ) : (
          <table className="w-full h-[53.5vh]">
            <thead>
              <tr className="bg-[#000000]">
                <th className="table-th font-semibold text-[rgb(173,173,173)]">ID</th>
                <th className="table-th font-semibold text-[rgb(173,173,173)]">Employee</th>
                <th className="table-th font-semibold text-[rgb(173,173,173)]">Leave Type</th>
                <th className="table-th font-semibold text-[rgb(173,173,173)]">Start Date</th>
                <th className="table-th font-semibold text-[rgb(173,173,173)]">End Date</th>
                <th className="table-th font-semibold text-[rgb(173,173,173)]">Total Days</th>
                <th className="table-th font-semibold text-[rgb(173,173,173)]">Reason</th>
                <th className="table-th font-semibold text-[rgb(173,173,173)]">Status</th>
                <th className="table-th font-semibold text-[rgb(173,173,173)]">Actioned By</th>
                <th className="table-th text-center font-semibold text-[rgb(173,173,173)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req, i) => (
                <tr key={req.id} className="table-row-hover last:[&>td]:border-0">
                  {/* ID */}
                  <td className="table-td">
                    <span className="font-mono text-xs text-slate-400 bg-surface/70 px-2 py-0.5 rounded border border-border">
                      {req.id}
                    </span>
                  </td>

                  {/* Employee */}
                  <td className="table-td">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        name={req.Employee?.full_name || 'Unknown'}
                        index={i}
                        size="sm"
                      />
                      <span className="font-medium text-slate-200 text-[13.5px]">
                        {req.Employee?.full_name || '—'}
                      </span>
                    </div>
                  </td>

                  {/* Leave Type */}
                  <td className="table-td">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan/10 text-cyan border border-cyan/20">
                      {req.LeaveType?.name || '—'}
                    </span>
                  </td>

                  {/* Start Date */}
                  <td className="table-td text-slate-400 text-[12.5px]">
                    {req.start_date ? new Date(req.start_date).toLocaleDateString() : '—'}
                  </td>

                  {/* End Date */}
                  <td className="table-td text-slate-400 text-[12.5px]">
                    {req.end_date ? new Date(req.end_date).toLocaleDateString() : '—'}
                  </td>

                  {/* Total Days */}
                  <td className="table-td">
                    <span className="font-semibold text-slate-300 text-[13px]">
                      {req.total_days}
                    </span>
                  </td>

                  {/* Reason */}
                  <td className="table-td text-slate-400 text-[12.5px] max-w-[200px] truncate">
                    {req.reason || '—'}
                  </td>

                  {/* Status - Dropdown */}
                  <td className="table-td">
                    <StatusBadge
                      status={req.status}
                      onStatusChange={(newStatus) => handleStatusChange(req.id, newStatus)}
                    />
                  </td>

                  {/* Actioned By */}
                  <td className="table-td text-slate-400 text-[12.5px]">
                    {req.actioned_by || '—'}
                  </td>

                  {/* Actions */}
                  <td className="table-td">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="btn-ghost hover:!bg-accent/10 hover:!text-accent hover:!border-accent/30"
                        title="Edit"
                        onClick={() => showToast('Edit functionality coming soon')}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        className="btn-ghost hover:!bg-cyan/10 hover:!text-cyan hover:!border-cyan/30"
                        title="Copy"
                        onClick={() => handleCopy(req)}
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        className="btn-ghost hover:!bg-danger/10 hover:!text-danger hover:!border-danger/30"
                        title="Delete"
                        onClick={() => handleDelete(req.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableWrapper>
    </div>
  )
}

export default LeaveRequests