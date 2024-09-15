from openai import OpenAI
import requests
from typing import Tuple
import os
from dotenv import load_dotenv
load_dotenv()
openai_api_key = os.getenv('OPENAI_API_KEY')
# Create OpenAI client
client = OpenAI(api_key=openai_api_key)


def answer_question(question: str) -> str:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": question}]
    )
    return response.choices[0].message.content


def get_address_from_desc(desc: str) -> str:
    if desc == "Location not found":
        return None

    address = answer_question(
        f"Here is a description of a place near MIT: {desc}. If it mentions building number: what is the full name of building number? Include the word \"building\" in the name. If it mentions building or field name: what is the name? If it refers to a specific address, what is the address? If it refers to a general area in Cambridge, what is in that area? Context: \"stud\" refers to Stratton Student Center. Give me only the building number or name. Do not include the room number or any additional text. If you can't tell, return \"Location not found\".")
    if "building" in address.lower():
        address = "MIT building " + address
    else:
        address = address + " near MIT"

    return address


def get_gis_from_address(address: str) -> Tuple[float, float]:
    if address in ["Location not found", None]:
        return None

    google_api_key = os.getenv('GOOGLE_API_KEY')
    base_url = "https://maps.googleapis.com/maps/api/geocode/json"

    params = {
        'address': address,
        'key': google_api_key
    }

    response = requests.get(base_url, params=params)
    data = response.json()

    if data['status'] == 'OK':
        location = data['results'][0]['geometry']['location']
        return location['lat'], location['lng']
    else:
        raise Exception(
            f"Geocoding failed: {data['status']}, searched for {address}")
