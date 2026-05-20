import { Path, Circle, Rect } from 'react-native-svg'
import { IconBase } from './IconBase'

type IconProps = {
  size?: number
  color?: string
}

export function IconTabForms({ size = 20, color = '#000' }: IconProps) {
  return (
    <IconBase size={size} color={color}>
      <Path d="M9 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <Rect x="9" y="3" width="6" height="4" rx="1" />
      <Path d="M9 12h6" />
      <Path d="M9 16h4" />
    </IconBase>
  )
}

export function IconClock({ size = 20, color = '#000' }: IconProps) {
  return (
    <IconBase size={size} color={color}>
      <Circle cx="12" cy="12" r="6" />
      <Path d="M12 8v4l3 2" />
    </IconBase>
  )
}

export function IconQR({ size = 20, color = '#000' }: IconProps) {
  return (
    <IconBase size={size} color={color}>
      <Path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <Path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <Path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <Path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <Rect x="7" y="7" width="10" height="10" rx="1" />
    </IconBase>
  )
}

export function IconTabScan({ size = 20, color = '#000' }: IconProps) {
  return (
    <IconBase size={size} color={color}>
      <Path d="M4.5 9V6.5A2 2 0 0 1 6.5 4.5H9" />
      <Path d="M15 4.5h2.5a2 2 0 0 1 2 2V9" />
      <Path d="M19.5 15v2.5a2 2 0 0 1-2 2H15" />
      <Path d="M9 19.5H6.5a2 2 0 0 1-2-2V15" />
      <Path d="M8.5 12h7" />
    </IconBase>
  )
}

export function IconTabSettings({ size = 20, color = '#000' }: IconProps) {
  return (
    <IconBase size={size} color={color}>
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19 12a7 7 0 0 0-.07-.98l2.02-1.57-1.9-3.3-2.43.86a7.04 7.04 0 0 0-1.7-.98l-.37-2.55h-3.8l-.37 2.55c-.6.22-1.17.54-1.7.98l-2.43-.86-1.9 3.3 2.02 1.57A7 7 0 0 0 5 12c0 .33.02.66.07.98l-2.02 1.57 1.9 3.3 2.43-.86c.53.44 1.1.76 1.7.98l.37 2.55h3.8l.37-2.55c.6-.22 1.17-.54 1.7-.98l2.43.86 1.9-3.3-2.02-1.57c.05-.32.07-.65.07-.98Z" />
    </IconBase>
  )
}

export function IconSync({ size = 20, color = '#000' }: IconProps) {
  return (
    <IconBase size={size} color={color}>
      <Path d="M21 2v6h-6" />
      <Path d="M3 12a9 9 0 0 1 15.4-5.9L21 8" />
      <Path d="M3 22v-6h6" />
      <Path d="M21 12a9 9 0 0 1-15.4 5.9L3 16" />
    </IconBase>
  )
}

export function IconTrash({ size = 20, color = '#a3a3a3' }: IconProps) {
  return (
    <IconBase size={size} color={color}>
      <Path d="M3 6h18" />
      <Path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <Path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    </IconBase>
  )
}

export function IconCheck({ size = 20, color = '#22c55e' }: IconProps) {
  return (
    <IconBase size={size} color={color}>
      <Path d="m7 12.5 3 3 7-7" />
    </IconBase>
  )
}

export function IconGrid({ size = 20, color = '#a3a3a3' }: IconProps) {
  return (
    <IconBase size={size} color={color}>
      <Rect x="4" y="4" width="6" height="6" rx="1" />
      <Rect x="14" y="4" width="6" height="6" rx="1" />
      <Rect x="4" y="14" width="6" height="6" rx="1" />
      <Rect x="14" y="14" width="6" height="6" rx="1" />
    </IconBase>
  )
}
