import { beforeEach, describe, expect, it } from 'vitest'
import { createDefaultCharacterSheet } from '../domain/character-sheet'
import {
  CHARACTER_SHEET_STORAGE_KEY,
  LocalStorageCharacterSheetRepository,
} from './character-sheet-repository'

describe('LocalStorageCharacterSheetRepository', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns a default sheet when storage is empty', async () => {
    const repository = new LocalStorageCharacterSheetRepository(window.localStorage)

    const sheet = await repository.load()

    expect(sheet.level).toBe(1)
    expect(sheet.passiveAbilities).toHaveLength(1)
  })

  it('persists and reads a sheet through localStorage', async () => {
    const repository = new LocalStorageCharacterSheetRepository(window.localStorage)
    const sheet = createDefaultCharacterSheet()

    sheet.identity.name = 'Mira'
    sheet.biography = 'Sobreviveu ao inverno escarlate.'

    await repository.save(sheet)
    const reloadedSheet = await repository.load()

    expect(reloadedSheet.identity.name).toBe('Mira')
    expect(reloadedSheet.biography).toBe('Sobreviveu ao inverno escarlate.')
  })

  it('falls back to a default sheet when storage contains invalid JSON', async () => {
    window.localStorage.setItem(CHARACTER_SHEET_STORAGE_KEY, '{invalid-json}')
    const repository = new LocalStorageCharacterSheetRepository(window.localStorage)

    const sheet = await repository.load()

    expect(sheet.identity.name).toBe('')
    expect(sheet.level).toBe(1)
  })

  it('falls back to a default sheet when storage contains an old schema version', async () => {
    window.localStorage.setItem(
      CHARACTER_SHEET_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 0,
      }),
    )

    const repository = new LocalStorageCharacterSheetRepository(window.localStorage)
    const sheet = await repository.load()

    expect(sheet.schemaVersion).toBe(1)
    expect(sheet.identity.name).toBe('')
  })
})
