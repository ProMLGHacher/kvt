import {
  type WindowHeightSizeClass,
  type WindowSizeClass,
  type WindowWidthSizeClass
} from './types'

/**
 * CSS pixels are the web equivalent we use for Android dp breakpoints.
 * The names intentionally mirror Android adaptive guidance.
 */
export function classifyWindowWidth(widthPx: number): WindowWidthSizeClass {
  if (widthPx < 600) return 'compact'
  if (widthPx < 840) return 'medium'
  if (widthPx < 1200) return 'expanded'
  if (widthPx < 1600) return 'large'
  return 'extraLarge'
}

export function classifyWindowHeight(heightPx: number): WindowHeightSizeClass {
  if (heightPx < 480) return 'compact'
  if (heightPx < 900) return 'medium'
  return 'expanded'
}

export function createWindowSizeClass(widthPx: number, heightPx: number): WindowSizeClass {
  return {
    width: classifyWindowWidth(widthPx),
    height: classifyWindowHeight(heightPx),
    widthPx,
    heightPx
  }
}

export function isMultiPaneWidth(widthClass: WindowWidthSizeClass) {
  return widthClass !== 'compact'
}
