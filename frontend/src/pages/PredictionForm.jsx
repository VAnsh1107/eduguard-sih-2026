import React, { useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Info, AlertTriangle, CheckCircle, Save, Sparkles, Sliders, ArrowRight, Zap, RefreshCw } from 'lucide-react'
import AppShell from '../components/AppShell'
import * as Switch from '@radix-ui/react-switch'
import toast from 'react-hot-toast'

const PRESETS = [
  {
    name: 'High-Risk Profile',
    icon: '🚨',
    color: 'var(--danger)',
    bg: 'var(--danger-light)',
    values: {
      gpa: 4.8,
      attendance_rate: 0.52,
      assignment_submission_rate: 0.48,
      previous_backlogs: 4,
      lms_login_frequency: 1,
      library_visits: 0,
      extracurricular_participation: 0,
      socioeconomic_score: 0.2,
      family_income_bracket: 1,
      scholarship_recipient: 0,
      distance_from_college: 28,
      mental_health_score: 3.5,
    }
  },
  {
    name: 'Borderline At-Risk',
    icon: '⚠️',
    color: 'var(--warning)',
    bg: 'var(--warning-light)',
    values: {
      gpa: 6.8,
      attendance_rate: 0.72,
      assignment_submission_rate: 0.74,
      previous_backlogs: 1,
      lms_login_frequency: 4,
      library_visits: 2,
      extracurricular_participation: 0.5,
      socioeconomic_score: 0.5,
      family_income_bracket: 2,
      scholarship_recipient: 0,
      distance_from_college: 12,
      mental_health_score: 5.8,
    }
  },
  {
    name: 'Dean\'s List / Low Risk',
    icon: '🌟',
    color: 'var(--success)',
    bg: 'var(--success-light)',
    values: {
      gpa: 9.2,
      attendance_rate: 0.96,
      assignment_submission_rate: 0.98,
      previous_backlogs: 0,
      lms_login_frequency: 14,
      library_visits: 9,
      extracurricular_participation: 1,
      socioeconomic_score: 0.8,
      family_income_bracket: 3,
      scholarship_recipient: 1,
      distance_from_college: 4,
      mental_health_score: 8.5,
    }
  }
]

const FIELDS = [
  // Group 1: Academic Performance
  { key: 'gpa', label: 'GPA', type: 'number', min: 0, max: 10, step: 0.1, default: 6.5, group: 'Academic Performance' },
  { key: 'attendance_rate', label: 'Attendance Rate', type: 'number', min: 0, max: 1, step: 0.01, default: 0.75, fmt: v => `${Math.round(v * 100)}%`, group: 'Academic Performance' },
  { key: 'assignment_submission_rate', label: 'Assignment Submission Rate', type: 'number', min: 0, max: 1, step: 0.01, default: 0.80, fmt: v => `${Math.round(v * 100)}%`, group: 'Academic Performance' },
  { key: 'previous_backlogs', label: 'Previous Backlogs', type: 'number', min: 0, max: 20, step: 1, default: 0, group: 'Academic Performance' },

  // Group 2: Engagement & Activity
  { key: 'lms_login_frequency', label: 'LMS Login Frequency (Logins/Week)', type: 'number', min: 0, max: 50, step: 1, default: 5, group: 'Engagement & Activity' },
  { key: 'library_visits', label: 'Library Visits (Per Month)', type: 'number', min: 0, max: 30, step: 1, default: 4, group: 'Engagement & Activity' },
  { key: 'extracurricular_participation', label: 'Extracurricular Participation', type: 'range', min: 0, max: 1, step: 0.1, default: 1, group: 'Engagement & Activity' },

  // Group 3: Background Factors
  { key: 'socioeconomic_score', label: 'Socioeconomic Score', type: 'range', min: 0, max: 1, step: 0.1, default: 0.5, group: 'Background Factors' },
  { key: 'family_income_bracket', label: 'Family Income Bracket', type: 'select', options: [1, 2, 3], labels: ['Low', 'Medium', 'High'], default: 2, group: 'Background Factors' },
  { key: 'scholarship_recipient', label: 'Scholarship Recipient', type: 'toggle', default: 0, group: 'Background Factors' },
  { key: 'distance_from_college', label: 'Distance from College (km)', type: 'number', min: 0, max: 100, step: 0.5, default: 8, group: 'Background Factors' },
  { key: 'mental_health_score', label: 'Mental Wellbeing Score (1-10)', type: 'range', min: 0, max: 10, step: 0.1, default: 6.0, group: 'Background Factors' },
]

function initValues() {
  return Object.fromEntries(FIELDS.map(f => [f.key, f.default]))
}

function RiskGauge({ riskLevel, confidence }) {
  const color = riskLevel === 'High' ? 'var(--danger)' : riskLevel === 'Medium' ? 'var(--warning)' : 'var(--success)'
  const percentage = Math.min(100, Math.max(0, confidence))
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto' }}>
      <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="80" cy="80" r={radius} stroke="var(--border)" strokeWidth="12" fill="none" />
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{Math.round(confidence)}%</div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Confidence</div>
      </div>
    </div>
  )
}

