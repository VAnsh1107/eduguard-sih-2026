import React, { useEffect, useState, useCallback, useRef } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Plus, Eye, Users, ChevronLeft, ChevronRight, Search, Activity, X, Filter, RotateCcw, FileText } from 'lucide-react'
import * as Select from '@radix-ui/react-select'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { toast } from 'react-hot-toast'
import AppShell from '../components/AppShell'
import StudentProfileSheet from '../components/StudentProfileSheet'
import useSocket from '../hooks/useSocket'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

const DEPARTMENTS = [
  'All',
  'Computer Science',
  'Information Tech.',
  'Electronics',
  'Electrical Eng.',
  'Mechanical Eng.',
  'Civil Eng.',
  'Biotechnology'
]

const SEMESTERS = [
  { value: 'All', label: 'All Semesters' },
  { value: '1', label: 'Semester 1' },
  { value: '2', label: 'Semester 2' },
  { value: '3', label: 'Semester 3' },
  { value: '4', label: 'Semester 4' },
  { value: '5', label: 'Semester 5' },
  { value: '6', label: 'Semester 6' },
  { value: '7', label: 'Semester 7' },
  { value: '8', label: 'Semester 8' },
]

function Sparkline({ data }) {
  if (!data || data.length === 0) {
    return <div style={{ width: 60, height: 24, background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }} />
  }
  const chartData = data.map((v, i) => ({ val: typeof v === 'object' ? (v.risk_probability || 0) : v, index: i }))
  return (
    <div style={{ width: 60, height: 24 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="val" stroke="var(--accent)" strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function RiskBadge({ level }) {
  let bg = 'var(--surface-2)'
  let color = 'var(--text-secondary)'
  const norm = (level || '').toLowerCase()
  if (norm === 'high') { bg = 'var(--danger-light)'; color = 'var(--danger)' }
  else if (norm === 'medium') { bg = 'var(--warning-light)'; color = 'var(--warning)' }
  else if (norm === 'low') { bg = 'var(--success-light)'; color = 'var(--success)' }
  
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      padding: '3px 9px', borderRadius: '980px',
      backgroundColor: bg, color: color, fontSize: '12px', fontWeight: 600,
    }}>
      {level || 'Unknown'}
    </div>
  )
}

function Avatar({ name }) {
  const initials = name ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '?'
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--accent-light)',
      color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 700, flexShrink: 0
    }}>
      {initials}
    </div>
  )
}

