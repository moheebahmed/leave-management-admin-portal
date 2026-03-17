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
  '#3b82f6',
  '#8b5cf6',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#14b8a6',
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
    name: 'ali Ahmed',
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

export const getAvatarColor = (index) => AVATAR_COLORS[index % AVATAR_COLORS.length]