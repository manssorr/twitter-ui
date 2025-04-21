import React, { useCallback, useMemo, useState, useReducer, Reducer, useRef, useEffect } from 'react';
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Platform,
  ActivityIndicator,
  ScrollView,
  SectionListData,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  OpacityTransitionView,
  TopNavigationBar,
  ExpandedHeader,
  ScrollingListWithHeader,
} from '~/components/TwitterComponent';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { ImageProps } from 'expo-image';
import { useColorScheme } from "nativewind";
import { StyledExpoImage as Image } from "~/components/Image"
import Comment from "~/assets/svg/comment.svg"
import Repost from "~/assets/svg/repost.svg"
import Like from "~/assets/svg/like.svg"
import Save from "~/assets/svg/save.svg"
import Share from "~/assets/svg/share.svg"
import Views from "~/assets/svg/views.svg"
import Category from "~/assets/svg/category.svg"
import Grok from "~/assets/svg/tabs/grok.svg";
// Import the refactored component and type
import { FeedItem, FeedContent, ProfileImage, PROFILE_IMAGE_SIZE_MAP } from '~/components/FeedItem';
import { useLocalSearchParams } from 'expo-router';
import users from '~/dummy/users.json';
import Messages from "~/assets/svg/tabs/messages.svg"


const PULL_TO_REFRESH_THRESHOLD = 70; // Pixels to pull down to trigger refresh
const PULL_TO_REFRESH_VISIBLE_THRESHOLD = 10; // Pixels to pull down before arrow starts appearing
const BANNER_BOTTOM_MARGIN = 60; // Margin at the bottom of the banner
const HEADER_PROFILE_IMAGE_SIZE = 'm';
const HEADER_PROFILE_IMAGE_SIZE_VALUE = 100;
const HEADER_PROFILE_IMAGE_START_SCALE = 1;
const HEADER_PROFILE_IMAGE_END_SCALE = 0.6;
const SCREEN_HORIZONTAL_PADDING = 16;

const canUseBlurEffect =
  Platform.OS === 'ios' || (Platform.OS === 'android' && Number(Platform.Version) >= 31);

const APP_PRIMARY_COLOR = '#1d9bf0';

interface User {
  id: string;
  name: string;
  handle: string;
  bio: string;
  url: string;
  followed_by: string;
  items_count: string;
  following_count: number;
  joined_date: string;
  category: string;
  profile_picture: string;
  header_picture: string;
  is_verified: boolean;
  verified_badge: string;
  is_organization: boolean;
}

