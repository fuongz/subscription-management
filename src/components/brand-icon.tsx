import {
  siNetflix,
  siYoutube,
  siAnthropic,
  si1password,
  siDuolingo,
  siIcloud,
  siGoogle,
  siCloudflareworkers,
  siGithubcopilot,
  siGooglegemini,
} from 'simple-icons'

const icons: Record<string, { svg: string; hex: string }> = {
  netflix: siNetflix,
  youtube: siYoutube,
  anthropic: siAnthropic,
  '1password': si1password,
  duolingo: siDuolingo,
  icloud: siIcloud,
  google: siGoogle,
  cloudflareworkers: siCloudflareworkers,
  githubcopilot: siGithubcopilot,
  googlegemini: siGooglegemini,
}

interface BrandIconProps {
  slug: string
  size?: number
  className?: string
  /** Override color. If not set, uses the brand's official color. */
  color?: string
}

export function BrandIcon({ slug, size = 24, className, color }: BrandIconProps) {
  const icon = icons[slug]
  if (!icon) {
    return null
  }

  // Extract the inner SVG content (everything between <svg> and </svg>)
  const innerContent = icon.svg.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '')

  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill={color || `#${icon.hex}`}
      className={className}
      dangerouslySetInnerHTML={{ __html: innerContent }}
    />
  )
}
