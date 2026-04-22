import { useMemo, useState } from 'react'
import { createPaneScaffoldDirective, type PaneDirectiveOptions } from './pane-layout'
import { type PaneNavigator } from './types'
import { useWindowSizeClass } from './use-window-size-class'

export function usePaneNavigator<TRole extends string>(
  roles: readonly TRole[],
  options: PaneDirectiveOptions & { initialPane?: TRole }
): PaneNavigator<TRole> {
  const windowSizeClass = useWindowSizeClass()
  const directive = createPaneScaffoldDirective(windowSizeClass, options)
  const [activePane, setActivePane] = useState<TRole>(options.initialPane ?? roles[0])

  return useMemo(
    () => ({
      activePane,
      directive,
      windowSizeClass,
      navigateTo: setActivePane,
      navigateBack: () => setActivePane(roles[0]),
      isPaneVisible: (pane: TRole) => directive.mode !== 'single' || pane === activePane
    }),
    [activePane, directive, roles, windowSizeClass]
  )
}