const ProfileHeader = ({ navBarVisibility, scrollOffset, refreshing, user }: {
  navBarVisibility: any;
  scrollOffset: any;
  refreshing: any;
  user: User;
}) => {
  const navigation = useNavigation();
  const { left: leftInset, right: rightInset, top: safeAreaTop } = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const bannerTotalHeight = useSharedValue(110 + BANNER_BOTTOM_MARGIN);
  const listRef = useRef<any>(null);
  const pullToRefreshThreshold = PULL_TO_REFRESH_THRESHOLD;
  // Store the previous scroll offset value before refresh
  const prevScrollOffsetBeforeRefresh = useSharedValue(0);
  // Track if we're in the middle of a tab change
  const isChangingTab = useSharedValue(false);
  const hasReachedThreshold = useSharedValue(false);

  // Modified blur overlay style that maintains state after refresh
  const blurOverlayStyle = useAnimatedStyle(() => {
    // Use max value between current scroll and previous to maintain blur during refresh
    const effectiveScrollOffset = isChangingTab.value ?
      Math.max(50, Math.abs(scrollOffset.value)) :
      Math.abs(scrollOffset.value);

    return {
      opacity: interpolate(
        effectiveScrollOffset,
        [0, 50],
        [0, 1],
        Extrapolate.CLAMP
      ),
    };
  });

  useEffect(() => {
    if (!refreshing) {
      // Reset the flag after refresh completes
      // The timeout ensures this happens after scroll animations finish
      setTimeout(() => {
        hasReachedThreshold.value = false;
      }, 500); // Longer timeout to ensure animation completes
    }
  }, [refreshing]);

  useAnimatedReaction(
    () => scrollOffset.value,
    (currentValue, previousValue) => {
      // Reset threshold tracking when scroll returns to top after refresh completes
      if (currentValue >= 0 && !refreshing && hasReachedThreshold.value) {
        // We can't call setTimeout from a worklet, so we need a small delay
        // This ensures the flag is reset when the user starts a new pull
        hasReachedThreshold.value = false;
      }
    }
  );

  const profileImageCurrentScale = useDerivedValue(() => interpolate(
    scrollOffset.value,
    [0, BANNER_BOTTOM_MARGIN],
    [HEADER_PROFILE_IMAGE_START_SCALE, HEADER_PROFILE_IMAGE_END_SCALE],
    Extrapolate.CLAMP
  ));

  // Modified banner vertical shift style with improved overscroll physics
  const bannerVerticalShiftStyle = useAnimatedStyle(() => {
    const effectiveScroll = isChangingTab.value ?
      Math.min(0, scrollOffset.value) :
      scrollOffset.value;

    // Add overscroll resistance factor - makes overscroll more "sticky"
    const overscrollFactor = 0.85; // Controls stickiness (higher = stickier)
    
    // Apply a non-linear transformation to overscroll values for more natural physics
    const transformedScroll = effectiveScroll < 0 
      ? effectiveScroll * overscrollFactor * (1 - Math.exp(effectiveScroll / 500))
      : effectiveScroll;

    return {
      transform: [{
        translateY: interpolate(
          transformedScroll,
          [0, BANNER_BOTTOM_MARGIN],
          [0, -BANNER_BOTTOM_MARGIN],
          Extrapolate.CLAMP
        )
      }],
    };
  });

  // Improved parallax scale style with better overscroll handling
  const parallaxScaleStyle = useAnimatedStyle(() => {
    // Enhanced scaling with increased "stickiness" during overscroll
    const overscrollBoost = 1.2; // Increase parallax effect during overscroll
    
    const scale = interpolate(
      scrollOffset.value, 
      [0, -(windowHeight + bannerTotalHeight.value)], 
      [1, windowHeight / (bannerTotalHeight.value / overscrollBoost)], 
      Extrapolate.CLAMP
    );
    
    return { 
      transform: [
        { scaleY: scale }, 
        { scaleX: scale }
      ] 
    };
  }, [windowHeight]);

  // Other animation styles remain the same
  const profileRowVerticalShiftStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -scrollOffset.value + BANNER_BOTTOM_MARGIN / 2 }],
  }));
  const profileRowZIndexStyle = useAnimatedStyle(() => ({
    zIndex: profileImageCurrentScale.value <= HEADER_PROFILE_IMAGE_END_SCALE ? -1 : 1,
  }));
  const profileImageTransformStyle = useAnimatedStyle(() => {
    const imageTranslateY = interpolate(profileImageCurrentScale.value, [HEADER_PROFILE_IMAGE_START_SCALE, HEADER_PROFILE_IMAGE_END_SCALE], [0, HEADER_PROFILE_IMAGE_SIZE_VALUE / 2.5], Extrapolate.CLAMP);
    return { transform: [{ scale: profileImageCurrentScale.value }, { translateY: imageTranslateY }] };
  });

  // Create a derived value to ensure activity indicator shows during transitions
  const isNearRefreshThreshold = useDerivedValue(() => {
    return scrollOffset.value < 0 && -scrollOffset.value >= pullToRefreshThreshold * 0.85;
  });

  // Style for the activity indicator - ensure it shows during transitions
  const activityIndicatorStyle = useAnimatedStyle(() => {
    // Show indicator during refreshing OR when close to threshold
    // This ensures there's no gap between arrow disappearing and indicator appearing
    const showIndicator = refreshing || isNearRefreshThreshold.value;

    // Ensure immediate visibility during transitions
    return {
      opacity: showIndicator ? 1 : 0,
      position: 'absolute',
    };
  });

  // Arrow style - create slight overlap with activity indicator
  const arrowStyle = useAnimatedStyle(() => {
    // Hide arrow when refreshing or after reaching near threshold
    if (refreshing || (hasReachedThreshold.value && scrollOffset.value < 0)) {
      return {
        opacity: 0,
        position: 'absolute',
      };
    }

    // Mark threshold slightly earlier to ensure overlap with indicator
    if (scrollOffset.value < 0 && -scrollOffset.value >= pullToRefreshThreshold * 0.85) {
      hasReachedThreshold.value = true;
      return {
        opacity: 0,
        position: 'absolute',
      };
    }

    // Show arrow during initial pull
    const showArrow = scrollOffset.value < 0 &&
      -scrollOffset.value < pullToRefreshThreshold * 0.85 &&
      !hasReachedThreshold.value;

    return {
      opacity: showArrow ? 1 : 0,
      position: 'absolute',
    };
  });

  // Before refreshing, store the current scroll offset
  const handleRefreshStart = useCallback(() => {
    prevScrollOffsetBeforeRefresh.value = scrollOffset.value;
  }, [scrollOffset, prevScrollOffsetBeforeRefresh]);

  // Handle refresh end
  const handleRefreshEnd = useCallback(() => {
  }, []);

  // Track component mounting/unmounting for tab changes
  useEffect(() => {
    return () => {
      // When component is about to unmount (like during tab change)
      isChangingTab.value = true;
    };
  }, [isChangingTab]);

  // Reset the tab change flag when component mounts
  useEffect(() => {
    isChangingTab.value = false;
  }, [isChangingTab]);

  // Animate scroll back to top when refreshing finishes with improved handling
  useEffect(() => {
    if (!refreshing && listRef.current && Math.round(scrollOffset.value) < 0) {
      // Add a small delay to ensure smooth transition
      const timeout = setTimeout(() => {
        // Use optional chaining to safely access scrollToLocation
        listRef.current?.scrollToLocation?.({
          sectionIndex: 0,
          itemIndex: 0,
          viewOffset: 0,
          animated: true,
        });
      }, 100);
      
      return () => clearTimeout(timeout);
    }
  }, [refreshing, listRef, scrollOffset]);



  return (
    <View className="relative z-10">
      <Animated.View style={[StyleSheet.absoluteFill, bannerVerticalShiftStyle]}>
        <Animated.View
          onLayout={(e) => (bannerTotalHeight.value = e.nativeEvent.layout.height)}
          style={[parallaxScaleStyle, { minHeight: 110 + BANNER_BOTTOM_MARGIN }]}
        >
          <View style={{ marginBottom: -BANNER_BOTTOM_MARGIN }}>


            {canUseBlurEffect ? (
              <Animated.View style={[StyleSheet.absoluteFill, { zIndex: 1 }, blurOverlayStyle]}>
                <BlurView style={StyleSheet.absoluteFill} intensity={60} tint="dark" />
              </Animated.View>
            ) : (
              <Animated.View
                style={blurOverlayStyle}
                className="absolute inset-0 z-10 bg-black/60"
              />
            )}


            <Image
              source={{ uri: user.header_picture }}
              contentFit="cover"
              contentPosition="center"
              style={[
                { width: windowWidth },
                { height: bannerTotalHeight.value, minHeight: 110 + BANNER_BOTTOM_MARGIN }
              ]}
              className="h-full w-full"
            />



          </View>




        </Animated.View>




        {/* Pull-to-Refresh Indicator Area */}
        <Animated.View
          style={[
            scrollingListStyles.refreshIndicatorContainer,
            { top: safeAreaTop + 20 }
          ]}
        >

          <Animated.View style={arrowStyle}>
            <Feather name="arrow-down" size={24} color="#ffffff" />
          </Animated.View>
          <Animated.View style={activityIndicatorStyle}>
            <ActivityIndicator size="small" color="#ffffff" />
          </Animated.View>

        </Animated.View>




      </Animated.View>








      <TopNavigationBar
        navBarVisibility={navBarVisibility}
        rightContent={
          <View className="flex-row gap-1.5">


            <TouchableOpacity className="bg-black/50 dark:bg-white/20 rounded-full p-2">
              <Grok width={20} height={17} fill="white" />
            </TouchableOpacity>


            <TouchableOpacity className="bg-black/50 dark:bg-white/20 rounded-full p-2">
              <Feather color="white" name="search" size={20} />
            </TouchableOpacity>

            <TouchableOpacity className="bg-black/50 dark:bg-white/20 rounded-full p-2">
              <Share width={20} height={20} fill="white" />
            </TouchableOpacity>


          </View>
        }
        leftContent={
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => navigation.canGoBack() && navigation.goBack()}
              className="bg-black/50 dark:bg-white/20 rounded-full p-2"
            >
              <Feather color="white" name={'arrow-left'} size={20} />
            </TouchableOpacity>
            <OpacityTransitionView visibilityLevel={navBarVisibility}>
              <Text className="text-lg font-bold text-white">{user.name}</Text>
              <Text className="text-xs text-neutral-300">{user.items_count} posts</Text>
            </OpacityTransitionView>
          </View>
        }
      />


      <Animated.View style={profileRowZIndexStyle} className={` flex  px-${SCREEN_HORIZONTAL_PADDING / 4}`}>
        <Animated.View
          style={[
            { left: Math.max(leftInset, SCREEN_HORIZONTAL_PADDING), right: Math.max(rightInset, SCREEN_HORIZONTAL_PADDING) },
            profileRowVerticalShiftStyle,
            { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
          ]}
          className="absolute flex-row justify-between items-end "
        >
          <Animated.View style={profileImageTransformStyle}>
            <TouchableOpacity>
              <ProfileImage
                displaySize={HEADER_PROFILE_IMAGE_SIZE}
                source={{ uri: user.profile_picture }}
                style={{
                  padding: 10,
                  backgroundColor: 'white'
                }}
              />
            </TouchableOpacity>
          </Animated.View>
          {user.id == 1 || user.id == 2 ? (
            <TouchableOpacity className="absolute bottom-0 right-0 py-1 px-3 bg-transparent rounded-full border border-neutral-400/50 dark:border-neutral-600/50 flex flex-start  ">
              <Text className="text-base font-bold text-black dark:text-white">Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity className="absolute bottom-0 right-0 py-1 px-8 bg-black rounded-full border border-neutral-400/50 dark:border-neutral-600/50 flex flex-start  ">
              <Text className="text-base font-bold text-white">Follow</Text>
            </TouchableOpacity>

          )}

        </Animated.View>
      </Animated.View>
    </View>
  );
};

