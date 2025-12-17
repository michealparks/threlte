import { getContext } from 'svelte'
import { type Plugin } from '../../../plugins/types.js'
import { type PluginContext, pluginContextKey } from '../../../plugins/injectPlugin.svelte.js'

export const usePlugins = (args: Parameters<Plugin>[0]) => {
  const context = getContext<PluginContext | undefined>(pluginContextKey)

  if (!context?.plugins || context.pluginValues.length === 0) {
    return
  }

  const pluginsProps: string[] = []
  const { pluginValues } = context

  const pluginArgs = args()

  // initalize plugins
  for (let i = 0, l = pluginValues.length; i < l; i++) {
    const plugin = pluginValues[i]

    // initialize plugin
    const p = plugin(pluginArgs)
    if (p?.pluginProps) {
      pluginsProps.push(...p.pluginProps)
    }
  }

  return {
    pluginsProps
  }
}
