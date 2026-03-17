import { Search } from 'lucide-react'

export const TableWrapper = ({ title, action, children }) => (
  <div className="card-base overflow-visible">
    <div className="flex items-center justify-between px-5 py-4 border-b border-border">
      <h2 className="section-title">{title}</h2>
      {action && <div>{action}</div>}
    </div>
    <div className="overflow-x-auto overflow-y-visible">{children}</div>
  </div>
)

export const EmptyState = ({ message = 'No records found.' }) => (
  <div className="py-16 text-center text-slate-600 text-sm">{message}</div>
)

export default TableWrapper