const ProfileDetailsHeader = ({ user }: { user: User }) => {
  const { top: topInset } = useSafeAreaInsets();

  const handleLinkPress = useCallback(async (url: string) => {
    const formattedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    try {
      const isSupported = await Linking.canOpenURL(formattedUrl);
      if (isSupported) {
        await Linking.openURL(formattedUrl);
      } else {
        console.warn(`Cannot open URL: ${formattedUrl}`);
      }
    } catch (error) {
      console.error("Error opening link:", error);
    }
  }, []);

  return (
    <ExpandedHeader>
      <View
        style={{ marginTop: topInset - 10 + HEADER_PROFILE_IMAGE_SIZE_VALUE / 2 }}
        className={`flex-col gap-2 px-${SCREEN_HORIZONTAL_PADDING / 3} w-full`}
      >
        <View className="flex-row gap-2 items-center">
          <Text className="text-2xl font-extrabold text-black dark:text-white">{user.name}</Text>
          {user.is_verified && (
            <Image
              source={{ uri: user.verified_badge }}
              style={{ width: 16, height: 16, alignItems: 'center' }}
            />
          )}
        </View>
        <Text className="text-neutral-500 dark:text-neutral-400 text-base -mt-3">@{user.handle}</Text>
        <Text className="text-black dark:text-white text-lg leading-relaxed">
          {user.bio}
        </Text>
        <View className="flex-row gap-2 items-center flex-wrap">
          <View className="flex-row gap-1.5 items-center">
            <Category width={16} height={16} opacity={0.5} />
            <Text className="text-neutral-500 dark:text-neutral-400 text-base">{user.category}</Text>
          </View>
          <View className="flex-row gap-1.5 items-center">
            <Feather name="link" color="rgb(163 163 163)" size={14} />
            <Text onPress={() => handleLinkPress(user.url)} className="text-sky-500 dark:text-sky-400 text-base">
              {user.url}
            </Text>
          </View>
        </View>
        <View className="flex-row gap-1.5 items-center">
          <Feather name="calendar" color="rgb(163 163 163)" size={14} />
          <Text className="text-neutral-500 dark:text-neutral-400 text-base">Joined {user.joined_date}</Text>
        </View>
        <View className="flex-row gap-4 items-center">
          <TouchableOpacity className="flex-row gap-1.5 items-center">
            <Text className="text-black dark:text-white text-base font-semibold">{user.following_count}</Text>
            <Text className="text-neutral-500 dark:text-neutral-400 text-base">Following</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row gap-1.5 items-center">
            <Text className="text-black dark:text-white text-base font-semibold">{user.followed_by}</Text>
            <Text className="text-neutral-500 dark:text-neutral-400 text-base">Followers</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row gap-8 items-center">
          <View className="relative flex-row -ml-3" style={{ width: PROFILE_IMAGE_SIZE_MAP.xs + (PROFILE_IMAGE_SIZE_MAP.xs / 1.8) * 2, height: PROFILE_IMAGE_SIZE_MAP.xs + 6 }}>
            {[10, 20, 30].map((imgNum, index) => (
              <ProfileImage
                key={`follower-${imgNum}`}
                displaySize="xs"
                source={{
                  uri: index === 0 ? "https://pbs.twimg.com/profile_images/1676741952014897152/j5t0mY_I_400x400.jpg" :
                    index === 1 ? "https://pbs.twimg.com/profile_images/1785867863191932928/EpOqfO6d_400x400.png" :
                      "https://pbs.twimg.com/profile_images/1776070739319214080/TBARcp9C_400x400.jpg"
                }}
                // `https://i.pravatar.cc/128?img=${imgNum}}` }}
                style={{
                  position: 'absolute',
                  top: 0,
                  zIndex: 3 - index,
                  // left: (PROFILE_IMAGE_SIZE_MAP.xs / 1.8) * index,
                  borderRadius: 100,
                }}
                className="border-2 border-white dark:border-black"
              />
            ))}
          </View>
          <Text className="text-neutral-500 dark:text-neutral-400 text-sm flex-1">
            Followed by Expo, React Native, and 15 others
          </Text>
        </View>
      </View>
    </ExpandedHeader>
  );
};

