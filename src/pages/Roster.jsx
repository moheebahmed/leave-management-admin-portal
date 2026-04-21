// import { useState } from 'react'
// import { Save, ChevronLeft, ChevronRight } from 'lucide-react'

// const DUMMY_EMPLOYEES = [
//   { id: 1, name: 'Asad Ali',    emp_no: '55' },
//   { id: 2, name: 'Shoaib Malik',  emp_no: '48' },
//   { id: 3, name: 'Usman Tariq', emp_no: '32' },
//   { id: 4, name: 'Ali Raza',  emp_no: '21' },
//   { id: 5, name: 'Kamran Ali',  emp_no: '10' },
// ]

// const DUMMY_SHIFTS = [
//   { id: 1, name: 'Morning'   },
//   { id: 2, name: 'Afternoon' },
//   { id: 3, name: 'Evening'   },
//   { id: 4, name: 'Night'    },
// ]

// const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
// const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

// const pad = (n) => String(n).padStart(2, '0')

// // Build weeks for a month
// const getWeeks = (year, month) => {
//   const daysInMonth = new Date(year, month + 1, 0).getDate()
//   const weeks = []
//   let week = []
//   for (let d = 1; d <= daysInMonth; d++) {
//     const date = new Date(year, month, d)
//     const dayOfWeek = (date.getDay() + 6) % 7 // Mon=0 ... Sun=6
//     if (dayOfWeek === 0 && week.length > 0) {
//       weeks.push(week)
//       week = []
//     }
//     week.push({ day: d, dayOfWeek, dateStr: `${year}-${pad(month + 1)}-${pad(d)}` })
//   }
//   if (week.length > 0) weeks.push(week)
//   return weeks
// }

// const SHIFT_COLORS = {
//   Morning:   'bg-blue-500/15 text-blue-400 border-blue-500/30',
//   Afternoon: 'bg-amber/15 text-amber border-amber/30',
//   Evening:   'bg-purple/15 text-purple border-purple/30',
//   Night:    'bg-cyan/15 text-cyan border-cyan/30',
//   OFF:       'bg-slate-700/30 text-slate-500 border-slate-600/30',
// }

// const Roster = () => {
//   const today = new Date()
//   const [year,  setYear]  = useState(today.getFullYear())
//   const [month, setMonth] = useState(today.getMonth())

//   // roster[empId][dateStr] = shiftName | 'OFF'
//   const [roster, setRoster] = useState({})
//   const [saved, setSaved]   = useState(false)

//   const weeks = getWeeks(year, month)

//   const prevMonth = () => {
//     setSaved(false)
//     if (month === 0) { setMonth(11); setYear(y => y - 1) }
//     else setMonth(m => m - 1)
//   }
//   const nextMonth = () => {
//     setSaved(false)
//     if (month === 11) { setMonth(0); setYear(y => y + 1) }
//     else setMonth(m => m + 1)
//   }

//   const getShift = (empId, dateStr) => roster[empId]?.[dateStr] || 'OFF'

//   const cycleShift = (empId, dateStr) => {
//     const options = [...DUMMY_SHIFTS.map(s => s.name), 'OFF']
//     const current = getShift(empId, dateStr)
//     const next    = options[(options.indexOf(current) + 1) % options.length]
//     setRoster(prev => ({
//       ...prev,
//       [empId]: { ...(prev[empId] || {}), [dateStr]: next }
//     }))
//     setSaved(false)
//   }

//   const handleSave = () => {
//     // TODO: POST /api/attendance/roster
//     setSaved(true)
//     setTimeout(() => setSaved(false), 2000)
//   }

//   // Apply same shift to all days for an employee
//   const applyToAll = (empId, shiftName) => {
//     const allDates = weeks.flat().map(d => d.dateStr)
//     const newDays = {}
//     allDates.forEach(d => { newDays[d] = shiftName })
//     setRoster(prev => ({ ...prev, [empId]: { ...(prev[empId] || {}), ...newDays } }))
//     setSaved(false)
//   }

//   return (
//     <div className="animate-fade-slide space-y-5">

//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//         <div>
//           <h2 className="page-title">
//             <span className="text-accent font-bold">Roster</span>{' '}
//             <span className="text-white font-bold">Management</span>
//           </h2>
//           <p className="page-subtitle font-semibold text-[rgb(173,173,173)]">
//             Assign shifts to employees — {MONTHS[month]} {year}
//           </p>
//         </div>

//         <div className="flex items-center gap-2 self-start sm:self-auto">
//           {/* Month nav */}
//           <button onClick={prevMonth} className="btn-ghost"><ChevronLeft size={14} /></button>
//           <div className="card-base px-4 py-2 text-sm font-semibold text-slate-200 min-w-[150px] text-center">
//             {MONTHS[month]} {year}
//           </div>
//           <button onClick={nextMonth} className="btn-ghost"><ChevronRight size={14} /></button>

//           {/* Save */}
//           <button onClick={handleSave} className={`btn-primary ${saved ? '!bg-emerald' : ''}`}>
//             <Save size={14} />
//             {saved ? 'Saved!' : 'Save Roster'}
//           </button>
//         </div>
//       </div>

//       {/* Legend */}
//       <div className="flex flex-wrap items-center gap-3 text-xs">
//         {[...DUMMY_SHIFTS.map(s => s.name), 'OFF'].map((s) => (
//           <span key={s} className={`px-2.5 py-1 rounded-full border font-semibold ${SHIFT_COLORS[s] || SHIFT_COLORS.OFF}`}>
//             {s}
//           </span>
//         ))}
//         <span className="text-slate-600 text-[11px] ml-1">← Click on a cell to cycle through shifts</span>
//       </div>

//       {/* Roster Table */}
//       <div className="card-base overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full" style={{ minWidth: `${180 + weeks.flat().length * 52}px` }}>
//             <thead>
//               {/* Week row */}
//               <tr className="bg-surface/60 border-b border-border">
//                 <th className="table-th sticky left-0 bg-surface z-10 min-w-[180px]">Employee</th>
//                 {weeks.map((week, wi) => (
//                   <th
//                     key={wi}
//                     colSpan={week.length}
//                     className="table-th text-center text-accent font-bold border-l border-border"
//                   >
//                     Week {wi + 1}
//                   </th>
//                 ))}
//                 <th className="table-th text-center text-slate-500 border-l border-border whitespace-nowrap">Apply All</th>
//               </tr>

//               {/* Day/Date row */}
//               <tr className="bg-[#000000]">
//                 <th className="table-th sticky left-0 bg-[#000000] z-10"></th>
//                 {weeks.flat().map((d) => (
//                   <th key={d.dateStr} className="table-th text-center px-1 w-[48px]">
//                     <div className="text-[10px] text-slate-500">{DAYS[d.dayOfWeek]}</div>
//                     <div className="text-[11px] text-slate-300 font-bold">{pad(d.day)}</div>
//                   </th>
//                 ))}
//                 <th className="table-th border-l border-border"></th>
//               </tr>
//             </thead>

//             <tbody>
//               {DUMMY_EMPLOYEES.map((emp) => (
//                 <tr key={emp.id} className="table-row-hover last:[&>td]:border-0">

//                   {/* Employee */}
//                   <td className="table-td sticky left-0 bg-card z-10">
//                     <div className="font-medium text-slate-200 text-[13px] whitespace-nowrap">{emp.name}</div>
//                     <div className="text-xs text-slate-500 font-mono">#{emp.emp_no}</div>
//                   </td>

//                   {/* Shift cells */}
//                   {weeks.flat().map((d) => {
//                     const shift = getShift(emp.id, d.dateStr)
//                     return (
//                       <td key={d.dateStr} className="table-td px-1 text-center">
//                         <button
//                           onClick={() => cycleShift(emp.id, d.dateStr)}
//                           className={`w-10 h-7 rounded text-[9px] font-bold border transition-all duration-150 hover:scale-105 active:scale-95 ${SHIFT_COLORS[shift] || SHIFT_COLORS.OFF}`}
//                           title={`${emp.name} — ${d.dateStr} — Click to change`}
//                         >
//                           {shift === 'OFF' ? 'OFF' : shift.slice(0, 3).toUpperCase()}
//                         </button>
//                       </td>
//                     )
//                   })}

//                   {/* Apply to all */}
//                   <td className="table-td border-l border-border px-2">
//                     <select
//                       onChange={(e) => { if (e.target.value) applyToAll(emp.id, e.target.value) }}
//                       defaultValue=""
//                       className="bg-surface/70 border border-border rounded-lg px-2 py-1 text-xs text-slate-400 outline-none cursor-pointer hover:border-accent/50 transition-all"
//                     >
//                       <option value="" disabled>Apply all</option>
//                       {DUMMY_SHIFTS.map(s => (
//                         <option key={s.id} value={s.name} className="bg-card">{s.name}</option>
//                       ))}
//                       <option value="OFF" className="bg-card">OFF</option>
//                     </select>
//                   </td>

//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//     </div>
//   )
// }

// export default Roster
