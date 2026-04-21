import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Dummy data
const DUMMY_EMPLOYEES = [
  { id: 1, name: 'Asad Ali', emp_no: '55' },
  { id: 2, name: 'Shoaib Malik', emp_no: '48' },
  { id: 3, name: 'Usman Tariq', emp_no: '32' },
  { id: 4, name: 'Ali Raza', emp_no: '21' },
]

const DUMMY_HOLIDAYS = ['2026-05-01', '2026-05-14']
const WEEKEND_DAYS = [0, 6] // 0=Sunday, 6=Saturday

// Dummy attendance: empId -> [dates present]
const DUMMY_PRESENT = {
  1: ['2026-05-04', '2026-05-05', '2026-05-06', '2026-05-07', '2026-05-08', '2026-05-11', '2026-05-12', '2026-05-13', '2026-05-15', '2026-05-18', '2026-05-19', '2026-05-20', '2026-05-21', '2026-05-22'],
  2: ['2026-05-04', '2026-05-05', '2026-05-07', '2026-05-08', '2026-05-11', '2026-05-12', '2026-05-13', '2026-05-15', '2026-05-18', '2026-05-19', '2026-05-20'],
  3: ['2026-05-04', '2026-05-06', '2026-05-07', '2026-05-08', '2026-05-11', '2026-05-13', '2026-05-15', '2026-05-18', '2026-05-19', '2026-05-20', '2026-05-21', '2026-05-22'],
  4: ['2026-05-05', '2026-05-06', '2026-05-07', '2026-05-08', '2026-05-11', '2026-05-12', '2026-05-13', '2026-05-15', '2026-05-18'],
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const pad = (n) => String(n).padStart(2, '0')

const AttendanceRegister = () => {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth()) // 0-indexed

  // Days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const dateStr = (d) => `${year}-${pad(month + 1)}-${pad(d)}`
  const isWeekend = (d) => WEEKEND_DAYS.includes(new Date(dateStr(d)).getDay())
  const isHoliday = (d) => DUMMY_HOLIDAYS.includes(dateStr(d))
  const isPresent = (empId, d) => (DUMMY_PRESENT[empId] || []).includes(dateStr(d))

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  // Cell style
  const getCellStyle = (empId, d) => {
    if (isHoliday(d)) return { bg: 'bg-amber/15', text: 'text-amber', label: 'H' }
    if (isWeekend(d)) return { bg: 'bg-slate-700/30', text: 'text-slate-500', label: 'WE' }
    if (isPresent(empId, d)) return { bg: 'bg-emerald/15', text: 'text-emerald', label: 'P' }
    return { bg: 'bg-red-500/10', text: 'text-red-400', label: 'A' }
  }

  // Totals
  const getTotals = (empId) => {
    let present = 0, absent = 0
    days.forEach((d) => {
      if (isWeekend(d) || isHoliday(d)) return
      if (isPresent(empId, d)) present++
      else absent++
    })
    return { present, absent }
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
            Monthly attendance overview
          </p>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button onClick={prevMonth} className="btn-ghost">
            <ChevronLeft size={14} />
          </button>
          <div className="card-base px-4 py-2 text-sm font-semibold text-slate-200 min-w-[150px] text-center">
            {MONTHS[month]} {year}
          </div>
          <button onClick={nextMonth} className="btn-ghost">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        {[
          { color: 'bg-emerald/20 text-emerald border-emerald/30', label: 'P — Present' },
          { color: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'A — Absent' },
          { color: 'bg-amber/15 text-amber border-amber/30', label: 'H — Holiday' },
          { color: 'bg-slate-700/30 text-slate-400 border-slate-600', label: 'WE — Weekend' },
        ].map((l) => (
          <span key={l.label} className={`px-2.5 py-1 rounded-full border font-semibold ${l.color}`}>
            {l.label}
          </span>
        ))}
      </div>

      {/* Register Table */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: `${120 + daysInMonth * 44 + 120}px` }}>
            <thead>
              <tr className="bg-[#000000]">
                {/* Employee col */}
                <th className="table-th font-semibold text-[rgb(173,173,173)] whitespace-nowrap sticky left-0 bg-[#000000] z-10 min-w-[160px]">
                  Employee
                </th>

                {/* Day columns */}
                {days.map((d) => (
                  <th
                    key={d}
                    className={`table-th font-semibold text-center whitespace-nowrap w-[40px] px-1
                      ${isHoliday(d) ? 'text-amber' : isWeekend(d) ? 'text-slate-600' : 'text-[rgb(173,173,173)]'}`}
                  >
                    <div>{pad(d)}</div>
                    <div className="text-[9px] font-normal opacity-60">
                      {new Date(dateStr(d)).toLocaleDateString('en', { weekday: 'short' })}
                    </div>
                  </th>
                ))}

                {/* Totals */}
                <th className="table-th font-semibold text-emerald text-center whitespace-nowrap">Present</th>
                <th className="table-th font-semibold text-red-400 text-center whitespace-nowrap">Absent</th>
              </tr>
            </thead>
            <tbody>
              {DUMMY_EMPLOYEES.map((emp) => {
                const { present, absent } = getTotals(emp.id)
                return (
                  <tr key={emp.id} className="table-row-hover last:[&>td]:border-0">

                    {/* Employee name */}
                    <td className="table-td sticky left-0 bg-card z-10">
                      <div>
                        <div className="font-medium text-slate-200 text-[13px] whitespace-nowrap">{emp.name}</div>
                        <div className="text-xs text-slate-500 font-mono">#{emp.emp_no}</div>
                      </div>
                    </td>

                    {/* Day cells */}
                    {days.map((d) => {
                      const cell = getCellStyle(emp.id, d)
                      return (
                        <td key={d} className="table-td px-1 text-center">
                          <span className={`inline-flex items-center justify-center w-7 h-6 rounded text-[10px] font-bold ${cell.bg} ${cell.text}`}>
                            {cell.label}
                          </span>
                        </td>
                      )
                    })}

                    {/* Totals */}
                    <td className="table-td text-center">
                      <span className="text-sm font-bold text-emerald">{present}</span>
                    </td>
                    <td className="table-td text-center">
                      <span className="text-sm font-bold text-red-400">{absent}</span>
                    </td>

                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

export default AttendanceRegister
