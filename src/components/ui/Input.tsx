import styled, { css } from 'styled-components'

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`

const Label = styled.label`
  min-height: 1.25rem;
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.muted};
`

const fieldBase = css`
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

const StyledInput = styled.input`
  ${fieldBase}
`

const StyledTextarea = styled.textarea`
  ${fieldBase}
  min-height: 5rem;
  resize: vertical;
  line-height: 1.45;
`

const ErrorText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.danger};
  margin: 0;
`

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = ({ label, error, id, ...props }: InputProps) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <FieldGroup>
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <StyledInput id={inputId} {...props} />
      {error && <ErrorText>{error}</ErrorText>}
    </FieldGroup>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = ({ label, error, id, ...props }: TextareaProps) => {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <FieldGroup>
      {label && <Label htmlFor={textareaId}>{label}</Label>}
      <StyledTextarea id={textareaId} {...props} />
      {error && <ErrorText>{error}</ErrorText>}
    </FieldGroup>
  )
}
