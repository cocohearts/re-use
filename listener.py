from imapclient import IMAPClient
import email
from email.header import decode_header

HOST = 'imap.gmail.com'  # Example for Gmail
USERNAME = 'your-email@gmail.com'
PASSWORD = 'your-password'

with IMAPClient(HOST) as client:
    client.login(USERNAME, PASSWORD)
    client.select_folder('INBOX')

    # Search for unread emails
    messages = client.search(['UNSEEN'])

    for msg_id in messages:
        msg_data = client.fetch(msg_id, ['RFC822'])
        for msg in msg_data.values():
            msg_email = email.message_from_bytes(msg[b'RFC822'])
            subject, encoding = decode_header(msg_email['Subject'])[0]
            if isinstance(subject, bytes):
                subject = subject.decode(encoding if encoding else 'utf-8')
            print(f"New email subject: {subject}")
