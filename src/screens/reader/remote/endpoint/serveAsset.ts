import { HttpRequest, HttpResponse } from '@native/WebServer';
import { ServerState } from '@screens/reader/remote/remoteReaderServer';
import fs from 'react-native-fs';

export async function serveAsset(
  req: HttpRequest,
  res: HttpResponse,
  _serverState: ServerState,
) {
  res.headers['Content-Type'] =
    getContentType(req.path.split('.').pop() ?? '') + '; charset=utf-8';
  res.body = await fs.readFileAssets(req.path.substring(1));
}

const contentTypeMap = {
  js: 'application/javascript',
  css: 'text/css',
  html: 'text/html',
  json: 'application/json',
  ttf: 'font/ttf',
} as const;

function getContentType(type: string): string {
  // @ts-ignore
  return contentTypeMap[type] || 'text/plain';
}
