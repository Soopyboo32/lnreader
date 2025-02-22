import { NativeEventEmitter, NativeModules } from 'react-native';

interface WebServerNative {
  createWebServer: (port: number) => Promise<WebServerId>;
  respondToRequest: (
    requestId: string,
    response: HttpResponse,
  ) => Promise<void>;
  stopWebServer: (id: WebServerId) => Promise<void>;
  getLocalIpAddress: () => Promise<string>;
}

export interface WebServer {
  stop: () => Promise<void>;
}

export type HttpRequest = {
  path: string;
  method: string;
  headers: Record<string, string>;
  body: string;
};

export type HttpResponse = {
  body: string;
  statusCode: string;
  headers: Record<string, string>;
};

type WebServerId = string;

const { WebServer: WebServerNative } = NativeModules as {
  WebServer: WebServerNative;
};

const contextToHandler = new Map();
const usedPorts = new Set<number>();

export const WebServer = {
  createServer: async (
    port: number,
    reqHandler: (req: HttpRequest) => Promise<HttpResponse>,
  ): Promise<WebServer> => {
    const startTime = Date.now();
    //wait up to 1s for port to be free
    while (usedPorts.has(port)) {
      if (Date.now() - startTime > 1000) {
        throw new Error('Port ' + port + ' is already in use!');
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    usedPorts.add(port);
    let webServerId = await WebServerNative.createWebServer(port);
    contextToHandler.set(
      webServerId,
      async (
        requestId: string,
        method: string,
        path: string,
        headers: Record<string, string>,
        body: string,
      ) => {
        let response;
        try {
          response = await reqHandler({
            path,
            method,
            headers,
            body,
          });
        } catch (e) {
          console.error(e);
          response = {
            statusCode: '500 Internal Server Error',
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
            },
            body: 'An internal server error occurred. Please try again later.',
          };
        }

        await WebServerNative.respondToRequest(requestId, response);
      },
    );
    return {
      stop: async () => {
        await WebServerNative.stopWebServer(webServerId);
        usedPorts.delete(port);
      },
    };
  },
  getLocalIpAddress: async (): Promise<string> => {
    return await WebServerNative.getLocalIpAddress();
  },
};

const eventEmitter = new NativeEventEmitter(NativeModules.PluginManager);
eventEmitter.addListener('HttpServerRequest', event => {
  contextToHandler.get(event.serverId)(
    event.requestId,
    event.method,
    event.path,
    event.headers,
    event.body,
  );
});
