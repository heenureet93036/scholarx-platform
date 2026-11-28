import { useState, useEffect, useRef } from 'react'
import './App.css'

// ─── Mock data ───────────────────────────────────────────────
const ROLES = [
  'Full Stack Engineer',
  'Backend Engineer',
  'DevOps / SRE',
  'Data Engineer',
  'Machine Learning Engineer',
  'Cloud Architect',
]

const MOCK_SKILLS_PRESENT = ['Java', 'Spring Boot', 'REST APIs', 'SQL', 'Git', 'Docker']
const MOCK_SKILLS_MISSING = ['Kubernetes', 'CI/CD Pipelines', 'Apache Kafka', 'System Design', 'gRPC']

const LOG_LINES = [
  { time: '10:42:01', service: 'scholar', msg: 'POST /api/scholars → 201 Created (scholar-id: sc-7f3a)' },
  { time: '10:42:02', service: 'scholar', msg: '[REST] POST /api/scholars/sc-7f3a/upload → PDF extracted, 847 chars' },
  { time: '10:42:02', service: 'scholar', msg: '[Kafka] Published → resume.uploaded {scholarId: sc-7f3a}' },
  { time: '10:42:03', service: 'ai',     msg: '[Kafka] Consumed ← resume.uploaded {scholarId: sc-7f3a}' },
  { time: '10:42:03', service: 'ai',     msg: '[Ollama] Calling Llama3 for skill extraction...' },
  { time: '10:42:08', service: 'ai',     msg: '[Ollama] Extracted 11 skills from resume' },
  { time: '10:42:08', service: 'ai',     msg: '[Kafka] Published → skills.extracted {skills: [Java, Spring Boot, ...]}' },
  { time: '10:42:09', service: 'gap',    msg: '[Kafka] Consumed ← skills.extracted' },
  { time: '10:42:09', service: 'gap',    msg: '[gRPC] GetScholarProfile(sc-7f3a) → scholar-service:9090' },
  { time: '10:42:09', service: 'gap',    msg: '[gRPC] Response: {name: Riya Sharma, role: DevOps / SRE}' },
  { time: '10:42:09', service: 'gap',    msg: 'Readiness score: 55% | Missing: 5 skills' },
  { time: '10:42:09', service: 'gap',    msg: '[Kafka] Published → gap.report.ready {score: 55}' },
  { time: '10:42:10', service: 'notif',  msg: '[Kafka] Consumed ← gap.report.ready' },
  { time: '10:42:10', service: 'notif',  msg: '[SMTP] Sending report to riya@example.com...' },
  { time: '10:42:10', service: 'notif',  msg: '[SMTP] Manager alert → manager@scholarx.com' },
  { time: '10:42:11', service: 'notif',  msg: 'NotificationLog saved. Status: SENT' },
]

