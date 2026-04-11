import logoSrc from '../images/logo.png'
import { cn } from '../utils/helpers'

interface BrandLogoProps {
  alt?: string
  className?: string
}

export function BrandLogo({ alt = "XON's Garden logo", className }: BrandLogoProps) {
  return (
    <img
      alt={alt}
      className={cn('block h-12 w-auto max-w-full select-none object-contain', className)}
      draggable={false}
      src={logoSrc}
    />
  )
}
