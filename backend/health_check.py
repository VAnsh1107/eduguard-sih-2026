"""
Full EduGuard system health check.
Tests: DB tables, API endpoints (login, students, stats, predict, export, PDF), WebSocket handshake.
"""
import sqlite3, os, sys, json, time
import urllib.request, urllib.error

BASE = 'http://localhost:5000'
DB   = r'c:\Users\vansh\OneDrive\Desktop\sih final\backend\data\eduguard.db'

PASS = '\033[92m[PASS]\033[0m'
FAIL = '\033[91m[FAIL]\033[0m'
INFO = '\033[94m[INFO]\033[0m'

errors = []

def ok(label):   print(f'{PASS} {label}')
def fail(label, detail=''):
    print(f'{FAIL} {label}' + (f' — {detail}' if detail else ''))
    errors.append(label)
def info(label): print(f'{INFO} {label}')

def http(method, path, data=None, token=None, binary=False):
    url = BASE + path
    body = json.dumps(data).encode() if data else None
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            if binary:
                return r.status, r.read()
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, {}
    except Exception as e:
        return 0, {'error': str(e)}

print('=' * 60)
print('   EduGuard Full System Health Check')
print('=' * 60)
print()

# ── 1. Database ──────────────────────────────────────────────────
info('DATABASE')
if not os.path.exists(DB):
    fail('Database file exists', 'NOT FOUND')
