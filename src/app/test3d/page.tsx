'use client'

import { CanvasContainer } from '@/components/3d/CanvasContainer'
import { Navigation } from '@/components/ui/Navigation'
import { TerminalOverlay } from '@/components/ui/Terminal'
import { AcceptanceLetter } from '@/components/ui/AcceptanceLetter'
import { JsSpellsOverlay } from '@/components/ui/JsSpellsOverlay'
import { MemoryViewerOverlay } from '@/components/ui/MemoryViewerOverlay'
import { useStore } from '@/lib/store'
import { useScrollManager } from '@/hooks/use-scroll-progress'
import { motion, AnimatePresence } from 'framer-motion'

export default function Test3DPage() {
  useScrollManager()

  const { isTerminalOpen, setTerminalOpen, activeRoom, setActiveRoom, hasReadLetter } = useStore()

  return (
    <>
      <AcceptanceLetter />

      {hasReadLetter && <Navigation onOpenTerminal={() => setTerminalOpen(!isTerminalOpen)} />}
      <JsSpellsOverlay />
      <MemoryViewerOverlay />

      <TerminalOverlay
        isOpen={isTerminalOpen}
        onClose={() => setTerminalOpen(false)}
      />

      <AnimatePresence>
        {activeRoom !== 'hallway' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed',
              bottom: '2rem',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 100,
              pointerEvents: 'auto'
            }}
          >
            <button
              className="glass"
              onClick={() => setActiveRoom('hallway')}
              style={{
                padding: '0.8rem 2rem',
                fontSize: '1rem',
                fontFamily: "'Cinzel', serif",
                color: '#fff',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(0,0,0,0.6)'
              }}
            >
              Exit Room
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed 3D Canvas — sits at z-index 0, fills viewport */}
      <CanvasContainer />

      {/*
        Scroll DOM overlay — MUST have pointerEvents: 'none' so click/hover
        events fall through to the canvas underneath.
        Only specific UI elements get pointerEvents: 'auto'.
      */}
      <div style={{ minHeight: '500vh', position: 'relative', pointerEvents: 'none' }}>

        {/* HUD title — pointerEvents auto so it's readable (not interactive) */}
        <div
          className="glass"
          style={{
            position: 'fixed',
            top: '5rem', /* Moved down so it doesn't overlap global nav */
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '1rem 2.5rem',
            textAlign: 'center',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <h1 className="heading-magic" style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>
            The Frontend Sorceress's Tale
          </h1>
          <p style={{ opacity: 0.7, fontSize: '0.85rem' }}>
            Scroll to travel through the Z-axis ↓
          </p>
        </div>

        {/* Scroll landmarks — invisible divs for each section height */}
        <div style={{ height: '100vh' }} />
        <div style={{ height: '100vh' }} />
        <div style={{ height: '100vh' }} />
        <div style={{ height: '100vh' }} />
        <div style={{ height: '100vh' }} />
        <div style={{ height: '100vh' }} />
        <div style={{ height: '100vh' }} />
      </div>
    </>
  )
}

