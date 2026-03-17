# LeaveOS — Employee Leave Management System

A modern, dark-themed HR dashboard built with **React + Vite + Tailwind CSS**.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in browser
http://localhost:5173
```

## 🛠 Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   ├── Avatar.jsx        # Employee avatar with initials
│   ├── Badge.jsx         # Status/department badges
│   ├── Navbar.jsx        # Top navigation bar
│   ├── Sidebar.jsx       # Collapsible sidebar
│   ├── StatCard.jsx      # Dashboard statistic cards
│   ├── Table.jsx         # Reusable table wrapper
│   └── Toast.jsx         # Notification toasts
├── data/
│   └── initialData.js    # Seed data & constants
├── hooks/
│   └── useToast.js       # Toast notification hook
├── layouts/
│   └── DashboardLayout.jsx  # Main layout + context
├── pages/
│   ├── Dashboard.jsx        # Overview with stats
│   ├── Employees.jsx        # Employee list
│   ├── AddEmployee.jsx      # Add employee form
│   ├── LeaveBalance.jsx     # Leave balance list
│   └── AddLeaveBalance.jsx  # Add leave balance form
├── App.jsx               # Router configuration
├── main.jsx              # App entry point
└── index.css             # Tailwind + global styles
```

## ✨ Features

- **Dark theme** — Deep navy/charcoal palette with blue accent glows
- **Collapsible sidebar** — Toggle with the menu button in navbar
- **React Router** — Full SPA navigation between pages
- **Form validation** — Real-time error feedback on all forms
- **Live CRUD** — Add/delete employees and leave balances in real-time
- **Progress bars** — Color-coded usage indicators (green → amber → red)
- **Toast notifications** — Success feedback on all actions
- **Responsive** — Works on desktop, tablet, and mobile
- **Search** — Filter employees by name, email, or department

## 🎨 Tech Stack

- **React 18** — Functional components + hooks
- **Vite 5** — Lightning-fast dev server
- **React Router 6** — Client-side routing
- **Tailwind CSS 3** — Utility-first styling
- **Lucide React** — Beautiful icon library
- **Google Fonts** — Syne (headings) + DM Sans (body)
