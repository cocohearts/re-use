import requests
import gzip
from io import BytesIO

# Credentials and mailing list details
from dotenv import load_dotenv
import os

load_dotenv()

username = os.getenv('MIT_USERNAME')
password = os.getenv('MIT_PASSWORD')
url = 'https://mailman.mit.edu/mailman/private/reuse/2024-September.txt.gz'
login_url = 'https://mailman.mit.edu/mailman/private/reuse/'

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

response = session.get(url, stream=True)

if response.status_code == 200:
    print('Download successful.')
    s = response.content.decode('utf-8')
    print(s)
