import { describe, expect, it } from 'vitest'
import {
  ABILITY_LIMITS,
  CHARACTER_SHEET_SCHEMA_VERSION,
  canAddAbility,
  createDefaultCharacterSheet,
  normalizeCharacterSheet,
} from './character-sheet'

describe('createDefaultCharacterSheet', () => {
  it('creates a consistent initial character sheet', () => {
    const sheet = createDefaultCharacterSheet()

    expect(sheet.schemaVersion).toBe(CHARACTER_SHEET_SCHEMA_VERSION)
    expect(sheet.level).toBe(1)
    expect(sheet.passiveAbilities).toHaveLength(1)
    expect(sheet.activeAbilities).toHaveLength(1)
    expect(sheet.passiveAbilities[0]?.id).toBeTruthy()
    expect(sheet.activeAbilities[0]?.id).toBeTruthy()
  })
})

describe('normalizeCharacterSheet', () => {
  it('returns null for incompatible schema versions', () => {
    expect(
      normalizeCharacterSheet({
        schemaVersion: 0,
      }),
    ).toBeNull()
  })
})

describe('ability limits', () => {
  it('keeps abilities unlimited when limit is false', () => {
    expect(ABILITY_LIMITS.passive).toBe(false)
    expect(canAddAbility(999, false)).toBe(true)
  })

  it('respects a numeric limit when one is configured', () => {
    expect(canAddAbility(2, 3)).toBe(true)
    expect(canAddAbility(3, 3)).toBe(false)
  })
})
