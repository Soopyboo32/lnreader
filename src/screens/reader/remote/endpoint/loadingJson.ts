import { HttpRequest, HttpResponse } from '@native/WebServer';
import { ServerState } from '@screens/reader/remote/remoteReaderServer';

export function loadingJson(
  _req: HttpRequest,
  res: HttpResponse,
  serverState: ServerState,
) {
  res.headers['Content-Type'] = 'application/json; charset=utf-8';
  res.body = JSON.stringify({
    loading: serverState.currentChapterContent?.loading,
  });
}
