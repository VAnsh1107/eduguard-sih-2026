import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  ChartBar,
  Users,
  Student,
  SignOut,
  Brain,
  ChartPie,
  Pulse,
  Buildings,
  CaretDown,
  Check,
} from '@phosphor-icons/react'
import axios from 'axios'

const NAV_LINKS = {
  admin:   [
    { label: 'Overview',    href: '/admin',   Icon: ChartPie },
    { label: 'Predict',     href: '/predict', Icon: Brain },
  ],
  teacher: [
    { label: 'My Class',    href: '/teacher', Icon: Users },
    { label: 'Predict',     href: '/predict', Icon: Brain },
  ],
  student: [
    { label: 'Dashboard',   href: '/student', Icon: Pulse },
  ],
}

export default function Navbar() {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()

  const [institutions, setInstitutions] = useState([])
  const [switching, setSwitching] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const links = user ? NAV_LINKS[user.role] || [] : []
  const isSuperAdmin = user?.role === 'super_admin'

  useEffect(() => {
    if (isSuperAdmin) {
      axios.get('/api/institutions')
        .then(r => setInstitutions(r.data.institutions || []))
        .catch(() => {})
    }
  }, [isSuperAdmin])

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    logout()
    navigate('/')
  }

  async function handleSwitchInstitution(instId) {
    if (instId === user?.institution_id || switching) {
      setDropdownOpen(false)
      return
    }
    setSwitching(true)
    setDropdownOpen(false)
    try {
      const { data } = await axios.post('/api/auth/switch-institution', {
        institution_id: instId,
      })
      login(data.access_token, data.refresh_token, data.user)
      window.location.reload()
    } catch (err) {
      alert('Failed to switch institution.')
    } finally {
      setSwitching(false)
    }
  }

  const roleColors = {
    super_admin: 'text-purple-400',
    admin:   'text-blue-400',
    teacher: 'text-emerald-400',
    student: 'text-amber-400',
  }

  const currentInst = institutions.find(i => i.id === user?.institution_id)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-xl">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mr-4 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
            <Brain size={16} weight="fill" className="text-white" />
          </div>
          <span className="font-semibold text-white tracking-tight">EduGuard</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1 flex-1">
          {links.map(({ label, href, Icon }) => (
            <Link
              key={href}
              to={href}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>

        {/* Right side — institution switcher + user info + logout */}
        {user && (
          <div className="flex items-center gap-3">
            {/* Institution Switcher (super_admin only) */}
            {isSuperAdmin && institutions.length > 0 && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(v => !v)}
                  disabled={switching}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/40 transition-all disabled:opacity-50"
                >
                  <Buildings size={13} />
                  <span className="max-w-[140px] truncate">
                    {switching ? 'Switching...' : (currentInst?.name || 'All Institutions')}
                  </span>
                  <CaretDown size={12} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-white/[0.08] bg-zinc-900 shadow-2xl shadow-black/50 py-2 z-50">
                    <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                      Switch Institution
                    </div>
                    {institutions.map(inst => (
                      <button
                        key={inst.id}
                        onClick={() => handleSwitchInstitution(inst.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-xs transition-all hover:bg-white/[0.06] ${
                          inst.id === user.institution_id
                            ? 'text-purple-300 bg-purple-500/10'
                            : 'text-zinc-300'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          inst.id === user.institution_id
                            ? 'bg-purple-500/20 border border-purple-500/30'
                            : 'bg-zinc-800 border border-white/[0.06]'
                        }`}>
                          <Buildings size={13} className={
                            inst.id === user.institution_id ? 'text-purple-400' : 'text-zinc-500'
                          } />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{inst.name}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">{inst.slug}</div>
                        </div>
                        {inst.id === user.institution_id && (
                          <Check size={14} weight="bold" className="text-purple-400 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Current institution badge for non-super-admin */}
            {!isSuperAdmin && user.institution_name && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-zinc-500 bg-zinc-900/60 border border-white/[0.06]">
                <Buildings size={11} />
                <span className="truncate max-w-[120px]">{user.institution_name}</span>
              </div>
            )}

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-zinc-500">Signed in as</span>
              <span className={`text-xs font-medium capitalize ${roleColors[user.role] || 'text-zinc-400'}`}>
                {user.name}
              </span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
            >
              <SignOut size={15} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </nav>
    </header>
  )
}
