import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle, ArrowLeft, Info } from 'lucide-react'
import { useApp } from '../layouts/DashboardLayout'
import axios from 'axios'
import { API_BASE_URL, getAuthHeaders } from '../api/config'

const AddLeaveBalance = () => {
  const navigate = useNavigate()
  const { empId } = useParams()
  const isEdit = Boolean(empId)
  const { showToast } = useApp()
  const [employees, setEmployees] = useState([])
  const [employeesWithBalance, setEmployeesWithBalance] = useState([])
  const [leaveTypes, setLeaveTypes] = useState([])
  const [selectedEmp, setSelectedEmp] = useState(empId || '')
  const [leaveForm, setLeaveForm] = useState({})
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    axios.get(`${API_BASE_URL}/hr/employees`, {
      headers: getAuthHeaders()
    }).then(async res => {
      const allEmployees = res.data.data.employees
      setEmployees(allEmployees)

      if (!isEdit) {
        const withBalance = []
        await Promise.all(
          allEmployees.map(async (emp) => {
            try {
              const balRes = await axios.get(`${API_BASE_URL}/hr/employees/${emp.id}/balances`, { headers: getAuthHeaders() })
              if (balRes.data.data.balances.length > 0) withBalance.push(emp.id)
            } catch { /* skip */ }
          })
        )
        setEmployeesWithBalance(withBalance)
      }
    })
      .catch(() => showToast('Failed to fetch employees'))

    axios.get(`${API_BASE_URL}/employees/leave/types`, {
      headers: getAuthHeaders()
    }).then(res => {
      const types = res.data.data.leave_types
      setLeaveTypes(types)

      if (empId) {
        axios.get(`${API_BASE_URL}/hr/employees/${empId}/balances`, { headers: getAuthHeaders() })
          .then(balRes => {
            const balances = balRes.data.data.balances
            const prefilled = {}
            balances.forEach(b => { prefilled[b.leave_type_id] = b.total_allowed })
            setLeaveForm(prefilled)
          })
          .catch(() => {})
      }
    })
      .catch(() => showToast('Failed to fetch leave types'))
  }, [])

  const toggleLeave = (id) => {
    setLeaveForm((prev) => {
      if (prev[id] !== undefined) {
        const updated = { ...prev }
        delete updated[id]
        return updated
      } else {
        return { ...prev, [id]: '' }
      }
    })
  }

  const setDays = (id, value) => {
    setLeaveForm((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = {}
    if (!selectedEmp) e2.emp = 'Please select an employee'
    if (Object.keys(leaveForm).length === 0) e2.leaves = 'Select at least one leave type'
    setErrors(e2)
    if (Object.keys(e2).length > 0) return

    setLoading(true)
    try {
      const payload = Object.entries(leaveForm).map(([leave_type_id, total_allowed]) => ({
        leave_type_id: Number(leave_type_id),
        total_allowed: Number(total_allowed)
      }))

      if (isEdit) {
        await axios.put(
          `${API_BASE_URL}/hr/employees/${selectedEmp}/balances`,
          payload,
          { headers: getAuthHeaders() }
        )
      } else {
        await axios.post(
          `${API_BASE_URL}/hr/employees/${selectedEmp}/balances`,
          payload,
          { headers: getAuthHeaders() }
        )
      }

      const emp = employees.find((e) => e.id === Number(selectedEmp))
      showToast(`Leave balance ${isEdit ? 'updated' : 'saved'} for ${emp?.full_name}!`)
      navigate('/leave-balance')

    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save leave balances'
      showToast(msg)
    } finally {
      setLoading(false)
    }
  }

  const selectedEmployee = employees.find((e) => e.id === Number(selectedEmp))
  const selectedCount = Object.keys(leaveForm).length

  return (
    <div className="animate-fade-slide">

      {/* Header */}
      <div className="flex items-baseline gap-3 mb-6">
        <button onClick={() => navigate('/leave-balance')} className="btn-ghost">
          <ArrowLeft size={14} />
        </button>
        <div>
          <h2 className="page-title">
            <span className="text-accent font-bold">{isEdit ? 'Edit' : 'Add'}</span>{' '}
            <span className="text-white font-bold">Leave Balance</span>
          </h2>
          <p className="page-subtitle mt-0.5 font-semibold text-[rgb(173,173,173)]">
            {isEdit ? 'Update leave quotas for this employee.' : 'Assign leave quotas to an employee.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-4xl w-full">

        {/* Form */}
        <div className="lg:col-span-2 card-base p-6">
          <h3 className="section-title mb-5">Leave Allocation</h3>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Employee Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 tracking-wide">
                Employee <span className="text-danger">*</span>
              </label>
              <select
                className={`form-input-base cursor-pointer ${errors.emp ? '!border-danger' : ''} ${isEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
                value={selectedEmp}
                onChange={(e) => !isEdit && setSelectedEmp(e.target.value)}
                disabled={isEdit}
              >
                <option value="">Select an employee…</option>
                {employees
                  .filter((emp) => !employeesWithBalance.includes(emp.id))
                  .map((emp) => (
                    <option key={emp.id} value={emp.id} className="bg-card">
                      {emp.full_name} — {emp.department}
                    </option>
                  ))
                }
              </select>
              {errors.emp && <p className="text-xs text-danger">{errors.emp}</p>}
            </div>

            {/* Leave Types Checkboxes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-500 tracking-wide">
                Leave Types <span className="text-danger">*</span>
              </label>
              {errors.leaves && <p className="text-xs text-danger mb-2">{errors.leaves}</p>}

              <div className="space-y-2">
                {leaveTypes.map((lt) => {
                  const isChecked = leaveForm[lt.id] !== undefined
                  return (
                    <div
                      key={lt.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer
                        ${isChecked
                          ? 'border-accent/40 bg-accent/5'
                          : 'border-border bg-surface/40 hover:border-slate-600'
                        }`}
                      onClick={() => toggleLeave(lt.id)}
                    >
                      {/* Checkbox */}
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all
                        ${isChecked ? 'bg-accent border-accent' : 'border-slate-600'}`}
                      >
                        {isChecked && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>

                      {/* Leave Name */}
                      <span className={`text-sm flex-1 ${isChecked ? 'text-slate-200' : 'text-slate-400'}`}>
                        {lt.name}
                      </span>

                      {/* Days Input */}
                      {isChecked && (
                        <input
                          type="number"
                          min="1"
                          max="365"
                          placeholder="Days"
                          value={leaveForm[lt.id]}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setDays(lt.id, e.target.value)}
                          className="w-20 text-xs text-center form-input-base py-1"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Info */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-surface/70 border border-border">
              <Info size={13} className="text-slate-500 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-400/90">
                Used leaves will start at <strong className="text-slate-400">0</strong> and increment
                automatically as employees submit approved requests.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary" disabled={loading}>
                <CheckCircle size={14} />
                {loading ? 'Saving...' : (isEdit ? 'Update Balance' : 'Save Balance')}
              </button>
              <button type="button" className="btn-outline" onClick={() => navigate('/leave-balance')}>
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <div className="card-base p-5">
            <h4 className="section-title text-[13px] mb-4">Preview</h4>

            {selectedEmployee ? (
              <div className="space-y-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Employee
                  </div>
                  <div className="text-sm font-semibold text-slate-200">{selectedEmployee.full_name}</div>
                  <div className="text-xs text-slate-500">{selectedEmployee.department}</div>
                </div>

                {selectedCount > 0 && (
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-2">
                      Selected Leaves
                    </div>
                    <div className="space-y-1">
                      {Object.entries(leaveForm).map(([id, days]) => {
                        const lt = leaveTypes.find((l) => l.id === Number(id))
                        return (
                          <div key={id} className="flex justify-between text-xs">
                            <span className="text-slate-400">{lt?.name}</span>
                            <span className="text-accent font-semibold">{days || '—'} days</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-600 text-center py-4">
                Select an employee to see a preview.
              </div>
            )}
          </div>

          <div className="card-base p-4 text-center">
            <div className="font-syne text-xl font-bold text-accent">{selectedCount}</div>
            <div className="text-xs text-slate-600 mt-0.5">Leave types selected</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddLeaveBalance
