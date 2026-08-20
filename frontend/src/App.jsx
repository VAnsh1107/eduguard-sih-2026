import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

import Landing          from './pages/Landing'
import Login            from './pages/Login'
import AdminDashboard   from './pages/AdminDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import StudentDashboard from './pages/StudentDashboard'
import PredictionForm   from './pages/PredictionForm'

// Global toast options — Apple HIG style
const toastOptions = {
  style: {
    background: 'var(--surface)',
    color: 'var(--text-primary)',
    border: '0.5px solid var(--border-strong)',
    borderRadius: '12px',
    fontSize: '14px',
    boxShadow: 'var(--shadow-md)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
  },
  success: {
    iconTheme: { primary: '#34C759', secondary: 'white' },
  },
  error: {
    iconTheme: { primary: '#FF3B30', secondary: 'white' },
  },
}

// ── Protected Route ────────────────────────────────────────────────────────────
function ProtectedRoute({ children, allowedRoles }) {
  const auth = useAuth()
  if (!auth.token || !auth.user) {
    return <Navigate to="/login" replace />
  }
  if (allowedRoles && !allowedRoles.includes(auth.user.role)) {
    return <Navigate to="/login" replace />
  }
  return children
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Admin / Super Admin */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Teacher / Directory */}
          <Route path="/teacher" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin', 'teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } />

          {/* Student */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />

          {/* Prediction playground — admin and teacher */}
          <Route path="/predict" element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin', 'teacher']}>
              <PredictionForm />
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Toaster — Apple HIG styled */}
        <Toaster
          position="bottom-center"
          gutter={8}
          toastOptions={toastOptions}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}
