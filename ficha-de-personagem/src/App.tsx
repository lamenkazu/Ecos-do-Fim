import { useEffect, useRef, useState } from 'react'
import { FiDownload } from 'react-icons/fi'
import './App.css'
import { AbilityListSection } from './components/AbilityListSection'
import { ArmorClassField } from './components/ArmorClassField'
import { AttributeField } from './components/AttributeField'
import { CharacterSheetPdfDocument } from './components/CharacterSheetPdfDocument'
import { LevelBadge } from './components/LevelBadge'
import { VitalField } from './components/VitalField'
import {
  ABILITY_LIMITS,
  ATTRIBUTE_DEFINITIONS,
  CHARACTER_SHEET_SCHEMA_VERSION,
  canAddAbility,
  createAbilityEntry,
  createDefaultCharacterSheet,
  type AttributeKey,
  type CharacterSheet,
  type IdentityFieldKey,
} from './domain/character-sheet'
import type { AbilityEntry } from './domain/character-sheet'
import {
  LocalStorageCharacterSheetRepository,
} from './repositories/character-sheet-repository'
import type { CharacterSheetRepository } from './repositories/character-sheet-repository'

const browserRepository =
  typeof window === 'undefined'
    ? null
    : new LocalStorageCharacterSheetRepository(window.localStorage)

const PDF_EXPORT_FORMAT = 'a3'
const PDF_EXPORT_ORIENTATION = 'landscape'
const PDF_EXPORT_MARGIN_MM = 0
const PDF_EXPORT_WIDTH_MM = 420
const PDF_EXPORT_SCALE = 1.5

type SaveStatus = 'loading' | 'saving' | 'saved' | 'error'
type PdfStatus = 'idle' | 'generating' | 'error'

interface AppProps {
  repository?: CharacterSheetRepository
}

