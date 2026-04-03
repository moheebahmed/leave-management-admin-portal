import axios from 'axios'
import { API_BASE_URL, getAuthHeaders } from './config'

/**
 * Send leave request notification to Lead and HR users
 * @param {Object} request - Leave request object
 * @param {Object} employee - Employee object with employee_id
 */
export const sendLeaveRequestNotification = async (request, employee) => {
  try {
    // Get employee details with lead info
    const empRes = await axios.get(
      `${API_BASE_URL}/hr/employees/${employee.employee_id}`,
      { headers: getAuthHeaders() }
    )
    const empData = empRes.data.data.employee

    // Get all HR users
    const hrRes = await axios.get(
      `${API_BASE_URL}/hr/users?role=HR`,
      { headers: getAuthHeaders() }
    )
    const hrUsers = hrRes.data.data.users || []

    // Collect emails
    const emails = []
    
    // Add lead email if exists
    if (empData.lead_id) {
      try {
        const leadRes = await axios.get(
          `${API_BASE_URL}/hr/employees/${empData.lead_id}`,
          { headers: getAuthHeaders() }
        )
        const leadEmail = leadRes.data.data.employee?.User?.email
        if (leadEmail) emails.push(leadEmail)
      } catch (error) {
        console.log('Error fetching lead email:', error)
      }
    }

    // Add HR emails
    hrUsers.forEach((user) => {
      if (user.email && !emails.includes(user.email)) {
        emails.push(user.email)
      }
    })

    // Send email if we have recipients
    if (emails.length > 0) {
      await axios.post(
        `${API_BASE_URL}/employees/leave/requests/${request.id}/send-notification`,
        { recipient_emails: emails },
        { headers: getAuthHeaders() }
      )
    }

    return { success: true, emailsSent: emails.length, recipients: emails }
  } catch (error) {
    console.log('Error sending notification:', error)
    throw error
  }
}

/**
 * Create a new leave request
 * @param {Object} leaveData - Leave request data
 */
export const createLeaveRequest = async (leaveData) => {
  try {
    const res = await axios.post(
      `${API_BASE_URL}/employees/leave/requests`,
      leaveData,
      { headers: getAuthHeaders() }
    )
    return res.data.data.request
  } catch (error) {
    throw error
  }
}

/**
 * Get leave balance for employee
 * @param {number} empId - Employee ID
 */
export const getLeaveBalance = async (empId) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/hr/employees/${empId}/balances`,
      { headers: getAuthHeaders() }
    )
    return res.data.data.balances || []
  } catch (error) {
    console.log('Error fetching balance:', error)
    return []
  }
}

/**
 * Get all leave types
 */
export const getLeaveTypes = async () => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/employees/leave/types`,
      { headers: getAuthHeaders() }
    )
    return res.data.data.leave_types || []
  } catch (error) {
    console.log('Error fetching leave types:', error)
    return []
  }
}

/**
 * Get current user info
 */
export const getCurrentUser = async () => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/auth/me`,
      { headers: getAuthHeaders() }
    )
    return res.data.data.user
  } catch (error) {
    console.log('Error fetching current user:', error)
    return null
  }
}
