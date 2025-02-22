import { useEffect, useState } from 'react';

const remoteReaderOptions = {
  enabled: false,
  accessedWebView: false,
  changeCallbacks: [] as (() => void)[],
};
export const remoteReader = {
  enable() {
    remoteReaderOptions.enabled = true;
    remoteReaderOptions.accessedWebView = false;
    remoteReaderOptions.changeCallbacks.forEach(cb => cb());
  },
  disable() {
    remoteReaderOptions.enabled = false;
    remoteReaderOptions.changeCallbacks.forEach(cb => cb());
  },
  isEnabled() {
    return remoteReaderOptions.enabled;
  },
  onChange(cb: () => void) {
    remoteReaderOptions.changeCallbacks.push(cb);
    return () => {
      remoteReaderOptions.changeCallbacks =
        remoteReaderOptions.changeCallbacks.filter(c => c !== cb);
    };
  },
  accessedWebView() {
    remoteReaderOptions.accessedWebView = true;
    remoteReaderOptions.changeCallbacks.forEach(cb => cb());
  },
};

export function useRemoteReader() {
  let [enabled, setEnabled] = useState(remoteReaderOptions.enabled);
  let [accessed, setAccessed] = useState(remoteReaderOptions.accessedWebView);

  useEffect(() => {
    return remoteReader.onChange(() => {
      setEnabled(remoteReaderOptions.enabled);
      setAccessed(remoteReaderOptions.accessedWebView);
    });
  }, []);

  return { enabled, accessed };
}
