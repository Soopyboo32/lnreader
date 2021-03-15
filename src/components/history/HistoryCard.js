import React from "react";

import { StyleSheet, View, Text, Image } from "react-native";
import { TouchableRipple, IconButton } from "react-native-paper";

import moment from "moment";

import { useSelector } from "react-redux";

const HistoryCard = ({ item, deleteHistory, navigation }) => {
    const theme = useSelector((state) => state.themeReducer.theme);

    return (
        <TouchableRipple
            style={[
                styles.historyCard,
                // { backgroundColor: theme.colorDarkPrimary },
            ]}
            rippleColor={theme.rippleColorDark}
            borderless
            onPress={() =>
                navigation.navigate("NovelItem", {
                    novelName: item.novelName,
                    novelCover: item.novelCover,
                    extensionId: item.extensionId,
                    novelUrl: item.novelUrl,
                    navigatingFrom: 0,
                })
            }
        >
            <>
                <Image
                    source={{ uri: item.novelCover }}
                    style={{
                        height: 80,
                        width: 57,
                        borderRadius: 4,
                    }}
                />
                <View
                    style={{
                        marginLeft: 15,
                        flex: 1,
                        flexDirection: "row",
                        justifyContent: "space-between",
                    }}
                >
                    <View style={{ flex: 0.9 }}>
                        <Text
                            style={{
                                color: theme.textColorPrimaryDark,
                                fontWeight: "bold",
                                fontSize: 16,
                            }}
                            numberOfLines={1}
                        >
                            {item.novelName}
                        </Text>
                        <Text
                            style={{
                                color: theme.textColorSecondaryDark,
                                marginTop: 2,
                            }}
                            numberOfLines={1}
                        >
                            {`${item.chapterName} - ${moment(
                                item.lastRead
                            ).calendar()}`}
                        </Text>
                    </View>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                        }}
                    >
                        <IconButton
                            icon="delete-outline"
                            size={22}
                            color={theme.textColorPrimaryDark}
                            style={{
                                marginRight: 0,
                            }}
                            onPress={() => deleteHistory(item.novelUrl)}
                        />
                        <IconButton
                            icon="play"
                            size={24}
                            color={theme.textColorPrimaryDark}
                            style={{ marginRight: 10 }}
                            onPress={() =>
                                navigation.navigate("ChapterItem", {
                                    chapterUrl: item.chapterUrl,
                                    extensionId: item.extensionId,
                                    novelUrl: item.novelUrl,
                                    novelName: item.novelName,
                                    novelCover: item.novelCover,
                                    chapterName: item.chapterName,
                                })
                            }
                        />
                    </View>
                </View>
            </>
        </TouchableRipple>
    );
};

export default HistoryCard;

const styles = StyleSheet.create({
    historyCard: {
        // backgroundColor: theme.colorDarkPrimary,
        // paddingVertical: 10,
        // marginVertical: 5,
        // paddingHorizontal: 20,
        marginBottom: 15,
        borderRadius: 4,
        flexDirection: "row",
        alignItems: "center",
    },
});