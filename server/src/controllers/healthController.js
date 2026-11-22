// Provides a lightweight API liveness response.
export function getHealth(_req, res) {
  return res.json({ status: 'ok' })
}
