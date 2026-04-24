import { useState } from 'react'
import * as XLSX from 'xlsx'
import axios from 'axios'
import { Upload, FileText, CheckCircle, X, CloudUpload } from 'lucide-react'
import { API_BASE_URL, getAuthHeaders } from '../api/config'
import { useApp } from '../layouts/DashboardLayout'
import { useNavigate } from 'react-router-dom'

// ─── Date helpers ────────────────────────────────────────────────────────────

const excelDateToString = (val) => {
  if (!val) return null
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val
  if (typeof val === 'string' && val.includes('/')) {
    const parts = val.split('/')
    if (parts.length === 3) {
      const [m, d, y] = parts
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    }
  }
  if (typeof val === 'number') {
    const date = XLSX.SSF.parse_date_code(val)
    if (date) {
      return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`
    }
  }
  return String(val).trim()
}

const toTimeString = (val) => {
  if (!val) return null
  if (typeof val === 'string') return val.trim()
  if (typeof val === 'number') {
    const totalSec = Math.round(val * 86400)
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '00')}`
  }
  return String(val).trim()
}

// ─── Computed field helpers ───────────────────────────────────────────────────

// Parse "HH:MM" or "HH:MM:SS" → total minutes
const timeToMins = (t) => {
  if (!t) return null
  const parts = String(t).split(':')
  if (parts.length < 2) return null
  const h = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  if (isNaN(h) || isNaN(m)) return null
  return h * 60 + m
}

// Total minutes → "Xh Ym"
const minsToHours = (mins) => {
  if (mins == null || mins <= 0) return null
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

// Extract HH:MM from a time string
const extractHHMM = (val) => {
  if (!val) return null
  const s = String(val)
  const m = s.match(/(\d{2}:\d{2})/)
  return m ? m[1] : s.slice(0, 5)
}

// Compute derived fields from raw mapped row
const computeRow = (row) => {
  const onDutyMins  = timeToMins(row.on_duty)
  const offDutyMins = timeToMins(row.off_duty)
  const checkInMins  = timeToMins(row.check_in)
  const checkOutMins = timeToMins(row.check_out)

  const late  = (checkInMins != null && onDutyMins != null && checkInMins > onDutyMins)
    ? checkInMins - onDutyMins : null
  const early = (checkOutMins != null && offDutyMins != null && checkOutMins < offDutyMins)
    ? offDutyMins - checkOutMins : null
  const work  = (checkInMins != null && checkOutMins != null && checkOutMins > checkInMins)
    ? checkOutMins - checkInMins : null
  const ot    = (checkOutMins != null && offDutyMins != null && checkOutMins > offDutyMins)
    ? checkOutMins - offDutyMins : null

  // let status = 'Absent'
  // if (checkInMins != null) status = late ? 'Late' : 'Present'

  return {
    ...row,
    on_duty:   extractHHMM(row.on_duty),
    off_duty:  extractHHMM(row.off_duty),
    check_in:  extractHHMM(row.check_in),
    check_out: extractHHMM(row.check_out),
    timetable: 'Full Day',
    late_minutes:  late,
    early_minutes: early,
    work_mins: work,
    ot_mins:   ot,
    // status,
  }
}

// ─── Row mapper ──────────────────────────────────────────────────────────────

const mapRow = (row) => ({
  employee_code: String(row['Emp No.'] || row['employee_code'] || row['Emp No'] || '').trim(),
  date:          excelDateToString(row['Date'] || row['date']),
  check_in:      toTimeString(row['Clock In']  || row['check_in']  || row['CheckIn'])  || null,
  check_out:     toTimeString(row['Clock Out'] || row['check_out'] || row['CheckOut']) || null,
  on_duty:       toTimeString(row['On duty']   || row['on_duty']   || row['On Duty'])  || null,
  off_duty:      toTimeString(row['Off duty']  || row['off_duty']  || row['Off Duty']) || null,
})

// ─── Component ───────────────────────────────────────────────────────────────

const AttendanceUpload = () => {
  const { showToast, setAttendanceRecords } = useApp()
  const navigate = useNavigate()
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile]         = useState(null)
  const [preview, setPreview]   = useState([])
  const [payload, setPayload]   = useState([])
  const [uploaded, setUploaded] = useState(false)
  const [loading, setLoading]   = useState(false)

  const parseFile = (f) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data     = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array', cellDates: true })
        const sheet    = workbook.Sheets[workbook.SheetNames[0]]
        const rows     = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: false })
        const mapped   = rows.map(mapRow).filter(r => r.employee_code && r.date)
        setPayload(mapped)
        // compute derived fields for preview only
        setPreview(mapped.slice(0, 31).map(computeRow))
      } catch (err) {
        console.error('Parse error:', err)
        showToast('Failed to parse file. Check format.')
      }
    }
    reader.readAsArrayBuffer(f)
  }

  const handleFile = (f) => {
    if (!f) return
    setFile(f)
    setUploaded(false)
    setPreview([])
    setPayload([])
    parseFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleRemove = () => {
    setFile(null); setPreview([]); setPayload([]); setUploaded(false)
  }

  const handleUpload = async () => {
    if (!payload.length) return
    setLoading(true)
    try {
      await axios.post(
        `${API_BASE_URL}/attendance/upload`,
        payload,
        { headers: getAuthHeaders() }
      )
      setAttendanceRecords(payload)
      setUploaded(true)
      showToast('Attendance uploaded successfully!')
      setTimeout(() => navigate('/attendance-records'), 1000)
    } catch (err) {
      showToast(err.response?.data?.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-slide space-y-5">

      {/* Header */}
      <div>
        <h2 className="page-title">
          <span className="text-accent font-bold">Attendance</span>{' '}
          <span className="text-white font-bold">Upload</span>
        </h2>
        <p className="page-subtitle font-semibold text-[rgb(173,173,173)]">
          Upload attendance Excel file — it will be parsed and sent to the server
        </p>
      </div>

      {/* Upload Box */}
      <div className="card-base p-6">
        <h3 className="section-title mb-4">Upload Attendance File</h3>

        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer
              ${dragOver ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50 hover:bg-surface/50'}`}
            onClick={() => document.getElementById('file-input').click()}
          >
            <CloudUpload size={40} className="mx-auto text-slate-600 mb-3" />
            <p className="text-slate-300 font-medium text-sm">
              Drag & drop your file here, or <span className="text-accent">browse</span>
            </p>
            <p className="text-slate-600 text-xs mt-1">Supports: Excel (.xlsx, .xls)</p>
            <input
              id="file-input"
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>
        ) : (
          <div className="flex items-center justify-between bg-surface/70 border border-border rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                <FileText size={16} className="text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB · {payload.length} records parsed</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {uploaded && (
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                  <CheckCircle size={13} /> Uploaded
                </span>
              )}
              <button onClick={handleRemove} className="btn-ghost hover:!bg-danger/10 hover:!text-danger hover:!border-danger/30">
                <X size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Upload Button */}
        {file && !uploaded && payload.length > 0 && (
          <div className="mt-4 flex justify-end">
            <button onClick={handleUpload} disabled={loading} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Upload size={14} /> Upload {payload.length} Records
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── Preview Table (same style as AttendanceRecords expanded rows) ── */}
      {preview.length > 0 && (
        <div className="card-base overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="section-title">Preview</h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
              Showing  {payload.length} rows
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="bg-[#000000]">
                  {[
                    'Emp Code', 'Date', 'Timetable',
                    'On Duty', 'Off Duty',
                    'Check In', 'Check Out',
                    'Late minutes', 'Early minutes',
                    'OT Time', 'Work Hour',
                  ].map(h => (
                    <th key={h} className="table-th text-[11px] font-semibold text-[rgb(173,173,173)] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-t border-border/50 hover:bg-card-hover transition-colors">

                    {/* Emp Code */}
                    <td className="table-td">
                      <span className="font-mono text-xs text-slate-400 bg-surface/70 px-2 py-0.5 rounded border border-border">
                        {row.employee_code}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="table-td text-slate-400 text-xs whitespace-nowrap">{row.date}</td>

                    {/* Timetable */}
                    <td className="table-td">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 whitespace-nowrap">
                        {row.timetable}
                      </span>
                    </td>

                    {/* On Duty */}
                    <td className="table-td text-slate-400 text-xs font-mono whitespace-nowrap">{row.on_duty || '—'}</td>

                    {/* Off Duty */}
                    <td className="table-td text-slate-400 text-xs font-mono whitespace-nowrap">{row.off_duty || '—'}</td>

                    {/* Check In */}
                    <td className="table-td text-slate-300 text-xs font-mono whitespace-nowrap">{row.check_in || '—'}</td>

                    {/* Check Out */}
                    <td className="table-td text-slate-300 text-xs font-mono whitespace-nowrap">{row.check_out || '—'}</td>

                    {/* Late-minutes */}
                    <td className="table-td text-xs font-mono whitespace-nowrap">
                      {row.late_minutes
                        ? <span className="text-red-400 font-semibold bg-red-500/10 px-1.5 py-0.5 rounded">{row.late_minutes}</span>
                        : <span className="text-slate-600">—</span>}
                    </td>

                    {/* Early-minutes */}
                    <td className="table-td text-xs font-mono whitespace-nowrap">
                      {row.early_minutes
                        ? <span className="text-green-400 font-semibold bg-green-500/10 px-1.5 py-0.5 rounded">{row.early_minutes}</span>
                        : <span className="text-slate-600">—</span>}
                    </td>

                    {/* Status */}
                    {/* <td className="table-td text-xs text-center whitespace-nowrap">
                      {row.status === 'Absent'
                        ? <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">Absent</span>
                        : row.status === 'Late'
                        ? <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Late</span>
                        : <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-500/10 text-green-400 border border-green-500/20">Present</span>
                      }
                    </td> */}

                    {/* OT Time */}
                    <td className="table-td text-xs font-mono whitespace-nowrap">
                      {row.ot_mins
                        ? <span className="text-blue-400 font-semibold">{row.ot_mins}</span>
                        : <span className="text-slate-600">—</span>}
                    </td>

                    {/* Work Hour */}
                    <td className="table-td text-xs font-mono text-slate-300 font-semibold whitespace-nowrap">
                      {minsToHours(row.work_mins) || '—'}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  )
}

export default AttendanceUpload