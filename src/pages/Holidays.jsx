import { useState } from 'react'
import { Plus, Trash2, CalendarDays } from 'lucide-react'
import { TableWrapper, EmptyState } from '../components/Table'

const DUMMY_HOLIDAYS = [
  { id: 1, name: 'Independence Day', date: '2026-08-14' },
  { id: 2, name: 'Eid ul Fitr',      date: '2026-03-31' },
  { id: 3, name: 'Eid ul Adha',      date: '2026-06-07' },
  { id: 4, name: 'Christmas',        date: '2026-12-25' },
]

const EMPTY_FORM = { name: '', date: '' }

const Holidays = () => {
  const [holidays, setHolidays] = useState(DUMMY_HOLIDAYS)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [showForm, setShowForm] = useState(false)
  const [errors, setErrors]     = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Holiday name required'
    if (!form.date)        e.date = 'Date required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleAdd = () => {
    if (!validate()) return
    setHolidays((prev) => [...prev, { id: Date.now(), ...form }])
    setForm(EMPTY_FORM)
    setShowForm(false)
    setErrors({})
    // TODO: POST /api/attendance/holidays
  }

  const handleDelete = (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return
    setHolidays((prev) => prev.filter((h) => h.id !== id))
    // TODO: DELETE /api/attendance/holidays/:id
  }

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="animate-fade-slide space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="page-title">
            <span className="text-accent font-bold">Holidays</span>{' '}
            <span className="text-white font-bold">Management</span>
          </h2>
          <p className="page-subtitle font-semibold text-[rgb(173,173,173)]">
            {holidays.length} holidays configured
          </p>
        </div>
        <button className="btn-primary self-start sm:self-auto" onClick={() => setShowForm((p) => !p)}>
          <Plus size={14} />
          Add Holiday
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card-base p-5 space-y-4">
          <h3 className="section-title">New Holiday</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">Holiday Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Independence Day"
                className="form-input-base"
              />
              {errors.name && <p className="text-xs text-danger">{errors.name}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="form-input-base"
              />
              {errors.date && <p className="text-xs text-danger">{errors.date}</p>}
            </div>

          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button className="btn-outline" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setErrors({}) }}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleAdd}>
              <Plus size={13} /> Save Holiday
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <TableWrapper title="All Holidays">
        {holidays.length === 0 ? (
          <EmptyState message="No holidays added yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="bg-[#000000]">
                  <th className="table-th font-semibold text-[rgb(173,173,173)] whitespace-nowrap">#</th>
                  <th className="table-th font-semibold text-[rgb(173,173,173)] whitespace-nowrap">Holiday Name</th>
                  <th className="table-th font-semibold text-[rgb(173,173,173)] whitespace-nowrap">Date</th>
                  <th className="table-th font-semibold text-[rgb(173,173,173)] whitespace-nowrap hidden sm:table-cell">Day</th>
                  <th className="table-th font-semibold text-[rgb(173,173,173)] text-center whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {holidays
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((h, i) => (
                  <tr key={h.id} className="table-row-hover last:[&>td]:border-0">
                    <td className="table-td text-slate-500 text-xs">{i + 1}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber/10 border border-amber/20 flex items-center justify-center shrink-0">
                          <CalendarDays size={13} className="text-amber" />
                        </div>
                        <span className="font-medium text-slate-200 text-[13px] whitespace-nowrap">{h.name}</span>
                      </div>
                    </td>
                    <td className="table-td text-slate-300 text-xs whitespace-nowrap">{formatDate(h.date)}</td>
                    <td className="table-td hidden sm:table-cell">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber/10 text-amber border border-amber/20 whitespace-nowrap">
                        {new Date(h.date).toLocaleDateString('en-PK', { weekday: 'long' })}
                      </span>
                    </td>
                    <td className="table-td text-center">
                      <button
                        onClick={() => handleDelete(h.id, h.name)}
                        className="btn-ghost hover:!bg-danger/10 hover:!text-danger hover:!border-danger/30"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TableWrapper>

    </div>
  )
}

export default Holidays
