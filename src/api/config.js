// export const API_BASE_URL = 'https://leave-management.conceptrecall.com/api'

export const API_BASE_URL = 'http://localhost:3000/api'

export const getAuthHeaders = () => ({
  Authorization: `Bearer ${sessionStorage.getItem('token')}`,
})
