import re
from typing import List
import requests
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

supabase_url: str = os.environ.get("SUPABASE_URL")
supabase_key: str = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

supabase.table("bids").delete().neq(
    'id', '00000000-0000-0000-0000-000000000000').execute()

supabase.table("items").delete().neq(
    'id', '00000000-0000-0000-0000-000000000000').execute()
