from supabase import create_client, Client
import os
import sys
from utils import *

# Now I can import
from geolocation import *

urls = [
    (
        'https://mailman.mit.edu/mailman/private/reuse/',
        'https://mailman.mit.edu/mailman/private/reuse/2024-September.txt.gz'
    ),
    (
        'https://mailman.mit.edu/mailman/private/free-foods/',
        'https://mailman.mit.edu/mailman/private/free-foods/2024-September.txt.gz'
    )
]


def update_db():
    for url_pair in urls:
        login_url, url = url_pair
        log_text, mailing_list = get_logs(login_url, url)
        emails = parse_logs(log_text, mailing_list)

        for email in emails:
            write_to_db(email)


if __name__ == "__main__":
    update_db()
