import { Search } from 'lucide-react'

export const TableWrapper = ({ title, action, children }) => (
  <div className="card-base overflow-visible">
    <div className="flex flex-wrap items-center justify-between px-5 py-4 border-b border-border gap-3">
      <h2 className="section-title whitespace-nowrap">{title}</h2>
      {action && <div className="shrink-0">{action}</div>}
    </div>
    <div className="overflow-x-auto overflow-y-visible">{children}</div>
  </div>
)

export const EmptyState = ({ message = 'No records found.' }) => (
  <div className="py-16 text-center text-slate-600 text-sm">{message}</div>
)

export default TableWrapper
