import { HttpRequest, HttpResponse } from '@native/WebServer';
import { ServerState } from '@screens/reader/remote/remoteReaderServer';
import {
  initialChapterGeneralSettings,
  initialChapterReaderSettings,
} from '@hooks/persisted/useSettings';
import { defaultTheme } from '@theme/md3/defaultTheme';
import { readerHtml } from '@screens/reader/components/WebViewReader';

export function indexHtml(
  _req: HttpRequest,
  res: HttpResponse,
  serverState: ServerState,
) {
  let readerSettings = serverState.currentChapterContent?.readerSettings;
  if (!readerSettings) {
    readerSettings = initialChapterReaderSettings;
  }
  let theme = serverState.currentChapterContent?.theme;
  if (!theme) {
    theme = defaultTheme.dark;
  }
  let nextChapter = serverState.currentChapterContent?.nextChapter;
  let chapterGeneralSettings =
    serverState.currentChapterContent?.chapterGeneralSettings;
  if (!chapterGeneralSettings) {
    chapterGeneralSettings = initialChapterGeneralSettings;
  }
  let html = serverState.currentChapterContent?.chapterHtml;
  let chapter = serverState.currentChapterContent?.chapter;
  let novel = serverState.currentChapterContent?.novel;
  let batteryLevel = 0; //TODO
  res.body = readerHtml(
    serverState.currentChapterContent?.loading ? 'Loading...' : html || '',
    readerSettings,
    theme,
    '', //pluginCustomCSS,
    '', //pluginCustomJS,
    chapterGeneralSettings,
    novel,
    chapter,
    nextChapter,
    batteryLevel,
    '',
    // language=JavaScript
    `
			async function waitForLoaded() {
				while (true) {
					await new Promise(resolve => setTimeout(resolve, 50));
					let res = await fetch("/loading.json").then(res => res.json());
					if (!res.loading) break;
				}
			}

			if (${serverState.currentChapterContent?.loading}) {
				waitForLoaded().then(() => {
					window.location = window.location;
				});
			}
			window.ReactNativeWebView = {
				postMessage: function (data) {
					fetch("/postData", {
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						},
						body: data
					});
					let dataParsed = JSON.parse(data);
					if (dataParsed.type == "next" || dataParsed.type == "prev") {
						let button = document.querySelector("button.next-button");
						button.style.backgroundColor = "rgba(0, 0, 0, 0)";
						button.style.color = "${readerSettings.textColor}";
						button.disabled = true;
						document.getElementById("LNReader-chapter").innerHTML = "Loading...";
						waitForLoaded().then(() => {
							window.location = window.location;
						})
					}
				}
			}
        `,
  );
}
