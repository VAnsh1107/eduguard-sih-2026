from flask_mail import Mail, Message
from flask import render_template_string

mail = Mail()

RISK_ALERT_HTML = """
<h3>⚠️ EduGuard High Risk Alert</h3>
<p>Dear Instructor,</p>
<p>Student <strong>{{ student_name }}</strong> has been flagged as <strong>High Risk</strong> of dropout by the EduGuard ML pipeline.</p>
<ul>
    <li><strong>Risk Probability:</strong> {{ risk_prob }}%</li>
</ul>
<h4>Top Contributing Factors:</h4>
<ul>
  {% for factor in top_factors %}
    <li><strong>{{ factor.label }}:</strong> {{ factor.value }} ({{ factor.direction }})</li>
  {% endfor %}
</ul>
<h4>Recommended Support Actions:</h4>
<ul>
  {% for action in interventions %}
    <li>{{ action }}</li>
  {% endfor %}
</ul>
<p>Please log into the EduGuard portal to assign support programs.</p>
<br>
<p>Best regards,<br>EduGuard automated risk services</p>
"""

WEEKLY_DIGEST_HTML = """
<h3>Weekly EduGuard High Risk Digest</h3>
<p>Dear Instructor,</p>
<p>Below is the weekly summary of students currently flagged as <strong>High Risk</strong>:</p>
<table border="1" cellpadding="5" style="border-collapse: collapse;">
  <thead>
    <tr style="background-color: #f3f4f6;">
      <th>Student ID</th>
      <th>Name</th>
      <th>GPA</th>
      <th>Attendance</th>
      <th>Risk Probability</th>
    </tr>
  </thead>
  <tbody>
    {% for s in students %}
    <tr>
      <td>{{ s.student_id }}</td>
      <td>{{ s.name }}</td>
      <td>{{ s.gpa }}</td>
      <td>{{ (s.attendance_rate * 100)|round(0)|int }}%</td>
      <td>{{ s.risk_probability|round(1) }}%</td>
    </tr>
    {% endfor %}
  </tbody>
</table>
<p>Please schedule necessary interventions for these students.</p>
<br>
<p>Best regards,<br>EduGuard automated risk services</p>
"""

INSTITUTION_INVITE_HTML = """
<h3>EduGuard Institution Admin Invite</h3>
<p>Hello,</p>
<p>You have been invited to administer <strong>{{ institution_name }}</strong> in EduGuard.</p>
<ul>
  <li><strong>Institution:</strong> {{ institution_name }}</li>
  <li><strong>Login email:</strong> {{ admin_email }}</li>
  <li><strong>Temporary password:</strong> {{ temp_password }}</li>
</ul>
<p>Please sign in and change your password after first login.</p>
<br>
<p>Best regards,<br>EduGuard platform services</p>
"""

def send_risk_alert(teacher_email, student_name, risk_prob, top_factors, interventions):
    try:
        msg = Message(
            subject=f"⚠️ High Risk Alert: {student_name}",
            recipients=[teacher_email],
            html=render_template_string(
                RISK_ALERT_HTML,
                student_name=student_name,
                risk_prob=round(risk_prob * 100, 1) if risk_prob <= 1.0 else round(risk_prob, 1),
                top_factors=top_factors,
                interventions=interventions
            )
        )
        mail.send(msg)
        print(f"[MAIL] Sent risk alert email for {student_name} to {teacher_email}")
    except Exception as e:
        print(f"[MAIL] Failed to send risk alert to {teacher_email}: {str(e)}")

def send_weekly_digest(teacher_email, high_risk_students_list):
    try:
        msg = Message(
            subject="Weekly High Risk Digest Summary",
            recipients=[teacher_email],
            html=render_template_string(
                WEEKLY_DIGEST_HTML,
                students=high_risk_students_list
            )
        )
        mail.send(msg)
        print(f"[MAIL] Sent weekly digest summary to {teacher_email} with {len(high_risk_students_list)} students")
    except Exception as e:
        print(f"[MAIL] Failed to send weekly digest to {teacher_email}: {str(e)}")

def send_institution_invite(admin_email, institution_name, temp_password):
    try:
        msg = Message(
            subject=f"EduGuard Admin Invite — {institution_name}",
            recipients=[admin_email],
            html=render_template_string(
                INSTITUTION_INVITE_HTML,
                admin_email=admin_email,
                institution_name=institution_name,
                temp_password=temp_password,
            )
        )
        mail.send(msg)
        print(f"[MAIL] Sent institution invite to {admin_email} for {institution_name}")
    except Exception as e:
        print(f"[MAIL] Failed to send institution invite to {admin_email}: {str(e)}")
