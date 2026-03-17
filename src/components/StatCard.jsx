import { TrendingUp, TrendingDown } from 'lucide-react'

const COLOR_MAP = {
  blue: {
    wrapper: 'before:bg-accent',
    icon: 'bg-accent/10 text-accent',
    value: 'text-slate-100',
    glow: 'shadow-[0_0_40px_rgba(59,130,246,0.05)]',
  },
  cyan: {
    wrapper: 'before:bg-cyan',
    icon: 'bg-cyan/10 text-cyan',
    value: 'text-slate-100',
    glow: 'shadow-[0_0_40px_rgba(6,182,212,0.05)]',
  },
  purple: {
    wrapper: 'before:bg-purple',
    icon: 'bg-purple/10 text-purple',
    value: 'text-slate-100',
    glow: 'shadow-[0_0_40px_rgba(139,92,246,0.05)]',
  },
  amber: {
    wrapper: 'before:bg-accent',
    icon: 'bg-accent/10 text-accent',
    value: 'text-slate-100',
    glow: 'shadow-[0_0_40px_rgba(245,158,11,0.05)]',
  },
}

const StatCard = ({ value, label, icon: Icon, color = 'blue', delta, deltaType = 'up' }) => {
  const c = COLOR_MAP[color]
  const isUp = deltaType === 'up'

  return (
    <div
      className={`
        relative overflow-hidden card-base p-5 transition-all duration-200
        hover:border-border-bright hover:-translate-y-0.5 cursor-default ${c.glow} ${c.wrapper}
        before:content-[''] before:absolute before:top-0 before:right-0
        before:w-20 before:h-20 before:rounded-full before:blur-3xl before:opacity-20
      `}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${c.icon}`}>
        <Icon size={18} />
      </div>

      {/* Value */}
      <div className={`font-syne text-3xl font-bold mb-1 ${c.value}`}>{value}</div>

      {/* Label */}
      <div className="text-[12.5px] text-slate-500">{label}</div>

      {/* Delta */}
      {delta && (
        <div
          className={`
            inline-flex items-center gap-1 mt-3 text-[11px] font-semibold px-2 py-0.5 rounded-full
            ${isUp ? 'bg-emerald/10 text-emerald' : 'bg-accent/10 text-accent'}
          `}
        >
          {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {delta}
        </div>
      )}
    </div>
  )
}

export default StatCard
