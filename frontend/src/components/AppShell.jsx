import React, { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import {
  Shield,
  LayoutDashboard,
  Users,
  Activity,
  Brain,
  Bell,
  Upload,
  GraduationCap,
  TrendingUp,
  LogOut,
  Search,
  Menu,
  ChevronDown,
  X,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  User,
  Building,
  ArrowRight,
  Sparkles,
  Command,
  Check,
  Trash2,
  Layers,
  Inbox
} from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Popover from '@radix-ui/react-popover'
import * as Dialog from '@radix-ui/react-dialog'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import useSocket from '../hooks/useSocket'
import StudentProfileSheet from './StudentProfileSheet'
import '../styles/tokens.css'
import '../styles/base.css'

function RiskBadge({ level }) {
  let bg = 'var(--surface-2)'
  let color = 'var(--text-secondary)'
  const norm = (level || '').toLowerCase()
  if (norm === 'high') { bg = 'var(--danger-light)'; color = 'var(--danger)' }
  else if (norm === 'medium') { bg = 'var(--warning-light)'; color = 'var(--warning)' }
  else if (norm === 'low') { bg = 'var(--success-light)'; color = 'var(--success)' }

  return (
    <span style={{
      padding: '2px 8px', borderRadius: '980px',
      backgroundColor: bg, color: color, fontSize: '11px', fontWeight: 600,
      textTransform: 'capitalize'
    }}>
      {level || 'Unknown'}
    </span>
  )
}

export default function AppShell({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const socket = useSocket()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  
  // Spotlight Search State
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const searchDebounceRef = useRef(null)

  // Notification Center State
  const [notifTab, setNotifTab] = useState('all') // 'all' | 'unread' | 'high'
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'High Risk Escalation',
      desc: 'STU1001 escalated to High Risk based on recent attendance decline.',
      time: '5m ago',
      unread: true,
      type: 'high',
      studentId: 'STU1001',
      badge: 'High Risk'
    },
    {
      id: 2,
      title: 'Attendance Alert',
      desc: 'STU1004 attendance rate fell below institutional 75% threshold.',
      time: '45m ago',
      unread: true,
      type: 'warning',
      studentId: 'STU1004',
      badge: 'Medium Risk'
    },
    {
      id: 3,
      title: 'Batch ML Predictions Complete',
      desc: 'Risk models processed 5,000 enrolled students. 313 flagged as high risk.',
      time: '2h ago',
      unread: true,
      type: 'info',
      link: '/admin',
      badge: 'System'
    },
    {
      id: 4,
      title: 'Model Registry Active',
      desc: 'RandomForest + XGBoost ensemble initialized. 5-Fold Stratified CV: Macro F1 82.32% ± 2.68% | Test Accuracy 87.10%.',
      time: '1d ago',
      unread: false,
      type: 'success',
      link: '/admin#models',
      badge: 'Model v2.4'
    },
  ])

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Live WebSocket Real-time Notifications
  useEffect(() => {
    if (!socket) return

    const handleLiveRisk = (payload) => {
      const { student_id, risk_label, risk_probability, changed } = payload
      const newNotif = {
        id: Date.now(),
        title: changed ? `⚠️ Risk Escalated: ${student_id}` : `Risk Update: ${student_id}`,
        desc: `Student ${student_id} classified as ${risk_label} (${Math.round(risk_probability)}% probability).`,
        time: 'Just now',
        unread: true,
        type: risk_label === 'High' ? 'high' : 'info',
        studentId: student_id,
        badge: `${risk_label} Risk`
      }
      setNotifications(prev => [newNotif, ...prev])
      toast(`${newNotif.title} — ${risk_label}`, {
        icon: risk_label === 'High' ? '🚨' : '📊'
      })
    }

    socket.on('risk_update', handleLiveRisk)
    return () => socket.off('risk_update', handleLiveRisk)
  }, [socket])

  // Keyboard shortcut CMD+K / CTRL+K for Spotlight Search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Live Student Search API Debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setSearchLoading(false)
      return
    }

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    setSearchLoading(true)

    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get('/api/students', {
          params: { search: searchQuery.trim(), limit: 6 }
        })
        setSearchResults(res.data.students || [])
      } catch (err) {
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 200)

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    }
  }, [searchQuery])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const role = user?.role || 'student'
  const institutionName = user?.institution_name || 'Default University'

  const navLinks = {
    super_admin: [
      { section: 'OVERVIEW', items: [{ icon: LayoutDashboard, label: 'Dashboard', to: '/admin' }] },
      {
        section: 'STUDENTS',
        items: [
          { icon: Users, label: 'Student Directory', to: '/teacher' },
          { icon: Activity, label: 'Risk Monitor', to: '/admin#risk' }
        ]
      }
    ],
    admin: [
      { section: 'OVERVIEW', items: [{ icon: LayoutDashboard, label: 'Dashboard', to: '/admin' }] },
      {
        section: 'STUDENTS',
        items: [
          { icon: Users, label: 'Student Directory', to: '/teacher' },
          { icon: Activity, label: 'Risk Monitor', to: '/admin#risk' }
        ]
      }
    ],
    teacher: [
      { section: 'OVERVIEW', items: [{ icon: LayoutDashboard, label: 'Dashboard', to: '/teacher' }] },
      {
        section: 'STUDENTS',
        items: [
          { icon: Users, label: 'Student Directory', to: '/teacher' },
          { icon: Activity, label: 'Risk Monitor', to: '/teacher#risk' }
        ]
      },
      { section: 'TOOLS', items: [{ icon: Brain, label: 'Predict', to: '/predict' }] }
    ],
    student: [
      {
        section: 'OVERVIEW',
        items: [
          { icon: GraduationCap, label: 'My Dashboard', to: '/student' },
          { icon: TrendingUp, label: 'My Progress', to: '/student#progress' }
        ]
      }
    ]
  }

  const currentNav = navLinks[role] || navLinks.student

  // Responsive sidebar logic
  const isTablet = windowWidth < 768 && windowWidth >= 480
  const isMobile = windowWidth < 480

  const sidebarWidth = isTablet ? '52px' : '240px'
  const sidebarDisplay = isMobile ? (isMobileOpen ? 'flex' : 'none') : 'flex'

  // Get current page title
  let pageTitle = 'Dashboard'
  currentNav.forEach(section => {
    section.items.forEach(item => {
      if (item.to === location.pathname || item.to === location.pathname + location.hash) {
        pageTitle = item.label
      }
    })
  })

  const unreadCount = notifications.filter(n => n.unread).length

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
    toast.success('All notifications marked as read')
  }

  const clearAllNotifications = () => {
    setNotifications([])
    toast.success('Notification feed cleared')
  }

  const dismissNotification = (e, id) => {
    e.stopPropagation()
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const handleNotificationClick = async (n) => {
    // Mark this notification as read
    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item))

    if (n.studentId) {
      const toastId = toast.loading(`Loading profile for ${n.studentId}...`)
      try {
        const res = await axios.get(`/api/students/${n.studentId}`)
        toast.dismiss(toastId)
        setSelectedStudent(res.data)
        setSheetOpen(true)
      } catch {
        toast.dismiss(toastId)
        // Fallback with basic student object
        setSelectedStudent({ student_id: n.studentId, name: n.studentId, department: 'General', risk_label: 'High' })
        setSheetOpen(true)
      }
    } else if (n.link) {
      navigate(n.link)
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (notifTab === 'unread') return n.unread
    if (notifTab === 'high') return n.type === 'high'
    return true
  })

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'U')

  const openStudentSheet = (student) => {
    setSearchOpen(false)
    setSelectedStudent(student)
    setSheetOpen(true)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}>
      <style>{`
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 36px;
          padding: 0 12px;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          text-decoration: none;
          transition: background-color 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .nav-item:hover {
          background-color: var(--surface-2);
          color: var(--text-primary);
        }
        .nav-item.active {
          background-color: var(--accent-light);
          color: var(--accent);
          font-weight: 600;
        }
        .nav-icon {
          flex-shrink: 0;
        }
        .nav-label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .icon-only .nav-item {
          justify-content: center;
          padding: 0;
        }
        .icon-only .nav-label {
          display: none;
        }
        .icon-only .section-header {
          display: none;
        }
        .mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
        .topbar-icon-btn {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background: var(--surface);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s ease;
          position: relative;
        }
        .topbar-icon-btn:hover {
          background: var(--surface-2);
          color: var(--text-primary);
          border-color: var(--border-strong);
        }
        .dropdown-item-hover:hover {
          background: var(--surface-2);
          color: var(--text-primary);
        }
        .search-result-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          width: 100%;
          text-align: left;
          font-family: var(--font-sans);
          transition: all 0.15s ease;
        }
        .search-result-item:hover, .search-result-item:focus {
          background: var(--surface-2);
          border-color: var(--border);
          outline: none;
        }
        .notif-card {
          padding: 12px 14px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background: var(--surface);
          box-shadow: var(--shadow-sm);
          cursor: pointer;
          transition: all 0.15s ease;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .notif-card:hover {
          background: var(--surface-2);
          border-color: var(--border-strong);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }
        .notif-card.unread {
          background: var(--accent-light);
          border-color: rgba(79, 70, 229, 0.2);
        }
        .notif-tab-btn {
          padding: 6px 12px;
          font-size: 12px;
          font-family: var(--font-sans);
          font-weight: 600;
          border-radius: var(--radius-full);
          border: 1px solid transparent;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .notif-tab-btn.active {
          background: var(--surface-2);
          color: var(--text-primary);
          font-weight: 700;
          border: 1px solid var(--border);
        }
        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .search-spinner {
          animation: spinSlow 0.8s linear infinite;
        }
      `}</style>

      {/* Mobile Sidebar Overlay */}
      {isMobile && isMobileOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarWidth, x: isMobile && !isMobileOpen ? '-100%' : 0 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
        className={isTablet ? 'icon-only' : ''}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: sidebarWidth,
          backgroundColor: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: sidebarDisplay,
          flexDirection: 'column',
          zIndex: 1001,
          overflow: 'hidden'
        }}
      >
        {/* Branding */}
        <div style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isTablet ? 'center' : 'flex-start'
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, var(--accent) 0%, #3B82F6 100%)',
              color: 'white',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
              fontWeight: 700
            }}>
              <Shield size={18} />
            </div>
            {!isTablet && <span style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>EduGuard</span>}
          </Link>
          {!isTablet && (
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
              {institutionName}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', flex: 1 }}>
          {currentNav.map((section, idx) => (
            <div key={idx} style={{ marginBottom: '14px' }}>
              <div className="section-header" style={{
                fontSize: '11px',
                fontFamily: 'var(--font-sans)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-tertiary)',
                padding: '6px 12px 6px',
                fontWeight: 700
              }}>
                {section.section}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {section.items.map((item, itemIdx) => {
                  const Icon = item.icon
                  const currentFull = location.pathname + (location.hash || '')
                  const isItemActive = item.to.includes('#')
                    ? currentFull === item.to
                    : (location.pathname === item.to && (!location.hash || location.hash === '#'))

                  return (
                    <NavLink
                      key={itemIdx}
                      to={item.to}
                      className={`nav-item ${isItemActive ? 'active' : ''}`}
                      onClick={() => {
                        if (isMobile) setIsMobileOpen(false)
                        if (item.to.includes('#')) {
                          const [targetPath, targetHash] = item.to.split('#')
                          if (location.pathname === targetPath) {
                            window.location.hash = targetHash
                          }
                        }
                      }}
                      title={isTablet ? item.label : undefined}
                    >
                      <Icon size={17} className="nav-icon" />
                      <span className="nav-label">{item.label}</span>
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 'auto',
          padding: '14px 16px',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--surface-2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          alignItems: isTablet ? 'center' : 'stretch'
        }}>
          {/* User Info */}
          {!isTablet && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--accent-light)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-sans)',
                fontWeight: 700,
                fontSize: '13px',
                flexShrink: 0
              }}>
                {userInitial}
              </div>
              <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>
                  {user?.name || user?.email || 'User'}
                </div>
                <div className="stamp-badge" style={{
                  fontSize: '10px',
                  background: 'var(--surface)',
                  color: 'var(--accent)',
                  borderColor: 'rgba(79, 70, 229, 0.2)',
                  marginTop: '2px'
                }}>
                  {role}
                </div>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            aria-label="Sign out"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isTablet ? 'center' : 'flex-start',
              gap: '8px',
              background: 'var(--surface)',
              border: '1px solid rgba(225, 29, 72, 0.2)',
              color: 'var(--danger)',
              cursor: 'pointer',
              padding: isTablet ? '8px 0' : '7px 12px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              fontSize: '12.5px'
            }}
            title={isTablet ? 'Sign out' : undefined}
          >
            <LogOut size={14} />
            {!isTablet && <span>Sign out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main style={{
        marginLeft: isMobile ? 0 : sidebarWidth,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        transition: 'margin-left 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}>
        {/* Topbar */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: 'var(--topbar-height)',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isMobile && (
              <button
                onClick={() => setIsMobileOpen(true)}
                aria-label="Open navigation menu"
                style={{ background: 'transparent', border: 'none', color: 'var(--ink)', cursor: 'pointer', padding: 0, display: 'flex' }}
              >
                <Menu size={20} />
              </button>
            )}
            <h1 style={{ fontFamily: 'var(--font-hand)', fontSize: '26px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
              {pageTitle}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Spotlight Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="topbar-icon-btn"
              aria-label="Quick Search"
              title="Search (Ctrl+K)"
            >
              <Search size={16} />
            </button>

            {/* Notifications Popover */}
            <Popover.Root>
              <Popover.Trigger asChild>
                <button
                  className="topbar-icon-btn"
                  aria-label="View notifications"
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '-3px',
                      right: '-3px',
                      width: '10px',
                      height: '10px',
                      borderRadius: 'var(--radius-xs)',
                      background: 'var(--danger)',
                      border: '1.5px solid var(--ink)'
                    }} />
                  )}
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  style={{
                    backgroundColor: 'var(--surface)',
                    border: '2px solid var(--ink)',
                    boxShadow: '5px 5px 0px var(--ink)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 0,
                    width: '380px',
                    maxWidth: '92vw',
                    zIndex: 9999,
                    outline: 'none',
                    overflow: 'hidden'
                  }}
                  align="end"
                  sideOffset={8}
                >
                  {/* Notification Header */}
                  <div style={{ padding: '16px 20px 12px', borderBottom: '0.5px solid var(--border)', backgroundColor: 'var(--surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Notifications</span>
                        {unreadCount > 0 && (
                          <span style={{
                            fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '980px',
                            background: 'var(--danger-light)', color: 'var(--danger)'
                          }}>
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllNotificationsRead}
                            style={{ fontSize: '12px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                          >
                            Mark all read
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            onClick={clearAllNotifications}
                            style={{ fontSize: '12px', color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}
                            title="Clear all notifications"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Filter Tabs */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => setNotifTab('all')}
                        className={`notif-tab-btn ${notifTab === 'all' ? 'active' : ''}`}
                      >
                        All ({notifications.length})
                      </button>
                      <button
                        onClick={() => setNotifTab('unread')}
                        className={`notif-tab-btn ${notifTab === 'unread' ? 'active' : ''}`}
                      >
                        Unread ({unreadCount})
                      </button>
                      <button
                        onClick={() => setNotifTab('high')}
                        className={`notif-tab-btn ${notifTab === 'high' ? 'active' : ''}`}
                      >
                        High Risk
                      </button>
                    </div>
                  </div>

                  {/* Notification List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto', padding: '12px 16px' }}>
                    {filteredNotifications.length === 0 ? (
                      <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                        <CheckCircle2 size={32} style={{ margin: '0 auto 8px', color: 'var(--success)', opacity: 0.8 }} />
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>All caught up!</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>No unread notifications to review.</div>
                      </div>
                    ) : (
                      filteredNotifications.map(n => {
                        let icon = <AlertTriangle size={15} color="var(--warning)" />
                        let borderLeft = '3px solid var(--warning)'
                        if (n.type === 'high') {
                          icon = <AlertTriangle size={15} color="var(--danger)" />
                          borderLeft = '3px solid var(--danger)'
                        } else if (n.type === 'success') {
                          icon = <CheckCircle2 size={15} color="var(--success)" />
                          borderLeft = '3px solid var(--success)'
                        } else if (n.type === 'info') {
                          icon = <Activity size={15} color="var(--accent)" />
                          borderLeft = '3px solid var(--accent)'
                        }

                        return (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`notif-card ${n.unread ? 'unread' : ''}`}
                            style={{ borderLeft }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {icon}
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{n.time}</span>
                                <button
                                  onClick={(e) => dismissNotification(e, n.id)}
                                  aria-label="Dismiss notification"
                                  style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 2, display: 'flex' }}
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            </div>

                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                              {n.desc}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                              <span style={{
                                fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px',
                                backgroundColor: n.type === 'high' ? 'var(--danger-light)' : 'var(--surface-2)',
                                color: n.type === 'high' ? 'var(--danger)' : 'var(--text-secondary)'
                              }}>
                                {n.badge || 'Alert'}
                              </span>

                              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {n.studentId ? 'Inspect Profile' : 'View Details'} <ArrowRight size={11} />
                              </span>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {/* Popover Footer */}
                  <div style={{ padding: '10px 16px', borderTop: '0.5px solid var(--border)', backgroundColor: 'var(--surface-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    <span>Live WebSocket risk monitor</span>
                    <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} /> Connected
                    </span>
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

            {/* Profile Dropdown Menu */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  aria-label="User account menu"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    background: 'transparent',
                    border: 'none',
                    padding: '4px 6px',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'background 0.15s ease'
                  }}
                  className="dropdown-item-hover"
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--accent-light)',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '12px'
                  }}>
                    {userInitial}
                  </div>
                  <ChevronDown size={14} color="var(--text-secondary)" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  style={{
                    backgroundColor: 'var(--surface)',
                    border: '0.5px solid var(--border-strong)',
                    boxShadow: 'var(--shadow-lg)',
                    borderRadius: 'var(--radius-md)',
                    padding: '6px',
                    width: '220px',
                    zIndex: 9999,
                    outline: 'none'
                  }}
                  align="end"
                  sideOffset={8}
                >
                  {/* User Profile Header */}
                  <div style={{ padding: '8px 10px', borderBottom: '0.5px solid var(--border)', marginBottom: '4px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.name || user?.email || 'User Account'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.email || 'user@edu.local'}
                    </div>
                    <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, background: 'var(--accent-light)', color: 'var(--accent)', padding: '2px 6px', borderRadius: '4px' }}>
                        {role}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {institutionName}
                      </span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <DropdownMenu.Item
                    onClick={() => {
                      if (role === 'admin' || role === 'super_admin') navigate('/admin')
                      else if (role === 'teacher') navigate('/teacher')
                      else navigate('/student')
                    }}
                    className="dropdown-item-hover"
                    style={{ padding: '8px 10px', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px', outline: 'none' }}
                  >
                    <LayoutDashboard size={14} /> My Dashboard
                  </DropdownMenu.Item>

                  <DropdownMenu.Separator style={{ height: '1px', backgroundColor: 'var(--border)', margin: '4px 0' }} />

                  <DropdownMenu.Item
                    onClick={handleLogout}
                    className="dropdown-item-hover"
                    style={{ padding: '8px 10px', fontSize: '13px', color: 'var(--danger)', cursor: 'pointer', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px', outline: 'none', fontWeight: 500 }}
                  >
                    <LogOut size={14} /> Sign out
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: '24px', flex: 1, overflowX: 'hidden' }}>
          {children}
        </div>
      </main>

      {/* Spotlight Search Modal (Dialog) */}
      <Dialog.Root open={searchOpen} onOpenChange={setSearchOpen}>
        <Dialog.Portal>
          <Dialog.Overlay style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(44, 24, 16, 0.45)',
            backdropFilter: 'blur(6px)', zIndex: 9998
          }} />
          <Dialog.Content style={{
            position: 'fixed', top: '15%', left: '50%', transform: 'translateX(-50%)',
            width: '90%', maxWidth: '580px', backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius-sm)', boxShadow: '8px 8px 0px var(--ink)',
            border: '2.5px solid var(--ink)', padding: 0, zIndex: 9999, outline: 'none',
            overflow: 'hidden', display: 'flex', flexDirection: 'column'
          }}>
            {/* Search Input Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '2px solid var(--ink)', background: 'var(--surface-2)' }}>
              {searchLoading ? (
                <div className="search-spinner" style={{ width: 20, height: 20, border: '2.5px solid var(--ink)', borderTopColor: 'transparent', borderRadius: '50%' }} />
              ) : (
                <Search size={20} color="var(--ink)" />
              )}
              <input
                autoFocus
                placeholder="Search student or ID (e.g. Vivaan, STU1003)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  flex: 1, border: 'none', background: 'transparent',
                  fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 600,
                  color: 'var(--ink)', outline: 'none'
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    if (searchResults.length > 0) {
                      openStudentSheet(searchResults[0])
                    } else {
                      setSearchOpen(false)
                      navigate(`/teacher?search=${encodeURIComponent(searchQuery)}`)
                    }
                  }
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'var(--surface-2)', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={13} />
                </button>
              )}
              <Dialog.Close asChild>
                <button
                  style={{
                    background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: '4px',
                    padding: '2px 6px', fontSize: '11px', color: 'var(--text-tertiary)', cursor: 'pointer', fontFamily: 'monospace'
                  }}
                >
                  ESC
                </button>
              </Dialog.Close>
            </div>

            {/* Search Body Content */}
            <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '12px 16px' }}>
              {searchQuery.trim() ? (
                /* Dynamic Matching Results */
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '8px', padding: '0 4px' }}>
                    {searchLoading ? 'Searching directory...' : `Students (${searchResults.length} matches)`}
                  </div>

                  {searchResults.length === 0 && !searchLoading ? (
                    <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <Users size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>No students found for "{searchQuery}"</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Try searching by student name or roll ID</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {searchResults.map(s => {
                        const initials = s.name ? s.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '?'
                        return (
                          <button
                            key={s.student_id}
                            onClick={() => openStudentSheet(s)}
                            className="search-result-item"
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'var(--accent-light)',
                                color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '12px', fontWeight: 700, flexShrink: 0
                              }}>
                                {initials}
                              </div>
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                  {s.name}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                  {s.department} · Sem {s.semester || s.year || 1} · <span style={{ fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{s.student_id}</span>
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                <div>GPA <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{typeof s.gpa === 'number' ? s.gpa.toFixed(2) : s.gpa}</span></div>
                              </div>
                              <RiskBadge level={s.risk_label} />
                            </div>
                          </button>
                        )
                      })}

                      {/* Jump to Full Directory CTA */}
                      <button
                        onClick={() => {
                          setSearchOpen(false)
                          navigate(`/teacher?search=${encodeURIComponent(searchQuery)}`)
                        }}
                        style={{
                          marginTop: '8px', padding: '10px 14px', borderRadius: 'var(--radius-md)',
                          border: '0.5px solid var(--border)', background: 'var(--surface-2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          cursor: 'pointer', color: 'var(--accent)', fontSize: '13px', fontWeight: 600, width: '100%'
                        }}
                      >
                        <span>View all results in Student Directory</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Default Quick Actions & Shortcuts */
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '8px', padding: '0 4px' }}>
                    Quick Navigation
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button
                      onClick={() => { setSearchOpen(false); navigate('/teacher') }}
                      className="dropdown-item-hover"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-primary)' }}>
                        <Users size={16} color="var(--accent)" /> Student Directory
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Jump to directory</span>
                    </button>

                    <button
                      onClick={() => { setSearchOpen(false); navigate('/predict') }}
                      className="dropdown-item-hover"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-primary)' }}>
                        <Brain size={16} color="var(--warning)" /> ML Risk Predictor
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Predict dropout risk</span>
                    </button>

                    <button
                      onClick={() => { setSearchOpen(false); navigate('/admin') }}
                      className="dropdown-item-hover"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-primary)' }}>
                        <LayoutDashboard size={16} color="var(--success)" /> Analytics Overview
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>System KPIs</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Spotlight Footer */}
            <div style={{
              padding: '10px 20px', borderTop: '0.5px solid var(--border)', backgroundColor: 'var(--surface-2)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-tertiary)'
            }}>
              <span>Search across 5,000+ student profiles</span>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span><kbd style={{ background: 'var(--surface)', padding: '1px 4px', borderRadius: '3px', border: '0.5px solid var(--border-strong)', fontFamily: 'monospace' }}>↵</kbd> to inspect</span>
                <span><kbd style={{ background: 'var(--surface)', padding: '1px 4px', borderRadius: '3px', border: '0.5px solid var(--border-strong)', fontFamily: 'monospace' }}>esc</kbd> to close</span>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Global Student Profile Sheet invoked from Search & Notifications */}
      <StudentProfileSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        student={selectedStudent}
      />
    </div>
  )
}
