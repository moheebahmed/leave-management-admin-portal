import { useState } from 'react'
import * as XLSX from "xlsx";
import { Upload, FileText, CheckCircle, X, CloudUpload } from 'lucide-react'

const DUMMY_PREVIEW = [
  { emp_no: '55', ac_no: '48', name: 'Asad', date: '1/1/2026', timetable: 'ST 4 - 1' },
  { emp_no: '55', ac_no: '48', name: 'Asad', date: '1/2/2026', timetable: 'ST 4 - 1' },
  { emp_no: '55', ac_no: '48', name: 'Asad', date: '1/3/2026', timetable: 'ST 4 - 1' },
  { emp_no: '55', ac_no: '48', name: 'Asad', date: '1/4/2026', timetable: 'ST 4 - 1' },
  { emp_no: '55', ac_no: '48', name: 'Asad', date: '1/6/2026', timetable: 'ST 4 - 1' },
]

// ---handleFileUpload XLSX--- //

const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (event) => {
    const data = new Uint8Array(event.target.result);

    const workbook = XLSX.read(data, { type: "array" });

    const sheetName = workbook.SheetNames[0]; // first sheet
    const sheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json(sheet);

    console.log("Excel Data:", jsonData);
  };

  reader.readAsArrayBuffer(file);
};

// _______________ //

const AttendanceUpload = () => {
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState([])
  const [uploaded, setUploaded] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleFile = (f) => {
    if (!f) return
    setFile(f)
    // Show dummy preview (real parsing will come from backend)
    setPreview(DUMMY_PREVIEW)
    setUploaded(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    handleFile(f)
  }

  const handleInputChange = (e) => {
    handleFile(e.target.files[0])
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    // TODO: Replace with real API call when backend is ready
    // const formData = new FormData()
    // formData.append('file', file)
    // await axios.post(`${API_BASE_URL}/attendance/upload`, formData, { headers: getAuthHeaders() })
    await new Promise((r) => setTimeout(r, 1500)) // Simulate upload
    setLoading(false)
    setUploaded(true)
  }

  const handleRemove = () => {
    setFile(null)
    setPreview([])
    setUploaded(false)
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
          Upload attendance CSV/Excel file exported from attendance software
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
            <p className="text-slate-600 text-xs mt-1">Supports: CSV, Excel (.xlsx, .xls)</p>
            <input
              id="file-input"
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleFileUpload}
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
                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {uploaded && (
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                  <CheckCircle size={13} /> Uploaded
                </span>
              )}
              <button
                onClick={handleRemove}
                className="btn-ghost hover:!bg-danger/10 hover:!text-danger hover:!border-danger/30"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Upload Button */}
        {file && !uploaded && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
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
                  <Upload size={14} /> Upload File
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Preview Table */}
      {preview.length > 0 && (
        <div className="card-base overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="section-title">File Preview</h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
              {preview.length} rows
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#000000]">
                  <th className="table-th font-semibold text-[rgb(173,173,173)]">Emp No.</th>
                  <th className="table-th font-semibold text-[rgb(173,173,173)]">AC-No.</th>
                  <th className="table-th font-semibold text-[rgb(173,173,173)]">Name</th>
                  <th className="table-th font-semibold text-[rgb(173,173,173)]">Date</th>
                  <th className="table-th font-semibold text-[rgb(173,173,173)]">Timetable</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="table-row-hover last:[&>td]:border-0">
                    <td className="table-td">
                      <span className="font-mono text-xs text-slate-400 bg-surface/70 px-2 py-0.5 rounded border border-border">
                        {row.emp_no}
                      </span>
                    </td>
                    <td className="table-td text-slate-400 text-xs">{row.ac_no}</td>
                    <td className="table-td font-medium text-slate-200 text-[13px]">{row.name}</td>
                    <td className="table-td text-slate-400 text-xs">{row.date}</td>
                    <td className="table-td">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                        {row.timetable}
                      </span>
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