export default function UserProfileScreen() {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<any>(null);
  const { colorScheme, setColorScheme } = useColorScheme();
  const scrollPosition = useSharedValue(0);

  // Get the handle parameter from the URL
  const params = useLocalSearchParams();
  const userHandle = params.id as string;

  // Find the user in users.json by handle
  const user = useMemo(() => {
    return users.find((user) => user.handle.toLowerCase() === userHandle.toLowerCase()) || users[0];
  }, [userHandle]);

  const feedSections: SectionListData<FeedContent, { title: string }>[] = useMemo(() => [
    {
      title: 'Feed',
      data: [
        {
          contentId: 'post-abc',
          poster_id: user.id,
          authorName: user.name,
          authorHandle: user.handle,
          authorImageUrl: user.profile_picture,
          posted_time: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago
          postedTime: '3h',
          message: `Three points 
Clean sheet 
Player of the Match 

A very happy 20th birthday for Dean Huijsen `,
          media_url: 'https://pbs.twimg.com/media/GohzgPVXQAArqUo?format=jpg&name=large',
          like_count: 5423,
          retweet_count: 876,
          reply_count: 234,
          view_count: '102K'
        },
        {
          contentId: 'post-def',
          poster_id: user.id,
          authorName: user.name,
          authorHandle: user.handle,
          authorImageUrl: user.profile_picture,
          posted_time: Date.now() - 6 * 60 * 60 * 1000, // 6 hours ago
          postedTime: '6h',
          message: `A lightning fast start 

It didn't take Antoine Semenyo long to give the Cherries the lead
`,
          media_url: 'https://pbs.twimg.com/media/GohLxVvWYAAR7rK?format=jpg&name=4096x4096',
          like_count: 3211,
          retweet_count: 542,
          reply_count: 178,
          view_count: '78K'
        }
      ]
    },
  ], [user]);

  const profileTabs = ['Posts', 'Affiliates', 'Replies', 'Highlights', 'Videos', 'Photos', 'Articles'];

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      // Apply a slight damping effect to make overscroll feel more natural
      const damping = event.contentOffset.y < 0 ? 0.95 : 1;
      scrollPosition.value = event.contentOffset.y * damping;
    },
    onBeginDrag: (event) => {
      // Track initial touch position for better overscroll handling
      'worklet';
      scrollPosition.value = event.contentOffset.y;
    },
    onEndDrag: (event) => {
      // Improve bounce-back behavior for small overscrolls
      'worklet';
      if (event.contentOffset.y > -50 && event.contentOffset.y < 0) {
        // Let the natural spring animation handle small overscrolls
        // This improves the "stickiness" feeling
      }
    },
  });

  return (
    <>
      <StatusBar style="light" />
      <ScrollingListWithHeader
        NavigationBarComponent={(props) => <ProfileHeader {...props} user={user} refreshing={refreshing} />}
        ExpandedHeaderComponent={(props) => <ProfileDetailsHeader {...props} user={user} />}
        sections={feedSections}
        ignoreLeftPadding
        ignoreRightPadding
        expandedHeaderCollapseThreshold={0.25}
        style={{ flex: 1, backgroundColor: 'white' }}
        contentContainerStyle={{ paddingBottom: bottomInset, flexGrow: 1, backgroundColor: colorScheme === 'light' ? 'white' : 'black' }}
        renderItem={({ item }: { item: FeedContent }) => <FeedItem itemData={item} />}
        stickySectionHeadersEnabled
        renderSectionHeader={() => (
          <View className=" border-b border-neutral-200 dark:border-neutral-700">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING / 4 }}
              contentContainerClassName="flex-row items-center bg-white dark:bg-black w-full"
            >
              {profileTabs.map((tabName, index) => (
                <TouchableOpacity
                  key={`tab-${index}`}
                  className="px-4 justify-center items-center h-[46px] relative"
                  onPress={() => setSelectedTabIndex(index)}
                >
                  <Text className={`text-[16px] font-bold ${selectedTabIndex === index ? 'text-black dark:text-white' : 'text-neutral-500 dark:text-neutral-400'}`}>
                    {tabName}
                  </Text>
                  {selectedTabIndex === index && (
                    <View
                      className="h-1 w-4/5 rounded absolute bottom-0"
                      style={{ backgroundColor: APP_PRIMARY_COLOR }}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            progressViewOffset={100} // Add appropriate offset for header
            progressBackgroundColor="transparent"
            colors={[APP_PRIMARY_COLOR]}
            tintColor={APP_PRIMARY_COLOR}
          />
        }
        ref={listRef}
      />
    </>
  );
};

const scrollingListStyles = StyleSheet.create({
  outerWrapper: { flex: 1 },
  refreshIndicatorContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    left: '50%',
    marginLeft: -20,
    zIndex: 10,
  },
});