import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Función para validar UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

serve(async (req) => {
  try {
    // Verificar que sea una petición POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405 }
      )
    }

    // Parsear el cuerpo de la petición
    const { user_id, event_type, event_details } = await req.json()
    
    // Validar los datos requeridos
    if (!user_id || !event_type) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          received: { user_id, event_type, event_details }
        }),
        { status: 400 }
      )
    }

    // Validar que user_id sea un UUID válido
    if (!isValidUUID(user_id)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid user_id format. Must be a valid UUID.',
          received: user_id
        }),
        { status: 400 }
      )
    }

    // Crear cliente de Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Insertar el evento
    const { data, error } = await supabaseClient
      .from('user_events')
      .insert([{ 
        user_id, 
        event_type, 
        event_details,
        created_at: new Date().toISOString()
      }])
      .select()

    if (error) {
      return new Response(
        JSON.stringify({ 
          error: error.message,
          details: error
        }),
        { status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        data: data[0]
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}) 