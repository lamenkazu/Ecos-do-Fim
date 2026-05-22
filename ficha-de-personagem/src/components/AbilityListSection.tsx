import type { AbilityEntry } from '../domain/character-sheet'
import { FiPlus, FiX } from 'react-icons/fi'

interface AbilityListSectionProps {
  tagLabel: string
  tagClassName: string
  addLabel: string
  abilities: AbilityEntry[]
  descriptionPlaceholder: string
  canAdd: boolean
  onAdd: () => void
  onRemove: (id: string) => void
  onChange: (
    id: string,
    field: keyof Omit<AbilityEntry, 'id'>,
    value: string,
  ) => void
}

export function AbilityListSection({
  tagLabel,
  tagClassName,
  addLabel,
  abilities,
  descriptionPlaceholder,
  canAdd,
  onAdd,
  onRemove,
  onChange,
}: AbilityListSectionProps) {
  return (
    <div className="ability-col">
      <div className="ability-toolbar">
        <span className={`ability-tag ${tagClassName}`}>{tagLabel}</span>
        <button
          type="button"
          className="ability-add-button"
          aria-label={addLabel}
          title={addLabel}
          onClick={onAdd}
          disabled={!canAdd}
        >
          <FiPlus aria-hidden="true" />
        </button>
      </div>
      <div className="ability-list">
        {abilities.map((ability, index) => (
          <article key={ability.id} className="ability-entry">
            <div className="ability-entry-head">
              <button
                type="button"
                className="remove-button"
                aria-label={`Remover habilidade ${index + 1}`}
                title={`Remover habilidade ${index + 1}`}
                onClick={() => onRemove(ability.id)}
              >
                <FiX aria-hidden="true" />
              </button>
            </div>
            <div className="ability-name-field field">
              <label htmlFor={`${tagClassName}-${ability.id}-name`}>
                Nome da Habilidade
              </label>
              <input
                id={`${tagClassName}-${ability.id}-name`}
                type="text"
                placeholder="Título da habilidade..."
                value={ability.name}
                onChange={(event) =>
                  onChange(ability.id, 'name', event.target.value)
                }
              />
            </div>
            <div className="field">
              <label htmlFor={`${tagClassName}-${ability.id}-description`}>
                Descrição
              </label>
              <textarea
                id={`${tagClassName}-${ability.id}-description`}
                rows={4}
                placeholder={descriptionPlaceholder}
                value={ability.description}
                onChange={(event) =>
                  onChange(ability.id, 'description', event.target.value)
                }
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
