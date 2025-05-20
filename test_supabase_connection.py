from dotenv import load_dotenv
import os
from supabase import create_client, Client

# Cargar variables de entorno
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

print("Probando conexión a Supabase...")
print(f"URL: {SUPABASE_URL}")
print(f"KEY: {'Cargada' if SUPABASE_KEY else 'No cargada'}")

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    # Intenta hacer una consulta simple
    response = supabase.table("districts").select("*").limit(1).execute()
    print("¡Conexión exitosa! Respuesta de ejemplo:", response.data)
except Exception as e:
    print("Error al conectar a Supabase:", e)