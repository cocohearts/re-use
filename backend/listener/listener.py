from supabase import create_client, Client
from utils import *

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
        url, login_url = url_pair
        emails = parse_logs(get_logs(url, login_url))

        for email in emails:
            write_to_db(email)


update_db()

# if __name__ == "__main__":
