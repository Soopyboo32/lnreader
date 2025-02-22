import { HttpRequest, HttpResponse } from '@native/WebServer';
import { ServerState } from '@screens/reader/remote/remoteReaderServer';
import { indexHtml } from '@screens/reader/remote/endpoint/indexHtml';
import { loadingJson } from '@screens/reader/remote/endpoint/loadingJson';
import { serveAsset } from '@screens/reader/remote/endpoint/serveAsset';

export const serverEndpoints = {
  '/': indexHtml,
  '/loading.json': loadingJson,
  //Asset files
  '/js/core.js': serveAsset,
  '/js/icons.js': serveAsset,
  '/js/index.js': serveAsset,
  '/js/text-vibe.js': serveAsset,
  '/js/van.js': serveAsset,
  '/css/index.css': serveAsset,
  '/fonts/arbutus-slab.ttf': serveAsset,
  '/fonts/domine.ttf': serveAsset,
  '/fonts/lato.ttf': serveAsset,
  '/fonts/lota.ttf': serveAsset,
  '/fonts/noto-sans.ttf': serveAsset,
  '/fonts/nunito.ttf': serveAsset,
  '/fonts/open-sans.ttf': serveAsset,
  '/fonts/OpenDyslexic3-Regular.ttf': serveAsset,
  '/fonts/pt-sans.ttf': serveAsset,
  '/fonts/pt-serif.ttf': serveAsset,
} as Record<string, ServerEndpoint>;

type ServerEndpoint = (
  request: HttpRequest,
  response: HttpResponse,
  serverState: ServerState,
) => Promise<void> | void;
