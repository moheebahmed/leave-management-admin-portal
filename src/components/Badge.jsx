const BADGE_STYLES = {
  blue: 'bg-accent/10 text-accent',
  cyan: 'bg-cyan/10 text-cyan',
  purple: 'bg-purple/10 text-purple',
  amber: 'bg-accent/10 text-accent',
  green: 'bg-emerald/10 text-emerald',
  red: 'bg-danger/10 text-danger',
  gray: 'bg-slate-700/40 text-slate-400',
  white: 'bg-slate-700/40 text-white',
}

const DEPT_COLOR_MAP = {
  Engineering: 'blue',
  Design: 'cyan',
  Marketing: 'purple',
  Sales: 'blue',
  HR: 'green',
  Finance: 'amber',
  Operations: 'cyan',
  Product: 'purple',
}

export const Badge = ({ children, color = 'blue' }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${BADGE_STYLES[color]}`}
  >
    {children}
  </span>
)

export const DeptBadge = ({ department }) => (
  <Badge color={DEPT_COLOR_MAP[department] || 'gray'}>{department}</Badge>
)

export default Badge
