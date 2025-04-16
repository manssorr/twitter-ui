import React, { useState, useRef } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    ScrollView,
    StyleSheet,
    Platform,
    Dimensions,
    FlatList, // Keep original FlatList import
} from 'react-native';
import { useRouter } from 'expo-router';
// Remove FeedItem import if it's not defined in this file
import { FeedItem, FeedContent } from '~/components/FeedItem';
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    interpolate,
    Extrapolation,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Import the hook
import sampleFeedItems from '~/dummy/posts.json';
import users from '~/dummy/users.json';
import { StyledExpoImage } from "~/components/Image"
import X from "~/assets/svg/aside/x.svg"



// --- Constants ---
const TAB_BAR_HEIGHT = 46; // Height of the scrollable tab bar itself
const SCREEN_HORIZONTAL_PADDING = 16;
const APP_PRIMARY_COLOR = '#1DA1F2'; // Twitter blue example

const profileTabs = ['For you', 'Following', 'TPOT', 'RN/ React', 'AI', 'Design', 'Premier League'];

// --- Create Animated FlatList ---
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<FeedContent>);

// --- Header Tabs Component ---
interface HeaderTabsProps {
    tabs: string[];
    selectedTabIndex: number;
    onTabPress: (index: number) => void;
    height: number; // Pass height dynamically
}

