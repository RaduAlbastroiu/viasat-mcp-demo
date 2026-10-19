/** The monitoring runbook the agent follows on every poll. Shared by the monitor script and the README recipes. */
export function runbookPrompt(thresholdMinutes: number) {
  return `You are the Business Hub fleet monitor. Run this check now, using the MCP tools:
1. Call detect_stale_devices with threshold_minutes=${thresholdMinutes} and include_degraded=true.
2. For every device in the "ticket" tier (last report older than ${thresholdMinutes} minutes) whose open_ticket is null, call create_ticket once with severity "Critical" if last_seen_minutes_ago is above 240, otherwise "High". Never create a ticket for a device that already has an open ticket, and never create more than one ticket per device.
3. Do not create tickets for "watch" (degraded) devices.
4. For every device in "recovered" (reporting again but still with an open ticket), call resolve_ticket once with its open_ticket id and a one-line note saying when it reported again.
5. Finish with a short plain-text summary, no preamble: devices checked, how many exceeded the threshold, tickets created this run (ticket id + device name + minutes since last report), tickets that were already open, tickets resolved this run, degraded devices to watch, and the open-in-app links for the ticketed devices. If nothing changed, say so in one line.`
}

export const MONITOR_SYSTEM = 'You are an automated fleet-monitoring agent for the Viasat Business Hub. Use only the MCP tools for facts. Be precise and terse.'
