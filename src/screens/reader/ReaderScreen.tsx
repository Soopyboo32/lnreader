import React, {
  useRef,
  useCallback,
  useState,
  useEffect,
  useMemo,
} from 'react';
import { DrawerLayoutAndroid, Pressable, Text, View } from 'react-native';

import { useChapterGeneralSettings, useTheme } from '@hooks/persisted';

import ReaderAppbar from './components/ReaderAppbar';
import ReaderFooter from './components/ReaderFooter';

import WebViewReader from './components/WebViewReader';
import ReaderBottomSheetV2 from './components/ReaderBottomSheet/ReaderBottomSheet';
import ChapterDrawer from './components/ChapterDrawer';
import ChapterLoadingScreen from './ChapterLoadingScreen/ChapterLoadingScreen';
import { ErrorScreenV2 } from '@components';
import { ChapterScreenProps } from '@navigators/types';
import WebView from 'react-native-webview';
import { getString } from '@strings/translations';
import KeepScreenAwake from './components/KeepScreenAwake';
import useChapter from './hooks/useChapter';
import { ChapterContextProvider, useChapterContext } from './ChapterContext';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useBackHandler } from '@hooks/index';
import { get } from 'lodash-es';
import { getPluginAsync } from '@plugins/pluginManager';
import {
  setRemoteReaderServerChapterData,
  setRemoteReaderServerEnabled,
} from '@screens/reader/remote/remoteReaderServer';
import { getMMKVObject } from '@utils/mmkv/mmkv';
import {
  CHAPTER_GENERAL_SETTINGS,
  CHAPTER_READER_SETTINGS,
  ChapterGeneralSettings,
  ChapterReaderSettings,
  initialChapterGeneralSettings,
  initialChapterReaderSettings,
} from '@hooks/persisted/useSettings';
import {
  remoteReader,
  useRemoteReader,
} from '@screens/reader/remote/remoteReader';
import { WebServer } from '@native/WebServer';
import { useFullscreenMode } from '@hooks';

const Chapter = ({ route, navigation }: ChapterScreenProps) => {
  const drawerRef = useRef<DrawerLayoutAndroid>(null);
  return (
    <ChapterContextProvider
      novel={route.params.novel}
      initialChapter={route.params.chapter}
    >
      <DrawerLayoutAndroid
        ref={drawerRef}
        onDrawerOpen={() => {
          drawerRef.current?.setState(prev => ({ ...prev, isOpen: true }));
        }}
        onDrawerClose={() => {
          drawerRef.current?.setState(prev => ({ ...prev, isOpen: false }));
        }}
        drawerWidth={300}
        drawerPosition="left"
        renderNavigationView={() => <ChapterDrawer />}
      >
        <ChapterContent
          route={route}
          navigation={navigation}
          drawerRef={drawerRef}
        />
      </DrawerLayoutAndroid>
    </ChapterContextProvider>
  );
};

type ChapterContentProps = ChapterScreenProps & {
  drawerRef: React.RefObject<DrawerLayoutAndroid>;
};

