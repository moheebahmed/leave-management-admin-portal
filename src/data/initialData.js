export const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'Product',
]

export const LEAVE_TYPES = [
  'Annual Leave',
  'Sick Leave',
  'Casual Leave',
  'Paternity Leave',
  'Hajj Leave',
]

export const AVATAR_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#f97316', // orange
  '#06b6d4', // sky
  '#a855f7', // violet
  '#0891b2', // cyan-dark
  '#059669', // emerald
  '#dc2626', // red-dark
  '#7c3aed', // violet-dark
]

export const INITIAL_EMPLOYEES = [
  {
    id: 'E001',
    name: 'Nasir Shakeel',
    email: 'nasirshakeel@company.com',
    phone: '+92 300 1234567',
    department: 'Engineering',
  },
  {
    id: 'E002',
    name: 'ali Nawaz',
    email: 'ali@company.com',
    phone: '+92 301 2345678',
    department: 'Design',
  },
  {
    id: 'E003',
    name: 'Sara Malik',
    email: 'sara@company.com',
    phone: '+92 302 3456789',
    department: 'Marketing',
  },
  {
    id: 'E004',
    name: 'Usman Tariq',
    email: 'usman@company.com',
    phone: '+92 303 4567890',
    department: 'HR',
  },
  {
    id: 'E005',
    name: 'Nadia Raza',
    email: 'nadia@company.com',
    phone: '+92 304 5678901',
    department: 'Finance',
  },
]

export const INITIAL_LEAVE_BALANCES = [
  {
    id: 'LB001',
    employeeId: 'E001',
    employeeName: 'Nasir Shakeel',
    leaveType: 'Annual Leave',
    totalAllowed: 20,
    used: 5,
    updatedAt: '2026-02-15',
  },
  {
    id: 'LB002',
    employeeId: 'E002',
    employeeName: 'Bilal Ahmed',
    leaveType: 'Sick Leave',
    totalAllowed: 10,
    used: 2,
    updatedAt: '2026-02-20',
  },
  {
    id: 'LB003',
    employeeId: 'E003',
    employeeName: 'Sara Malik',
    leaveType: 'Privilege Leave',
    totalAllowed: 20,
    used: 12,
    updatedAt: '2026-03-01',
  },
  {
    id: 'LB004',
    employeeId: 'E004',
    employeeName: 'Usman Tariq',
    leaveType: 'Casual Leave',
    totalAllowed: 5,
    used: 1,
    updatedAt: '2026-03-05',
  },
  {
    id: 'LB005',
    employeeId: 'E005',
    employeeName: 'Nadia Raza',
    leaveType: 'Hajj Leave',
    totalAllowed: 20,
    used: 0,
    updatedAt: '2026-01-10',
  },
]

export const getInitials = (name) => {
  if (!name) return '??'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Global map: empId -> color (sequential assignment, no collisions)
const _colorMap = new Map()
let _colorCounter = 0

export const getAvatarColor = (indexOrId) => {
  const key = String(indexOrId)
  if (!_colorMap.has(key)) {
    _colorMap.set(key, _colorCounter % AVATAR_COLORS.length)
    _colorCounter++
  }
  return AVATAR_COLORS[_colorMap.get(key)]
}