export default function TeacherDashboard() {
  const [students, setStudents] = useState([])
  const [totalStudents, setTotalStudents] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('All')
  const [risk, setRisk] = useState('All')
  const [semester, setSemester] = useState('All')
  const [page, setPage] = useState(1)
  const limit = 20

  const [selectedStudent, setSelectedStudent] = useState(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [flashingIds, setFlashingIds] = useState(new Set())
  const flashTimers = useRef({})
  const socket = useSocket()

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/students', {
        params: {
          search: search.trim() || undefined,
          department: dept !== 'All' ? dept : undefined,
          risk_level: risk !== 'All' ? risk : undefined,
          semester: semester !== 'All' ? semester : undefined,
          page,
          limit
        }
      })
      setStudents(res.data.students || [])
      setTotalStudents(res.data.total || 0)
    } catch {
      toast.error('Failed to load student directory')
    } finally {
      setLoading(false)
    }
  }, [search, dept, risk, semester, page])

  // Reset to page 1 on filter changes
  useEffect(() => {
    setPage(1)
  }, [search, dept, risk, semester])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const handleRiskUpdate = useCallback((payload) => {
    const { student_id, risk_label, risk_probability, changed } = payload
    setStudents(prev => prev.map(s =>
      s.student_id === student_id ? { ...s, risk_label, risk_probability, dropout_risk: risk_probability } : s
    ))
    if (changed) {
      setFlashingIds(prev => new Set([...prev, student_id]))
      if (flashTimers.current[student_id]) clearTimeout(flashTimers.current[student_id])
      flashTimers.current[student_id] = setTimeout(() => {
        setFlashingIds(prev => {
          const next = new Set(prev)
          next.delete(student_id)
          return next
        })
      }, 1500)
    }
  }, [])

  useEffect(() => {
    if (!socket) return
    socket.on('risk_update', handleRiskUpdate)
    return () => socket.off('risk_update', handleRiskUpdate)
  }, [socket, handleRiskUpdate])

  const handleExportCSV = async () => {
    const toastId = toast.loading('Exporting CSV...')
    try {
      const res = await axios.get('/api/export/students', {
        params: {
          search: search.trim() || undefined,
          department: dept !== 'All' ? dept : undefined,
          risk: risk !== 'All' ? risk : undefined,
          semester: semester !== 'All' ? semester : undefined,
        },
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `students_export_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('CSV downloaded successfully', { id: toastId })
    } catch {
      toast.error('Failed to export CSV', { id: toastId })
    }
  }

  const handleDownloadReport = async (e, studentId) => {
    e.stopPropagation()
    const toastId = toast.loading('Generating student report...')
    try {
      const res = await axios.get(`/api/students/${studentId}/report.pdf`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Student_Report_${studentId}.pdf`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Report downloaded', { id: toastId })
    } catch {
      toast.error('Failed to download student report', { id: toastId })
    }
  }

  const openStudent = (s) => {
    setSelectedStudent(s)
    setSheetOpen(true)
  }

  const clearAllFilters = () => {
    setSearch('')
    setDept('All')
    setRisk('All')
    setSemester('All')
  }

  const hasActiveFilters = search.trim() !== '' || dept !== 'All' || risk !== 'All' || semester !== 'All'

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 32px 64px',
  }

  const searchBarStyle = {
    position: 'sticky',
    top: '0',
    zIndex: 20,
    backgroundColor: 'var(--bg)',
    padding: '16px 0 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  }

  const inputStyle = {
    width: '100%',
    height: '44px',
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border-strong)',
    borderRadius: 'var(--radius-md)',
    padding: '0 16px',
    paddingLeft: '40px',
    fontSize: '14px',
    fontFamily: 'var(--font-sans)',
    color: 'var(--text-primary)',
    outline: 'none',
    boxShadow: 'var(--shadow-sm)'
  }

  const filterRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  }

  const selectTriggerStyle = {
    height: '38px',
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border-strong)',
    borderRadius: 'var(--radius-sm)',
    boxShadow: 'var(--shadow-sm)',
    padding: '0 14px',
    fontSize: '13px',
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    cursor: 'pointer',
    outline: 'none'
  }

  const selectContentStyle = {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)',
    padding: '4px',
    zIndex: 100,
    fontFamily: 'var(--font-sans)'
  }

  const selectItemStyle = {
    height: '34px',
    padding: '0 12px',
    fontSize: '13px',
    fontFamily: 'var(--font-sans)',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    borderRadius: 'var(--radius-xs)',
    cursor: 'pointer',
    outline: 'none'
  }

  const buttonStyle = {
    height: '38px',
    padding: '0 18px',
    background: 'linear-gradient(135deg, var(--accent) 0%, #3B82F6 100%)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    boxShadow: '0 3px 10px rgba(79, 70, 229, 0.3)',
    color: 'white',
    fontSize: '13.5px',
    fontFamily: 'var(--font-sans)',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer'
  }

  const tableCardStyle = {
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-card)',
    overflow: 'hidden',
    marginTop: '16px'
  }

  const totalPages = Math.max(1, Math.ceil(totalStudents / limit))

  return (
    <AppShell>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: [0.25, 0.46, 0.45, 0.94], duration: 0.4 }} style={containerStyle}>
        
        {/* Sticky Filter Header */}
        <div style={searchBarStyle}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: 13, color: 'var(--text-tertiary)' }} />
            <input
              style={inputStyle}
              placeholder="Search students by name, roll ID (e.g. STU1001, Vivaan)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search students by name or ID"
            />
          </div>

          <div style={filterRowStyle}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Select.Root value={dept} onValueChange={setDept}>
                <Select.Trigger style={selectTriggerStyle}>
                  <Select.Value placeholder="Department" />
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content style={selectContentStyle}>
                    <Select.Viewport>
                      {DEPARTMENTS.map(d => (
                        <Select.Item key={d} value={d} style={selectItemStyle} className="select-item-hover">
                          <Select.ItemText>{d}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>

              <Select.Root value={risk} onValueChange={setRisk}>
                <Select.Trigger style={selectTriggerStyle}>
                  <Select.Value placeholder="Risk Level" />
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content style={selectContentStyle}>
                    <Select.Viewport>
                      {['All', 'High', 'Medium', 'Low'].map(r => (
                        <Select.Item key={r} value={r} style={selectItemStyle} className="select-item-hover">
                          <Select.ItemText>{r === 'All' ? 'All Risk Levels' : `${r} Risk`}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>

              <Select.Root value={semester} onValueChange={setSemester}>
                <Select.Trigger style={selectTriggerStyle}>
                  <Select.Value placeholder="Semester" />
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content style={selectContentStyle}>
                    <Select.Viewport>
                      {SEMESTERS.map(s => (
                        <Select.Item key={s.value} value={s.value} style={selectItemStyle} className="select-item-hover">
                          <Select.ItemText>{s.label}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {socket && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--success)', fontWeight: 500 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'var(--success)' }} />
                  Live Socket
                </div>
              )}
              <button style={buttonStyle} onClick={handleExportCSV}>
                <Download size={15} />
                Export CSV
              </button>
            </div>
          </div>

          {/* Active Filter Chips Bar */}
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}
            >
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active Filters:
              </span>

              {search.trim() && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px',
                  borderRadius: '980px', background: 'var(--surface)', border: '0.5px solid var(--border-strong)',
                  fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500
                }}>
                  Search: "{search}"
                  <X size={12} style={{ cursor: 'pointer', color: 'var(--text-tertiary)' }} onClick={() => setSearch('')} />
                </span>
              )}

              {dept !== 'All' && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px',
                  borderRadius: '980px', background: 'var(--surface)', border: '0.5px solid var(--border-strong)',
                  fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500
                }}>
                  Dept: {dept}
                  <X size={12} style={{ cursor: 'pointer', color: 'var(--text-tertiary)' }} onClick={() => setDept('All')} />
                </span>
              )}

              {risk !== 'All' && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px',
                  borderRadius: '980px', background: 'var(--surface)', border: '0.5px solid var(--border-strong)',
                  fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500
                }}>
                  Risk: {risk}
                  <X size={12} style={{ cursor: 'pointer', color: 'var(--text-tertiary)' }} onClick={() => setRisk('All')} />
                </span>
              )}

              {semester !== 'All' && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px',
                  borderRadius: '980px', background: 'var(--surface)', border: '0.5px solid var(--border-strong)',
                  fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500
                }}>
                  Semester {semester}
                  <X size={12} style={{ cursor: 'pointer', color: 'var(--text-tertiary)' }} onClick={() => setSemester('All')} />
                </span>
              )}

              <button
                onClick={clearAllFilters}
                style={{
                  background: 'none', border: 'none', color: 'var(--accent)', fontSize: '12px',
                  fontWeight: 600, cursor: 'pointer', marginLeft: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px'
                }}
              >
                <RotateCcw size={11} /> Reset all
              </button>
            </motion.div>
          )}
        </div>

        {/* Students Table Container */}
        <div style={{
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-card)',
          border: '0.5px solid var(--border)',
          overflow: 'hidden'
        }}>
          {/* Table Header Bar */}
          <div style={{
            padding: '16px 20px', borderBottom: '0.5px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Directory Registry
              </span>
              <span style={{
                fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '980px',
                background: 'var(--surface-2)', color: 'var(--text-secondary)'
              }}>
                {totalStudents.toLocaleString()} Students
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              Click any student row to view full profile & SHAP metrics
            </span>
          </div>

          <div className="table-scroll-container">
            <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
              <thead style={{
                position: 'sticky', top: '52px', backgroundColor: 'var(--surface)', zIndex: 10
              }}>
                <tr>
                  {['Student', 'Department', 'Semester', 'GPA', 'Attendance', 'Risk Level', 'Trend', 'Actions'].map(h => (
                    <th key={h} style={{
                      fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em',
                      color: 'var(--text-tertiary)', padding: '12px 18px', borderBottom: '0.5px solid var(--border-strong)',
                      textAlign: h === 'Actions' ? 'right' : 'left', fontWeight: 700
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <motion.tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} style={{ height: '54px', borderBottom: '0.5px solid var(--border)' }}>
                      <td colSpan={8} style={{ padding: '0 18px' }}>
                        <div style={{ height: 20, backgroundColor: 'var(--surface-2)', borderRadius: 6, opacity: 0.6 }} />
                      </td>
                    </tr>
                  ))
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '64px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <Users size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>No students match your active filters</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Try resetting department or risk selections</div>
                    </td>
                  </tr>
                ) : (
                  students.map((s, i) => (
                    <motion.tr
                      key={s.student_id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.025, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className={flashingIds.has(s.student_id) ? 'row-flash row-hover' : 'row-hover'}
                      style={{ height: '54px', borderBottom: '0.5px solid var(--border)', cursor: 'pointer' }}
                      onClick={() => openStudent(s)}
                    >
                      <td style={{ padding: '8px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Avatar name={s.name} />
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>{s.student_id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '8px 18px', fontSize: '13px', color: 'var(--text-secondary)' }}>{s.department}</td>
                      <td style={{ padding: '8px 18px', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>Sem {s.semester || s.year || 1}</td>
                      <td style={{ padding: '8px 18px', fontSize: '13px', fontFamily: 'monospace', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {typeof s.gpa === 'number' ? s.gpa.toFixed(2) : (parseFloat(s.gpa) || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: '8px 18px', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
                        {Math.round((s.attendance_rate || 0) * 100)}%
                      </td>
                      <td style={{ padding: '8px 18px' }}>
                        <RiskBadge level={s.risk_label} />
                      </td>
                      <td style={{ padding: '8px 18px' }}>
                        {(s.risk_history || s.recent_risk_probs)
                          ? <Sparkline data={s.risk_history || s.recent_risk_probs} />
                          : <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>—</span>}

                      </td>
                      <td style={{ padding: '8px 18px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button
                              aria-label="Actions menu"
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px', borderRadius: '4px' }}
                              className="dropdown-item-hover"
                            >
                              <div style={{ display: 'flex', gap: 2 }}>
                                <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor' }} />
                                <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor' }} />
                                <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor' }} />
                              </div>
                            </button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content style={{
                              backgroundColor: 'var(--surface)', border: '0.5px solid var(--border)',
                              boxShadow: 'var(--shadow-md)', borderRadius: 'var(--radius-md)', padding: 4, zIndex: 9999, minWidth: 160
                            }}>
                              <DropdownMenu.Item style={selectItemStyle} onClick={() => openStudent(s)} className="select-item-hover">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <Eye size={14} color="var(--accent)" /> View Profile Sheet
                                </div>
                              </DropdownMenu.Item>
                              <DropdownMenu.Item style={selectItemStyle} className="select-item-hover" onClick={() => openStudent(s)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <Plus size={14} color="var(--success)" /> Assign Intervention
                                </div>
                              </DropdownMenu.Item>
                              <DropdownMenu.Item style={selectItemStyle} onClick={() => openStudent(s)} className="select-item-hover">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <FileText size={14} color="var(--warning)" /> Preview Evaluation Brief
                                </div>
                              </DropdownMenu.Item>
                              <DropdownMenu.Item style={selectItemStyle} onClick={(e) => handleDownloadReport(e, s.student_id)} className="select-item-hover">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <Download size={14} /> Download PDF
                                </div>
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </td>
                    </motion.tr>
                  ))
                )}
              </motion.tbody>
            </table>
          </div>

          {/* Table Pagination Bar */}
          <div style={{ padding: '14px 20px', borderTop: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', backgroundColor: 'var(--surface)' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Showing {students.length} of {totalStudents.toLocaleString()} students
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                aria-label="Previous page"
                style={{ ...buttonStyle, height: '32px', opacity: page === 1 ? 0.5 : 1 }}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={15} />
              </button>
              <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>
                Page {page} of {totalPages}
              </span>
              <button
                aria-label="Next page"
                style={{ ...buttonStyle, height: '32px', opacity: page >= totalPages ? 0.5 : 1 }}
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>

      </motion.div>

      {/* Global Student Profile Sheet */}
      <StudentProfileSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        student={selectedStudent}
      />
    </AppShell>
  )
}