else:
    size_mb = round(os.path.getsize(DB) / 1024 / 1024, 2)
    ok(f'Database file exists ({size_mb} MB)')
    con = sqlite3.connect(DB)
    cur = con.cursor()
    tables = [t[0] for t in cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
    required = ['students', 'users', 'risk_snapshots', 'interventions', 'alert_config']
    for t in required:
        if t in tables:
            count = cur.execute(f'SELECT COUNT(*) FROM "{t}"').fetchone()[0]
            ok(f'Table "{t}" exists — {count} rows')
        else:
            fail(f'Table "{t}" missing')

    # Check student columns
    cols = [c[1] for c in cur.execute('PRAGMA table_info(students)').fetchall()]
    required_cols = ['student_id','name','email','gpa','attendance_rate','risk_label','risk_probability']
    for c in required_cols:
        if c not in cols:
            fail(f'students.{c} column missing')
    ok(f'students table has all required columns ({len(cols)} total)')

    # Verify seeded users
    users = cur.execute('SELECT email, role FROM users').fetchall()
    user_emails = [u[0] for u in users]
    for email in ['admin@edu.local', 'teacher@edu.local', 'student@edu.local']:
        if email in user_emails:
            ok(f'User exists: {email}')
        else:
            fail(f'User missing: {email}')
    con.close()

print()

# ── 2. Backend API Health ────────────────────────────────────────
info('BACKEND API')

# Health check
status, body = http('GET', '/api/health')
if status == 200:
    ok(f'GET /api/health — {body.get("status", "?")}')
else:
    fail('GET /api/health', f'HTTP {status}')

# Login — admin
status, body = http('POST', '/api/auth/login', {'email': 'admin@edu.local', 'password': 'changeme'})
if status == 200 and 'access_token' in body:
    admin_token = body['access_token']
    ok('POST /api/auth/login (admin)')
else:
    fail('POST /api/auth/login (admin)', f'HTTP {status}')
    admin_token = None

# Login — teacher
status, body = http('POST', '/api/auth/login', {'email': 'teacher@edu.local', 'password': 'changeme'})
if status == 200 and 'access_token' in body:
    teacher_token = body['access_token']
    ok('POST /api/auth/login (teacher)')
else:
    fail('POST /api/auth/login (teacher)', f'HTTP {status}')
    teacher_token = None

# Login — student
status, body = http('POST', '/api/auth/login', {'email': 'student@edu.local', 'password': 'changeme'})
if status == 200 and 'access_token' in body:
    student_token = body['access_token']
    ok('POST /api/auth/login (student)')
else:
    fail('POST /api/auth/login (student)', f'HTTP {status}')
    student_token = None

if admin_token:
    # Students list
    status, body = http('GET', '/api/students?limit=10', token=admin_token)
    if status == 200 and 'students' in body:
        ok(f'GET /api/students — returned {len(body["students"])} students (page)')
    else:
        fail('GET /api/students', f'HTTP {status}')

    # Stats
    status, body = http('GET', '/api/stats', token=admin_token)
    if status == 200 and 'total_students' in body:
        ok(f'GET /api/stats — total={body["total_students"]}, model_accuracy={body.get("model_accuracy")}')
    else:
        fail('GET /api/stats', f'HTTP {status}')

    # Single student
    status, body = http('GET', '/api/students/STU1001', token=admin_token)
    if status == 200 and 'prediction' in body:
        ok(f'GET /api/students/STU1001 — risk={body["prediction"].get("risk_level")} ({body["prediction"].get("confidence", 0):.1f}%)')
    else:
        fail('GET /api/students/STU1001', f'HTTP {status}')

    # Predict endpoint
    sample_features = {
        'gpa': 5.2, 'attendance_rate': 0.62, 'assignment_submission_rate': 0.7,
        'lms_login_frequency': 3, 'library_visits': 1,
        'extracurricular_participation': 0, 'socioeconomic_score': 0.4,
        'family_income_bracket': 2, 'scholarship_recipient': 0,
        'distance_from_college': 35, 'mental_health_score': 5, 'previous_backlogs': 2
    }
    status, body = http('POST', '/api/predict', sample_features, token=admin_token)
    if status == 200 and 'risk_level' in body:
        ok(f'POST /api/predict — risk_level={body["risk_level"]}, confidence={body.get("confidence", 0):.1f}%')
    else:
        fail('POST /api/predict', f'HTTP {status} {body}')

    # Risk history
    status, body = http('GET', '/api/students/STU1001/risk-history', token=admin_token)
    if status == 200:
        ok(f'GET /api/students/STU1001/risk-history — {len(body.get("history", []))} snapshots')
    else:
        fail('GET /api/students/STU1001/risk-history', f'HTTP {status}')

    # Interventions summary
    status, body = http('GET', '/api/interventions/summary', token=admin_token)
    if status == 200:
        ok(f'GET /api/interventions/summary — pending={body.get("pending",0)}, active={body.get("active",0)}')
    else:
        fail('GET /api/interventions/summary', f'HTTP {status}')

    # Alert config
    status, body = http('GET', '/api/admin/alert-config', token=admin_token)
    if status == 200:
        ok(f'GET /api/admin/alert-config — threshold={body.get("threshold_probability")}%')
    else:
        fail('GET /api/admin/alert-config', f'HTTP {status}')

    # Model versions
    status, body = http('GET', '/api/admin/models', token=admin_token)
    if status == 200:
        count = len(body.get("versions", []))
        if count > 0:
            ok(f'GET /api/admin/models — {count} version(s), accuracy={body["versions"][0].get("accuracy", "?")}')
        else:
            fail('GET /api/admin/models', 'No model versions returned (registry may be filtering incorrectly)')
    else:
        fail('GET /api/admin/models', f'HTTP {status}')

    # Export CSV
    status, raw = http('GET', '/api/export/students?risk=Medium', token=admin_token, binary=True)
    if status == 200 and b'student_id' in raw:
        lines = raw.decode().strip().splitlines()
        ok(f'GET /api/export/students — {len(lines)-1} rows in CSV')
    else:
        fail('GET /api/export/students', f'HTTP {status}')

    # PDF report
    status, raw = http('GET', '/api/students/STU1001/report.pdf', token=admin_token, binary=True)
    if status == 200 and raw[:4] == b'%PDF':
        ok(f'GET /api/students/STU1001/report.pdf — PDF {len(raw)} bytes')
    else:
        fail('GET /api/students/STU1001/report.pdf', f'HTTP {status}')

print()

# ── 3. WebSocket Handshake ───────────────────────────────────────
info('WEBSOCKET')
if teacher_token:
    ws_url = f'{BASE}/socket.io/?EIO=4&transport=polling&token={teacher_token}'
    try:
        with urllib.request.urlopen(ws_url, timeout=5) as r:
            body = r.read()
            if b'"sid"' in body:
                ok('Socket.IO polling handshake — session ID obtained')
            else:
                fail('Socket.IO handshake', 'no sid in response')
    except Exception as e:
        fail('Socket.IO handshake', str(e))
else:
    fail('Socket.IO handshake (skipped — no token)')

print()
# ── Summary ──────────────────────────────────────────────────────
print('=' * 60)
if errors:
    print(f'  RESULT: {len(errors)} FAILURE(S) found:')
    for e in errors:
        print(f'    ✗ {e}')
    sys.exit(1)
else:
    print('  RESULT: ALL CHECKS PASSED ✓')
print('=' * 60)
