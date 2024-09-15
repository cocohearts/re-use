import re
from typing import List, Tuple
import requests
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

username = os.getenv('MIT_USERNAME')
password = os.getenv('MIT_PASSWORD')

openai_api_key = os.getenv('OPENAI_API_KEY')
# Create OpenAI client
client = OpenAI(api_key=openai_api_key)

supabase_url: str = os.environ.get("SUPABASE_URL")
supabase_key: str = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)


class Email:
    def __init__(self, subject, from_, date, body, location, mailing_list, can_self_pickup, name=""):
        self.subject = subject
        self.from_ = from_
        self.date = date
        self.body = body
        self.location = location
        self.mailing_list = mailing_list  # New mandatory field for mailing list
        self.name = name
        self.links = []
        self.can_self_pickup = can_self_pickup
    def __str__(self):
        return f"Subject: {self.subject}\nFrom: {self.from_}\nMailing List: {self.mailing_list}\nName: {self.name}\nDate: {self.date}\nCan self-pickup: {self.can_self_pickup}\nBody: {self.body}\nLinks: {self.links}"

    def to_json(self):
        return {
            "created_at": self.date,
            "email": self.from_,
            "name": self.subject,
            "description": self.body,
            "location": self.location,
            "can_self_pickup": self.can_self_pickup,
            "mailing_list": self.mailing_list,  # Include mailing list in JSON
            "photo_urls": self.links
        }


def get_logs(login_url, url) -> str:
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


def get_location_and_can_self_pickup(email_body: str) -> Tuple[str, bool]:
    try:
        # Prepare the message for ChatGPT
        system_prompt_1 = """You are a helpful assistant that extracts pick-up locations and whether the user can self-pickup from email bodies. Do not include any other text in the response. Return the location and a boolean for whether the user can self-pickup. If the location is not found, return "Location not found, False".
        
        All pickups happen in or around MIT campus. Also includes Boston, Harvard."""

        messages = [
            {"role": "system", "content": system_prompt_1},
            {"role": "user", "content": f"What is the pick-up location mentioned in this email body, and can the user self-pickup?\n\n{email_body}"}
        ]

        # Make the API call to ChatGPT
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages
        )

        # Extract the assistant's reply
        content = response.choices[0].message.content
        last_comma_index = content.rfind(',')
        location = content[:last_comma_index].strip()
        can_self_pickup = content[last_comma_index + 1:].strip() == 'True'

        print("Building: ", location, "Can self-pickup: ", can_self_pickup)
        return location, can_self_pickup

        # system_prompt_2 = """You are a helpful assistant that extracts geolocation from a description of a location near MIT. Use the following format:
        # Latitude: xx.xxxxxx
        # Longitude: xx.xxxxxx
        # """
        # messages = [
        #     {"role": "system", "content": system_prompt_2},
        #     {"role": "user", "content": content}
        # ]

        # response = client.chat.completions.create(
        #     model="gpt-4o",
        #     messages=messages
        # )

        # text = response.choices[0].message.content
        # match = re.search(
        #     r'Latitude: (\d+\.\d+)\nLongitude: (-?\d+\.\d+)', text)
        # print(text)
        # if match:
        #     print("matched!")
        #     latitude = float(match.group(1))
        #     longitude = float(match.group(2))

    except Exception as e:
        print(f"Error in parsing body with ChatGPT: {str(e)}")
        return "Location not found"


def check_img_url(url):
    if url.startswith(('http://mailman.mit.edu', 'https://mailman.mit.edu')):
        # Check if the URL ends with 'htm' or 'html'
        if url.lower().endswith(('htm', 'html', 'htm>')):
            return False
        return True
    if url.startswith('http://aka.ms') or url.startswith('https://aka.ms'):
        return False
    return True


def get_name_addr_from_line(line):
    email_from = line[5:].strip()
    sender_name = ""
    if "mit" in email_from.lower():
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

    else:
        # Ask GPT-4 to fetch the name and email address
        prompt = f"Extract the name and email address from this string: '{email_from}'. Format the response as 'Name: [name], Email: [email]'"
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}]
        )
        result = response.choices[0].message.content
        name_match = re.search(r'Name: (.+),', result)
        email_match = re.search(r'Email: (.+)', result)
        if name_match and email_match:
            sender_name = name_match.group(1).strip()
            email_from = email_match.group(1).strip()
    return email_from, sender_name


def get_subj_and_mailing_list_from_line(line):
    subject = line[8:].strip()
    if subject.startswith('[Reuse]'):
        email_subject = subject[7:].strip()
        mailing_list = "Reuse"
    elif subject.startswith('[Free-food]'):
        email_subject = subject[11:].strip()
        mailing_list = "Free-food"
    else:
        email_subject = subject
        mailing_list = "Unknown"
    return email_subject, mailing_list


