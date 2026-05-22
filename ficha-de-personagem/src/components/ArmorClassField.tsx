import { FiShield } from 'react-icons/fi'

interface ArmorClassFieldProps {
  value: number | null
  onChange: (value: number | null) => void
}

export function ArmorClassField({ value, onChange }: ArmorClassFieldProps) {
  return (
    <div className="vital-bar vital-ca">
      <div className="vital-header">
        <span className="vital-name vital-ca">
          <FiShield aria-hidden="true" />
          <span>CA</span>
        </span>
        <span className="vital-sub">classe de armadura</span>
      </div>
      <div className="armor-class-input-wrap">
        <input
          aria-label="Classe de Armadura"
          type="number"
          min="0"
          placeholder="—"
          value={formatNumberValue(value)}
          onChange={(event) => onChange(parseNullableNumber(event.target.value))}
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
