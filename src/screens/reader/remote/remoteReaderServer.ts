import { WebServer } from '@native/WebServer';
import { ChapterInfo, NovelInfo } from '@database/types';
import {
  ChapterGeneralSettings,
  ChapterReaderSettings,
} from '@hooks/persisted/useSettings';
import { ThemeColors } from '@theme/types';
import { WebViewPostEvent } from '@screens/reader/components/WebViewReader';
import { serverEndpoints } from '@screens/reader/remote/serverEndpoints';

export type ChapterContent = {
  chapterHtml: string;
  loading: boolean;
  error: string | undefined;
  nextChapter: ChapterInfo;
  prevChapter: ChapterInfo;
  saveProgress: (percentage: number) => void;
  navigateChapter: (position: 'NEXT' | 'PREV') => void;
  readerSettings?: ChapterReaderSettings;
  theme?: ThemeColors;
  chapterGeneralSettings?: ChapterGeneralSettings;
  chapter?: ChapterInfo;
  novel?: NovelInfo;
};

export type ServerState = {
  enabled: boolean;
  serverObj: WebServer | null;
  currentChapterContent: ChapterContent | null;
};

const serverState: ServerState = {
  enabled: false,
  serverObj: null,
  currentChapterContent: null,
};

// @ts-ignore
if (module.hot && module.hot.dispose) {
  // @ts-ignore
  module.hot.dispose(() => {
    //make sure to stop the server when hot reloading
    setRemoteReaderServerEnabled(false);
  });
}

export function setRemoteReaderServerEnabled(enabled: boolean) {
  if (!serverState.enabled && enabled) {
    startRemoteReaderServer();
  }
  if (serverState.enabled && !enabled) {
    stopRemoteReaderServer();
  }
  serverState.enabled = enabled;
}

export function setRemoteReaderServerChapterData(content: ChapterContent) {
  serverState.currentChapterContent = content;
}

async function startRemoteReaderServer() {
  serverState.serverObj = await WebServer.createServer(8000, async req => {
    const ret = {
      statusCode: '200 OK',
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
      body: '',
    };
    if (req.method.toUpperCase() === 'HEAD') {
      return ret;
    }
    if (req.method == 'POST') {
      if (req.path == '/postData') {
        const event: WebViewPostEvent = JSON.parse(req.body);
        switch (event.type) {
          case 'hide':
            // onPress();
            break;
          case 'next':
            serverState.currentChapterContent?.navigateChapter?.('NEXT');
            break;
          case 'prev':
            serverState.currentChapterContent?.navigateChapter?.('PREV');
            break;
          case 'save':
            if (event.data && typeof event.data === 'number') {
              // saveProgress(event.data);
            }
            break;
          case 'speak':
            break;
          case 'stop-speak':
            break;
        }
      } else {
        ret.body = JSON.stringify({ error: true, message: '404 Not Found' });
      }
      ret.headers['Content-Type'] = 'application/json; charset=utf-8';
      return ret;
    }

    if (req.path in serverEndpoints) {
      await serverEndpoints[req.path](req, ret, serverState);
    } else {
      ret.statusCode = '404 Not Found';
      ret.body = 'Not Found';
    }

    return ret;
  });
}

async function stopRemoteReaderServer() {
  await serverState.serverObj?.stop();
  serverState.serverObj = null;
}
