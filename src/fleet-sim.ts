/**
 * Time simulation for the fleet. The JSON carries "last seen N minutes ago" per device; this module turns that into a
 * live clock so a monitor polling every 15 minutes sees realistic data:
 *  - connected devices keep reporting (their minutes-ago re-rolls within 0–4 every 5 minutes),
 *  - degraded and offline devices drift: minutes-ago grows with real elapsed time (FLEET_DRIFT per real minute, default 1),
 *    so some degraded devices cross the threshold on a later poll,
 *  - rolling incidents (FLEET_INCIDENTS, default on): in every FLEET_INCIDENT_EVERY window (default 2h) one otherwise
 *    healthy device goes silent from the start of the window — degraded after 15 min, past the 60-min threshold after an
 *    hour — and reports again when the next window starts (its ticket can then be resolved). Picked by hashing the window
 *    number, so it is deterministic across restarts and gives a monitor something new to find every window, not just on
 *    the first day.
 * FLEET_SIMULATION=off returns the static values from the JSON.
 */
import type { Connectivity, Device } from './data/types'
import { state } from './store'

export const SIMULATION = (process.env.FLEET_SIMULATION ?? 'on').toLowerCase() !== 'off'
export const DRIFT = Number(process.env.FLEET_DRIFT ?? 1)
export const DEGRADED_AFTER_MIN = 15
export const DEFAULT_THRESHOLD_MIN = 60
export const INCIDENTS = (process.env.FLEET_INCIDENTS ?? 'on').toLowerCase() !== 'off'
const parseDuration = (s: string) => {
  const m = /^(\d+)(s|m|h)?$/.exec(s.trim())
  if (!m) throw new Error(`Bad FLEET_INCIDENT_EVERY "${s}" (use 90m, 2h)`)
  return Number(m[1]) * (m[2] === 's' ? 1000 : m[2] === 'h' ? 3_600_000 : 60_000)
}
export const INCIDENT_EVERY_MS = parseDuration(process.env.FLEET_INCIDENT_EVERY ?? '2h')

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

let healthyPool: Device[] | null = null
const healthyDevices = () => (healthyPool ??= state.devices.filter((d) => d.lastSeenMinutesAgo !== undefined && reportedConnectivity(d) === 'connected'))

export interface Incident {
  device_id: string
  device_name: string
  /** ISO time the device went silent (start of the current window) */
  silent_since: string
  /** ISO time it reports again (start of the next window) */
  recovers_at: string
  window_minutes: number
}

/** The healthy device that is currently silent under the rolling-incident simulation, if any. */
export function currentIncident(now = Date.now()): Incident | null {
  if (!SIMULATION || !INCIDENTS) return null
  const pool = healthyDevices()
  if (!pool.length) return null
  const slot = Math.floor(now / INCIDENT_EVERY_MS)
  const d = pool[hash(`incident:${slot}`) % pool.length]
  return { device_id: d.id, device_name: d.label, silent_since: new Date(slot * INCIDENT_EVERY_MS).toISOString(), recovers_at: new Date((slot + 1) * INCIDENT_EVERY_MS).toISOString(), window_minutes: INCIDENT_EVERY_MS / 60_000 }
}

/** Minutes since the device last reported, under simulation. Null when the record has no last-seen data. */
export function minutesAgo(d: Device, now = Date.now()): number | null {
  if (d.lastSeenMinutesAgo === undefined) return null
  if (!SIMULATION) return d.lastSeenMinutesAgo
  const base = reportedConnectivity(d)
  if (base === 'connected') {
    const inc = currentIncident(now)
    if (inc && inc.device_id === d.id) return Math.floor((now - Date.parse(inc.silent_since)) / 60_000)
    return hash(d.id + Math.floor(now / 300_000)) % 5
  }
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
