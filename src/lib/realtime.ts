import { useEffect, useRef } from 'react'
import { IS_DEMO, SESION } from './api'

/** Canal en tiempo real para el control remoto (milisegundos). Usa ntfy.sh (pub/sub gratuito, sin cuenta).
 *  Solo viajan números de slide: ningún dato de participantes. Google queda como respaldo. */
const cfg = (window.AVALON_CONFIG ?? {}) as { apiUrl?: string; canal?: string }
function hash(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) } return (h >>> 0).toString(36) }
const TOPIC = cfg.canal || `awa-comite-${hash((cfg.apiUrl || '') + '|' + SESION)}${hash(SESION + (cfg.apiUrl || '').slice(-20))}`
const BASE = 'https://ntfy.sh/' + TOPIC

export interface RtMsg { i: number; step: number; origen: 'admin' | 'deck'; seq: number }

export function rtSend(m: RtMsg) {
  if (IS_DEMO) return
  fetch(BASE, { method: 'POST', body: JSON.stringify(m) }).catch(() => {})
}

export function useRealtime(onMsg: (m: RtMsg) => void) {
  const cb = useRef(onMsg); cb.current = onMsg
  useEffect(() => {
    if (IS_DEMO || typeof EventSource === 'undefined') return
    let es: EventSource | null = null, retry = 0, dead = false
    const open = () => {
      es = new EventSource(`${BASE}/sse`)
      es.onmessage = ev => {
        try { const n = JSON.parse(ev.data); if (n.event === 'message' && n.message) cb.current(JSON.parse(n.message)) } catch { /* nada */ }
      }
      es.onerror = () => { es?.close(); if (!dead) retry = window.setTimeout(open, 1500) }
    }
    open()
    return () => { dead = true; clearTimeout(retry); es?.close() }
  }, [])
}
