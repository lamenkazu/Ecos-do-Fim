interface VitalFieldProps {
  name: string
  symbol: string
  className: string
  currentValue: number | null
  maxValue: number | null
  onCurrentChange: (value: number | null) => void
  onMaxChange: (value: number | null) => void
}

export function VitalField({
  name,
  symbol,
  className,
  currentValue,
  maxValue,
  onCurrentChange,
  onMaxChange,
}: VitalFieldProps) {
  return (
    <div className={`vital-bar ${className}`}>
      <div className="vital-header">
        <span className={`vital-name ${className}`}>
          {symbol} {name}
        </span>
        <span className="vital-sub">atual / máximo</span>
      </div>
      <div className="vital-inputs">
        <input
          aria-label={`${name} atual`}
          type="number"
          min="0"
          placeholder="—"
          value={formatNumberValue(currentValue)}
          onChange={(event) => onCurrentChange(parseNullableNumber(event.target.value))}
        />
        <span className="vital-sep">/</span>
        <input
          aria-label={`${name} máximo`}
          type="number"
          min="0"
          placeholder="—"
          value={formatNumberValue(maxValue)}
          onChange={(event) => onMaxChange(parseNullableNumber(event.target.value))}
        />
      </div>
    </div>
  )
}

function parseNullableNumber(value: string) {
  if (value.trim() === '') {
    return null
  }

  const parsedValue = Number(value)

  return Number.isFinite(parsedValue) ? parsedValue : null
}

function formatNumberValue(value: number | null) {
  return value ?? ''
}