def is_opportunity(subject, body):
    return True
    prompt = f"Check if this email is confirming that something is claimed. If it is saying something is claimed, return 'False'. Otherwise if it is describing or providing something new, return 'True'. Here is the email: Subject: {subject} Body: {body} Is this offering or describing something? Format the response as 'True' or 'False'."
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}]
    )
    result = response.choices[0].message.content
    if result.lower() == "false":
        print("Skipping non-opportunity email: ", body)
        return False
    return True


def parse_logs(log_text: str) -> List[Email]:
    # Split the log text into individual emails
    emails = []
    current_email = []
    inside_digest = False

    for line in log_text.splitlines():
        if inside_digest:
            if line.startswith("End of Reuse Digest"):
                inside_digest = False
            continue
        words = line.split()
        if len(words) >= 3 and words[0] == "From:":
            if words[1] == "Reuse":
                inside_digest = True
                continue

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
    for email_text in emails[-30:]:
        sender_name = ""
        lines = email_text.split('\n')
        body_lines = []
        in_body = False
        exists = False
        is_useless = False

        attachment_links = []
        in_attachments = False

        # Regular expression pattern to match URLs
        url_pattern = re.compile(
            r'https?://(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)'
        )

        for line in lines:
            if is_useless or exists:
                break
            if line.startswith('From:'):
                email_from, sender_name = get_name_addr_from_line(line)

            elif line.startswith('Date:'):
                email_date = line[5:].strip()

            elif line.startswith('Subject:'):
                email_subject, mailing_list = get_subj_and_mailing_list_from_line(line)
                if email_subject.startswith(('Reuse Digest', 'Fwd:', 'Re:')):
                    is_useless = True
                    break
                if check_existence(email_date, email_subject):
                    exists = False
            elif line.startswith('Message-ID:'):
                continue
            elif line.startswith('In-Reply-To:'):
                is_useless = True
                break
            elif not line.strip() and not in_body:
                in_body = True
            elif in_body:
                if line == "-------------- next part --------------" or line.endswith("attachment was scrubbed...") or line.startswith("Get Outlook for"):
                    in_body = False
                    in_attachments = True
                    continue
                body_lines.append(line)
            elif in_attachments:
                attachment_links += [link for link in url_pattern.findall(
                    line) if check_img_url(link)]

        # Post-processing
        if is_useless or exists:
            continue
        
        email_body = '\n'.join(body_lines).strip()
        if not is_opportunity(email_subject, email_body):
            continue

        email_location, can_self_pickup = get_location_and_can_self_pickup(email_body)
        email = Email(email_subject, email_from,
                      email_date, email_body, email_location, mailing_list, can_self_pickup, sender_name)

        # Find all links in the email body, excluding specific domains
        email.links = [
            link for link in url_pattern.findall(email_body)
            if check_img_url(link)
        ] + attachment_links

        # # Remove text after and including the separator if present in the email body
        # separator = "________________________________"
        # if separator in email.body:
        #     email.body = email.body.split(separator)[0].strip()

        parsed_emails.append(email)

    emails = []
    for email in parsed_emails:
        is_duplicate = False
        for other_email in parsed_emails:
            if email.subject == other_email.subject and email.date > other_email.date:
                is_duplicate = True
                break
        if not is_duplicate:
            emails.append(email)

    return emails


def check_existence(date, subject):
    # Check if a row with the same timestamp and same name already exists in the database
    result = supabase.table("items").select(
        "*").eq("created_at", date).eq("name", subject).execute()

    # If any rows are returned, the email already exists
    if result.data:
        print(
            f"Email with subject '{subject}' from {date} already exists in the database.")
        return True

    return False


def write_to_db(email: Email):
    email_location, can_self_pickup = get_location_and_can_self_pickup(email.subject + "\n" + email.body)
    email.location = email_location
    email.can_self_pickup = can_self_pickup
    email_json = email.to_json()
    print(email_json)
    supabase.table("items").insert(email.to_json()).execute()


if __name__ == "__main__":
    url = 'https://mailman.mit.edu/mailman/private/reuse/2024-September.txt.gz'
    login_url = 'https://mailman.mit.edu/mailman/private/reuse/'
    supabase.table("items").delete().neq(
        'id', '00000000-0000-0000-0000-000000000000').execute()
    emails = parse_logs(get_logs(login_url, url))
    for email in emails[:1]:
        print(email)
        print("———————————————————————————————————————————————————————————")

    for email in emails[:10]:
        write_to_db(email)
