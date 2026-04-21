import { useState } from 'react'
import { Search, Filter, X, ChevronDown, ChevronRight } from 'lucide-react'
import { TableWrapper, EmptyState } from '../components/Table'
import Avatar from '../components/Avatar'

const DUMMY_RECORDS = [
  { id: 1,  emp_no: '55', ac_no: '48', name: 'Asad',  department: 'Engineering', date: '2026-03-05', timetable: 'Full Day', on_duty: '19:00', off_duty: '03:00', clock_in: '20:58', clock_out: '03:00', normal: 1, real_time: 0.5, late: '02:58', early: '01:05', absent: 0, ot_time: '05:01', work_time: '06:13' },
  { id: 2,  emp_no: '55', ac_no: '48', name: 'Asad',  department: 'Engineering', date: '2026-03-11', timetable: 'Full Day', on_duty: '19:00', off_duty: '03:00', clock_in: '20:45', clock_out: '02:59', normal: 1, real_time: 0.5, late: '02:45', early: null,   absent: 0, ot_time: null,   work_time: '06:13' },
  { id: 3,  emp_no: '55', ac_no: '48', name: 'Asad',  department: 'Engineering', date: '2026-03-12', timetable: 'Full Day', on_duty: '19:00', off_duty: '03:00', clock_in: '20:05', clock_out: '03:00', normal: 1, real_time: 0.5, late: '02:05', early: null,   absent: 0, ot_time: null,   work_time: '06:54' },
  { id: 4,  emp_no: '55', ac_no: '48', name: 'Asad',  department: 'Engineering', date: '2026-03-13', timetable: 'Full Day', on_duty: '19:00', off_duty: '03:00', clock_in: '20:23', clock_out: '02:56', normal: 1, real_time: 0.5, late: '02:23', early: null,   absent: 0, ot_time: null,   work_time: '06:36' },
  { id: 5,  emp_no: '55', ac_no: '48', name: 'Asad',  department: 'Engineering', date: '2026-03-14', timetable: 'Full Day', on_duty: '19:00', off_duty: '03:00', clock_in: '20:29', clock_out: '02:56', normal: 1, real_time: 0.5, late: '02:29', early: null,   absent: 0, ot_time: null,   work_time: '06:27' },
  { id: 6,  emp_no: '48', ac_no: '32', name: 'Abdullah',  department: 'HR',          date: '2026-03-15', timetable: 'Full Day', on_duty: '19:00', off_duty: '03:00', clock_in: '16:16', clock_out: null,   normal: 1, real_time: 1,   late: null,   early: '01:00', absent: 0, ot_time: null,   work_time: '08:00' },
  { id: 7,  emp_no: '48', ac_no: '32', name: 'Abdullah',  department: 'HR',          date: '2026-03-20', timetable: 'Full Day', on_duty: '19:00', off_duty: '03:00', clock_in: '16:44', clock_out: null,   normal: 1, real_time: 1,   late: null,   early: '01:00', absent: 0, ot_time: null,   work_time: '08:00' },
  { id: 8,  emp_no: '32', ac_no: '21', name: 'Ayyan', department: 'Finance',     date: '2026-02-21', timetable: 'Full Day', on_duty: '19:00', off_duty: '03:00', clock_in: '21:43', clock_out: '03:00', normal: 1, real_time: 0.5, late: '03:43', early: '01:06', absent: 0, ot_time: null,   work_time: '04:16' },
  { id: 9,  emp_no: '32', ac_no: '21', name: 'Ayyan', department: 'Finance',     date: '2026-02-27', timetable: 'Full Day', on_duty: '19:00', off_duty: '03:00', clock_in: '16:33', clock_out: '01:10', normal: 1, real_time: 1,   late: null,   early: null,   absent: 0, ot_time: null,   work_time: '07:10' },
]

const MONTHS = [
  { value: '',        label: 'All Months'    },
  { value: '2026-01', label: 'January 2026'  },
  { value: '2026-02', label: 'February 2026' },
  { value: '2026-03', label: 'March 2026'    },
  { value: '2026-04', label: 'April 2026'    },
]

const DEPARTMENTS = ['All Departments', 'Engineering', 'HR', 'Finance', 'Design', 'Marketing']