export default function PredictionForm() {
  const [values, setValues] = useState(initValues)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [activePreset, setActivePreset] = useState(null)

  // Counterfactual "What-If" State
  const [whatIfAttendanceDelta, setWhatIfAttendanceDelta] = useState(15)
  const [whatIfGpaDelta, setWhatIfGpaDelta] = useState(0.8)

  function setFieldValue(key, val) {
    setValues(prev => ({ ...prev, [key]: val }))
  }

  function applyPreset(preset) {
    setActivePreset(preset.name)
    setValues(preset.values)
    toast.success(`Loaded ${preset.name} preset`)
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault()
    setLoading(true)
    setResult(null)
    
    try {
      const payload = { ...values }
      Object.keys(payload).forEach(k => {
        payload[k] = Number(payload[k])
      })
      const { data } = await axios.post('/api/predict', payload)
      setResult(data)
      toast.success('ML Prediction generated')
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Prediction failed.'
      toast.error(errMsg)
    } finally {
      setLoading(false)
    }
  }

  // Calculate simulated What-If counterfactual metrics
  const originalConf = result ? result.confidence : 50
  const isHigh = result?.risk_level === 'High'
  const isMed = result?.risk_level === 'Medium'

  const reductionFactor = (whatIfAttendanceDelta * 1.2) + (whatIfGpaDelta * 15)
  const simulatedProb = Math.max(8, Math.round(originalConf - (isHigh ? reductionFactor : reductionFactor * 0.7)))
  const simulatedRiskLevel = simulatedProb >= 70 ? 'High' : simulatedProb >= 40 ? 'Medium' : 'Low'

  const groups = {
    'Academic Performance': FIELDS.filter(f => f.group === 'Academic Performance'),
    'Engagement & Activity': FIELDS.filter(f => f.group === 'Engagement & Activity'),
    'Background Factors': FIELDS.filter(f => f.group === 'Background Factors'),
  }

  const inputStyle = {
    width: '100%',
    height: '38px',
    padding: '0 12px',
    borderRadius: 'var(--radius-sm)',
    border: '0.5px solid var(--border-strong)',
    backgroundColor: 'var(--surface)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
    boxShadow: 'var(--shadow-sm)',
    transition: 'border-color 0.2s'
  }

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 32px 64px' }}
      >
        {/* Header with Title and 1-Click Presets */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
              ML Risk Predictor & What-If Studio
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
              Test multi-dimensional student feature vectors against the trained ensemble model
            </p>
          </div>

          {/* Archetype Preset Chips */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {PRESETS.map(p => (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px',
                  borderRadius: '980px', border: activePreset === p.name ? `1px solid ${p.color}` : '0.5px solid var(--border-strong)',
                  backgroundColor: activePreset === p.name ? p.bg : 'var(--surface)',
                  color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)', transition: 'all 0.15s ease'
                }}
              >
                <span>{p.icon}</span>
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
          
          {/* Left Card: Input Form */}
          <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-card)', border: '0.5px solid var(--border)' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {Object.entries(groups).map(([groupName, fields]) => (
                <div key={groupName} style={{ backgroundColor: 'var(--surface-2)', padding: '18px 20px', borderRadius: 'var(--radius-lg)', border: '0.5px solid var(--border)' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', marginTop: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {groupName}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {fields.map(field => (
                      <div key={field.key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{field.label}</label>
                          {field.type === 'range' && (
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', fontFamily: 'monospace' }}>
                              {field.fmt ? field.fmt(Number(values[field.key])) : values[field.key]}
                            </span>
                          )}
                          {field.type === 'number' && field.fmt && (
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              ({field.fmt(Number(values[field.key]))})
                            </span>
                          )}
                        </div>

                        {field.type === 'number' && (
                          <input
                            type="number"
                            min={field.min}
                            max={field.max}
                            step={field.step}
                            value={values[field.key]}
                            onChange={e => setFieldValue(field.key, e.target.value)}
                            style={inputStyle}
                            required
                          />
                        )}

                        {field.type === 'range' && (
                          <input
                            type="range"
                            min={field.min}
                            max={field.max}
                            step={field.step}
                            value={values[field.key]}
                            onChange={e => setFieldValue(field.key, e.target.value)}
                            style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
                          />
                        )}

                        {field.type === 'select' && (
                          <select
                            value={values[field.key]}
                            onChange={e => setFieldValue(field.key, e.target.value)}
                            style={inputStyle}
                          >
                            {field.options.map((opt, i) => (
                              <option key={opt} value={opt}>
                                {field.labels ? field.labels[i] : opt}
                              </option>
                            ))}
                          </select>
                        )}

                        {field.type === 'toggle' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                            <Switch.Root
                              checked={Boolean(values[field.key])}
                              onCheckedChange={checked => setFieldValue(field.key, checked ? 1 : 0)}
                              style={{
                                width: '42px', height: '24px', backgroundColor: values[field.key] ? 'var(--accent)' : 'var(--border-strong)',
                                borderRadius: '980px', position: 'relative', border: 'none', cursor: 'pointer', outline: 'none'
                              }}
                            >
                              <Switch.Thumb style={{
                                display: 'block', width: '18px', height: '18px', backgroundColor: 'white',
                                borderRadius: '50%', transform: values[field.key] ? 'translateX(20px)' : 'translateX(3px)',
                                transition: 'transform 100ms'
                              }} />
                            </Switch.Root>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                              {values[field.key] ? 'Recipient (Yes)' : 'Non-recipient (No)'}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', height: '46px', backgroundColor: 'var(--accent)', color: 'white',
                  borderRadius: '980px', border: 'none', fontWeight: 600, fontSize: '15px',
                  cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 12px rgba(0, 113, 227, 0.25)'
                }}
              >
                {loading ? (
                  <div style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <>
                    <Brain size={18} />
                    <span>Run Dropout Prediction</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Card: Prediction & What-If Studio */}
          <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)', border: '0.5px solid var(--border)', padding: '28px', display: 'flex', flexDirection: 'column' }}>
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', textAlign: 'center', color: 'var(--text-tertiary)' }}
                >
                  <Brain size={54} style={{ marginBottom: '16px', color: 'var(--accent)', opacity: 0.4 }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px' }}>Ready for Inference</h3>
                  <p style={{ fontSize: '13px', margin: 0, maxWidth: '280px', color: 'var(--text-secondary)' }}>
                    Select an archetype preset or adjust features and click "Run Dropout Prediction"
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
                >
                  {/* Result Header & Gauge */}
                  <div style={{ textAlign: 'center', borderBottom: '0.5px solid var(--border)', paddingBottom: '24px' }}>
                    <RiskGauge riskLevel={result.risk_level} confidence={result.confidence} />
                    <div style={{
                      display: 'inline-block', marginTop: '16px', padding: '6px 18px', borderRadius: '980px', fontSize: '14px', fontWeight: 700,
                      backgroundColor: result.risk_level === 'High' ? 'var(--danger-light)' : result.risk_level === 'Medium' ? 'var(--warning-light)' : 'var(--success-light)',
                      color: result.risk_level === 'High' ? 'var(--danger)' : result.risk_level === 'Medium' ? 'var(--warning)' : 'var(--success)'
                    }}>
                      {result.risk_level} Risk Category
                    </div>
                  </div>

                  {/* Counterfactual "What-If" Simulator */}
                  <div style={{ backgroundColor: 'var(--surface-2)', padding: '18px 20px', borderRadius: 'var(--radius-lg)', border: '0.5px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <Zap size={16} color="var(--accent)" />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Counterfactual "What-If" Analysis
                      </span>
                    </div>

                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 14px', lineHeight: 1.4 }}>
                      Simulate the impact of targeted academic interventions on this student's risk profile:
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                          <span>Attendance Improvement Boost</span>
                          <span style={{ color: 'var(--success)' }}>+{whatIfAttendanceDelta}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="40"
                          value={whatIfAttendanceDelta}
                          onChange={e => setWhatIfAttendanceDelta(Number(e.target.value))}
                          style={{ width: '100%', accentColor: 'var(--success)', cursor: 'pointer' }}
                        />
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                          <span>GPA Improvement</span>
                          <span style={{ color: 'var(--success)' }}>+{whatIfGpaDelta.toFixed(1)} pts</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="2.5"
                          step="0.1"
                          value={whatIfGpaDelta}
                          onChange={e => setWhatIfGpaDelta(Number(e.target.value))}
                          style={{ width: '100%', accentColor: 'var(--success)', cursor: 'pointer' }}
                        />
                      </div>

                      {/* What-if Outcome Preview */}
                      <div style={{
                        marginTop: '6px', padding: '12px 14px', borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--surface)', border: '0.5px solid var(--border-strong)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                            Projected New Risk
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: simulatedRiskLevel === 'High' ? 'var(--danger)' : simulatedRiskLevel === 'Medium' ? 'var(--warning)' : 'var(--success)' }}>
                            {simulatedRiskLevel} Risk ({simulatedProb}%)
                          </div>
                        </div>

                        <div style={{
                          fontSize: '12px', fontWeight: 700, padding: '3px 8px', borderRadius: '980px',
                          backgroundColor: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px'
                        }}>
                          ↓ -{Math.max(0, Math.round(originalConf - simulatedProb))}% Risk Drop
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SHAP Factor Importance */}
                  {result.top_factors && result.top_factors.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', marginTop: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        SHAP Attribution Breakdown
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {result.top_factors.map((f, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--surface-2)', fontSize: '13px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: f.direction === 'increases risk' ? 'var(--danger)' : 'var(--success)' }} />
                              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{f.label}</span>
                            </div>
                            <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{f.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prescriptive Interventions */}
                  {result.interventions && result.interventions.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', marginTop: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Recommended Interventions
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {result.interventions.map((inv, i) => (
                          <div key={i} style={{ display: 'flex', gap: '10px', padding: '12px', backgroundColor: 'var(--surface-2)', borderRadius: 'var(--radius-md)', border: '0.5px solid var(--border)' }}>
                            <CheckCircle size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.45 }}>{inv}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <style>{`
              @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
          </div>
        </div>
      </motion.div>
    </AppShell>
  )
}
