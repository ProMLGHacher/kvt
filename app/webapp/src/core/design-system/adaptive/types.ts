import { type ReactNode } from 'react'

export type WindowWidthSizeClass = 'compact' | 'medium' | 'expanded' | 'large' | 'extraLarge'
export type WindowHeightSizeClass = 'compact' | 'medium' | 'expanded'

export interface WindowSizeClass {
  width: WindowWidthSizeClass
  height: WindowHeightSizeClass
  widthPx: number
  heightPx: number
}

export type PaneLayoutMode = 'single' | 'stack' | 'dual' | 'triple'
export type CompactPaneBehavior = 'single' | 'stack'

export interface PaneScaffoldDirective {
  mode: PaneLayoutMode
  visiblePaneCount: 1 | 2 | 3
  supportsNavigation: boolean
  widthClass: WindowWidthSizeClass
  heightClass: WindowHeightSizeClass
}

export interface PaneDefinition<TRole extends string> {
  role: TRole
  label: string
  content: ReactNode
}

export interface PaneNavigator<TRole extends string> {
  activePane: TRole
  directive: PaneScaffoldDirective
  windowSizeClass: WindowSizeClass
  navigateTo: (pane: TRole) => void
  navigateBack: () => void
  isPaneVisible: (pane: TRole) => boolean
}
