/** Lightweight time formatters — no external dependencies needed */

export function formatDistanceToNow(dateStr) {
  const date  = new Date(dateStr)
  const diff  = Date.now() - date.getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)

  if (mins < 1)   return 'now'
  if (mins < 60)  return `${mins}m`
  if (hours < 24) return `${hours}h`
  if (days < 7)   return `${days}d`
  return date.toLocaleDateString()
}

export function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
