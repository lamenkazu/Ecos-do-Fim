import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import {
  CHARACTER_SHEET_STORAGE_KEY,
  LocalStorageCharacterSheetRepository,
} from './repositories/character-sheet-repository'

const html2pdfMock = vi.hoisted(() => {
  const save = vi.fn().mockResolvedValue(undefined)
  const from = vi.fn(() => ({ save }))
  const set = vi.fn(() => ({ from }))
  const factory = vi.fn(() => ({ set }))

  return { factory, from, save, set }
})

vi.mock(
  'html2pdf.js',
  () => ({
    default: html2pdfMock.factory,
  }),
)

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear()
    html2pdfMock.factory.mockClear()
    html2pdfMock.from.mockClear()
    html2pdfMock.save.mockClear()
    html2pdfMock.set.mockClear()
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  it('edits and persists base character fields', async () => {
    const user = userEvent.setup()
    const repository = new LocalStorageCharacterSheetRepository(window.localStorage)

    render(<App repository={repository} />)

    const nameInput = screen.getByLabelText('Nome do Personagem')
    const biographyInput = screen.getByLabelText('Biografia')
    const lifeCurrentInput = screen.getByLabelText('Vida atual')
    const etherMaxInput = screen.getByLabelText('Éter máximo')

    await user.clear(nameInput)
    await user.type(nameInput, 'Alya')
    await user.type(biographyInput, 'Cronista dos ecos antigos.')
    await user.type(lifeCurrentInput, '37')
    await user.type(etherMaxInput, '12')

    await waitFor(() => {
      const persisted = JSON.parse(
        window.localStorage.getItem(CHARACTER_SHEET_STORAGE_KEY) ?? '{}',
      ) as {
        identity?: { name?: string }
        biography?: string
        vitals?: { life?: { current?: number }; ether?: { max?: number } }
      }

      expect(persisted.identity?.name).toBe('Alya')
      expect(persisted.biography).toBe('Cronista dos ecos antigos.')
      expect(persisted.vitals?.life?.current).toBe(37)
      expect(persisted.vitals?.ether?.max).toBe(12)
    })
  })

  it('adds and removes abilities dynamically', async () => {
    const user = userEvent.setup()
    const repository = new LocalStorageCharacterSheetRepository(window.localStorage)

    render(<App repository={repository} />)

    const addPassiveButton = screen.getByRole('button', {
      name: 'Adicionar habilidade passiva',
    })

    await user.click(addPassiveButton)

    expect(screen.getAllByText('Nome da Habilidade')).toHaveLength(3)

    const removeButtons = screen.getAllByRole('button', { name: /Remover habilidade/ })
    await user.click(removeButtons[0]!)

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /Remover habilidade/ })).toHaveLength(2)
    })
  })

  it('loads persisted data again after remount', async () => {
    const user = userEvent.setup()
    const repository = new LocalStorageCharacterSheetRepository(window.localStorage)

    const firstRender = render(<App repository={repository} />)
    const nameInput = screen.getByLabelText('Nome do Personagem')

    await user.clear(nameInput)
    await user.type(nameInput, 'Theron')

    await waitFor(() => {
      const persisted = JSON.parse(
        window.localStorage.getItem(CHARACTER_SHEET_STORAGE_KEY) ?? '{}',
      ) as { identity?: { name?: string } }

      expect(persisted.identity?.name).toBe('Theron')
    })

    firstRender.unmount()
    render(<App repository={repository} />)

    await waitFor(() => {
      expect(screen.getByLabelText('Nome do Personagem')).toHaveValue('Theron')
    })
  })

  it('increments, decrements, and persists level changes', async () => {
    const user = userEvent.setup()
    const repository = new LocalStorageCharacterSheetRepository(window.localStorage)

    render(<App repository={repository} />)

    expect(document.querySelector('.level-value-display')).toHaveTextContent('1')

    await user.click(screen.getByRole('button', { name: /Subir para o nível 2/ }))
    await waitFor(() => {
      expect(document.querySelector('.level-value-display')).toHaveTextContent('2')
    })

    await waitFor(() => {
      const persisted = JSON.parse(
        window.localStorage.getItem(CHARACTER_SHEET_STORAGE_KEY) ?? '{}',
      ) as { level?: number }

      expect(persisted.level).toBe(2)
    })

    await user.click(screen.getByRole('button', { name: /Descer para o nível 1/ }))
    await waitFor(() => {
      expect(document.querySelector('.level-value-display')).toHaveTextContent('1')
    })

    await waitFor(() => {
      const persisted = JSON.parse(
        window.localStorage.getItem(CHARACTER_SHEET_STORAGE_KEY) ?? '{}',
      ) as { level?: number }

      expect(persisted.level).toBe(1)
    })
  })

  it('downloads the expanded sheet as a pdf document', async () => {
    const user = userEvent.setup()
    const repository = new LocalStorageCharacterSheetRepository(window.localStorage)

    render(<App repository={repository} />)

    const nameInput = screen.getByLabelText('Nome do Personagem')
    const biographyInput = screen.getByLabelText('Biografia')

    await user.clear(nameInput)
    await user.type(nameInput, 'Álya dos Ecos')
    await user.type(biographyInput, 'Linha um da cronista.\nLinha dois sem cortes.')

    await user.click(
      screen.getByRole('button', { name: 'Baixar ficha em PDF' }),
    )

    await waitFor(() => {
      expect(html2pdfMock.factory).toHaveBeenCalledTimes(1)
      expect(html2pdfMock.set).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: 'alya-dos-ecos.pdf',
        }),
      )
      expect(html2pdfMock.from).toHaveBeenCalledTimes(1)
      expect(html2pdfMock.save).toHaveBeenCalledTimes(1)
    })

    const firstFromCall = html2pdfMock.from.mock.calls[0]

    if (!firstFromCall) {
      throw new Error('html2pdf.from should have been called once.')
    }

    const pdfElement = firstFromCall[0]

    expect(pdfElement).toBeInstanceOf(HTMLDivElement)
    expect(pdfElement).toHaveTextContent('Álya dos Ecos')
    expect(pdfElement).toHaveTextContent('Linha um da cronista.')
    expect(pdfElement).toHaveTextContent('Linha dois sem cortes.')
  })
})
