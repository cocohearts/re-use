import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv
import os
import warnings

# Load environment variables from .env file
load_dotenv()

def send_email(to_address, subject, body):
    # Get SMTP credentials from environment variables
    smtp_host = os.getenv('SMTP_HOST')
    smtp_port = int(os.getenv('SMTP_PORT'))
    smtp_user = os.getenv('SMTP_USER')
    smtp_password = os.getenv('SMTP_PASSWORD')

    # Create an email message
    message = EmailMessage()
    message.set_content(body)
    message['Subject'] = subject
    message['From'] = smtp_user
    message['To'] = to_address

    try:
        # Connect to the SMTP server and send the email
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()  # Upgrade the connection to a secure encrypted SSL/TLS connection
            server.login(smtp_user, smtp_password)
            server.send_message(message)
            print(f"Email sent to {to_address}")
    except smtplib.SMTPConnectError:
        print("Failed to connect to the SMTP server. Please check the server address and port.")
    except smtplib.SMTPAuthenticationError:
        print("Authentication failed. Please check your SMTP username and password.")
    except smtplib.SMTPException as e:
        print(f"Failed to send email: {e}")

# Example usage
if __name__ == "__main__":
    send_email("elliottliu17@gmail.com", "Test Subject", "This is a test email body.")
