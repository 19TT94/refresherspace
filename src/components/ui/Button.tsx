import styled, { css } from 'styled-components'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface StyledButtonProps {
  $variant: ButtonVariant
  $size: ButtonSize
}

const variantStyles = {
  primary: css`
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.tertiary};
    border: 1px solid transparent;

    &:hover:not(:disabled) {
      filter: brightness(0.92);
    }
  `,
  secondary: css`
    background-color: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.text};
    border: 1px solid ${({ theme }) => theme.colors.border};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.surfaceHover};
    }
  `,
  ghost: css`
    background-color: transparent;
    color: ${({ theme }) => theme.colors.muted};
    border: 1px solid transparent;

    &:hover:not(:disabled) {
      color: ${({ theme }) => theme.colors.text};
      background-color: ${({ theme }) => theme.colors.surfaceHover};
    }
  `,
  outline: css`
    background-color: transparent;
    color: ${({ theme }) => theme.colors.primary};
    border: 1px solid ${({ theme }) => theme.colors.primary};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.primarySoft};
    }
  `,
}

const sizeStyles = {
  sm: css`
    min-height: 2.25rem;
    padding: 0.375rem 0.75rem;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  `,
  md: css`
    min-height: 2.5rem;
    padding: 0.5rem 1rem;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  `,
  lg: css`
    min-height: 2.75rem;
    padding: 0.625rem 1.25rem;
    font-size: ${({ theme }) => theme.fontSizes.base};
  `,
}

const StyledButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  border-radius: ${({ theme }) => theme.radii.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    filter 0.15s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ $variant }) => variantStyles[$variant]}
  ${({ $size }) => sizeStyles[$size]}
`

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export const Button = ({
  variant = 'outline',
  size = 'md',
  ...props
}: ButtonProps) => {
  return <StyledButton $variant={variant} $size={size} {...props} />
}
