from flatapi import FlatAPI, Request, Response
from supabase import create_client, Client
import os

# Initialize Supabase client
url = os.getenv("SUPABASE_URL")  # your Supabase project URL
key = os.getenv("SUPABASE_KEY")  # your Supabase public anon key
supabase: Client = create_client(url, key)

app = FlatAPI()

# POST method for writing data


@app.route("/write", methods=["POST"])
async def write_data(req: Request) -> Response:
    data = await req.json()  # expects data in JSON format
    response = supabase.table("your_table").insert(data).execute()
    if response.status_code == 201:
        return Response.json({"message": "Data successfully written"}, status=201)
    return Response.json({"error": "Failed to write data"}, status=500)

# GET method for retrieving data


@app.route("/get", methods=["GET"])
async def get_data(req: Request) -> Response:
    query_params = req.query_params
    response = supabase.table("your_table").select("*").execute()
    if response.status_code == 200:
        return Response.json(response.data, status=200)
    return Response.json({"error": "Failed to retrieve data"}, status=500)

# Another POST method for automated writing data (for example, generating some default data)


@app.route("/auto-write", methods=["POST"])
async def auto_write_data(req: Request) -> Response:
    # Simulate or generate data automatically
    auto_data = {
        "name": "Auto-generated name",
        "value": 12345
    }
    response = supabase.table("your_table").insert(auto_data).execute()
    if response.status_code == 201:
        return Response.json({"message": "Auto data successfully written"}, status=201)
    return Response.json({"error": "Failed to write auto data"}, status=500)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
