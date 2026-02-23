'use client'

interface HealthBarProps {
  value: number
  maxValue: number
  isDamaged?: boolean
  label?: string
}

export function HealthBar({ value, maxValue, label }: HealthBarProps) {
  const percentage = Math.max(0, Math.min(100, (value / maxValue) * 100))

  const getBarColor = () => {
    if (percentage > 60) return 'bg-success'
    if (percentage > 30) return 'bg-warning'
    return 'bg-danger'
  }

  return (
    <div className="flex-1">
      {label && (
        <div className="text-xs text-text-muted mb-1">{label}</div>
      )}
      <div className="flex items-center gap-2">
        <div className="flex-1 health-bar">
          <div
            className={`health-bar-fill ${getBarColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs text-text-muted w-10 text-right tabular-nums">
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
    if (value >= 80) return 'bg-success'
    if (value >= 50) return 'bg-warning'
    return 'bg-danger'
  }

  return (
    <div>
      {label && <div className="text-xs text-text-muted mb-1">{label}</div>}
      <div className="health-bar">
        <div
          className={`health-bar-fill ${getBarColor()}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}
