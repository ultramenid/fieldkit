import Svg, { SvgProps } from 'react-native-svg'
import { TOKENS } from '../theme/tokens'

type IconBaseProps = SvgProps & {
  size?: number
  color?: string
}

export function IconBase({
  size = 20,
  color = TOKENS.colors.black,
  children,
  ...rest
}: IconBaseProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </Svg>
  )
}
