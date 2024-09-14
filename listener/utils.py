import re
from typing import List
import requests
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

username = os.getenv('MIT_USERNAME')
password = os.getenv('MIT_PASSWORD')
url = 'https://mailman.mit.edu/mailman/private/reuse/2024-September.txt.gz'
login_url = 'https://mailman.mit.edu/mailman/private/reuse/'

openai_api_key = os.getenv('OPENAI_API_KEY')
# Create OpenAI client
client = OpenAI(api_key=openai_api_key)


supabase_url: str = os.environ.get("SUPABASE_URL")
supabase_key: str = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)


class Email:
    def __init__(self, subject, from_, date, body, name=""):
        self.subject = subject
        self.from_ = from_
        self.date = date
        self.body = body
        self.name = name
        self.links = []

    def __str__(self):
        return f"Subject: {self.subject}\nFrom: {self.from_}\nName: {self.name}\nDate: {self.date}\nBody: {self.body}\nLinks: {self.links}"

    def to_json(self):
        return {
            "created_at": self.date,
            "email": self.from_,
            "name": self.name,
            "description": self.subject,
            "long_description": self.body,
            "photo_url": self.links
        }


def get_logs() -> str:
    # Initialize a session to maintain cookies and session state
    session = requests.Session()

    # Data for the POST request (login form)
    login_data = {
        'username': username,
        'password': password,
        'submit': 'Let me in...'  # This matches what was in the form data in the image
    }

    # Perform the login
    response = session.post(login_url, data=login_data)

    # Retry mechanism
    max_retries = 3
    for attempt in range(max_retries):
        response = session.get(url, stream=True)
        if response.status_code == 200:
            print('Download successful.')
            s = response.content.decode('utf-8')
            return s
        else:
            print(f'Download failed. Attempt {attempt + 1} of {max_retries}.')
            if attempt < max_retries - 1:
                print('Retrying...')
            else:
                print('Max retries reached. Download failed.')
                return None

    # If all retries fail
    return None


def parse_logs(log_text: str) -> List[Email]:
    emails = []
    current_email = []

    for line in log_text.splitlines():
        words = line.split()
        if len(words) >= 3 and words[0] == "From:":
            if current_email:
                emails.append('\n'.join(current_email))
                current_email = []
            current_email.append(line)
        elif len(words) >= 3 and words[0] == "From" and words[2] == "at":
            pass
        else:
            current_email.append(line)

    if current_email:
        emails.append('\n'.join(current_email))

    parsed_emails = []
    for email_text in emails:
        sender_name = ""
        lines = email_text.split('\n')
        body_lines = []
        in_body = False

        for line in lines:
            if line.startswith('From:'):
                email_from = line[5:].strip()
                # Check for parentheses and extract name if present
                if '(' in email_from and ')' in email_from:
                    name_start = email_from.index('(') + 1
                    name_end = email_from.index(')')
                    sender_name = email_from[name_start:name_end].strip()
                    # Remove parentheses and name
                    email_from = email_from[:name_start-1].strip()

                if email_from.startswith('Reuse'):
                    email_from = 'Reuse'
                # Replace 'at' with '@' in email address
                if ' at ' in email_from:
                    username, domain = email_from.split(' at ')
                    email_from = f"{username}@{domain}"

            elif line.startswith('Date:'):
                email_date = line[5:].strip()
            elif line.startswith('Subject:'):
                subject = line[8:].strip()
                if subject.startswith('[Reuse]'):
                    email_subject = subject[7:].strip()
                else:
                    email_subject = subject
            elif line.startswith('Message-ID:'):
                continue
            elif not line.strip() and not in_body:
                in_body = True
            elif in_body:
                body_lines.append(line)

        if email_subject.startswith('Reuse Digest'):
            continue

        email_body = '\n'.join(body_lines).strip()
        email = Email(email_subject, email_from,
                      email_date, email_body, sender_name)

        # Regular expression pattern to match URLs
        url_pattern = re.compile(
            r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+')

        # Find all links in the email body, excluding specific domains
        email.links = [
            link for link in url_pattern.findall(email_body)
            if not link.startswith(('http://mailman.mit.edu', 'https://mailman.mit.edu', 'http://aka.ms', 'https://aka.ms'))
        ]

        # Remove text after and including the separator if present in the email body
        separator = "________________________________"
        if separator in email.body:
            email.body = email.body.split(separator)[0].strip()

        parsed_emails.append(email)

    emails = parsed_emails

    return emails


def write_to_db(email: Email):
    email_json = email.to_json()
    supabase.table("items").insert(email.to_json()).execute()


if __name__ == "__main__":
    supabase.table("items").delete().neq(
        'id', '00000000-0000-0000-0000-000000000000').execute()
    emails = parse_logs(get_logs())
    for email in emails[:5]:
        print(email)
        print("———————————————————————————————————————————————————————————")

    for email in emails[:10]:
        write_to_db(email)
