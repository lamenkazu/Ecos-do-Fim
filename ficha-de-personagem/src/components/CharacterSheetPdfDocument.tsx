import { forwardRef, type CSSProperties } from 'react'
import {
  ATTRIBUTE_DEFINITIONS,
  type AbilityEntry,
  type CharacterSheet,
} from '../domain/character-sheet'

interface CharacterSheetPdfDocumentProps {
  exportWidthMm?: number
  sheet: CharacterSheet
}

export const CharacterSheetPdfDocument = forwardRef<
  HTMLDivElement,
  CharacterSheetPdfDocumentProps
>(function CharacterSheetPdfDocument({ exportWidthMm, sheet }, ref) {
  const passiveAbilities = filterFilledAbilities(sheet.passiveAbilities)
  const activeAbilities = filterFilledAbilities(sheet.activeAbilities)
  const pdfStyle = exportWidthMm
    ? ({
        '--pdf-export-width': `${exportWidthMm}mm`,
      } as CSSProperties)
    : undefined

  return (
    <div ref={ref} className="sheet pdf-sheet" style={pdfStyle}>
      <header className="header">
        <div className="header-ornament">✦ &nbsp; Codex Arcanum &nbsp; ✦</div>
        <div className="title">Ficha de Personagem</div>
        <div className="divider-line"></div>
      </header>

      <section className="identity-top">
        <div className="identity-top-name">
          <div className="field pdf-field">
            <label>Nome do Personagem</label>
            <p className="pdf-field-value">{renderFieldValue(sheet.identity.name)}</p>
          </div>
        </div>
        <div className="identity-top-level">
          <div className="pdf-level-badge">
            <span className="level-label">Nível</span>
            <span className="pdf-level-value">{sheet.level ?? 1}</span>
          </div>
        </div>
      </section>

      <section className="identity">
        <div className="id-col">
          <div className="field pdf-field">
            <label>Idade</label>
            <p className="pdf-field-value">{renderFieldValue(sheet.identity.age)}</p>
          </div>
          <div className="field pdf-field">
            <label>Profissão</label>
            <p className="pdf-field-value">{renderFieldValue(sheet.identity.profession)}</p>
          </div>
        </div>
        <div className="id-col">
          <div className="field pdf-field">
            <label>Origem</label>
            <p className="pdf-field-value">{renderFieldValue(sheet.identity.origin)}</p>
          </div>
          <div className="field pdf-field">
            <label>Afiliação</label>
            <p className="pdf-field-value">{renderFieldValue(sheet.identity.affiliation)}</p>
          </div>
        </div>
        <div className="id-col">
          <div className="field pdf-field">
            <label>Personalidade</label>
            <p className="pdf-multiline">{renderFieldValue(sheet.identity.personality)}</p>
          </div>
        </div>
      </section>

      <section className="vitals-section">
        <div className="section-title">Pontos Vitais</div>
        <div className="vitals-grid">
          <div className="vital-bar vital-hp pdf-avoid-break">
            <div className="vital-header">
              <span className="vital-name vital-hp">❤ Vida</span>
              <span className="vital-sub">atual / máximo</span>
            </div>
            <div className="pdf-vital-values">
              <span className="pdf-vital-number">{renderNumberValue(sheet.vitals.life.current)}</span>
              <span className="vital-sep">/</span>
              <span className="pdf-vital-number">{renderNumberValue(sheet.vitals.life.max)}</span>
            </div>
          </div>
          <div className="vital-bar vital-ether pdf-avoid-break">
            <div className="vital-header">
              <span className="vital-name vital-ether">✦ Éter</span>
              <span className="vital-sub">atual / máximo</span>
            </div>
            <div className="pdf-vital-values">
              <span className="pdf-vital-number">{renderNumberValue(sheet.vitals.ether.current)}</span>
              <span className="vital-sep">/</span>
              <span className="pdf-vital-number">{renderNumberValue(sheet.vitals.ether.max)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="attrs-section">
        <div className="section-title">Atributos</div>
        <div className="attrs-grid">
          {ATTRIBUTE_DEFINITIONS.map((attribute) => (
            <div
              key={attribute.key}
              className={`attr-box pdf-avoid-break ${attribute.highlighted ? 'attr-box-highlighted' : ''}`}
            >
              <span className={`attr-name ${attribute.highlighted ? 'attr-name-highlighted' : ''}`}>
                {attribute.label}
              </span>
              <span className={`pdf-attribute-value ${attribute.highlighted ? 'pdf-attribute-value-highlighted' : ''}`}>
                {renderNumberValue(sheet.attributes[attribute.key])}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="abilities-section pdf-abilities-section">
        <div className="ability-col">
          <span className="ability-tag tag-passive">⬟ Passiva</span>
          <div className="pdf-ability-list">
            {passiveAbilities.length > 0 ? (
              passiveAbilities.map((ability) => (
                <article key={ability.id} className="pdf-ability-card">
                  <div className="field pdf-field">
                    <label>Nome da Habilidade</label>
                    <p className="pdf-field-value">{renderFieldValue(ability.name)}</p>
                  </div>
                  <div className="field pdf-field">
                    <label>Descrição</label>
                    <p className="pdf-multiline">{renderFieldValue(ability.description)}</p>
                  </div>
                </article>
              ))
            ) : (
              <p className="pdf-empty-note">Nenhuma habilidade passiva registrada.</p>
            )}
          </div>
        </div>

        <div className="ability-col">
          <span className="ability-tag tag-active">⬡ Ativa</span>
          <div className="pdf-ability-list">
            {activeAbilities.length > 0 ? (
              activeAbilities.map((ability) => (
                <article key={ability.id} className="pdf-ability-card">
                  <div className="field pdf-field">
                    <label>Nome da Habilidade</label>
                    <p className="pdf-field-value">{renderFieldValue(ability.name)}</p>
                  </div>
                  <div className="field pdf-field">
                    <label>Descrição</label>
                    <p className="pdf-multiline">{renderFieldValue(ability.description)}</p>
                  </div>
                </article>
              ))
            ) : (
              <p className="pdf-empty-note">Nenhuma habilidade ativa registrada.</p>
            )}
          </div>
        </div>
      </section>

      <section className="bottom-grid pdf-bottom-grid">
        <div className="bottom-col">
          <div className="section-title section-title-left">⚔ Equipamento</div>
          <div className="field pdf-field pdf-avoid-break">
            <label>Arma Principal</label>
            <p className="pdf-field-value">{renderFieldValue(sheet.equipment.mainWeapon)}</p>
          </div>
          <div className="field pdf-field pdf-avoid-break">
            <label>Armadura / Proteção</label>
            <p className="pdf-field-value">{renderFieldValue(sheet.equipment.armor)}</p>
          </div>
          <div className="field pdf-field pdf-avoid-break">
            <label>Acessório 1</label>
            <p className="pdf-field-value">{renderFieldValue(sheet.equipment.accessoryOne)}</p>
          </div>
          <div className="field pdf-field pdf-avoid-break">
            <label>Acessório 2</label>
            <p className="pdf-field-value">{renderFieldValue(sheet.equipment.accessoryTwo)}</p>
          </div>
          <div className="field pdf-field pdf-avoid-break">
            <label>Item Especial</label>
            <p className="pdf-field-value">{renderFieldValue(sheet.equipment.specialItem)}</p>
          </div>
        </div>

        <div className="bottom-col">
          <div className="section-title section-title-left">⊞ Inventário</div>
          <p className="pdf-multiline pdf-avoid-break">{renderFieldValue(sheet.inventory)}</p>
        </div>
      </section>

      <section className="full-section">
        <div className="section-title">Biografia</div>
        <p className="pdf-multiline">{renderFieldValue(sheet.biography)}</p>
      </section>

      <footer className="footer">
        ✦ &nbsp; que os dados estejam a seu favor &nbsp; ✦
      </footer>
    </div>
  )
})

function filterFilledAbilities(abilities: AbilityEntry[]) {
  return abilities.filter(
    (ability) =>
      ability.name.trim() !== '' || ability.description.trim() !== '',
  )
}

function renderFieldValue(value: string) {
  return value.trim() === '' ? '—' : value
}

function renderNumberValue(value: number | null) {
  return value ?? '—'
}
