import { NativeModules } from 'react-native';

interface PluginManagerInterface {
  createJsContext: () => Promise<ContextId>;
  eval: (id: ContextId, code: string) => Promise<string>;
}

type ContextId = string;

const { PluginManager } = NativeModules;

export default PluginManager as PluginManagerInterface;