// ─── Event Flow Bar ───────────────────────────────────────────
function EventFlowBar({ activeStep }) {
  const nodes = [
    { label: 'scholar-service', type: 'service', step: 1 },
    { label: 'resume.uploaded', type: 'topic', step: 1 },
    { label: 'ai-review-service', type: 'service', step: 2 },
    { label: 'skills.extracted', type: 'topic', step: 2 },
    { label: 'gap-service', type: 'service', step: 3 },
    { label: 'gap.report.ready', type: 'topic', step: 3 },
    { label: 'notification-service', type: 'service', step: 4 },
  ]
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="card-header" style={{ marginBottom: 12 }}>
        <div className="card-title">
          <span>⚡</span> Event-Driven Flow
        </div>
        <div className="flex gap-8">
          <span className="concept-badge kafka">Kafka Async</span>
          <span className="concept-badge grpc">gRPC</span>
          <span className="concept-badge rest">REST</span>
        </div>
      </div>
      <div className="event-flow">
        {nodes.map((n, i) => (
          <div key={i} className="flex items-center">
            <div className="event-node">
              <div className={`event-node-box ${n.type} ${activeStep >= n.step ? 'active' : ''}`}>
                {n.label}
              </div>
              <div className="event-node-label">{n.type === 'topic' ? 'Kafka Topic' : 'Microservice'}</div>
            </div>
            {i < nodes.length - 1 && <div className="event-arrow">→</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── PAGE 0: Overview ─────────────────────────────────────────
function OverviewPage() {
  const services = [
    { name: 'scholar-service', port: '8081', desc: 'Scholar profile, PDF resume upload, target role selection', icon: '👤', comm: 'REST' },
    { name: 'ai-review-service', port: '8082', desc: 'Ollama/Llama3 AI skill extraction from resume text', icon: '🤖', comm: 'Kafka' },
    { name: 'gap-service', port: '8083', desc: 'Skill gap analysis, readiness score, circuit breaker', icon: '📊', comm: 'gRPC + Kafka' },
    { name: 'notification-service', port: '8084', desc: 'Email reports to scholar and manager via SMTP', icon: '📧', comm: 'Kafka' },
  ]

  return (
    <div>
      <div className="overview-hero">
        <h2>ScholarX Platform</h2>
        <p>AI-powered scholar-to-full-time conversion tracker. Upload your resume, pick a role, know exactly what's missing.</p>
        <div className="infra-row" style={{ marginTop: 20 }}>
          {['Event-Driven (Kafka)', 'REST API', 'gRPC', 'Circuit Breaker', 'K8s Self-Healing', 'NGINX Gateway'].map(t => (
            <span key={t} className="infra-badge" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white' }}>✓ {t}</span>
          ))}
        </div>
      </div>

      <div className="section-heading">4 Microservices</div>
      <div className="services-row">
        {services.map(s => (
          <div key={s.name} className="service-card">
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <h3>{s.name}</h3>
            <p>{s.desc}</p>
            <div className="flex gap-8">
              <span className="port">:{s.port}</span>
              <span className="concept-badge" style={{ fontSize: 10, padding: '2px 7px', background: '#f1f5f9', color: '#475569' }}>{s.comm}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="section-heading">Architecture</div>
      <div className="arch-grid">
        <div className="arch-item">
          <h4>🌐 API Gateway</h4>
          <p>NGINX Ingress routes external traffic. Single entry point for all services on port 80.</p>
        </div>
        <div className="arch-item">
          <h4>📡 Service Registry</h4>
          <p>Kubernetes DNS resolves service names (e.g. <code>scholar-service:8081</code>) within the cluster.</p>
        </div>
        <div className="arch-item">
          <h4>⚡ Message Queue</h4>
          <p>Apache Kafka with 3 topics: <code>resume.uploaded</code>, <code>skills.extracted</code>, <code>gap.report.ready</code></p>
        </div>
        <div className="arch-item">
          <h4>🔌 Circuit Breaker</h4>
          <p>Resilience4j on gap-service. Opens after 3 failures, resets after 30s. Prevents cascade failures.</p>
        </div>
      </div>

      <div className="section-heading" style={{ marginTop: 20 }}>Communication Styles</div>
      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['From', 'To', 'Style', 'Sync/Async', 'Why'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Client', 'scholar-service', 'REST', 'Sync', 'Standard HTTP file upload'],
              ['scholar-service', 'ai-review-service', 'Kafka', 'Async', 'Decoupled resume processing'],
              ['ai-review-service', 'gap-service', 'Kafka', 'Async', 'Independent gap analysis'],
              ['gap-service', 'scholar-service', 'gRPC', 'Sync', 'Efficient binary protocol for profile fetch'],
              ['gap-service', 'notification-service', 'Kafka', 'Async', 'Email fires independently'],
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                {row.map((cell, j) => (
                  <td key={j} style={{ padding: '8px 12px' }}>
                    {j === 2 ? (
                      <span className={`concept-badge ${cell.toLowerCase() === 'rest' ? 'rest' : cell.toLowerCase() === 'kafka' ? 'kafka' : 'grpc'}`}>{cell}</span>
                    ) : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── PAGE 1: Upload Resume ────────────────────────────────────
function UploadPage({ onSubmit }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [deadline, setDeadline] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()

  const canSubmit = name && email && role && deadline && file

  function handleFile(f) {
    if (f && f.type === 'application/pdf') setFile(f)
    else alert('Please upload a PDF file.')
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    handleFile(f)
  }

  async function handleSubmit() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1800))
    setLoading(false)
    onSubmit({ name, email, role, deadline, file })
  }

  return (
    <div>
      <div className="alert info">
        <span>ℹ️</span>
        <span>This calls <strong>POST /api/scholars</strong> (REST) on scholar-service:8081, then uploads the PDF via <strong>POST /{'{id}'}/upload</strong>. After upload, scholar-service publishes to Kafka topic <strong>resume.uploaded</strong>.</span>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            👤 Scholar Profile
          </div>
          <span className="concept-badge rest">REST</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="e.g. Riya Sharma" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="scholar@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Target Role</label>
            <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
              <option value="">Select a role...</option>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Conversion Deadline</label>
            <input className="form-input" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">📄 Upload Resume (PDF)</div>
          <span className="concept-badge rest">Multipart/REST</span>
        </div>

        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
          onClick={() => fileRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="upload-icon">{file ? '✅' : '📂'}</div>
          {file ? (
            <>
              <p><strong>{file.name}</strong></p>
              <p style={{ marginTop: 4, fontSize: 12 }}>{(file.size / 1024).toFixed(1)} KB — Click to change</p>
            </>
          ) : (
            <>
              <p><strong>Drop your PDF here</strong> or click to browse</p>
              <p style={{ marginTop: 4 }}>Scholar-service uses Apache PDFBox 3.x to extract text</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" disabled={!canSubmit || loading} onClick={handleSubmit}>
          {loading ? <><span className="spinner"></span> Processing...</> : '🚀 Submit & Trigger Pipeline'}
        </button>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-title" style={{ marginBottom: 12 }}>🔗 REST Endpoints — scholar-service</div>
        {[
          ['POST', '/api/scholars', 'Create scholar profile', 'JSON body'],
          ['POST', '/api/scholars/{id}/upload', 'Upload PDF resume', 'Multipart form'],
          ['POST', '/api/scholars/{id}/target-role', 'Set target role', 'JSON body'],
          ['GET',  '/api/scholars/{id}', 'Get scholar profile', '—'],
        ].map(([method, path, desc, body]) => (
          <div key={path} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
            <span style={{ background: method === 'GET' ? '#dbeafe' : '#d1fae5', color: method === 'GET' ? '#1e40af' : '#065f46', padding: '2px 7px', borderRadius: 4, fontWeight: 700, fontSize: 11, minWidth: 36, textAlign: 'center' }}>{method}</span>
            <code style={{ color: 'var(--primary-dark)' }}>{path}</code>
            <span className="text-muted">{desc}</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>{body}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── PAGE 2: Skills Extracted ─────────────────────────────────
function SkillsPage({ scholar }) {
  const [visible, setVisible] = useState(false)
  const [cbState, setCbState] = useState('closed')
  const [cbDemo, setCbDemo] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 300)
  }, [])

  function simulateCB() {
    setCbDemo(true)
    setCbState('open')
    setTimeout(() => setCbState('half-open'), 3000)
    setTimeout(() => { setCbState('closed'); setCbDemo(false) }, 6000)
  }

  return (
    <div>
      <div className="alert success">
        <span>✅</span>
        <span>Kafka consumer on ai-review-service received <strong>resume.uploaded</strong> event. Ollama/Llama3 extracted skills. Published to <strong>skills.extracted</strong>. Gap-service fetched profile via <strong>gRPC</strong> from scholar-service:9090.</span>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">🤖 AI Skill Extraction</div>
          <span className="concept-badge kafka">Kafka Async</span>
        </div>
        <div className="flex gap-8 mb-16" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          <span>Scholar: <strong>{scholar?.name || 'Riya Sharma'}</strong></span>
          <span>·</span>
          <span>Target: <strong>{scholar?.role || 'DevOps / SRE'}</strong></span>
          <span>·</span>
          <span>Model: <strong>Llama3 (Ollama)</strong></span>
        </div>

        <div className="section-heading">Skills Found in Resume</div>
        <div className="skills-grid">
          {MOCK_SKILLS_PRESENT.map(s => (
            <span key={s} className="skill-tag present" style={{ opacity: visible ? 1 : 0, transform: visible ? 'scale(1)' : 'scale(0.8)', transition: 'all 0.3s' }}>✓ {s}</span>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">🔌 gRPC Call — Scholar Profile Fetch</div>
          <span className="concept-badge grpc">gRPC</span>
        </div>
        <div className="arch-grid">
          <div>
            <div className="section-heading">Request</div>
            <pre style={{ background: '#f8fafc', borderRadius: 6, padding: 12, fontSize: 12, color: '#334155' }}>{`// scholar.proto
service ScholarGrpcService {
  rpc GetScholarProfile(
    ScholarRequest
  ) returns (ScholarResponse);
}

// gap-service → scholar-service:9090
message ScholarRequest {
  string scholar_id = 1;
}`}</pre>
          </div>
          <div>
            <div className="section-heading">Response</div>
            <pre style={{ background: '#f8fafc', borderRadius: 6, padding: 12, fontSize: 12, color: '#334155' }}>{`message ScholarResponse {
  string scholar_id  = 1;
  string name        = 2;
  string email       = 3;
  string target_role = 4;
  string deadline    = 5;
}

// Status: 200 OK (binary proto)
// Latency: ~3ms (vs ~20ms REST)`}</pre>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div className="card-title" style={{ marginBottom: 12 }}>⚡ Circuit Breaker (Resilience4j)</div>
          <div className="cb-states">
            {[['closed', '✅ CLOSED', 'Normal — requests pass through'], ['open', '🔴 OPEN', 'Fail fast — no calls, fallback active'], ['half-open', '🟡 HALF-OPEN', 'Testing recovery — 1 probe request']].map(([id, label, desc]) => (
              <div key={id} className={`cb-state ${id} ${cbState === id ? 'active' : ''}`}>
                <div>{label}</div>
                <div style={{ fontSize: 10, fontWeight: 400, marginTop: 4 }}>{desc}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-secondary btn-sm" onClick={simulateCB} disabled={cbDemo}>
              {cbDemo ? '⏳ Simulating...' : '💥 Simulate scholar-service Failure'}
            </button>
            <span className="text-xs text-muted">threshold=3 failures · timeout=30s · reset=30s</span>
          </div>
          {cbDemo && (
            <div className="alert warning" style={{ marginTop: 12 }}>
              <span>⚠️</span>
              <span>Circuit opened! Fallback returns <code>{`{name: "Unknown", targetRole: ""}`}</code> — no cascade failure. Auto-recovers in 6s (simulated).</span>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="section-heading" style={{ marginBottom: 12 }}>Service Log Stream</div>
        <div className="log-stream">
          {LOG_LINES.slice(0, 9).map((l, i) => (
            <div key={i} className="log-line">
              <span className="log-time">{l.time}</span>
              <span className={`log-service ${l.service}`}>[{l.service}-svc]</span>
              <span className="log-msg">{l.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── PAGE 3: Gap Report ───────────────────────────────────────
function GapReportPage({ scholar }) {
  const score = 55
  const scoreClass = score >= 80 ? 'high' : score >= 50 ? 'mid' : 'low'

  return (
    <div>
      <div className="alert info">
        <span>📊</span>
        <span>Gap-service compared extracted skills vs role requirements. Score computed. Published <strong>gap.report.ready</strong> to Kafka → notification-service will email the report.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, marginBottom: 20 }}>
        <div className="score-display">
          <div className="score-number">{score}%</div>
          <div className="score-label">Readiness Score</div>
          <div style={{ marginTop: 12, fontSize: 12, background: 'rgba(255,255,255,0.15)', borderRadius: 6, padding: '4px 10px' }}>
            {score >= 80 ? '✅ Conversion Ready' : '⚠ Needs Preparation'}
          </div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="form-label" style={{ marginBottom: 8 }}>Progress to Role: <strong>{scholar?.role || 'DevOps / SRE'}</strong></div>
          <div className="progress-wrap">
            <div className={`progress-bar ${scoreClass}`} style={{ width: `${score}%` }}>{score}%</div>
          </div>
          <div className="flex justify-between mt-8" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            <span>0% — Not Ready</span>
            <span>80%+ — Conversion Ready</span>
          </div>
          <div className="flex gap-8 mt-12">
            <div style={{ flex: 1, background: 'var(--success-light)', borderRadius: 6, padding: '10px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#065f46' }}>{MOCK_SKILLS_PRESENT.length}</div>
              <div style={{ fontSize: 11, color: '#047857' }}>Skills Present</div>
            </div>
            <div style={{ flex: 1, background: 'var(--danger-light)', borderRadius: 6, padding: '10px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#991b1b' }}>{MOCK_SKILLS_MISSING.length}</div>
              <div style={{ fontSize: 11, color: '#dc2626' }}>Skills Missing</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">✅ Skills You Have</div>
          <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>{MOCK_SKILLS_PRESENT.length} skills</span>
        </div>
        <div className="skills-grid">
          {MOCK_SKILLS_PRESENT.map(s => <span key={s} className="skill-tag present">✓ {s}</span>)}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">❌ Skills You Need</div>
          <span style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600 }}>{MOCK_SKILLS_MISSING.length} gaps</span>
        </div>
        <div className="skills-grid">
          {MOCK_SKILLS_MISSING.map(s => <span key={s} className="skill-tag missing">✗ {s}</span>)}
        </div>
        <div className="alert warning" style={{ marginTop: 16 }}>
          <span>📚</span>
          <span>Focus on <strong>Kubernetes</strong>, <strong>CI/CD Pipelines</strong>, and <strong>Apache Kafka</strong> before your conversion deadline. These are the most critical gaps for the <strong>DevOps / SRE</strong> role.</span>
        </div>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 12 }}>📨 Kafka Event Published</div>
        <pre style={{ background: '#0f172a', borderRadius: 8, padding: 16, fontSize: 12, color: '#94a3b8', overflow: 'auto' }}>{`// Topic: gap.report.ready
{
  "scholarId":     "sc-7f3a",
  "scholarName":   "${scholar?.name || 'Riya Sharma'}",
  "scholarEmail":  "${scholar?.email || 'riya@example.com'}",
  "targetRole":    "${scholar?.role || 'DevOps / SRE'}",
  "readinessScore": ${score},
  "presentSkills": ${JSON.stringify(MOCK_SKILLS_PRESENT)},
  "missingSkills": ${JSON.stringify(MOCK_SKILLS_MISSING)}
}`}</pre>
      </div>
    </div>
  )
}

// ─── PAGE 4: Notification Sent ────────────────────────────────
function NotificationPage({ scholar }) {
  return (
    <div>
      <div className="alert success">
        <span>🎉</span>
        <span>Notification-service consumed <strong>gap.report.ready</strong>. Emails sent via JavaMailSender (SMTP). Event logged to <strong>notification_logs</strong> table in PostgreSQL.</span>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">📧 Scholar Email</div>
          <span className="concept-badge kafka">Kafka Consumer</span>
        </div>
        <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, fontFamily: 'monospace', fontSize: 13, whiteSpace: 'pre-wrap', color: '#334155', border: '1px solid var(--border)' }}>
{`To: ${scholar?.email || 'riya@example.com'}
Subject: ScholarX — Your Readiness Report for ${scholar?.role || 'DevOps / SRE'}

Hi ${scholar?.name || 'Riya Sharma'},

Your ScholarX Conversion Readiness Report is ready!

Target Role: ${scholar?.role || 'DevOps / SRE'}
Readiness Score: ${55}%

✅ Skills You Have:
- ${MOCK_SKILLS_PRESENT.join('\n- ')}

❌ Skills You Need:
- ${MOCK_SKILLS_MISSING.join('\n- ')}

Focus on closing these gaps before your conversion deadline.

Best,
ScholarX Platform`}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">📣 Manager Alert Email</div>
        </div>
        <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, fontFamily: 'monospace', fontSize: 13, whiteSpace: 'pre-wrap', color: '#334155', border: '1px solid var(--border)' }}>
{`To: manager@scholarx.com
Subject: ScholarX — Readiness Update: ${scholar?.name || 'Riya Sharma'}

Manager Alert,

Scholar ${scholar?.name || 'Riya Sharma'} has completed their gap analysis.

Target Role: ${scholar?.role || 'DevOps / SRE'}
Readiness Score: 55%

⚠ Scholar needs more preparation before conversion.

ScholarX Platform`}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">🗃 Notification Log (PostgreSQL)</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
              {['id', 'scholar_id', 'scholar_name', 'target_role', 'readiness_score', 'status', 'sent_at'].map(h => (
                <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontSize: 11 }}>a3f7...</td>
              <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontSize: 11 }}>sc-7f3a</td>
              <td style={{ padding: '8px 10px' }}>{scholar?.name || 'Riya Sharma'}</td>
              <td style={{ padding: '8px 10px' }}>{scholar?.role || 'DevOps / SRE'}</td>
              <td style={{ padding: '8px 10px', textAlign: 'center' }}>55</td>
              <td style={{ padding: '8px 10px' }}><span style={{ background: 'var(--success-light)', color: '#065f46', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>SENT</span></td>
              <td style={{ padding: '8px 10px', fontSize: 11, color: 'var(--text-muted)' }}>2026-11-28 10:42:11</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="section-heading" style={{ marginBottom: 12 }}>Full Event Log</div>
        <div className="log-stream" style={{ maxHeight: 240 }}>
          {LOG_LINES.map((l, i) => (
            <div key={i} className="log-line">
              <span className="log-time">{l.time}</span>
              <span className={`log-service ${l.service}`}>[{l.service === 'ai' ? 'ai-review' : l.service === 'notif' ? 'notification' : l.service}-svc]</span>
              <span className="log-msg">{l.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState(0)
  const [scholar, setScholar] = useState(null)
  const [completedSteps, setCompletedSteps] = useState(new Set())

  function handleUploadSubmit(data) {
    setScholar(data)
    setCompletedSteps(prev => new Set([...prev, 1]))
    // Simulate async Kafka processing — auto-advance after delay
    setTimeout(() => {
      setCompletedSteps(prev => new Set([...prev, 2]))
    }, 1000)
    setTimeout(() => {
      setCompletedSteps(prev => new Set([...prev, 3]))
    }, 2000)
    setTimeout(() => {
      setCompletedSteps(prev => new Set([...prev, 4]))
    }, 3000)
    setPage(2)
  }

  const steps = [
    { id: 0, label: 'Overview', icon: '🏠' },
    { id: 1, label: 'Upload Resume', icon: '📄' },
    { id: 2, label: 'Skills Extracted', icon: '🤖' },
    { id: 3, label: 'Gap Report', icon: '📊' },
    { id: 4, label: 'Notification Sent', icon: '📧' },
  ]

  const pageComponents = [
    <OverviewPage key="overview" />,
    <UploadPage key="upload" onSubmit={handleUploadSubmit} />,
    <SkillsPage key="skills" scholar={scholar} />,
    <GapReportPage key="gap" scholar={scholar} />,
    <NotificationPage key="notif" scholar={scholar} />,
  ]

  return (
    <div>
      <header className="header">
        <div className="header-brand">
          <div className="logo-icon">🎓</div>
          <div>
            <h1>ScholarX</h1>
            <span>AI-Powered Conversion Tracker</span>
          </div>
        </div>
        <nav className="header-nav">
          <button className={`nav-btn ${page === 0 ? 'active' : ''}`} onClick={() => setPage(0)}>Architecture</button>
          <button className={`nav-btn ${page >= 1 ? 'active' : ''}`} onClick={() => setPage(1)}>Live Demo</button>
        </nav>
      </header>

      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-title">Pipeline Steps</div>
          {steps.map(s => (
            <button
              key={s.id}
              className={`sidebar-item ${page === s.id ? 'active' : ''} ${completedSteps.has(s.id) ? 'done' : ''}`}
              onClick={() => setPage(s.id)}
            >
              <span className="step-num">
                {completedSteps.has(s.id) ? '✓' : s.id === 0 ? s.icon : s.id}
              </span>
              {s.label}
            </button>
          ))}

          <div className="sidebar-divider" />
          <div className="sidebar-title">Tech Stack</div>
          {[
            ['⚡', 'Apache Kafka'],
            ['🔵', 'gRPC + Protobuf'],
            ['🌱', 'Spring Boot 3.2'],
            ['🤖', 'Ollama / Llama3'],
            ['🛡️', 'Resilience4j'],
            ['☸️', 'Kubernetes'],
            ['🐳', 'Docker Compose'],
            ['🗄️', 'PostgreSQL'],
          ].map(([icon, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', fontSize: 12, color: 'var(--text-muted)' }}>
              <span>{icon}</span><span>{label}</span>
            </div>
          ))}
        </aside>

        <main className="main-content">
          {page > 0 && page < 5 && <EventFlowBar activeStep={page} />}

          <div>
            <div className="flex items-center justify-between mb-16">
              <h2 style={{ fontSize: 22, fontWeight: 800 }}>
                {steps[page]?.icon} {steps[page]?.label}
              </h2>
              {page > 0 && (
                <div className="flex gap-8">
                  {page > 1 && <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => p - 1)}>← Back</button>}
                  {page < 4 && <button className="btn btn-primary btn-sm" onClick={() => setPage(p => p + 1)}>Next →</button>}
                </div>
              )}
            </div>

            {pageComponents[page]}
          </div>
        </main>
      </div>
    </div>
  )
}
