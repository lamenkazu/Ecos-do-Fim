export const CHARACTER_SHEET_SCHEMA_VERSION = 1

export interface AbilityEntry {
  id: string
  name: string
  description: string
}

export type AbilityLimit = false | number

export interface CharacterSheet {
  schemaVersion: number
  updatedAt: string
  identity: {
    name: string
    age: string
    profession: string
    origin: string
    affiliation: string
    personality: string
  }
  level: number | null
  vitals: {
    life: {
      current: number | null
      max: number | null
    }
    armorClass: number | null
    ether: {
      current: number | null
      max: number | null
    }
  }
  attributes: {
    strength: number | null
    dexterity: number | null
    constitution: number | null
    intelligence: number | null
    charisma: number | null
    totalModifier: number | null
  }
  passiveAbilities: AbilityEntry[]
  activeAbilities: AbilityEntry[]
  equipment: {
    mainWeapon: string
    armor: string
    accessoryOne: string
    accessoryTwo: string
    specialItem: string
  }
  inventory: string
  biography: string
}

export type IdentityFieldKey = keyof CharacterSheet['identity']
export type AttributeKey = keyof CharacterSheet['attributes']

export const ABILITY_LIMITS = {
  passive: false,
  active: false,
} satisfies Record<'passive' | 'active', AbilityLimit>

export const ATTRIBUTE_DEFINITIONS: Array<{
  key: AttributeKey
  label: string
  min: number
  max: number
  highlighted?: boolean
}> = [
  { key: 'strength', label: 'Força', min: 0, max: 99 },
  { key: 'dexterity', label: 'Destreza', min: 0, max: 99 },
  { key: 'constitution', label: 'Constituição', min: 0, max: 99 },
  { key: 'intelligence', label: 'Inteligência', min: 0, max: 99 },
  { key: 'charisma', label: 'Carisma', min: 0, max: 99 },
  { key: 'totalModifier', label: 'Mod. Total', min: -99, max: 99, highlighted: true },
]

export function createAbilityEntry(): AbilityEntry {
  return {
    id: createId(),
    name: '',
    description: '',
  }
}

export function canAddAbility(
  currentCount: number,
  limit: AbilityLimit,
) {
  if (limit === false) {
    return true
  }

  return currentCount < limit
}

export function createDefaultCharacterSheet(): CharacterSheet {
  return {
    schemaVersion: CHARACTER_SHEET_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    identity: {
      name: '',
      age: '',
      profession: '',
      origin: '',
      affiliation: '',
      personality: '',
    },
    level: 1,
    vitals: {
      life: {
        current: null,
        max: null,
      },
      armorClass: null,
      ether: {
        current: null,
        max: null,
      },
    },
    attributes: {
      strength: null,
      dexterity: null,
      constitution: null,
      intelligence: null,
      charisma: null,
      totalModifier: null,
    },
    passiveAbilities: [createAbilityEntry()],
    activeAbilities: [createAbilityEntry()],
    equipment: {
      mainWeapon: '',
      armor: '',
      accessoryOne: '',
      accessoryTwo: '',
      specialItem: '',
    },
    inventory: '',
    biography: '',
  }
}

export function normalizeCharacterSheet(value: unknown): CharacterSheet | null {
  if (!isRecord(value)) {
    return null
  }

  if (value.schemaVersion !== CHARACTER_SHEET_SCHEMA_VERSION) {
    return null
  }

  const defaultSheet = createDefaultCharacterSheet()
  const identity = isRecord(value.identity) ? value.identity : null
  const vitals = isRecord(value.vitals) ? value.vitals : null
  const life = vitals && isRecord(vitals.life) ? vitals.life : null
  const ether = vitals && isRecord(vitals.ether) ? vitals.ether : null
  const attributes = isRecord(value.attributes) ? value.attributes : null
  const equipment = isRecord(value.equipment) ? value.equipment : null
  const passiveAbilities = normalizeAbilities(value.passiveAbilities)
  const activeAbilities = normalizeAbilities(value.activeAbilities)

  if (!identity || !vitals || !life || !ether || !attributes || !equipment) {
    return null
  }

  return {
    schemaVersion: CHARACTER_SHEET_SCHEMA_VERSION,
    updatedAt:
      typeof value.updatedAt === 'string'
        ? value.updatedAt
        : defaultSheet.updatedAt,
    identity: {
      name: normalizeString(identity.name),
      age: normalizeString(identity.age),
      profession: normalizeString(identity.profession),
      origin: normalizeString(identity.origin),
      affiliation: normalizeString(identity.affiliation),
      personality: normalizeString(identity.personality),
    },
    level: normalizeNullableNumber(value.level),
    vitals: {
      life: {
        current: normalizeNullableNumber(life.current),
        max: normalizeNullableNumber(life.max),
      },
      armorClass: normalizeNullableNumber(vitals.armorClass),
      ether: {
        current: normalizeNullableNumber(ether.current),
        max: normalizeNullableNumber(ether.max),
      },
    },
    attributes: {
      strength: normalizeNullableNumber(attributes.strength),
      dexterity: normalizeNullableNumber(attributes.dexterity),
      constitution: normalizeNullableNumber(attributes.constitution),
      intelligence: normalizeNullableNumber(attributes.intelligence),
      charisma: normalizeNullableNumber(attributes.charisma),
      totalModifier: normalizeNullableNumber(attributes.totalModifier),
    },
    passiveAbilities: passiveAbilities.length > 0 ? passiveAbilities : defaultSheet.passiveAbilities,
    activeAbilities: activeAbilities.length > 0 ? activeAbilities : defaultSheet.activeAbilities,
    equipment: {
      mainWeapon: normalizeString(equipment.mainWeapon),
      armor: normalizeString(equipment.armor),
      accessoryOne: normalizeString(equipment.accessoryOne),
      accessoryTwo: normalizeString(equipment.accessoryTwo),
      specialItem: normalizeString(equipment.specialItem),
    },
    inventory: normalizeString(value.inventory),
    biography: normalizeString(value.biography),
  }
}

function normalizeAbilities(value: unknown): AbilityEntry[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.flatMap((entry) => {
    if (!isRecord(entry)) {
      return []
    }

    const id = typeof entry.id === 'string' && entry.id !== '' ? entry.id : createId()

    return [
      {
        id,
        name: normalizeString(entry.name),
        description: normalizeString(entry.description),
      },
    ]
  })
}

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function normalizeNullableNumber(value: unknown) {
  if (value === null) {
    return null
  }

  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `ability-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}
