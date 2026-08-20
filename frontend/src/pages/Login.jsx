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
    badge: '[ DEAN / ADMIN ]'
  },
  {
    role: 'Teacher',
    email: 'teacher@edu.local',
    password: 'changeme',
    desc: 'Student risk monitor & directory',
    badge: '[ ADVISOR ]'
  },
  {
    role: 'Student',
    email: 'student@edu.local',
    password: 'changeme',
    desc: 'Personal risk & wellbeing tracker',
    badge: '[ STUDENT HUB ]'
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
          color: 'var(--ink)',
          border: '2px solid var(--ink)',
          borderRadius: '4px',
          boxShadow: '3px 3px 0px var(--ink)',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px'
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
          border: '2.5px solid var(--ink)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: '6px 6px 0px var(--ink)',
          padding: '36px 32px'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--ink)',
            color: 'var(--bg)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            marginBottom: '10px'
          }}>
            🛡️
          </div>
          <h1 style={{
            fontFamily: 'var(--font-hand)',
            fontSize: '36px',
            fontWeight: 700,
            color: 'var(--ink)',
            lineHeight: 1.1,
            margin: '0 0 6px 0'
          }}>
            EduGuard Portal
          </h1>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text-secondary)'
          }}>
            // Institutional Early-Warning & Retention System
          </p>
        </div>

        {/* Demo Quick Access */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--text-tertiary)',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>[ 1-CLICK DEMO ACCESS ]</span>
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
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1.5px solid var(--ink)',
                  backgroundColor: 'var(--surface-2)',
                  color: 'var(--ink)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: '2px 2px 0px var(--ink)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12.5px', fontWeight: 700 }}>
                    {acc.role} Account
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {acc.desc}
                  </div>
                </div>

                <div className="stamp-badge" style={{ fontSize: '9px', borderColor: 'var(--ink)', background: 'var(--surface)' }}>
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
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-tertiary)'
        }}>
          <div style={{ flex: 1, height: '1.5px', backgroundColor: 'var(--border-subtle)' }} />
          <span>OR SIGN IN MANUALLY</span>
          <div style={{ flex: 1, height: '1.5px', backgroundColor: 'var(--border-subtle)' }} />
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '6px' }}>
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
                padding: '0 12px',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                color: 'var(--ink)',
                backgroundColor: 'var(--surface-2)',
                border: '1.5px solid var(--ink)',
                borderRadius: 'var(--radius-xs)',
                boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.05)',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink)', marginBottom: '6px' }}>
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
                  padding: '0 36px 0 12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  color: 'var(--ink)',
                  backgroundColor: 'var(--surface-2)',
                  border: '1.5px solid var(--ink)',
                  borderRadius: 'var(--radius-xs)',
                  boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.05)',
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
              height: '46px',
              backgroundColor: 'var(--ink)',
              color: 'var(--bg)',
              border: '2px solid var(--ink)',
              boxShadow: '3px 3px 0px var(--accent)',
              borderRadius: 'var(--radius-xs)',
              fontFamily: 'var(--font-mono)',
              fontSize: '13.5px',
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