const AttendanceRecords = () => {
  const [search, setSearch]       = useState('')
  const [records]                 = useState(DUMMY_RECORDS)
  const [selectedMonth, setMonth] = useState('')
  const [selectedDept,  setDept]  = useState('All Departments')
  const [dateFrom, setDateFrom]   = useState('')
  const [dateTo,   setDateTo]     = useState('')
  const [expanded, setExpanded]   = useState({})

  const activeFilters = [selectedMonth, selectedDept !== 'All Departments', dateFrom, dateTo].filter(Boolean).length

  const clearFilters = () => {
    setMonth(''); setDept('All Departments')
    setDateFrom(''); setDateTo(''); setSearch('')
  }

  const filtered = records.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.emp_no.includes(search) || r.date.includes(search)
    const matchMonth  = selectedMonth ? r.date.startsWith(selectedMonth) : true
    const matchDept   = selectedDept !== 'All Departments' ? r.department === selectedDept : true
    const matchFrom   = dateFrom ? r.date >= dateFrom : true
    const matchTo     = dateTo   ? r.date <= dateTo   : true
    return matchSearch && matchMonth && matchDept && matchFrom && matchTo
  })

  // Group by employee
  const grouped = filtered.reduce((acc, r) => {
    const key = r.emp_no
    if (!acc[key]) acc[key] = { emp_no: r.emp_no, ac_no: r.ac_no, name: r.name, department: r.department, records: [] }
    acc[key].records.push(r)
    return acc
  }, {})
  const groupedList = Object.values(grouped)

  const toggleExpand = (emp_no) => setExpanded(prev => ({ ...prev, [emp_no]: !prev[emp_no] }))

  return (
    <div className="animate-fade-slide space-y-5">

      {/* Header */}
      <div>
        <h2 className="page-title">
          <span className="text-accent font-bold">Attendance</span>{' '}
          <span className="text-white font-bold">Records</span>
        </h2>
        <p className="page-subtitle font-semibold text-[rgb(173,173,173)]">
          {groupedList.length} employees · {filtered.length} records
        </p>
      </div>

      {/* Filter Bar */}
      <div className="card-base px-4 py-3">
        <div className="flex flex-wrap items-end gap-2">

          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold uppercase tracking-widest shrink-0 self-end pb-[11px]">
            <Filter size={12} />
            Filters
            {activeFilters > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-accent text-white text-[10px] font-bold leading-none">{activeFilters}</span>
            )}
          </div>

          <div className="w-px h-8 bg-border shrink-0 self-end mb-1 hidden sm:block" />

          {/* Month */}
          <div className="flex flex-col gap-1 w-[calc(50%-4px)] sm:w-[130px]">
            <label className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest">Month</label>
            <select value={selectedMonth} onChange={(e) => setMonth(e.target.value)}
              className={`w-full bg-surface/70 border rounded-lg pl-2 pr-2 py-2 text-xs outline-none cursor-pointer transition-all
                ${selectedMonth ? 'border-accent/50 text-slate-200' : 'border-border text-slate-400'}`}>
              {MONTHS.map((m) => <option key={m.value} value={m.value} className="bg-card">{m.label}</option>)}
            </select>
          </div>

          {/* Department */}
          <div className="flex flex-col gap-1 w-[calc(50%-4px)] sm:w-[150px]">
            <label className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest">Department</label>
            <select value={selectedDept} onChange={(e) => setDept(e.target.value)}
              className={`w-full bg-surface/70 border rounded-lg pl-2 pr-2 py-2 text-xs outline-none cursor-pointer transition-all
                ${selectedDept !== 'All Departments' ? 'border-accent/50 text-slate-200' : 'border-border text-slate-400'}`}>
              {DEPARTMENTS.map((d) => <option key={d} value={d} className="bg-card">{d}</option>)}
            </select>
          </div>

          {/* Date From */}
          <div className="flex flex-col gap-1 w-[calc(50%-4px)] sm:w-[140px]">
            <label className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest">Date From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className={`w-full bg-surface/70 border rounded-lg px-2 py-2 text-xs outline-none cursor-pointer transition-all hover:border-accent/60
                ${dateFrom ? 'border-accent/50 text-slate-200' : 'border-border text-slate-400'}`} />
          </div>

          {/* Date To */}
          <div className="flex flex-col gap-1 w-[calc(50%-4px)] sm:w-[140px]">
            <label className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest">Date To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className={`w-full bg-surface/70 border rounded-lg px-2 py-2 text-xs outline-none cursor-pointer transition-all hover:border-accent/60
                ${dateTo ? 'border-accent/50 text-slate-200' : 'border-border text-slate-400'}`} />
          </div>

          {activeFilters > 0 && (
            <button onClick={clearFilters} className="btn-ghost hover:!bg-danger/10 hover:!text-danger hover:!border-danger/30 self-end" title="Clear">
              <X size={12} />
            </button>
          )}

          {/* Search */}
          <div className="flex flex-col gap-1 w-full sm:w-auto sm:ml-auto sm:min-w-[170px]">
            <label className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest">Search</label>
            <div className="flex items-center gap-2 bg-surface/70 border border-border rounded-lg px-3 h-[34px] transition-all focus-within:border-accent/60 focus-within:shadow-[0_0_0_3px_rgba(224,77,51,0.08)]">
              <Search size={12} className="text-slate-500 shrink-0" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, emp no…"
                className="bg-transparent text-xs text-slate-200 placeholder-slate-600 outline-none flex-1 min-w-0" />
              {search && <button onClick={() => setSearch('')} className="text-slate-600 hover:text-slate-400 shrink-0"><X size={10} /></button>}
            </div>
          </div>

        </div>
      </div>

      {/* Table */}
      <TableWrapper title="All Attendance Records">
        {groupedList.length === 0 ? (
          <EmptyState message="No records match your filters." />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[#000000]">
                <th className="table-th w-8"></th>
                <th className="table-th font-semibold text-[rgb(173,173,173)] whitespace-nowrap">Emp No.</th>
                <th className="table-th font-semibold text-[rgb(173,173,173)] whitespace-nowrap">Employee</th>
                <th className="table-th font-semibold text-[rgb(173,173,173)] whitespace-nowrap">Department</th>
                <th className="table-th font-semibold text-[rgb(173,173,173)] whitespace-nowrap">Records</th>
              </tr>
            </thead>
            <tbody>
              {groupedList.map((group, i) => (
                <>
                  {/* Employee Row */}
                  <tr
                    key={group.emp_no}
                    className="table-row-hover cursor-pointer"
                    onClick={() => toggleExpand(group.emp_no)}
                  >
                    <td className="table-td w-8">
                      {expanded[group.emp_no]
                        ? <ChevronDown size={14} className="text-accent" />
                        : <ChevronRight size={14} className="text-slate-500" />}
                    </td>
                    <td className="table-td">
                      <span className="font-mono text-xs text-slate-400 bg-surface/70 px-2 py-0.5 rounded border border-border whitespace-nowrap">
                        {group.emp_no}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={group.name} index={i} size="sm" />
                        <span className="font-medium text-slate-200 text-[13px] whitespace-nowrap">{group.name}</span>
                      </div>
                    </td>
                    <td className="table-td text-slate-400 text-xs whitespace-nowrap">{group.department}</td>
                    <td className="table-td">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                        {group.records.length} records
                      </span>
                    </td>
                  </tr>

                  {/* Expanded Records */}
                  {expanded[group.emp_no] && (
                    <tr key={`${group.emp_no}-exp`}>
                      <td colSpan={5} className="px-4 pb-3 pt-0">
                        <div className="ml-8 rounded-lg border border-border overflow-x-auto">
                          <table className="w-full min-w-[900px]">
                            <thead>
                              <tr className="bg-surface/50">
                                {['Date','Timetable','On Duty','Off Duty','Check In','Check Out','Normal','Real Time','Late','Early','Absent','OT Time','Work Time'].map(h => (
                                  <th key={h} className="table-th text-[11px] text-slate-500 whitespace-nowrap">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {group.records.map((row) => (
                                <tr key={row.id} className="border-t border-border/50 hover:bg-card-hover transition-colors">
                                  <td className="table-td text-slate-400 text-xs whitespace-nowrap">{row.date}</td>
                                  <td className="table-td">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 whitespace-nowrap">{row.timetable}</span>
                                  </td>
                                  <td className="table-td text-slate-400 text-xs font-mono whitespace-nowrap">{row.on_duty}</td>
                                  <td className="table-td text-slate-400 text-xs font-mono whitespace-nowrap">{row.off_duty}</td>
                                  <td className="table-td text-slate-300 text-xs font-mono whitespace-nowrap">{row.clock_in || '—'}</td>
                                  <td className="table-td text-slate-300 text-xs font-mono whitespace-nowrap">{row.clock_out || '—'}</td>
                                  <td className="table-td text-slate-400 text-xs text-center whitespace-nowrap">{row.normal}</td>
                                  <td className="table-td text-slate-400 text-xs text-center whitespace-nowrap">{row.real_time}</td>
                                  <td className="table-td text-xs font-mono whitespace-nowrap">
                                    {row.late ? <span className="text-red-400 font-semibold bg-red-500/10 px-1.5 py-0.5 rounded">{row.late}</span> : <span className="text-slate-600">—</span>}
                                  </td>
                                  <td className="table-td text-xs font-mono whitespace-nowrap">
                                    {row.early ? <span className="text-green-400 font-semibold bg-green-500/10 px-1.5 py-0.5 rounded">{row.early}</span> : <span className="text-slate-600">—</span>}
                                  </td>
                                  <td className="table-td text-xs text-center whitespace-nowrap">
                                    {row.absent > 0 ? <span className="text-red-400 font-bold">{row.absent}</span> : <span className="text-slate-600">0</span>}
                                  </td>
                                  <td className="table-td text-xs font-mono whitespace-nowrap">
                                    {row.ot_time ? <span className="text-blue-400 font-semibold">{row.ot_time}</span> : <span className="text-slate-600">—</span>}
                                  </td>
                                  <td className="table-td text-xs font-mono text-slate-300 font-semibold whitespace-nowrap">{row.work_time || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </TableWrapper>

    </div>
  )
}

export default AttendanceRecords
