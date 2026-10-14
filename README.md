# Zora — Enterprise Management System & HRM Platform

Welcome to **Zora**, a modern enterprise resource planning (ERP), human resource management (HRM), and client portal system.

---

## 🚀 Key Features

- **Staff & Hierarchy Management**: Organizational hierarchy, departments, designations, and employee self-service.
- **Attendance & Leave Tracking**: Real-time check-in/out, biometric/manual attendance logging, leave approval workflows.
- **Payroll & Finance**: Automated payslip generation, salary advances, overtime calculation, income & expense ledger, invoice generation.
- **Project & Task Hub**: Kanban boards, milestone tracking, resource allocation, and team collaboration.
- **Client & Public Portal**: Public showcase, service catalogue, contact forms, appointment booking, and client dashboard.
- **Digital Agreements & E-Signatures**: Contract creation, digital signature pad, PDF export with tamper-evident stamps.
- **AI Analytics & Insights**: Automated performance summaries, workforce metrics, and business intelligence.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Framer Motion
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JWT with role-based access control (Admin, Manager, Staff, Client)

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster connection string

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_jwt_key
CLIENT_URL=http://localhost:5173

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=zorasolutions.official@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM=zorasolutions.official@gmail.com
```

### 3. Install Dependencies
```bash
# Install root, backend, and frontend packages
npm install
cd client && npm install
```

### 4. Run Development Servers
```bash
# Run both backend and frontend concurrently from root
npm run dev
```

---

## 📞 Support & Inquiries

- **Email**: [zorasolutions.official@gmail.com](mailto:zorasolutions.official@gmail.com)
- **Phone**: +94 77 749 8608
- **Platform**: Zora Solutions

© 2026 Zora. All rights reserved.
