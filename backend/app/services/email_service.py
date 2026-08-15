import smtplib
from email.message import EmailMessage
from loguru import logger
from app.core.config import settings


def _transport_configured() -> bool:
    return bool(settings.RESEND_API_KEY or settings.SMTP_HOST)


def _send_via_resend(to: str, subject: str, html: str) -> None:
    import resend

    resend.api_key = settings.RESEND_API_KEY
    resend.Emails.send({
        "from": settings.MAIL_FROM,
        "to": [to],
        "subject": subject,
        "html": html,
    })


def _send_via_smtp(to: str, subject: str, html: str) -> None:
    msg = EmailMessage()
    msg["From"] = settings.MAIL_FROM
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(html, subtype="html")

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        if settings.SMTP_USER:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)


def send_email(to: str, subject: str, html: str) -> bool:
    if not _transport_configured():
        logger.warning(f"No email transport configured; skipping email to {to}")
        return False
    try:
        if settings.RESEND_API_KEY:
            _send_via_resend(to, subject, html)
        else:
            _send_via_smtp(to, subject, html)
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to}: {e}")
        return False


def _verification_html(link: str) -> str:
    return f"""\
<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#1f2937">
  <h2 style="color:#111827">Verifica tu email</h2>
  <p>Gracias por registrarte en CV Analyzer. Para activar tu cuenta, confirma tu
     dirección de correo:</p>
  <p>
    <a href="{link}"
       style="display:inline-block;padding:10px 18px;background:#2563eb;color:#fff;
              text-decoration:none;border-radius:6px">Verificar email</a>
  </p>
  <p style="font-size:13px;color:#6b7280">
    Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
    <a href="{link}">{link}</a>
  </p>
  <p style="font-size:13px;color:#6b7280">
    Si no creaste esta cuenta, puedes ignorar este mensaje.
  </p>
</div>
"""


def _reset_html(link: str) -> str:
    return f"""\
<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#1f2937">
  <h2 style="color:#111827">Restablece tu contraseña</h2>
  <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en
     CV Analyzer. El enlace es válido durante 1 hora.</p>
  <p>
    <a href="{link}"
       style="display:inline-block;padding:10px 18px;background:#2563eb;color:#fff;
              text-decoration:none;border-radius:6px">Restablecer contraseña</a>
  </p>
  <p style="font-size:13px;color:#6b7280">
    Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
    <a href="{link}">{link}</a>
  </p>
  <p style="font-size:13px;color:#6b7280">
    Si no solicitaste este cambio, ignora este correo y tu contraseña no cambiará.
  </p>
</div>
"""


def send_verification_email(to: str, token: str) -> None:
    link = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    if not _transport_configured():
        logger.info(f"[DEV] No email transport configured. Verification link for {to}: {link}")
    send_email(to, "Verifica tu email", _verification_html(link))


def send_password_reset_email(to: str, token: str) -> None:
    link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    if not _transport_configured():
        logger.info(f"[DEV] No email transport configured. Password reset link for {to}: {link}")
    send_email(to, "Restablece tu contraseña", _reset_html(link))