import logging
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def send_approval_email_task(self, user_email, full_name):
    """
    Celery task to send an account approval email notification to the user.
    """
    subject = "Welcome to AirBooking! Your Account Has Been Approved"
    
    plain_message = (
        f"Dear {full_name},\n\n"
        f"Great news! Your AirBooking account registration has been reviewed and approved by our administration.\n\n"
        f"You can now log in to search flights, make bookings, and manage your trips at:\n"
        f"http://localhost:3000/login\n\n"
        f"Thank you for choosing AirBooking!\n"
        f"The AirBooking Team"
    )
    
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; color: #333333; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }}
            .header {{ background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; padding: 30px; text-align: center; }}
            .header h1 {{ margin: 0; font-size: 24px; font-weight: 700; }}
            .content {{ padding: 30px; line-height: 1.6; font-size: 15px; }}
            .badge {{ display: inline-block; padding: 6px 14px; background: #e0f2fe; color: #0284c7; border-radius: 20px; font-weight: 600; font-size: 13px; margin-bottom: 15px; }}
            .btn {{ display: inline-block; padding: 12px 28px; background: #0284c7; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }}
            .footer {{ background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✈️ AirBooking</h1>
            </div>
            <div class="content">
                <span class="badge">Account Approved</span>
                <h2>Hello {full_name},</h2>
                <p>We are delighted to inform you that your <strong>AirBooking</strong> customer account has been approved by our administration team!</p>
                <p>You now have full access to explore domestic and international routes, book seats in real-time, view your digital tickets, and track live flight statuses.</p>
                <p style="text-align: center;">
                    <a href="http://localhost:3000/login" class="btn" style="color: #ffffff;">Log In to AirBooking</a>
                </p>
                <p>If you have any questions, feel free to reply to this email.</p>
                <p>Safe travels,<br><strong>The AirBooking Team</strong></p>
            </div>
            <div class="footer">
                &copy; 2026 AirBooking Inc. All rights reserved. • YUAI Soft Solutions Technical Assignment
            </div>
        </div>
    </body>
    </html>
    """

    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'AirBooking <noreply@airbooking.com>'),
            recipient_list=[user_email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"Approval email successfully sent to {user_email}")
        return f"Email sent to {user_email}"
    except Exception as exc:
        logger.error(f"Failed to send approval email to {user_email}: {exc}")
        # Retry with exponential backoff if running in Celery worker
        try:
            raise self.retry(exc=exc, countdown=60)
        except Exception:
            return f"Failed to send email to {user_email}: {str(exc)}"

@shared_task(bind=True, max_retries=3)
def send_rejection_email_task(self, user_email, full_name, reason="Information could not be verified"):
    """
    Celery task to send an account rejection email notification.
    """
    subject = "AirBooking Account Registration Update"
    plain_message = (
        f"Dear {full_name},\n\n"
        f"Thank you for registering with AirBooking. After review, we regret to inform you that your account registration was not approved.\n"
        f"Reason: {reason}\n\n"
        f"If you believe this is a mistake, please contact our support team.\n\n"
        f"The AirBooking Team"
    )
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'AirBooking <noreply@airbooking.com>'),
            recipient_list=[user_email],
            fail_silently=False,
        )
        return f"Rejection email sent to {user_email}"
    except Exception as exc:
        logger.error(f"Failed to send rejection email: {exc}")
        return f"Failed to send rejection email: {str(exc)}"
