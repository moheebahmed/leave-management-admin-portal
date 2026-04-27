import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { API_BASE_URL, getAuthHeaders } from '../api/config'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const WEEKEND_DAYS = [0, 6]
const pad = (n) => String(n).padStart(2, '0')

const AttendanceRegister = () => {
  const today = new Date()
const [year, setYear] = useState(today.getFullYear())  
const [month, setMonth] = useState(0)  

  const [employees, setEmployees] = useState([])
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)
  const [generating, setGenerating] = useState(false)

  // Days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const dateStr = (d) => `${year}-${pad(month + 1)}-${pad(d)}`
  const isWeekend = (d) => WEEKEND_DAYS.includes(new Date(dateStr(d)).getDay())

  // Get status from daily_records
  const getDayRecord = (employee, d) => {
    const ds = dateStr(d)
    return employee.daily_records?.find((r) => r.date === ds) || null
  }

  // Cell style based on API status
  const getCellStyle = (employee, d) => {
    if (isWeekend(d)) return { bg: 'bg-slate-700/30', text: 'text-slate-500', label: 'WE' }
    const record = getDayRecord(employee, d)
    const status = record?.status

    switch (status) {
      case 'Present':   return { bg: 'bg-emerald/15',    text: 'text-emerald',  label: 'P'  }
      case 'Late':      return { bg: 'bg-yellow-500/15', text: 'text-yellow-400', label: 'L' }
      case 'Absent':    return { bg: 'bg-red-500/10',    text: 'text-red-400',  label: 'A'  }
      case 'Half Day':  return { bg: 'bg-blue-500/15',   text: 'text-blue-400', label: 'HD' }
      case 'Holiday':   return { bg: 'bg-amber/15',      text: 'text-amber',    label: 'H'  }
      case 'Leave':     return { bg: 'bg-purple-500/15', text: 'text-purple-400', label: 'LV'}
      default:          return { bg: 'bg-slate-800/30',  text: 'text-slate-600', label: '—' }
    }
  }

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  const handleGenerateRegister = async () => {
    setGenerating(true)
    setError(null)
    try {
      const headers = getAuthHeaders()
      const url = `${API_BASE_URL}/attendance/register?month=${month + 1}&year=${year}`
      
      const res = await fetch(url, { headers })
      
      if (!res.ok) {
        setError(`API Error: ${res.status} ${res.statusText}`)
        return
      }
      
      const json = await res.json()
      
      if (json.success) {
        setEmployees(json.data)
        setStats(json.stats)
      } else {
        setError(json.message || 'Failed to generate register')
      }
    } catch (err) {
      console.error('Generate error:', err)
      setError(`Error: ${err.message}`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="animate-fade-slide space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="page-title">
            <span className="text-accent font-bold">Attendance</span>{' '}
            <span className="text-white font-bold">Register</span>
          </h2>
          <p className="page-subtitle font-semibold text-[rgb(173,173,173)]">
            {stats ? `${stats.total_employees} employees · ${MONTHS[month]} ${year}` : 'Monthly attendance overview'}
          </p>
        </div>

        {/* Month Navigator & Generate Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="btn-ghost" disabled={generating}>
              <ChevronLeft size={14} />
            </button>
            <div className="card-base px-4 py-2 text-sm font-semibold text-slate-200 min-w-[150px] text-center">
              {MONTHS[month]} {year}
            </div>
            <button onClick={nextMonth} className="btn-ghost" disabled={generating}>
              <ChevronRight size={14} />
            </button>
          </div>
          <button
            onClick={handleGenerateRegister}
            disabled={generating}
            className="btn-primary px-4 py-2 text-sm font-semibold whitespace-nowrap"
          >
            {generating ? (
              <>
                <svg className="animate-spin mr-2 h-4 w-4 inline" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Generating...
              </>
            ) : (
              'Generate Register'
            )}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        {[
          { color: 'bg-emerald/20 text-emerald border-emerald/30',           label: 'P — Present'  },
          { color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',  label: 'L — Late'     },
          { color: 'bg-red-500/10 text-red-400 border-red-500/20',           label: 'A — Absent'   },
          { color: 'bg-blue-500/15 text-blue-400 border-blue-500/20',        label: 'HD — Half Day'},
          { color: 'bg-purple-500/15 text-purple-400 border-purple-500/20',  label: 'LV — Leave'   },
          { color: 'bg-amber/15 text-amber border-amber/30',                  label: 'H — Holiday'  },
          { color: 'bg-slate-700/30 text-slate-400 border-slate-600',        label: 'WE — Weekend' },
        ].map((l) => (
          <span key={l.label} className={`px-2.5 py-1 rounded-full border font-semibold ${l.color}`}>
            {l.label}
          </span>
        ))}
      </div>

      {/* Loading / Error States */}
      {error && (
        <div className="card-base flex items-center gap-2 py-6 px-4 text-red-400 text-sm">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Register Table */}
      {!error && employees.length > 0 && (
        <div className="card-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: `${200 + daysInMonth * 44 + 200}px` }}>
              <thead>
                <tr className="bg-[#000000]">
                  {/* Employee col */}
                  <th className="table-th font-semibold text-[rgb(173,173,173)] whitespace-nowrap sticky left-0 bg-[#000000] z-10 min-w-[180px]">
                    Employee
                  </th>

                  {/* Day columns */}
                  {days.map((d) => (
                    <th
                      key={d}
                      className={`table-th font-semibold text-center whitespace-nowrap w-[40px] px-1
                        ${isWeekend(d) ? 'text-slate-600' : 'text-[rgb(173,173,173)]'}`}
                    >
                      <div>{pad(d)}</div>
                      <div className="text-[9px] font-normal opacity-60">
                        {new Date(dateStr(d)).toLocaleDateString('en', { weekday: 'short' })}
                      </div>
                    </th>
                  ))}

                  {/* Summary cols */}
                  <th className="table-th font-semibold text-emerald      text-center whitespace-nowrap">Present</th>
                  <th className="table-th font-semibold text-yellow-400   text-center whitespace-nowrap">Late</th>
                  <th className="table-th font-semibold text-red-400      text-center whitespace-nowrap">Absent</th>
                  <th className="table-th font-semibold text-blue-400     text-center whitespace-nowrap">Half Day</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const s = emp.summary
                  return (
                    <tr key={emp.employee_id} className="table-row-hover last:[&>td]:border-0">

                      {/* Employee name */}
                      <td className="table-td sticky left-0 bg-card z-10">
                        <div>
                          <div className="font-medium text-slate-200 text-[13px] whitespace-nowrap">{emp.full_name}</div>
                          <div className="text-xs text-slate-500 font-mono">#{emp.employee_code}</div>
                          <div className="text-[10px] text-slate-600 mt-0.5">{emp.designation}</div>
                        </div>
                      </td>

                      {/* Day cells */}
                      {days.map((d) => {
                        const cell = getCellStyle(emp, d)
                        return (
                          <td key={d} className="table-td px-1 text-center">
                            <span className={`inline-flex items-center justify-center w-7 h-6 rounded text-[10px] font-bold ${cell.bg} ${cell.text}`}>
                              {cell.label}
                            </span>
                          </td>
                        )
                      })}

                      {/* Summary totals from API */}
                      <td className="table-td text-center">
                        <span className="text-sm font-bold text-emerald">{s.present}</span>
                      </td>
                      <td className="table-td text-center">
                        <span className="text-sm font-bold text-yellow-400">{s.late}</span>
                      </td>
                      <td className="table-td text-center">
                        <span className="text-sm font-bold text-red-400">{s.absent}</span>
                      </td>
                      <td className="table-td text-center">
                        <span className="text-sm font-bold text-blue-400">{s.half_day}</span>
                      </td>

                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!error && employees.length === 0 && (
        <div className="card-base flex items-center justify-center py-16 text-slate-500 text-sm">
          No attendance register generated yet. Click "Generate Register" to create records for {MONTHS[month]} {year}.
        </div>
      )}

    </div>
  )
}

export default AttendanceRegister