import { useEffect } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(onClose, 3500)
    return () => clearTimeout(timer)
  }, [toast, onClose])

  if (!toast) return null

  const isSuccess = toast.type !== 'error'

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-toast-in">
      <div
        className={`
          flex items-center gap-3 px-4 py-3.5 rounded-xl border shadow-2xl
          ${
            isSuccess
              ? 'bg-card border-emerald/30 text-emerald'
              : 'bg-card border-danger/30 text-danger'
          }
        `}
      >
        {isSuccess ? <CheckCircle size={16} /> : <XCircle size={16} />}
        <span className="text-sm font-medium text-slate-200">{toast.message}</span>
        <button
          onClick={onClose}
          className="ml-1 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}

export default Toast
