import { getContext } from 'svelte'
import type { Plugin, PluginContext, PluginContextName } from '../../../plugins/types'

const pluginContextName: PluginContextName = 'threlte-plugin-context'

export const usePlugins = (args: () => Parameters<Plugin>[0]) => {
  const plugins = getContext<PluginContext | undefined>(pluginContextName)

  if (!plugins) return

  const pluginsProps: string[] = []
  const pluginsArray = Object.values(plugins)

  if (pluginsArray.length > 0) {
    const pluginArgs = args()
    // initalize plugins
    for (let i = 0; i < pluginsArray.length; i++) {
      const plugin = pluginsArray[i]
      // initialize plugin
      const p = plugin(pluginArgs)
      if (p && p.pluginProps) {
        pluginsProps.push(...p.pluginProps)
      }
    }
  }

  return {
    pluginsProps
  }
}
