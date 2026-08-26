import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import styled from 'styled-components'

export interface SearchSelectOption {
  value: string
  label: string
  /** Extra text matched by the filter (not shown in the list). */
  keywords?: string
}

interface SearchSelectProps {
  label?: string
  help?: ReactNode
  placeholder?: string
  value: string
  options: SearchSelectOption[]
  onChange: (value: string) => void
  /** When set, choosing a list option reports the option instead of writing its label into the field. */
  onSelectOption?: (option: SearchSelectOption) => void
  allowCreate?: boolean
  emptyMessage?: string
  menuSize?: 'md' | 'lg'
}

export const SearchSelect = ({
  label,
  help,
  placeholder,
  value,
  options,
  onChange,
  onSelectOption,
  allowCreate = true,
  emptyMessage = 'No options',
  menuSize = 'md',
}: SearchSelectProps) => {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    const query = value.trim().toLowerCase()
    if (!query) return options
    return options.filter((option) => {
      const haystack = `${option.label} ${option.keywords ?? ''}`.toLowerCase()
      return haystack.includes(query)
    })
  }, [options, value])

  const exactMatch = useMemo(() => {
    const query = value.trim().toLowerCase()
    if (!query) return undefined
    return options.find((option) => option.label.toLowerCase() === query)
  }, [options, value])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  const fieldId = label?.toLowerCase().replace(/\s+/g, '-')

  const selectOption = (option: SearchSelectOption) => {
    if (onSelectOption) {
      onSelectOption(option)
    } else {
      onChange(option.label)
    }
    setOpen(false)
  }

  return (
    <FieldGroup ref={rootRef} $menuOpen={open}>
      {(label || help) && (
        <LabelRow>
          {label && <Label htmlFor={fieldId}>{label}</Label>}
          {help}
        </LabelRow>
      )}
      <Input
        id={fieldId}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        placeholder={placeholder}
        value={value}
        onChange={(event) => {
          onChange(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />
      {open && (
        <Menu id={listId} role="listbox" $size={menuSize}>
          {filtered.map((option) => (
            <OptionButton
              key={option.value}
              type="button"
              role="option"
              $size={menuSize}
              onPointerDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
                selectOption(option)
              }}
            >
              {option.label}
            </OptionButton>
          ))}
          {allowCreate && value.trim().length > 0 && !exactMatch && (
            <OptionButton
              type="button"
              role="option"
              $size={menuSize}
              onPointerDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onChange(value.trim())
                setOpen(false)
              }}
            >
              Create “{value.trim()}”
            </OptionButton>
          )}
          {filtered.length === 0 &&
            !(allowCreate && value.trim().length > 0) && (
              <EmptyState $size={menuSize}>{emptyMessage}</EmptyState>
            )}
        </Menu>
      )}
    </FieldGroup>
  )
}

const FieldGroup = styled.div<{ $menuOpen: boolean }>`
  position: relative;
  z-index: ${({ $menuOpen }) => ($menuOpen ? 5 : 'auto')};
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
  min-height: 1.25rem;
`

const Label = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.muted};
`

const Input = styled.input`
  width: 100%;
  min-height: 2.5rem;
  padding: 0.625rem 0.875rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBg};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};

  &::placeholder {
    color: ${({ theme }) => theme.colors.muted};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.focus};
  }
`

const Menu = styled.div<{ $size: 'md' | 'lg' }>`
  position: absolute;
  z-index: 20;
  top: calc(100% + 0.25rem);
  left: 0;
  right: 0;
  max-height: ${({ $size }) => ($size === 'lg' ? 'min(70vh, 32rem)' : '14rem')};
  overflow: auto;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.card};
`

const OptionButton = styled.button<{ $size: 'md' | 'lg' }>`
  display: block;
  width: 100%;
  padding: ${({ $size }) =>
    $size === 'lg' ? '0.875rem 1rem' : '0.625rem 0.875rem'};
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ $size, theme }) =>
    $size === 'lg' ? theme.fontSizes.base : theme.fontSizes.sm};
  line-height: 1.4;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`

const EmptyState = styled.p<{ $size: 'md' | 'lg' }>`
  margin: 0;
  padding: ${({ $size }) => ($size === 'lg' ? '1rem' : '0.75rem 0.875rem')};
  font-size: ${({ $size, theme }) =>
    $size === 'lg' ? theme.fontSizes.base : theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
`
