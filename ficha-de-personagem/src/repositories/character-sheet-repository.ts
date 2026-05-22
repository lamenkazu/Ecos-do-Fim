import {
  createDefaultCharacterSheet,
  normalizeCharacterSheet,
} from '../domain/character-sheet'
import type { CharacterSheet } from '../domain/character-sheet'

export const CHARACTER_SHEET_STORAGE_KEY = 'character-sheet:v1'

export interface CharacterSheetRepository {
  load(): Promise<CharacterSheet>
  save(sheet: CharacterSheet): Promise<void>
}

export class LocalStorageCharacterSheetRepository
  implements CharacterSheetRepository
{
  constructor(
    private readonly storage: Storage = window.localStorage,
    private readonly storageKey: string = CHARACTER_SHEET_STORAGE_KEY,
  ) {}

  async load(): Promise<CharacterSheet> {
    try {
      const rawValue = this.storage.getItem(this.storageKey)

      if (!rawValue) {
        return createDefaultCharacterSheet()
      }

      const parsedValue = JSON.parse(rawValue) as unknown
      const normalizedSheet = normalizeCharacterSheet(parsedValue)

      return normalizedSheet ?? createDefaultCharacterSheet()
    } catch {
      return createDefaultCharacterSheet()
    }
  }

  async save(sheet: CharacterSheet): Promise<void> {
    this.storage.setItem(this.storageKey, JSON.stringify(sheet))
  }
}
