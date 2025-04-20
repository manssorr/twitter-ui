import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FeedItem, FeedContent } from '~/components/FeedItem';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view';
import Animated from 'react-native-reanimated';
import sampleFeedItems from '~/dummy/posts.json';
import users from '~/dummy/users.json';
import { StyledExpoImage } from "~/components/Image";
import X from "~/assets/svg/aside/x.svg";
import { BlurView } from 'expo-blur';

// --- Constants ---
const APP_PRIMARY_COLOR = '#1DA1F2'; // Twitter blue
const profileTabs = ['For you', 'Following', 'TPOT', 'RN/ React', 'AI', 'Design', 'Premier League'];

// Convert string timestamps to numbers to match FeedContent interface
const processedFeedItems: FeedContent[] = sampleFeedItems.map(item => ({
    ...item,
    postedTime: parseInt(item.postedTime, 10)
}));

// --- Header Component ---
const Header = () => {
    const currentUser = users[0];
    const insets = useSafeAreaInsets();

    return (
        <View style={{ paddingTop: insets.top }} className="border-b border-gray-200 dark:border-gray-700 w-full">
            <View className="flex-row items-center w-full justify-center py-3">
                <StyledExpoImage source={{ uri: currentUser.profile_picture }} className="w-10 h-10 rounded-full absolute left-4" />
                <X width={26} height={26} fill="black" />
            </View>
        </View>
    );
};

// --- Main Screen Component ---
export default function HomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleItemPress = (postId: string) => {
        router.push(`/post/${postId}`);
    };

    // Render function for each tab
    const renderTab = useCallback((tabName: string) => {
        const renderFeedItem = ({ item }: { item: FeedContent }) => (
            <FeedItem itemData={item} onPress={() => handleItemPress(item.contentId)} />
        );

        return (
            <Tabs.FlatList
                data={processedFeedItems}
                renderItem={renderFeedItem}
                keyExtractor={(item) => item.contentId}
                contentContainerStyle={{
                    paddingBottom: insets.bottom,
                }}
            />
        );
    }, [insets.bottom]);

    // Custom tab bar
    const renderTabBar = (props: any) => (
        <MaterialTabBar
            {...props}
            indicatorStyle={{ backgroundColor: APP_PRIMARY_COLOR }}
            activeColor="black"
            inactiveColor="gray"
            scrollEnabled={true}
            style={{ elevation: 0, shadowOpacity: 0, borderBottomWidth: 0 }}
            labelStyle={{ fontWeight: 'bold', textTransform: 'none' }}
        />
    );

    return (
        <BlurView style={styles.container} className="flex-1" intensity={80} tint={"light"}>
            <Tabs.Container
                headerHeight={90 + insets.top} // Adjust based on your header size
                renderHeader={Header}
                renderTabBar={renderTabBar}
                pagerProps={{ scrollEnabled: true }}
                initialTabName="For you"
            >
                {profileTabs.map((tab) => (
                    <Tabs.Tab name={tab} key={tab}>
                        {renderTab(tab)}
                    </Tabs.Tab>
                ))}
            </Tabs.Container>
        </BlurView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        width: '100%',
        height: '100%',
    },
});