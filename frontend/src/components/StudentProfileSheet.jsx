import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Plus, Check, FileText, Eye, ShieldCheck } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tabs from '@radix-ui/react-tabs'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { toast } from 'react-hot-toast'

function AvatarLarge({ name }) {
  const initials = name ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '?'
  return (
    <div style={{
      width: 56, height: 56, borderRadius: 'var(--radius-full)',
      backgroundColor: 'var(--accent-light)',
      color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-sans)', fontSize: 20, fontWeight: 800, flexShrink: 0
    }}>
      {initials}
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
    <div className="stamp-badge" style={{
      backgroundColor: bg, color: color,
      fontSize: '12px', fontWeight: 700, padding: '4px 14px'
    }}>
      {level || 'Unknown'} Risk Profile
    </div>
  )
}

function RiskGaugeComponent({ probability, riskLevel, probabilities }) {
  const prob = typeof probability === 'number' ? probability : (parseFloat(probability) || 0)
  const norm = (riskLevel || '').toLowerCase()
  let color = 'var(--success)'
  if (norm === 'high') color = 'var(--danger)'
  else if (norm === 'medium') color = 'var(--warning)'
  else if (norm === 'low') color = 'var(--success)'

  const strokeWidth = 10
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (Math.min(prob, 100) / 100) * circumference

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: 110, height: 110 }}>
        <svg width="110" height="110" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="60" cy="60" r={radius} stroke="var(--border)" strokeWidth={strokeWidth} fill="none" />
          <circle
            cx="60" cy="60" r={radius} stroke={color} strokeWidth={strokeWidth} fill="none"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
          />
        </svg>
      </div>
      <div>
        <div style={{ fontSize: '36px', fontFamily: 'var(--font-sans)', fontWeight: 800, color, lineHeight: 1 }}>{Math.round(prob)}%</div>
        <div style={{ fontSize: '13px', fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 600 }}>
          {riskLevel ? `${riskLevel} Risk Probability` : 'Predicted Risk Probability'}
        </div>
        {probabilities && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '11.5px', fontFamily: 'var(--font-sans)', color: 'var(--text-tertiary)' }}>
              High: {Math.round(probabilities.High || 0)}% · Med: {Math.round(probabilities.Medium || 0)}% · Low: {Math.round(probabilities.Low || 0)}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function StudentProfileSheet({ student, open, onClose }) {
  const [detail, setDetail] = useState(null)
  const [history, setHistory] = useState([])
  const [interventions, setInterventions] = useState([])
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    if (open && student) {
      setLoading(true)
      const sid = student.student_id
      Promise.all([
        axios.get(`/api/students/${sid}`).catch(() => ({ data: student })),
        axios.get(`/api/students/${sid}/risk-history`).catch(() => ({ data: { history: [] } })),
        axios.get(`/api/students/${sid}/interventions`).catch(() => ({ data: { interventions: [] } }))
      ]).then(([resDetail, resHist, resInt]) => {
        setDetail(resDetail.data)
        setHistory(resHist.data.history || [])
        setInterventions(resInt.data.interventions || [])
      }).finally(() => {
        setLoading(false)
      })
    } else {
      setDetail(null)
      setHistory([])
      setInterventions([])
    }
  }, [open, student])

  if (!student) return null

  const handleDownloadPDF = async () => {
    if (downloading) return
    setDownloading(true)
    const toastId = toast.loading('Generating PDF report...')
    try {
      const res = await axios.get(`/api/students/${student.student_id}/report.pdf`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `student_report_${student.student_id}.pdf`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('PDF report downloaded', { id: toastId })
    } catch {
      toast.error('Failed to download report PDF', { id: toastId })
    } finally {
      setDownloading(false)
    }
  }

  const handleAssignIntervention = async (title) => {
    try {
      await axios.post(`/api/students/${student.student_id}/interventions`, {
        type: 'General', title, notes: ''
      })
      toast.success('Intervention assigned')
      const res = await axios.get(`/api/students/${student.student_id}/interventions`)
      setInterventions(res.data.interventions || [])
    } catch {
      toast.error('Failed to assign intervention')
    }
  }

  const handleResolveIntervention = async (id) => {
    try {
      await axios.patch(`/api/interventions/${id}`, { status: 'resolved' })
      toast.success('Intervention marked resolved')
      const res = await axios.get(`/api/students/${student.student_id}/interventions`)
      setInterventions(res.data.interventions || [])
    } catch {
      toast.error('Failed to resolve intervention')
    }
  }

  // Safe extraction of features and prediction
  const f = detail?.features || student || {}
  const pred = detail?.prediction || {}
  const currentRiskProb = pred.confidence ?? student.risk_probability ?? student.dropout_risk ?? 0
  const currentRiskLevel = pred.risk_level ?? student.risk_label ?? 'Medium'

  // Normalization for Radar (0-100 scale)
  const radarData = [
    { subject: 'GPA', A: Math.min(((f.gpa || 0) / 10) * 100, 100) },
    { subject: 'Attendance', A: Math.min((f.attendance_rate || 0) * 100, 100) },
    { subject: 'Assignments', A: Math.min((f.assignment_submission_rate || 0) * 100, 100) },
    { subject: 'LMS Activity', A: Math.min(((f.lms_login_frequency || f.lms_logins_week || 0) / 15) * 100, 100) },
    { subject: 'Wellbeing', A: Math.min(((f.mental_health_score || f.mental_wellbeing_score || 0) / 10) * 100, 100) },
    { subject: 'Social', A: Math.min(((f.socioeconomic_score || 5) / 10) * 100, 100) }
  ]

  const topFactors = pred.top_factors || []
  const recommendedInterventions = pred.interventions || []

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(4px)', zIndex: 9998
                }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ x: 480 }}
                animate={{ x: 0 }}
                exit={{ x: 480 }}
                transition={{ ease: [0.25, 0.46, 0.45, 0.94], duration: 0.35 }}
                style={{
                  position: 'fixed', right: 0, top: 0, height: '100vh', width: '480px',
                  maxWidth: '100vw',
                  backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-lg)',
                  borderLeft: '0.5px solid var(--border)',
                  zIndex: 9999, display: 'flex', flexDirection: 'column', outline: 'none'
                }}
              >
                {/* Header */}
                <div style={{ padding: '24px 32px', borderBottom: '0.5px solid var(--border)', backgroundColor: 'var(--surface)' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '16px' }}>
                    <button
                      onClick={() => setPreviewOpen(true)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px', height: '32px', padding: '0 12px',
                        backgroundColor: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', border: '0.5px solid var(--border-strong)',
                        fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer'
                      }}
                    >
                      <Eye size={14} color="var(--accent)" /> Preview Report
                    </button>
                    <button
                      onClick={handleDownloadPDF}
                      disabled={downloading}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px', height: '32px', padding: '0 12px',
                        backgroundColor: 'var(--accent)', borderRadius: 'var(--radius-sm)', border: 'none',
                        fontSize: '13px', fontWeight: 600, color: 'white', cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0, 113, 227, 0.25)'
                      }}
                    >
                      <Download size={14} /> {downloading ? 'Generating...' : 'Download PDF'}
                    </button>
                    <Dialog.Close asChild>
                      <button
                        aria-label="Close sheet"
                        style={{
                          width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          backgroundColor: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', border: '0.5px solid var(--border-strong)',
                          color: 'var(--text-secondary)', cursor: 'pointer'
                        }}
                      >
                        <X size={16} />
                      </button>
                    </Dialog.Close>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <AvatarLarge name={student.name} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {student.name}
                      </h2>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {student.department} · Sem {student.semester || student.year || 1} · <span style={{ fontFamily: 'monospace' }}>{student.student_id}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '16px' }}>
                    <RiskBadge level={currentRiskLevel} />
                  </div>
                </div>

                {/* Scrollable Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
                  {loading ? (
                    <div style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '48px 0' }}>Loading student intelligence...</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
                      
                      {/* SECTION 1: Gauge */}
                      <section style={{ padding: '20px', backgroundColor: 'var(--surface-2)', borderRadius: 'var(--radius-md)' }}>
                        <RiskGaugeComponent
                          probability={currentRiskProb}
                          riskLevel={currentRiskLevel}
                          probabilities={pred.probabilities}
                        />
                      </section>

                      {/* SECTION 2: Radar Chart */}
                      <section>
                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', margin: 0 }}>
                          Performance Profile
                        </h3>
                        <div style={{ height: 220, backgroundColor: 'var(--surface-2)', borderRadius: 'var(--radius-md)', padding: '16px', marginTop: '8px' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                              <PolarGrid stroke="var(--border)" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                              <Radar name="Student" dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.2} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </section>

                      {/* SECTION 3: Key Risk Factors */}
                      {topFactors.length > 0 && (
                        <section>
                          <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '12px', letterSpacing: '0.04em' }}>
                            Top Risk Factors (SHAP)
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {topFactors.map((factor, i) => (
                              <div key={i} style={{ padding: '10px 14px', backgroundColor: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: factor.direction === 'increases risk' ? 'var(--danger)' : 'var(--success)' }} />
                                  <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{factor.label}</span>
                                </div>
                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                  {typeof factor.value === 'number' ? factor.value.toFixed(2) : factor.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* SECTION 4: Tabs */}
                      <section>
                        <Tabs.Root defaultValue="recommended">
                          <Tabs.List style={{ display: 'flex', borderBottom: '0.5px solid var(--border)', marginBottom: '16px' }}>
                            {[
                              { id: 'recommended', label: 'Recommended' },
                              { id: 'assigned', label: `Assigned (${interventions.length})` },
                              { id: 'history', label: 'History' }
                            ].map(t => (
                              <Tabs.Trigger key={t.id} value={t.id} className="sheet-tab-trigger" style={{
                                padding: '10px 14px', backgroundColor: 'transparent', border: 'none',
                                fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer',
                                borderBottom: '2px solid transparent'
                              }}>
                                {t.label}
                              </Tabs.Trigger>
                            ))}
                          </Tabs.List>

                          <Tabs.Content value="recommended" style={{ outline: 'none' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {recommendedInterventions.length === 0 ? (
                                <div style={{ color: 'var(--text-tertiary)', fontSize: '13px', padding: '12px 0' }}>No recommended interventions for this risk profile.</div>
                              ) : recommendedInterventions.map((rec, i) => (
                                <div key={i} style={{ padding: '14px', backgroundColor: 'var(--surface-2)', borderRadius: 'var(--radius-md)', border: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                  <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.4 }}>{rec}</span>
                                  <button
                                    onClick={() => handleAssignIntervention(rec)}
                                    style={{
                                      display: 'flex', alignItems: 'center', gap: '4px', height: '28px', padding: '0 10px',
                                      backgroundColor: 'var(--accent-light)', color: 'var(--accent)', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, flexShrink: 0
                                    }}
                                  >
                                    <Plus size={12} /> Assign
                                  </button>
                                </div>
                              ))}
                            </div>
                          </Tabs.Content>

                          <Tabs.Content value="assigned" style={{ outline: 'none' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {interventions.length === 0 ? (
                                <div style={{ color: 'var(--text-tertiary)', fontSize: '13px', padding: '12px 0' }}>No active interventions assigned yet.</div>
                              ) : interventions.map((inv) => {
                                let statusColor = 'var(--warning)'
                                if (inv.status === 'resolved') statusColor = 'var(--success)'
                                if (inv.status === 'active') statusColor = 'var(--accent)'
                                return (
                                  <div key={inv.id} style={{
                                    padding: '14px', backgroundColor: 'var(--surface-2)', borderRadius: 'var(--radius-md)',
                                    border: '0.5px solid var(--border)', borderLeft: `4px solid ${statusColor}`,
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px'
                                  }}>
                                    <div>
                                      <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>{inv.title}</div>
                                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                        Assigned {new Date(inv.assigned_at).toLocaleDateString()}
                                      </div>
                                      <div style={{ fontSize: '11px', fontWeight: 600, color: statusColor, marginTop: '6px', textTransform: 'uppercase' }}>
                                        {inv.status}
                                      </div>
                                    </div>
                                    {inv.status !== 'resolved' && (
                                      <button
                                        onClick={() => handleResolveIntervention(inv.id)}
                                        style={{
                                          display: 'flex', alignItems: 'center', gap: '4px', height: '26px', padding: '0 10px',
                                          backgroundColor: 'var(--surface)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', border: '0.5px solid var(--border-strong)', cursor: 'pointer', fontSize: '12px', fontWeight: 500, flexShrink: 0
                                        }}
                                      >
                                        <Check size={12} /> Resolve
                                      </button>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </Tabs.Content>

                          <Tabs.Content value="history" style={{ outline: 'none' }}>
                            <div style={{ height: 180, width: '100%', marginTop: '8px' }}>
                              {history.length === 0 ? (
                                <div style={{ color: 'var(--text-tertiary)', fontSize: '13px', padding: '12px 0' }}>No historical risk snapshots recorded yet.</div>
                              ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={history.map(h => ({ ...h, date: new Date(h.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) }))}>
                                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-sm)' }} />
                                    <Area type="monotone" dataKey="risk_probability" stroke="var(--danger)" fill="var(--danger-light)" strokeWidth={2} />
                                  </AreaChart>
                                </ResponsiveContainer>
                              )}
                            </div>
                          </Tabs.Content>
                        </Tabs.Root>
                      </section>
                      
                    </div>
                  )}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
      {/* In-App Report Preview Modal */}
      <Dialog.Root open={previewOpen} onOpenChange={setPreviewOpen}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 10000 }} />
          <Dialog.Content style={{
            position: 'fixed', top: '8%', left: '50%', transform: 'translateX(-50%)',
            width: '90%', maxWidth: '680px', maxHeight: '84vh', overflowY: 'auto',
            backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '36px',
            zIndex: 10001, outline: 'none', boxShadow: 'var(--shadow-lg)', border: '0.5px solid var(--border-strong)'
          }}>
            {/* Header Document Banner */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--text-primary)', paddingBottom: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={28} color="var(--accent)" />
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                    EduGuard Academic Risk Brief
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Institutional Retention & Early Intervention Report · Generated {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>

              <Dialog.Close asChild>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                  <X size={20} />
                </button>
              </Dialog.Close>
            </div>

            {/* Student Snapshot Header */}
            <div style={{ backgroundColor: 'var(--surface-2)', padding: '18px 20px', borderRadius: 'var(--radius-lg)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>{student.name}</h3>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Student ID: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{student.student_id}</span> · {student.department} · Sem {student.semester || student.year || 1}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <RiskBadge level={currentRiskLevel} />
                <div style={{ fontSize: '12px', fontWeight: 600, color: currentRiskLevel === 'Low' ? 'var(--success)' : currentRiskLevel === 'Medium' ? 'var(--warning)' : 'var(--danger)', marginTop: '4px' }}>
                  {currentRiskLevel === 'Low'
                    ? `${Math.round(currentRiskProb)}% Low Risk Probability (Safe)`
                    : currentRiskLevel === 'Medium'
                    ? `${Math.round(currentRiskProb)}% Moderate Risk Probability`
                    : `${Math.round(currentRiskProb)}% Dropout Risk Probability`}
                </div>
                {currentRiskLevel === 'Low' && (
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    Dropout Probability: &lt; 1%
                  </div>
                )}
              </div>
            </div>

            {/* Core Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>GPA</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{f.gpa ? f.gpa.toFixed(1) : 'N/A'}</div>
              </div>
              <div style={{ padding: '12px', backgroundColor: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Attendance</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{f.attendance_rate ? `${Math.round(f.attendance_rate * 100)}%` : 'N/A'}</div>
              </div>
              <div style={{ padding: '12px', backgroundColor: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Submissions</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{f.assignment_submission_rate ? `${Math.round(f.assignment_submission_rate * 100)}%` : 'N/A'}</div>
              </div>
              <div style={{ padding: '12px', backgroundColor: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Backlogs</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{f.previous_backlogs ?? 0}</div>
              </div>
            </div>

            {/* Key Risk Drivers */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)', marginBottom: '12px' }}>
                Key ML Risk Attributions (SHAP)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {topFactors.length > 0 ? topFactors.map((fact, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface-2)', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{fact.label}</span>
                    <span style={{ color: fact.direction === 'increases risk' ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>{fact.value}</span>
                  </div>
                )) : (
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Standard attendance & academic performance indicators within normal bounds.</div>
                )}
              </div>
            </div>

            {/* Prescriptive Interventions */}
            <div style={{ marginBottom: '28px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)', marginBottom: '12px' }}>
                Actionable Intervention Protocols
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recommendedInterventions.length > 0 ? recommendedInterventions.map((inv, idx) => (
                  <div key={idx} style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '0.5px solid var(--border)', backgroundColor: 'var(--surface)', fontSize: '13px', color: 'var(--text-primary)' }}>
                    ✓ {inv}
                  </div>
                )) : (
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No active remedial actions allocated.</div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '0.5px solid var(--border)', paddingTop: '20px' }}>
              <button
                onClick={() => setPreviewOpen(false)}
                style={{ padding: '8px 18px', borderRadius: '980px', backgroundColor: 'var(--surface-2)', border: '0.5px solid var(--border)', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                Close Preview
              </button>
              <button
                onClick={handleDownloadPDF}
                style={{ padding: '8px 20px', borderRadius: '980px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(0, 113, 227, 0.25)' }}
              >
                <Download size={14} /> Download Official PDF
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <style>{`
        .sheet-tab-trigger[data-state="active"] {
          color: var(--text-primary) !important;
          border-bottom-color: var(--accent) !important;
          font-weight: 600 !important;
        }
      `}</style>
    </Dialog.Root>
  )
}
