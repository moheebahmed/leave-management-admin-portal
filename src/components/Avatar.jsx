import { getInitials, getAvatarColor } from '../data/initialData'

const Avatar = ({ name, index = 0, size = 'md' }) => {
  const sizes = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white shrink-0 ${sizes[size]}`}
      style={{ background: getAvatarColor(index) }}
    >
      {getInitials(name || '')}
    </div>
  )
}

export default Avatar
