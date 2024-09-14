from supabase import create_client, Client
import os

HOST = 'imap.gmail.com'  # Example for Gmail
USERNAME = 'your-email@gmail.com'
PASSWORD = 'your-password'


url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

response = (
    supabase.table("countries")
    .insert({"id": 1, "name": "Denmark"})
    .execute()
)
