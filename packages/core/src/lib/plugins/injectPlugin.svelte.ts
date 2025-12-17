import { getContext, setContext } from 'svelte'
import { type AnyProps, type Plugin } from './types.js'

export interface PluginContext {
  plugins: Record<string, Plugin<AnyProps>>
  pluginValues: Plugin<AnyProps>[]
  set(name: string, plugin: Plugin): void
}

export const pluginContextKey = 'threlte-plugin-context'

const createPluginContext = (): PluginContext => {
  const plugins: PluginContext['plugins'] = {}
  let pluginValues: Plugin[] = []

  return {
    set(name: string, plugin: Plugin) {
      plugins[name] = plugin
      pluginValues.push(plugin)
    },
    get plugins() {
      return plugins
    },
    get pluginValues() {
      return pluginValues
    }
  }
}

export function injectPlugin<Props extends AnyProps = AnyProps>(
  name: string,
  plugin: Plugin<Props>
): void {
  if (!plugin) return

  const context = getContext<PluginContext | undefined>(pluginContextKey) ?? createPluginContext()

  context.set(name, plugin as Plugin)

  setContext<PluginContext>(pluginContextKey, context)
}
