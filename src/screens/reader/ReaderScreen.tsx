import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  DrawerLayoutAndroid,
  FlatList,
  RecyclerViewBackedScrollView,
  Text,
  View,
} from 'react-native';

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

const Chapter = ({ route, navigation }: ChapterScreenProps) => {
  const drawerRef = useRef<DrawerLayoutAndroid>(null);
  return (
    <ChapterContextProvider
      novel={route.params.novel}
      initialChapter={route.params.chapter}
    >
      <DrawerLayoutAndroid
        ref={drawerRef}
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
  const { novel, chapter, setChapter } = useChapterContext();
  const webViewRef = useRef<WebView>(null);
  const readerSheetRef = useRef(null);
  const theme = useTheme();
  const { pageReader = false, keepScreenOn } = useChapterGeneralSettings();

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
  const [renderingChapters, setRenderingChapters] = useState<any[]>([
    {
      key: 1,
      chapterText: chapterText,
      nextChapter: nextChapter,
    },
  ]);
  useEffect(() => {
    setRenderingChapters(chap => {
      let newC = [...chap];
      newC[newC.length - 1] = {
        ...newC[newC.length - 1],
        chapterText: chapterText,
        nextChapter: nextChapter,
      };
      return newC;
    });
  }, [chapterText, nextChapter]);

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

  let loadingNext = useRef(true);

  return (
    <>
      {keepScreenOn ? <KeepScreenAwake /> : null}
      {loading ? (
        <ChapterLoadingScreen onPress={hideHeader} />
      ) : (
        <FlatList
          data={renderingChapters}
          renderItem={({ item }) => {
            // console.log('Rendering', item.key);
            let isLast =
              item.key === renderingChapters[renderingChapters.length - 1].key;
            return (
              <View
                style={{ flex: 1, padding: 10, minHeight: 10, minWidth: 10 }}
              >
                <WebViewReader
                  html={item.chapterText}
                  nextChapter={item.nextChapter}
                  webViewRef={isLast ? webViewRef : null}
                  saveProgress={isLast ? saveProgress : () => {}}
                  onPress={hideHeader}
                  navigateChapter={navigateChapter}
                  finishedLoading={() => {
                    if (
                      item.key !==
                      renderingChapters[renderingChapters.length - 1].key
                    )
                      return;
                    loadingNext.current = false;
                    console.log('FINISHED LOADING');
                  }}
                />
              </View>
            );
          }}
          onEndReached={() => {
            console.log('END REACHED', loadingNext.current);
            if (loadingNext.current) return;

            loadingNext.current = true;
            setRenderingChapters(chap => {
              if (chap.length > 2) {
                chap = [chap[1], chap[2]];
              }
              let newC = [
                ...chap,
                {
                  key: chap[chap.length - 1].key + 1,
                  chapterText: '',
                  nextChapter: '',
                },
              ];
              console.log('NEW CHAPTERS', newC.map(c=>c.key));
              return newC;
            });
            setChapter(nextChapter);
          }}
          // onEndReachedThreshold={0.5}
          ListFooterComponent={<ActivityIndicator size={'large'} />}
        />
      )}
      <ReaderBottomSheetV2 bottomSheetRef={readerSheetRef} />
      {!hidden ? (
        <>
          <ReaderAppbar goBack={navigation.goBack} theme={theme} />
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
