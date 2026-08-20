import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Shield, Loader2, ArrowRight, Eye, EyeOff, CheckCircle2, UserCheck, Sparkles } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import '../styles/tokens.css'
import '../styles/base.css'

const DEMO_ACCOUNTS = [
  {
    role: 'Admin',
    email: 'admin@edu.local',
    password: 'changeme',
    desc: 'System analytics & models',
    badge: 'DEAN / ADMIN',
    color: 'var(--accent)',
    bg: 'var(--accent-light)'
  },
  {
    role: 'Teacher',
    email: 'teacher@edu.local',
    password: 'changeme',
    desc: 'Student risk monitor & directory',
    badge: 'ADVISOR',
    color: 'var(--warning)',
    bg: 'var(--warning-light)'
  },
  {
    role: 'Student',
    email: 'student@edu.local',
    password: 'changeme',
    desc: 'Personal risk & wellbeing tracker',
    badge: 'STUDENT HUB',
    color: 'var(--success)',
    bg: 'var(--success-light)'
  },
]

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeDemo, setActiveDemo] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const performLogin = async (loginEmail, loginPassword) => {
    setLoading(true)
    try {
      const response = await axios.post('/api/auth/login', {
        email: loginEmail,
        password: loginPassword,
      })
      const { access_token, refresh_token, user } = response.data

      login(access_token, refresh_token, user)
      toast.success(`Welcome back, ${user.name || user.email}!`)

      setTimeout(() => {
        if (user.role === 'admin' || user.role === 'super_admin') {
          navigate('/admin')
        } else if (user.role === 'teacher') {
          navigate('/teacher')
        } else {
          navigate('/student')
        }
      }, 300)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid email or password.')
    } finally {
      setLoading(false)
      setActiveDemo(null)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter both email and password.')
      return
    }
    performLogin(email, password)
  }

  const handleDemoClick = (account) => {
    setActiveDemo(account.role)
    setEmail(account.email)
    setPassword(account.password)
    performLogin(account.email, account.password)
  }

  return (
    <div style={{
      minHeight: '100dvh',
      backgroundColor: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative'
    }}>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: 'var(--surface)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-md)',
          fontFamily: 'var(--font-sans)',
          fontSize: '13.5px'
        }
      }} />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          padding: '40px 36px'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--accent) 0%, #3B82F6 100%)',
            color: 'white',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            marginBottom: '12px',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
          }}>
            <Shield size={22} />
          </div>
          <h1 style={{
            fontSize: '26px',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
            margin: '0 0 6px 0'
          }}>
            EduGuard Portal
          </h1>
          <p style={{
            fontSize: '13.5px',
            color: 'var(--text-secondary)'
          }}>
            Institutional Early-Warning & Retention Platform
          </p>
        </div>

        {/* Demo Quick Access */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-tertiary)',
            marginBottom: '10px'
          }}>
            1-CLICK DEMO ACCESS
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => handleDemoClick(acc)}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface-2)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>
                    {acc.role} Account
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {acc.desc}
                  </div>
                </div>

                <div className="stamp-badge" style={{ fontSize: '10px', backgroundColor: acc.bg, color: acc.color, border: 'none' }}>
                  {activeDemo === acc.role ? 'Logging in...' : acc.badge}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '20px 0',
          fontSize: '11.5px',
          color: 'var(--text-tertiary)',
          fontWeight: 600
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
          <span>OR SIGN IN WITH CREDENTIALS</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Institutional Email
            </label>
            <input
              type="email"
              placeholder="user@edu.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                height: '42px',
                padding: '0 14px',
                fontSize: '13.5px',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--surface-2)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-sm)',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 36px 0 14px',
                  fontSize: '13.5px',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--surface-2)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              height: '44px',
              background: 'linear-gradient(135deg, var(--accent) 0%, #3B82F6 100%)',
              color: 'white',
              border: 'none',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '14px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? <Loader2 size={16} className="search-spinner" /> : <>Sign In to Dashboard <ArrowRight size={15} /></>}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
