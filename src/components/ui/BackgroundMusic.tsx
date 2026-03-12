'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { withBasePath } from '@/lib/base-path'

type MusicState = 'playing' | 'paused' | 'needs_gesture'

const STORAGE_KEY = 'hogwarts_music_v2'

type Persisted = {
    enabled: boolean
    trackIndex: number
    time: number
}

function readState(): Persisted {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return { enabled: true, trackIndex: 0, time: 0 }
        const parsed = JSON.parse(raw)
        return {
            enabled: parsed?.enabled !== false,
            trackIndex: Number.isFinite(parsed?.trackIndex) ? parsed.trackIndex : 0,
            time: Number.isFinite(parsed?.time) ? parsed.time : 0,
        }
    } catch {
        return { enabled: true, trackIndex: 0, time: 0 }
    }
}

function writeState(next: Persisted) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
        // ignore
    }
}

export function BackgroundMusic() {
    const tracks = useMemo(() => ([
        withBasePath('/audio/1.mp3'),
        withBasePath('/audio/2.mp3'),
        withBasePath('/audio/3.mp3'),
        withBasePath('/audio/4.mp3'),
    ]), [])

    const audioRef = useRef<HTMLAudioElement | null>(null)
    const initialEnabled = (() => {
        if (typeof window === 'undefined') return true
        return readState().enabled
    })()
    const [enabled, setEnabled] = useState<boolean>(initialEnabled)
    const [musicState, setMusicState] = useState<MusicState>(initialEnabled ? 'playing' : 'paused')

    const trackIndexRef = useRef(0)
    const enabledRef = useRef(enabled)

    useEffect(() => {
        enabledRef.current = enabled
    }, [enabled])

    // Init audio element once.
    useEffect(() => {
        const persisted = readState()
        trackIndexRef.current = Math.max(0, Math.min(tracks.length - 1, persisted.trackIndex))

        const audio = new Audio()
        audioRef.current = audio
        audio.preload = 'auto'
        audio.loop = false
        audio.volume = 0.9
        audio.src = tracks[trackIndexRef.current]

        if (persisted.time > 0) {
            // Best-effort resume (may be clamped by the browser until metadata is loaded).
            audio.currentTime = persisted.time
        }

        const persistNow = () => {
            writeState({
                enabled: enabledRef.current,
                trackIndex: trackIndexRef.current,
                time: audio.currentTime || 0,
            })
        }

        const onEnded = () => {
            trackIndexRef.current = (trackIndexRef.current + 1) % tracks.length
            audio.src = tracks[trackIndexRef.current]
            audio.currentTime = 0
            persistNow()
            if (!enabledRef.current) return
            void audio.play().then(() => setMusicState('playing')).catch(() => setMusicState('needs_gesture'))
        }

        audio.addEventListener('ended', onEnded)

        // Periodically persist playback position so a refresh feels continuous.
        const interval = setInterval(() => {
            if (!audioRef.current) return
            if (!enabledRef.current) return
            persistNow()
        }, 2000)

        const onVis = () => {
            if (document.visibilityState === 'hidden') persistNow()
        }
        document.addEventListener('visibilitychange', onVis)

        return () => {
            clearInterval(interval)
            document.removeEventListener('visibilitychange', onVis)
            persistNow()
            audio.pause()
            audio.removeEventListener('ended', onEnded)
            audioRef.current = null
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tracks])

    // Keep enabled state in sync (pause/resume and persist).
    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const persisted = readState()
        writeState({
            enabled,
            trackIndex: trackIndexRef.current,
            time: persisted.time ?? audio.currentTime ?? 0,
        })

        if (!enabled) {
            audio.pause()
            setMusicState('paused')
            return
        }

        void audio.play().then(() => setMusicState('playing')).catch(() => setMusicState('needs_gesture'))
    }, [enabled])

    const toggle = () => {
        setEnabled((v) => !v)
    }

    const enableGesture = async () => {
        const audio = audioRef.current
        if (!audio) return
        try {
            await audio.play()
            setMusicState('playing')
        } catch {
            // noop
        }
    }

    const label = musicState === 'playing'
        ? 'Music: On'
        : musicState === 'paused'
            ? 'Music: Off'
            : 'Tap to enable music'

    const border = musicState === 'needs_gesture'
        ? '1px solid rgba(255, 204, 68, 0.42)'
        : '1px solid rgba(255, 255, 255, 0.14)'

    const bg = musicState === 'needs_gesture'
        ? 'rgba(10, 14, 23, 0.46)'
        : enabled ? 'rgba(10, 14, 23, 0.32)' : 'rgba(10, 14, 23, 0.22)'

    const onClick = musicState === 'needs_gesture' ? enableGesture : toggle

    return (
        <button
            onClick={onClick}
            style={{
                pointerEvents: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.42rem 0.62rem',
                borderRadius: '12px',
                border,
                background: bg,
                color: 'rgba(255, 248, 225, 0.92)',
                fontSize: '0.78rem',
                letterSpacing: '0.35px',
                userSelect: 'none',
                opacity: enabled ? 1 : 0.72,
                cursor: 'pointer',
                fontFamily: "'Cinzel', serif",
                textAlign: 'left',
            }}
            title={musicState === 'needs_gesture' ? 'Enable music' : (enabled ? 'Turn music off' : 'Turn music on')}
            aria-label={musicState === 'needs_gesture' ? 'Enable music' : (enabled ? 'Turn music off' : 'Turn music on')}
        >
            <span
                aria-hidden="true"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    background: musicState === 'needs_gesture'
                        ? 'rgba(255, 204, 68, 0.16)'
                        : enabled ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.03)',
                    color: '#fff8e1',
                    flexShrink: 0,
                }}
            >
                {musicState === 'needs_gesture' ? '▶' : (enabled ? '🎵' : '🔇')}
            </span>
            <span style={{ whiteSpace: 'nowrap', opacity: musicState === 'needs_gesture' ? 0.95 : 0.85 }}>
                <span style={{ textDecoration: (!enabled && musicState !== 'needs_gesture') ? 'line-through' : 'none' }}>
                    {label}
                </span>
            </span>
        </button>
    )
}