const HeaderTabs: React.FC<HeaderTabsProps> = ({ tabs, selectedTabIndex, onTabPress, height }) => {
    const currentUser = users[0];

    return (
        <View style={[styles.headerTabsContainer]} className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-700 w-full gap-4">

            <View className="flex-row items-center w-full justify-center">
                <StyledExpoImage source={{ uri: currentUser.profile_picture }} className="w-10 h-10 rounded-full absolute left-4" />

                <X width={26} height={26} fill="black" />

            </View>


            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING / 4 }}
                contentContainerClassName="flex-row items-center pl-3 "
            >
                {tabs.map((tabName, index) => (
                    <TouchableOpacity
                        key={`tab-${index}`}
                        className=" px-2 justify-center items-center relative"
                        style={{ height: height }} // Use dynamic height
                        onPress={() => onTabPress(index)}
                    >
                        <Text className={`text-[15px] font-bold ${selectedTabIndex === index ? 'text-black dark:text-white' : 'text-gray-500 dark:text-neutral-400'
                            }`}>
                            {tabName}
                        </Text>
                        {selectedTabIndex === index && (
                            <View
                                className="h-1 w-[100%] rounded absolute bottom-0 self-center" // Centered indicator
                                style={{ backgroundColor: APP_PRIMARY_COLOR }}
                            />
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

// --- Main Screen Component ---
export default function HomeScreen() {
    const router = useRouter();
    const [selectedTabIndex, setSelectedTabIndex] = useState(0);
    const insets = useSafeAreaInsets(); // Get safe area insets

    // Calculate the effective header height including safe area top inset
    const EFFECTIVE_HEADER_HEIGHT = TAB_BAR_HEIGHT + insets.top + 50;

    // Animated values
    const scrollY = useSharedValue(0);
    const lastScrollY = useSharedValue(0);
    // Controls the translation of the entire header container (including safe area padding)
    const headerTranslateY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event, ctx) => {
            const currentScrollY = event.contentOffset.y;
            // Clamp scrollY to avoid negative values from bounce
            const clampedScrollY = Math.max(0, currentScrollY);
            scrollY.value = clampedScrollY;

            // Determine scroll direction only if scrolling significantly
            const diff = clampedScrollY - lastScrollY.value;
            if (Math.abs(diff) > 1) { // Add threshold to avoid jitter on slight scrolls
                const isScrollingDown = diff > 0;
                // Only translate if scrolling past the initial header height
                if (clampedScrollY > EFFECTIVE_HEADER_HEIGHT) {
                    // Hide progressively while scrolling down
                    headerTranslateY.value = withTiming(
                        Math.max(-EFFECTIVE_HEADER_HEIGHT, headerTranslateY.value - diff),
                        { duration: 0 } // Use duration 0 for direct tracking, alternative is to clamp below
                    );
                    // Clamp the translation value
                    headerTranslateY.value = Math.max(-EFFECTIVE_HEADER_HEIGHT, Math.min(0, headerTranslateY.value));

                } else {
                    // Show progressively while scrolling up towards top
                    headerTranslateY.value = withTiming(
                        Math.min(0, headerTranslateY.value - diff),
                        { duration: 0 }
                    );
                    // Clamp the translation value
                    headerTranslateY.value = Math.max(-EFFECTIVE_HEADER_HEIGHT, Math.min(0, headerTranslateY.value));
                }
            }

            lastScrollY.value = clampedScrollY;
        },
        onBeginDrag: (event, ctx) => {
            // Potentially store the starting translate value if needed for more complex logic
            // ctx.startY = headerTranslateY.value;
        },
        onEndDrag: (event, ctx) => {
            // Snap header open or closed based on current position and scroll direction
            const isScrollingDown = scrollY.value > lastScrollY.value; // Check direction at the end
            if (isScrollingDown && scrollY.value > EFFECTIVE_HEADER_HEIGHT) {
                // If scrolled down enough and ended drag scrolling down, hide fully
                headerTranslateY.value = withTiming(-EFFECTIVE_HEADER_HEIGHT, { duration: 150 });
            } else {
                // Otherwise (scrolling up, or not scrolled down far enough), show fully
                headerTranslateY.value = withTiming(0, { duration: 150 });
            }
        },
        onMomentumEnd: (event, ctx) => {
            // Snap header open or closed after momentum scroll finishes
            // Similar logic to onEndDrag
            const isScrollingDown = scrollY.value > lastScrollY.value;
            if (isScrollingDown && scrollY.value > EFFECTIVE_HEADER_HEIGHT) {
                headerTranslateY.value = withTiming(-EFFECTIVE_HEADER_HEIGHT, { duration: 150 });
            } else {
                headerTranslateY.value = withTiming(0, { duration: 150 });
            }
        }
    });

    // Animated style for the header container
    const headerAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: headerTranslateY.value }],
            // Ensure the container itself doesn't block touches when hidden
            // (though the content padding should prevent overlap)
            // opacity: interpolate(headerTranslateY.value, [-EFFECTIVE_HEADER_HEIGHT, 0], [0, 1]) // Optional Fade
        };
    });

    const handleItemPress = (postId: string) => {
        router.push(`/post/${postId}`);
    };

    const renderFeedItem = ({ item }: { item: FeedContent }) => (
        <FeedItem itemData={item} onPress={() => handleItemPress(item.contentId)} />
    );

    return (
        // Use a standard View, not SafeAreaView, as requested
        <View style={styles.container} className="flex-1 bg-white dark:bg-black">
            {/* Animated Header Container */}
            {/* This container handles the safe area padding and the animation */}
            <Animated.View style={[styles.headerWrapper, headerAnimatedStyle]}>
                {/* Add paddingTop dynamically based on insets */}
                <View style={{ paddingTop: insets.top, backgroundColor: 'white' /* Match HeaderTabs bg */ }} className="dark:bg-black">
                    {/* The actual visible Header Tabs */}


                    <HeaderTabs
                        tabs={profileTabs}
                        selectedTabIndex={selectedTabIndex}
                        onTabPress={setSelectedTabIndex}
                        height={TAB_BAR_HEIGHT} // Pass the specific height of the tab bar
                    />
                </View>
            </Animated.View>

            {/* Animated FlatList */}
            <AnimatedFlatList
                data={sampleFeedItems}
                renderItem={renderFeedItem}
                keyExtractor={(item) => item.contentId}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                contentContainerStyle={{
                    // Padding top must account for the *entire* header area including safe area
                    paddingTop: EFFECTIVE_HEADER_HEIGHT,
                    paddingBottom: insets.bottom, // Also respect bottom inset for scroll content
                }}
                // Automatically adjust scroll indicator insets to avoid the header/safe area
                automaticallyAdjustsScrollIndicatorInsets={true}
            />
        </View>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    // This wrapper is positioned absolutely and animated
    headerWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        width: '100%',
        // The height is implicitly determined by the content (paddingTop + HeaderTabs height)
    },
    // Style for the visible tab bar part
    headerTabsContainer: {
        // Removed fixed height here, pass via props
        // borderBottomWidth etc are handled by className
    },
});