function App({ repository = browserRepository ?? new LocalStorageCharacterSheetRepository() }: AppProps) {
  const [sheet, setSheet] = useState<CharacterSheet>(() => createDefaultCharacterSheet())
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('loading')
  const [pdfStatus, setPdfStatus] = useState<PdfStatus>('idle')
  const [isReady, setIsReady] = useState(false)
  const pdfDocumentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false

    async function loadSheet() {
      try {
        const loadedSheet = await repository.load()

        if (cancelled) {
          return
        }

        setSheet(loadedSheet)
        setSaveStatus('saved')
      } catch {
        if (cancelled) {
          return
        }

        setSheet(createDefaultCharacterSheet())
        setSaveStatus('error')
      } finally {
        if (!cancelled) {
          setIsReady(true)
        }
      }
    }

    void loadSheet()

    return () => {
      cancelled = true
    }
  }, [repository])

  useEffect(() => {
    if (!isReady) {
      return
    }

    let cancelled = false

    async function persistSheet() {
      setSaveStatus('saving')

      try {
        await repository.save(sheet)

        if (!cancelled) {
          setSaveStatus('saved')
        }
      } catch {
        if (!cancelled) {
          setSaveStatus('error')
        }
      }
    }

    void persistSheet()

    return () => {
      cancelled = true
    }
  }, [isReady, repository, sheet])

  function updateSheet(updater: (current: CharacterSheet) => CharacterSheet) {
    setSheet((current) => ({
      ...updater(current),
      schemaVersion: CHARACTER_SHEET_SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
    }))
  }

  function updateIdentityField(field: IdentityFieldKey, value: string) {
    updateSheet((current) => ({
      ...current,
      identity: {
        ...current.identity,
        [field]: value,
      },
    }))
  }

  function updateVital(
    vital: 'life' | 'ether',
    field: 'current' | 'max',
    value: number | null,
  ) {
    updateSheet((current) => ({
      ...current,
      vitals: {
        ...current.vitals,
        [vital]: {
          ...current.vitals[vital],
          [field]: value,
        },
      },
    }))
  }

  function updateAttribute(field: AttributeKey, value: number | null) {
    updateSheet((current) => ({
      ...current,
      attributes: {
        ...current.attributes,
        [field]: value,
      },
    }))
  }

  function updateEquipmentField(
    field: keyof CharacterSheet['equipment'],
    value: string,
  ) {
    updateSheet((current) => ({
      ...current,
      equipment: {
        ...current.equipment,
        [field]: value,
      },
    }))
  }

  function updateAbilityList(
    type: 'passiveAbilities' | 'activeAbilities',
    updater: (abilities: AbilityEntry[]) => AbilityEntry[],
  ) {
    updateSheet((current) => ({
      ...current,
      [type]: updater(current[type]),
    }))
  }

  function addAbility(type: 'passiveAbilities' | 'activeAbilities') {
    updateAbilityList(type, (abilities) => [...abilities, createAbilityEntry()])
  }

  function removeAbility(type: 'passiveAbilities' | 'activeAbilities', id: string) {
    updateAbilityList(type, (abilities) => {
      if (abilities.length === 1) {
        return [createAbilityEntry()]
      }

      return abilities.filter((ability) => ability.id !== id)
    })
  }

  function updateAbility(
    type: 'passiveAbilities' | 'activeAbilities',
    id: string,
    field: keyof Omit<AbilityEntry, 'id'>,
    value: string,
  ) {
    updateAbilityList(type, (abilities) =>
      abilities.map((ability) =>
        ability.id === id ? { ...ability, [field]: value } : ability,
      ),
    )
  }

  function getSaveStatusLabel(status: SaveStatus) {
    switch (status) {
      case 'loading':
        return 'Carregando registro local'
      case 'saving':
        return 'Salvando localmente'
      case 'saved':
        return 'Salvo localmente'
      case 'error':
        return 'Falha ao salvar localmente'
      default:
        return 'Estado desconhecido'
    }
  }

  function getPdfStatusLabel(status: PdfStatus) {
    switch (status) {
      case 'generating':
        return 'Gerando PDF da ficha'
      case 'error':
        return 'Falha ao gerar o PDF'
      default:
        return ''
    }
  }

  async function downloadPdf() {
    if (!pdfDocumentRef.current) {
      return
    }

    setPdfStatus('generating')

    try {
      if ('fonts' in document) {
        await document.fonts.ready
      }

      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => resolve())
      })

      const { default: html2pdf } = await import('html2pdf.js')

      await html2pdf()
        .set({
          margin: PDF_EXPORT_MARGIN_MM,
          filename: buildPdfFilename(sheet.identity.name),
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: PDF_EXPORT_SCALE,
            useCORS: true,
            backgroundColor: '#0e0c0a',
            logging: false,
          },
          pagebreak: {
            mode: ['css', 'legacy'],
            avoid: '.pdf-avoid-break',
          },
          jsPDF: {
            unit: 'mm',
            format: PDF_EXPORT_FORMAT,
            orientation: PDF_EXPORT_ORIENTATION,
          },
        })
        .from(pdfDocumentRef.current)
        .save()

      setPdfStatus('idle')
    } catch {
      setPdfStatus('error')
    }
  }

  return (
    <main className="sheet-shell">
      <div className="sheet">
        <header className="header">
          <div className="header-ornament">✦ &nbsp; Codex Arcanum &nbsp; ✦</div>
          <div className="title">Ficha de Personagem</div>
          <div className="divider-line"></div>
          <p className={`sheet-status sheet-status-${saveStatus}`}>
            {getSaveStatusLabel(saveStatus)}
          </p>
        </header>

        <section className="identity-top">
          <div className="identity-top-name">
            <div className="field">
              <label htmlFor="character-name">Nome do Personagem</label>
              <input
                id="character-name"
                type="text"
                placeholder="Como és chamado..."
                value={sheet.identity.name}
                onChange={(event) => updateIdentityField('name', event.target.value)}
              />
            </div>
          </div>
          <div className="identity-top-level">
            <LevelBadge
              level={sheet.level ?? 1}
              onIncrement={() =>
                updateSheet((current) => ({
                  ...current,
                  level: Math.min(99, Math.max(1, (current.level ?? 1) + 1)),
                }))
              }
              onDecrement={() =>
                updateSheet((current) => ({
                  ...current,
                  level: Math.max(1, (current.level ?? 1) - 1),
                }))
              }
            />
          </div>
        </section>

        <section className="identity">
          <div className="id-col">
            <div className="field">
              <label htmlFor="character-age">Idade</label>
              <input
                id="character-age"
                type="text"
                placeholder="Anos vividos..."
                value={sheet.identity.age}
                onChange={(event) => updateIdentityField('age', event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="character-job">Profissão</label>
              <input
                id="character-job"
                type="text"
                placeholder="Ofício ou vocação..."
                value={sheet.identity.profession}
                onChange={(event) => updateIdentityField('profession', event.target.value)}
              />
            </div>
          </div>
          <div className="id-col">
            <div className="field">
              <label htmlFor="character-origin">Origem</label>
              <input
                id="character-origin"
                type="text"
                placeholder="Terra natal ou linhagem..."
                value={sheet.identity.origin}
                onChange={(event) => updateIdentityField('origin', event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="character-affiliation">Afiliação</label>
              <input
                id="character-affiliation"
                type="text"
                placeholder="Guilda, facção ou ordem..."
                value={sheet.identity.affiliation}
                onChange={(event) => updateIdentityField('affiliation', event.target.value)}
              />
            </div>
          </div>
          <div className="id-col">
            <div className="field">
              <label htmlFor="character-personality">Personalidade</label>
              <textarea
                id="character-personality"
                rows={4}
                placeholder="Traços, manias, virtudes e defeitos..."
                value={sheet.identity.personality}
                onChange={(event) => updateIdentityField('personality', event.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="vitals-section">
          <div className="section-title">Pontos Vitais</div>
          <div className="vitals-grid">
            <VitalField
              name="Vida"
              symbol="❤"
              className="vital-hp"
              currentValue={sheet.vitals.life.current}
              maxValue={sheet.vitals.life.max}
              onCurrentChange={(value) => updateVital('life', 'current', value)}
              onMaxChange={(value) => updateVital('life', 'max', value)}
            />
            <ArmorClassField
              value={sheet.vitals.armorClass}
              onChange={(value) =>
                updateSheet((current) => ({
                  ...current,
                  vitals: {
                    ...current.vitals,
                    armorClass: value,
                  },
                }))
              }
            />
            <VitalField
              name="Éter"
              symbol="✦"
              className="vital-ether"
              currentValue={sheet.vitals.ether.current}
              maxValue={sheet.vitals.ether.max}
              onCurrentChange={(value) => updateVital('ether', 'current', value)}
              onMaxChange={(value) => updateVital('ether', 'max', value)}
            />
          </div>
        </section>

        <section className="attrs-section">
          <div className="section-title">Atributos</div>
          <div className="attrs-grid">
            {ATTRIBUTE_DEFINITIONS.map((attribute) => (
              <AttributeField
                key={attribute.key}
                label={attribute.label}
                value={sheet.attributes[attribute.key]}
                min={attribute.min}
                max={attribute.max}
                highlighted={attribute.highlighted}
                onChange={(value) => updateAttribute(attribute.key, value)}
              />
            ))}
          </div>
        </section>

        <section className="abilities-section">
          <AbilityListSection
            tagLabel="⬟ Passiva"
            tagClassName="tag-passive"
            addLabel="Adicionar habilidade passiva"
            abilities={sheet.passiveAbilities}
            canAdd={canAddAbility(sheet.passiveAbilities.length, ABILITY_LIMITS.passive)}
            onAdd={() => addAbility('passiveAbilities')}
            onRemove={(id) => removeAbility('passiveAbilities', id)}
            onChange={(id, field, value) =>
              updateAbility('passiveAbilities', id, field, value)
            }
            descriptionPlaceholder="Efeito permanente ou bônus passivo..."
          />
          <AbilityListSection
            tagLabel="⬡ Ativa"
            tagClassName="tag-active"
            addLabel="Adicionar habilidade ativa"
            abilities={sheet.activeAbilities}
            canAdd={canAddAbility(sheet.activeAbilities.length, ABILITY_LIMITS.active)}
            onAdd={() => addAbility('activeAbilities')}
            onRemove={(id) => removeAbility('activeAbilities', id)}
            onChange={(id, field, value) =>
              updateAbility('activeAbilities', id, field, value)
            }
            descriptionPlaceholder="Custo, alcance, efeito e condições..."
          />
        </section>

        <section className="bottom-grid">
          <div className="bottom-col">
            <div className="section-title section-title-left">⚔ Equipamento</div>
            <div className="field">
              <label htmlFor="main-weapon">Arma Principal</label>
              <input
                id="main-weapon"
                type="text"
                value={sheet.equipment.mainWeapon}
                onChange={(event) =>
                  updateEquipmentField('mainWeapon', event.target.value)
                }
              />
            </div>
            <div className="field">
              <label htmlFor="armor">Armadura / Proteção</label>
              <input
                id="armor"
                type="text"
                value={sheet.equipment.armor}
                onChange={(event) => updateEquipmentField('armor', event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="accessory-one">Acessório 1</label>
              <input
                id="accessory-one"
                type="text"
                value={sheet.equipment.accessoryOne}
                onChange={(event) =>
                  updateEquipmentField('accessoryOne', event.target.value)
                }
              />
            </div>
            <div className="field">
              <label htmlFor="accessory-two">Acessório 2</label>
              <input
                id="accessory-two"
                type="text"
                value={sheet.equipment.accessoryTwo}
                onChange={(event) =>
                  updateEquipmentField('accessoryTwo', event.target.value)
                }
              />
            </div>
            <div className="field">
              <label htmlFor="special-item">Item Especial</label>
              <input
                id="special-item"
                type="text"
                value={sheet.equipment.specialItem}
                onChange={(event) =>
                  updateEquipmentField('specialItem', event.target.value)
                }
              />
            </div>
          </div>
          <div className="bottom-col">
            <div className="section-title section-title-left">⊞ Inventário</div>
            <textarea
              aria-label="Inventário"
              rows={10}
              placeholder="Liste os itens carregados, consumíveis, materiais, moedas e relíquias..."
              value={sheet.inventory}
              onChange={(event) =>
                updateSheet((current) => ({
                  ...current,
                  inventory: event.target.value,
                }))
              }
            />
          </div>
        </section>

        <section className="full-section">
          <div className="section-title">Biografia</div>
          <textarea
            aria-label="Biografia"
            rows={6}
            placeholder="A história do personagem — de onde veio, o que viveu, o que o trouxe até aqui..."
            value={sheet.biography}
            onChange={(event) =>
              updateSheet((current) => ({
                ...current,
                biography: event.target.value,
              }))
            }
          />
        </section>

        <footer className="footer">
          ✦ &nbsp; que os dados estejam a seu favor &nbsp; ✦
        </footer>

        <div className="sheet-actions">
          <button
            type="button"
            className="sheet-action-button"
            onClick={() => void downloadPdf()}
            disabled={pdfStatus === 'generating'}
          >
            <FiDownload aria-hidden="true" />
            <span>
              {pdfStatus === 'generating' ? 'Gerando PDF...' : 'Baixar ficha em PDF'}
            </span>
          </button>
          {pdfStatus !== 'idle' && (
            <p className={`sheet-action-status sheet-action-status-${pdfStatus}`}>
              {getPdfStatusLabel(pdfStatus)}
            </p>
          )}
        </div>
      </div>

      <div className="pdf-hidden-export-root" aria-hidden="true">
        <CharacterSheetPdfDocument
          ref={pdfDocumentRef}
          exportWidthMm={PDF_EXPORT_WIDTH_MM}
          sheet={sheet}
        />
      </div>
    </main>
  )
}

function buildPdfFilename(characterName: string) {
  const baseName = characterName.trim() || 'ficha-personagem'

  const normalizedName = baseName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `${normalizedName || 'ficha-personagem'}.pdf`
}

export default App
