interface AttributeFieldProps {
  label: string
  value: number | null
  min: number
  max: number
  highlighted?: boolean
  onChange: (value: number | null) => void
}

export function AttributeField({
  label,
  value,
  min,
  max,
  highlighted = false,
  onChange,
}: AttributeFieldProps) {
  return (
    <div className={`attr-box ${highlighted ? 'attr-box-highlighted' : ''}`}>
      <span className={`attr-name ${highlighted ? 'attr-name-highlighted' : ''}`}>
        {label}
      </span>
      <span className={`attr-value ${highlighted ? 'attr-value-highlighted' : ''}`}>
        <input
          aria-label={label}
          type="number"
          min={min}
          max={max}
          placeholder="0"
          value={formatNumberValue(value)}
          onChange={(event) => onChange(parseNullableNumber(event.target.value))}
        />
      </span>
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
