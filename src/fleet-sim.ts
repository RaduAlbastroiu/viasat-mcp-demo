/**
 * Time simulation for the fleet. The JSON carries "last seen N minutes ago" per device; this module turns that into a
 * live clock so a monitor polling every 15 minutes sees realistic data:
 *  - connected devices keep reporting (their minutes-ago re-rolls within 0–4 every 5 minutes),
 *  - degraded and offline devices drift: minutes-ago grows with real elapsed time (FLEET_DRIFT per real minute, default 1),
 *    so some degraded devices cross the threshold on a later poll.
 * FLEET_SIMULATION=off returns the static values from the JSON.
 */
import type { Connectivity, Device } from './data/types'

export const SIMULATION = (process.env.FLEET_SIMULATION ?? 'on').toLowerCase() !== 'off'
export const DRIFT = Number(process.env.FLEET_DRIFT ?? 1)
export const DEGRADED_AFTER_MIN = 15
export const DEFAULT_THRESHOLD_MIN = 60

let startedAt = Date.now()
export const resetSimulation = () => {
  startedAt = Date.now()
}

const hash = (s: string) => {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0
  return Math.abs(h)
}

/** Base connectivity as the data reports it (fleet rows carry it; older records derive it from alarms). */
export function reportedConnectivity(d: Device): Connectivity {
  if (d.connectivity) return d.connectivity
  if (d.alarm?.tone === 'negative') return 'offline'
  if (d.alarm || d.availability === 'Degraded') return 'degraded'
  return 'connected'
}

/** Minutes since the device last reported, under simulation. Null when the record has no last-seen data. */
export function minutesAgo(d: Device, now = Date.now()): number | null {
  if (d.lastSeenMinutesAgo === undefined) return null
  if (!SIMULATION) return d.lastSeenMinutesAgo
  const base = reportedConnectivity(d)
  if (base === 'connected') return hash(d.id + Math.floor(now / 300_000)) % 5
  const elapsed = (now - startedAt) / 60_000
  return Math.round(d.lastSeenMinutesAgo + elapsed * DRIFT)
}

export function lastSeenAt(d: Device, now = Date.now()): string | null {
  const m = minutesAgo(d, now)
  return m === null ? null : new Date(now - m * 60_000).toISOString()
}

/** Effective connectivity right now, derived from minutes since last report. */
export function connectivityNow(d: Device, now = Date.now(), offlineAfter = DEFAULT_THRESHOLD_MIN): Connectivity {
  const m = minutesAgo(d, now)
  if (m === null) return reportedConnectivity(d)
  if (m >= offlineAfter) return 'offline'
  if (m >= DEGRADED_AFTER_MIN) return 'degraded'
  return 'connected'
}
