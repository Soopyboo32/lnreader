import { useEffect, useState } from 'react';

const remoteReaderOptions = {
  enabled: false,
  changeCallbacks: [] as (() => void)[],
};
export const remoteReader = {
  enable: () => {
    remoteReaderOptions.enabled = true;
    remoteReaderOptions.changeCallbacks.forEach(cb => cb());
  },
  disable: () => {
    remoteReaderOptions.enabled = false;
    remoteReaderOptions.changeCallbacks.forEach(cb => cb());
  },
  isEnabled: () => {
    return remoteReaderOptions.enabled;
  },
  onChange: (cb: () => void) => {
    remoteReaderOptions.changeCallbacks.push(cb);
    return () => {
      remoteReaderOptions.changeCallbacks =
        remoteReaderOptions.changeCallbacks.filter(c => c !== cb);
    };
  },
};

export function useRemoteReaderEnabled() {
  let [enabled, setEnabled] = useState(remoteReaderOptions.enabled);

  useEffect(() => {
    return remoteReader.onChange(() => {
      setEnabled(remoteReaderOptions.enabled);
    });
  }, []);

  return enabled;
}
