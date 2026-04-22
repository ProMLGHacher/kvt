import { type CompactPaneBehavior, type PaneScaffoldDirective, type WindowSizeClass } from './types'
import { isMultiPaneWidth } from './window-size'

export interface PaneDirectiveOptions {
  paneCount: 2 | 3
  compactBehavior?: CompactPaneBehavior
}

export function createPaneScaffoldDirective(
  windowSizeClass: WindowSizeClass,
  { paneCount, compactBehavior = 'single' }: PaneDirectiveOptions
): PaneScaffoldDirective {
  if (windowSizeClass.height === 'compact') {
    return createSinglePaneDirective(windowSizeClass)
  }

  if (!isMultiPaneWidth(windowSizeClass.width)) {
    return compactBehavior === 'stack'
      ? createStackPaneDirective(windowSizeClass, paneCount)
      : createSinglePaneDirective(windowSizeClass)
  }

  if (paneCount === 3 && ['large', 'extraLarge'].includes(windowSizeClass.width)) {
    return {
      mode: 'triple',
      visiblePaneCount: 3,
      supportsNavigation: false,
      widthClass: windowSizeClass.width,
      heightClass: windowSizeClass.height
    }
  }

  return {
    mode: 'dual',
    visiblePaneCount: 2,
    supportsNavigation: false,
    widthClass: windowSizeClass.width,
    heightClass: windowSizeClass.height
  }
}

function createSinglePaneDirective(windowSizeClass: WindowSizeClass): PaneScaffoldDirective {
  return {
    mode: 'single',
    visiblePaneCount: 1,
    supportsNavigation: true,
    widthClass: windowSizeClass.width,
    heightClass: windowSizeClass.height
  }
}

function createStackPaneDirective(
  windowSizeClass: WindowSizeClass,
  paneCount: 2 | 3
): PaneScaffoldDirective {
  return {
    mode: 'stack',
    visiblePaneCount: paneCount,
    supportsNavigation: false,
    widthClass: windowSizeClass.width,
    heightClass: windowSizeClass.height
  }
}
