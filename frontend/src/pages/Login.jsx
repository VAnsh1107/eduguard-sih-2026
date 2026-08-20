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
    color: 'var(--accent)',
    badgeBg: 'var(--accent-light)',
  },
  {
    role: 'Teacher',
    email: 'teacher@edu.local',
    password: 'changeme',
    desc: 'Student risk monitor & directory',
    color: 'var(--warning)',
    badgeBg: 'var(--warning-light)',
  },
  {
    role: 'Student',
    email: 'student@edu.local',
    password: 'changeme',
    desc: 'Personal risk & wellbeing tracker',
    color: 'var(--success)',
    badgeBg: 'var(--success-light)',
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

      // Navigate based on role
      setTimeout(() => {
        if (user.role === 'admin' || user.role === 'super_admin') {
          navigate('/admin')
        } else if (user.role === 'teacher') {
          navigate('/teacher')
        } else {
          navigate('/student')
        }
      }, 200)
    } catch (error) {
      console.error('Login error:', error)
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Invalid email or password. Please check your credentials.'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password.')
      return
    }
    performLogin(email.trim(), password)
  }

  const handleQuickLogin = (account) => {
    setActiveDemo(account.role)
    setEmail(account.email)
    setPassword(account.password)
    performLogin(account.email, account.password)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Ambient background glow */}
      <div className="ambient-hero-glow" />

      {/* Top logo link */}
      <Link
        to="/"
        style={{
          position: 'absolute',
          top: '28px',
          left: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
          color: 'var(--text-secondary)',
          fontSize: '14px',
          fontWeight: 600,
          zIndex: 10
        }}
      >
        <div style={{
          width: '26px', height: '26px', borderRadius: '7px',
          backgroundColor: 'var(--accent-light)', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <Shield size={15} color="var(--accent)" />
        </div>
        <span style={{ color: 'var(--text-primary)' }}>EduGuard</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          width: '100%',
          maxWidth: '430px',
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-2xl)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03)',
          border: '0.5px solid var(--border-strong)',
          padding: '38px 34px',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--accent-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: '0 4px 12px rgba(0, 113, 227, 0.12)',
            }}
          >
            <Shield size={26} color="var(--accent)" />
          </div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '0 0 6px 0',
              letterSpacing: '-0.025em',
            }}
          >
            Sign in to EduGuard
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              margin: 0,
              lineHeight: 1.45,
            }}
          >
            AI-powered higher education retention intelligence
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Email field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              htmlFor="login-email"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Institutional Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@edu.local"
              disabled={loading}
              style={{
                width: '100%',
                height: '42px',
                padding: '0 14px',
                borderRadius: 'var(--radius-md)',
                border: '0.5px solid var(--border-strong)',
                background: 'var(--surface-2)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent)'
                e.target.style.boxShadow = '0 0 0 3px rgba(0, 113, 227, 0.15)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-strong)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Password field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              htmlFor="login-password"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={loading}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 40px 0 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '0.5px solid var(--border-strong)',
                  background: 'var(--surface-2)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--accent)'
                  e.target.style.boxShadow = '0 0 0 3px rgba(0, 113, 227, 0.15)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-strong)'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: 'var(--text-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              height: '44px',
              borderRadius: '980px',
              background: 'var(--accent)',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '4px',
              boxShadow: '0 4px 12px rgba(0, 113, 227, 0.25)',
              opacity: loading ? 0.85 : 1,
            }}
          >
            {loading ? (
              <>
                <Loader2 size={17} style={{ animation: 'loginSpin 1s linear infinite' }} />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </form>

        {/* 1-Click Demo Section */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '0.5px solid var(--border)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              1-Click Demo Login
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Instant role switch</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {DEMO_ACCOUNTS.map((acc) => {
              const isSelected = activeDemo === acc.role && loading
              return (
                <motion.button
                  key={acc.role}
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin(acc)}
                  whileHover={{ y: -1, boxShadow: 'var(--shadow-sm)' }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '0.5px solid var(--border-strong)',
                    background: 'var(--surface-2)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: acc.badgeBg,
                        color: acc.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      {acc.role[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {acc.role} Account
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {acc.email} · <span style={{ fontFamily: 'monospace' }}>{acc.password}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ color: acc.color, display: 'flex', alignItems: 'center' }}>
                    {isSelected ? (
                      <Loader2 size={15} style={{ animation: 'loginSpin 1s linear infinite' }} />
                    ) : (
                      <ArrowRight size={15} />
                    )}
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <div style={{ marginTop: '28px', fontSize: '12px', color: 'var(--text-tertiary)', textAlign: 'center' }}>
        Protected by EduGuard Enterprise Security · Smart India Hackathon
      </div>

      <style>{`
        @keyframes loginSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
