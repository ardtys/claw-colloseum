'use client'

import { motion } from 'framer-motion'

interface HealthBarProps {
  value: number
  maxValue: number
  isDamaged?: boolean
  label?: string
}

export function HealthBar({ value, maxValue, isDamaged = false, label }: HealthBarProps) {
  const percentage = Math.max(0, Math.min(100, (value / maxValue) * 100))
  const segments = 20
  const filledSegments = Math.floor((percentage / 100) * segments)

  const getSegmentClass = (index: number): string => {
    if (index >= filledSegments) return 'health-segment empty'
    if (percentage <= 20) return 'health-segment critical'
    if (percentage <= 50) return 'health-segment damaged'
    return 'health-segment full'
  }

  return (
    <div className="flex-1">
      {label && (
        <div className="data-label mb-1">{label}</div>
      )}
      <div className="flex items-center gap-1">
        <div
          className={`flex-1 flex gap-[2px] h-4 p-[2px] brutal-border ${
            isDamaged ? 'glitch-active' : ''
          }`}
        >
          {Array.from({ length: segments }).map((_, i) => (
            <motion.div
              key={i}
              className={getSegmentClass(i)}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.05, delay: i * 0.02 }}
            />
          ))}
        </div>
        <span className="data-label w-12 text-right">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  )
}

interface IntegrityBarProps {
  value: number
  label?: string
}

export function IntegrityBar({ value, label }: IntegrityBarProps) {
  const getBarColor = () => {
    if (value >= 80) return 'bg-claw-green'
    if (value >= 50) return 'bg-claw-orange'
    return 'bg-claw-red'
  }

  return (
    <div>
      {label && <div className="data-label mb-1">{label}</div>}
      <div className="brutal-border h-2 bg-claw-dark overflow-hidden">
        <motion.div
          className={`h-full ${getBarColor()}`}
          initial={{ width: '100%' }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      </div>
    </div>
  )
}
