export async function logUserEvent({
  user_id,
  event_type,
  event_details = {},
}: {
  user_id: string
  event_type: string
  event_details?: Record<string, any>
}) {
  const res = await fetch('/api/log-user-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, event_type, event_details }),
  })
  if (!res.ok) {
    // Puedes loguear el error o mostrarlo en consola
    console.error('Failed to log user event', await res.text())
  }
} 