export const ChapterContent = ({
  navigation,
  drawerRef,
}: ChapterContentProps) => {
  const { novel, chapter } = useChapterContext();
  const webViewRef = useRef<WebView>(null);
  const readerSheetRef = useRef<BottomSheetModalMethods>(null);
  const theme = useTheme();
  const { pageReader = false, keepScreenOn } = useChapterGeneralSettings();
  const [bookmarked, setBookmarked] = useState(chapter.bookmark);
  const [isPluginLoaded, setIsPluginLoaded] = useState(false);

  useEffect(() => {
    setBookmarked(chapter.bookmark);
  }, [chapter]);

  useEffect(() => {
    let cancel = false;
    if (isPluginLoaded) {
      setIsPluginLoaded(false);
    }
    getPluginAsync(novel.pluginId).then(() => {
      if (cancel) {
        return;
      }
      setIsPluginLoaded(true);
    });
    return () => {
      cancel = true;
    };
  }, [novel.pluginId]);

  const {
    hidden,
    loading,
    error,
    prevChapter,
    nextChapter,
    chapterText,
    saveProgress,
    hideHeader,
    navigateChapter,
    refetch,
  } = useChapter(webViewRef);

  const scrollToStart = () =>
    requestAnimationFrame(() => {
      webViewRef?.current?.injectJavaScript(
        !pageReader
          ? `(()=>{
                window.scrollTo({top:0,behavior:'smooth'})
              })()`
          : `(()=>{
              document.querySelector('chapter').setAttribute('data-page',0);
              document.querySelector("chapter").style.transform = 'translate(0%)';
            })()`,
      );
    });

  const openDrawer = useCallback(() => {
    drawerRef.current?.openDrawer();
    hideHeader();
  }, [drawerRef, hideHeader]);

  useBackHandler(() => {
    if (get(drawerRef.current?.state, 'isOpen')) {
      drawerRef.current?.closeDrawer();
      return true;
    }
    return false;
  });

  const readerSettings = useMemo(
    () =>
      getMMKVObject<ChapterReaderSettings>(CHAPTER_READER_SETTINGS) ||
      initialChapterReaderSettings,
    [],
  );
  const chapterGeneralSettings = useMemo(
    () =>
      getMMKVObject<ChapterGeneralSettings>(CHAPTER_GENERAL_SETTINGS) ||
      initialChapterGeneralSettings,
    [],
  );

  const { enabled: remoteReaderEnabled, accessed: accessedWebView } =
    useRemoteReader();
  const { setImmersiveMode } = useFullscreenMode();
  const [localIp, setLocalIp] = useState('');
  useEffect(() => {
    if (!remoteReaderEnabled) {
      return;
    }
    setImmersiveMode();
    if (localIp) {
      return;
    }
    WebServer.getLocalIpAddress().then(ip => setLocalIp(ip));
  }, [remoteReaderEnabled]);
  setRemoteReaderServerEnabled(remoteReaderEnabled);
  if (remoteReaderEnabled) {
    setRemoteReaderServerChapterData({
      chapterHtml: chapterText,
      loading,
      error,
      nextChapter,
      prevChapter,
      saveProgress,
      navigateChapter,
      readerSettings,
      theme,
      chapterGeneralSettings,
      novel,
      chapter,
    });

    return (
      <View>
        <Pressable
          style={{ backgroundColor: 'black', width: '100%', height: '100%' }}
          onPress={() => {
            remoteReader.disable();
          }}
        >
          {accessedWebView ? null : (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: 'white',
                }}
              >
                Read at {localIp}:8000 on any other device on the same network
              </Text>
              <Text
                style={{
                  color: 'white',
                }}
              >
                (Click the screen to disable)
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    );
  }

  if (error) {
    return (
      <ErrorScreenV2
        error={error}
        actions={[
          {
            iconName: 'refresh',
            title: getString('common.retry'),
            onPress: refetch,
          },
          {
            iconName: 'earth',
            title: 'WebView',
            onPress: () =>
              navigation.navigate('WebviewScreen', {
                name: novel.name,
                url: chapter.path,
                pluginId: novel.pluginId,
              }),
          },
        ]}
      />
    );
  }
  return (
    <>
      {keepScreenOn ? <KeepScreenAwake /> : null}
      {loading || !isPluginLoaded ? (
        <ChapterLoadingScreen />
      ) : (
        <WebViewReader
          html={chapterText}
          nextChapter={nextChapter}
          webViewRef={webViewRef}
          saveProgress={saveProgress}
          onPress={hideHeader}
          navigateChapter={navigateChapter}
        />
      )}
      <ReaderBottomSheetV2 bottomSheetRef={readerSheetRef} />
      {!hidden ? (
        <>
          <ReaderAppbar
            goBack={navigation.goBack}
            theme={theme}
            bookmarked={bookmarked}
            setBookmarked={setBookmarked}
          />
          <ReaderFooter
            theme={theme}
            nextChapter={nextChapter}
            prevChapter={prevChapter}
            readerSheetRef={readerSheetRef}
            scrollToStart={scrollToStart}
            navigateChapter={navigateChapter}
            navigation={navigation}
            openDrawer={openDrawer}
          />
        </>
      ) : null}
    </>
  );
};

export default Chapter;
