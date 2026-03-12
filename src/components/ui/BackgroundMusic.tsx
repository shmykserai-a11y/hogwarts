'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { withBasePath } from '@/lib/base-path'

type MusicState = 'playing' | 'muted' | 'needs_gesture'

const STORAGE_KEY = 'hogwarts_music_v1'

function readMuted(): boolean {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return false
        const parsed = JSON.parse(raw)
        return !!parsed?.muted
    } catch {
        return false
    }
}

function writeMuted(muted: boolean) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ muted }))
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
    const [muted, setMuted] = useState(false)
    const [musicState, setMusicState] = useState<MusicState>('playing')
    const trackIndexRef = useRef(0)

    // Init audio element once.
    useEffect(() => {
        setMuted(readMuted())

        const audio = new Audio()
        audioRef.current = audio
        audio.preload = 'auto'
        audio.loop = false
        audio.volume = 0.9

        const onEnded = () => {
            trackIndexRef.current = (trackIndexRef.current + 1) % tracks.length
            audio.src = tracks[trackIndexRef.current]
            void audio.play().catch(() => setMusicState('needs_gesture'))
        }

        audio.addEventListener('ended', onEnded)

        return () => {
            audio.pause()
            audio.removeEventListener('ended', onEnded)
            audioRef.current = null
        }
    }, [tracks])

    // Keep audio muted state in sync.
    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return
        audio.muted = muted
        writeMuted(muted)
        setMusicState(muted ? 'muted' : 'playing')
    }, [muted])

    // Autoplay attempt (may be blocked by the browser; we'll show a "tap to enable" affordance).
    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        // Start from track 1 and try to play immediately.
        trackIndexRef.current = 0
        audio.src = tracks[0]

        if (muted) return

        void audio.play().catch(() => {
            // Most mobile browsers require a user gesture for audio playback.
            setMusicState('needs_gesture')
        })
    }, [tracks, muted])

    const toggleMute = async () => {
        const audio = audioRef.current
        const next = !muted
        setMuted(next)

        if (!audio) return
        if (!next) {
            // If unmuting, try to resume playback.
            try {
                await audio.play()
                setMusicState('playing')
            } catch {
                setMusicState('needs_gesture')
            }
        } else {
            setMusicState('muted')
        }
    }

    const enable = async () => {
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
        : musicState === 'muted'
            ? 'Music: Off'
            : 'Tap to enable music'

    const border = musicState === 'needs_gesture'
        ? '1px solid rgba(255, 204, 68, 0.42)'
        : '1px solid rgba(255, 255, 255, 0.14)'

    const bg = musicState === 'needs_gesture'
        ? 'rgba(10, 14, 23, 0.46)'
        : 'rgba(10, 14, 23, 0.32)'

    return (
        <div style={{
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
        }}>
            <button
                onClick={musicState === 'needs_gesture' ? enable : toggleMute}
                style={{
                    pointerEvents: 'auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    background: musicState === 'needs_gesture' ? 'rgba(255, 204, 68, 0.16)' : 'rgba(255, 255, 255, 0.06)',
                    color: '#fff8e1',
                    cursor: 'pointer',
                    fontFamily: "'Cinzel', serif",
                }}
                title={musicState === 'needs_gesture' ? 'Enable music' : (muted ? 'Unmute' : 'Mute')}
                aria-label={musicState === 'needs_gesture' ? 'Enable music' : (muted ? 'Unmute' : 'Mute')}
            >
                {musicState === 'needs_gesture' ? '▶' : (muted ? '🔇' : '🎵')}
            </button>
            <div style={{ whiteSpace: 'nowrap', opacity: musicState === 'needs_gesture' ? 0.95 : 0.85 }}>
                {label}
            </div>
        </div>
    )
}

