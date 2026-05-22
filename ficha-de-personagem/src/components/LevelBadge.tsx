import { useEffect, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'

type LevelEffectDirection = 'up' | 'down'

interface LevelBadgeProps {
  level: number
  onIncrement: () => void
  onDecrement: () => void
}

interface ActiveEffect {
  id: number
  direction: LevelEffectDirection
}

const FIREWORK_PARTICLES = [
  { id: 1, x: -34, y: -26, rotate: -32, delay: 0.0, size: 8, tone: 'bright' },
  { id: 2, x: -16, y: -34, rotate: -12, delay: 0.03, size: 7, tone: 'warm' },
  { id: 3, x: 6, y: -38, rotate: 8, delay: 0.02, size: 8, tone: 'bright' },
  { id: 4, x: 28, y: -26, rotate: 24, delay: 0.05, size: 7, tone: 'warm' },
  { id: 5, x: 40, y: -2, rotate: 38, delay: 0.08, size: 6, tone: 'bright' },
  { id: 6, x: 30, y: 22, rotate: 18, delay: 0.06, size: 7, tone: 'warm' },
  { id: 7, x: 0, y: 34, rotate: 0, delay: 0.04, size: 6, tone: 'bright' },
  { id: 8, x: -28, y: 20, rotate: -26, delay: 0.07, size: 7, tone: 'warm' },
  { id: 9, x: -40, y: -4, rotate: -40, delay: 0.01, size: 6, tone: 'bright' },
  { id: 10, x: 14, y: 22, rotate: 12, delay: 0.09, size: 5, tone: 'bright' },
]

export function LevelBadge({
  level,
  onIncrement,
  onDecrement,
}: LevelBadgeProps) {
  const shouldReduceMotion = useReducedMotion() ?? false
  const [activeEffect, setActiveEffect] = useState<ActiveEffect | null>(null)
  const [effectId, setEffectId] = useState(0)

  useEffect(() => {
    if (!activeEffect) {
      return
    }

    const timeout = window.setTimeout(
      () => {
        setActiveEffect((current) =>
          current?.id === activeEffect.id ? null : current,
        )
      },
      activeEffect.direction === 'up' ? 760 : 320,
    )

    return () => {
      window.clearTimeout(timeout)
    }
  }, [activeEffect])

  function triggerLevelChange(direction: LevelEffectDirection) {
    const nextId = effectId + 1

    setEffectId(nextId)
    setActiveEffect({
      id: nextId,
      direction,
    })

    if (direction === 'up') {
      onIncrement()
      return
    }

    onDecrement()
  }

  const nextLevel = Math.min(99, level + 1)
  const previousLevel = Math.max(1, level - 1)

  return (
    <div className="level-badge-shell">
      <div className="level-badge">
        <AnimatePresence>
          {activeEffect && (
            <motion.div
              key={`${activeEffect.direction}-${activeEffect.id}`}
              className={`level-effect-overlay level-effect-overlay-${activeEffect.direction}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.16 : 0.26, ease: 'easeOut' }}
              aria-hidden="true"
            >
              {activeEffect.direction === 'up' ? (
                <LevelUpFireworks reducedMotion={shouldReduceMotion} />
              ) : (
                <LevelDownAura reducedMotion={shouldReduceMotion} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="level-badge-content">
          <span className="level-label">Nível</span>
          <div className="level-counter-row">
            <button
              type="button"
              className="level-control-button level-control-left"
              aria-label={`Descer para o nível ${previousLevel}`}
              title="Descer de nível"
              onClick={() => triggerLevelChange('down')}
              disabled={level <= 1}
            >
              <FiChevronDown aria-hidden="true" />
            </button>

            <span className="level-value-stage" aria-live="polite">
              <AnimatePresence initial={false} mode="wait">
                <motion.span
                  key={level}
                  className="level-value-display"
                  initial={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          y: activeEffect?.direction === 'down' ? -8 : 8,
                          scale: 0.88,
                        }
                  }
                  animate={
                    shouldReduceMotion
                      ? { opacity: 1 }
                      : { opacity: 1, y: 0, scale: 1 }
                  }
                  exit={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          y: activeEffect?.direction === 'down' ? 8 : -8,
                          scale: 0.88,
                        }
                  }
                  transition={{
                    duration: shouldReduceMotion ? 0.16 : 0.24,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {level}
                </motion.span>
              </AnimatePresence>
            </span>

            <button
              type="button"
              className="level-control-button level-control-right"
              aria-label={`Subir para o nível ${nextLevel}`}
              title="Subir de nível"
              onClick={() => triggerLevelChange('up')}
              disabled={level >= 99}
            >
              <FiChevronUp aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function LevelUpFireworks({ reducedMotion }: { reducedMotion: boolean }) {
  if (reducedMotion) {
    return (
      <>
        <motion.span
          className="level-burst-ring level-burst-ring-primary"
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: [0, 0.8, 0], scale: [0.92, 1.16, 1.28] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
        <motion.span
          className="level-burst-glow"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.65, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
        />
      </>
    )
  }

  return (
    <>
      <motion.span
        className="level-burst-ring level-burst-ring-primary"
        initial={{ opacity: 0, scale: 0.82 }}
        animate={{ opacity: [0, 0.92, 0], scale: [0.88, 1.18, 1.42] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.span
        className="level-burst-ring level-burst-ring-secondary"
        initial={{ opacity: 0, scale: 0.76 }}
        animate={{ opacity: [0, 0.72, 0], scale: [0.78, 1.06, 1.58] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.span
        className="level-burst-glow"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: [0, 0.78, 0], scale: [0.92, 1.1, 1.22] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.56, ease: 'easeOut' }}
      />
      {FIREWORK_PARTICLES.map((particle) => (
        <motion.span
          key={particle.id}
          className="level-particle-anchor"
          style={
            {
              '--particle-size': `${particle.size}px`,
            } as CSSProperties
          }
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.2, rotate: 0 }}
          animate={{
            x: particle.x,
            y: particle.y,
            opacity: [0, 1, 0],
            scale: [0.2, 1, 0.7],
            rotate: [0, particle.rotate],
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.6,
            delay: particle.delay,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <span className={`level-particle level-particle-${particle.tone}`} />
        </motion.span>
      ))}
    </>
  )
}

function LevelDownAura({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      <motion.span
        className="level-burst-ring level-burst-ring-down"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{
          opacity: [0, reducedMotion ? 0.38 : 0.54, 0],
          scale: reducedMotion ? [0.96, 1.04, 1.12] : [0.94, 1.08, 1.18],
        }}
        exit={{ opacity: 0 }}
        transition={{ duration: reducedMotion ? 0.2 : 0.3, ease: 'easeOut' }}
      />
      <motion.span
        className="level-burst-glow level-burst-glow-down"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, reducedMotion ? 0.18 : 0.28, 0] }}
        exit={{ opacity: 0 }}
        transition={{ duration: reducedMotion ? 0.18 : 0.26, ease: 'easeOut' }}
      />
    </>
  )
}
