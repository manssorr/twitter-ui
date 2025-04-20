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
import { useLocalSearchParams } from 'expo-router';
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
  SharedValue,
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
// Import JSON data
import usersData from '~/dummy/users.json';
import postsData from '~/dummy/posts.json';

const PULL_TO_REFRESH_THRESHOLD = 70; // Pixels to pull down to trigger refresh
const PULL_TO_REFRESH_VISIBLE_THRESHOLD = 10; // Pixels to pull down before arrow starts appearing
const BANNER_BOTTOM_MARGIN = 60; // Margin at the bottom of the banner
const HEADER_PROFILE_IMAGE_SIZE = 'm';
const HEADER_PROFILE_IMAGE_SIZE_VALUE = 100;
const HEADER_PROFILE_IMAGE_START_SCALE = 1;
const HEADER_PROFILE_IMAGE_END_SCALE = 0.6;
const SCREEN_HORIZONTAL_PADDING = 16;

// User interface definition for type safety
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
  is_organization?: boolean;
}

const canUseBlurEffect =
  Platform.OS === 'ios' || (Platform.OS === 'android' && Number(Platform.Version) >= 31);

const APP_PRIMARY_COLOR = '#1d9bf0';

const ProfileHeader = ({ navBarVisibility, scrollOffset, refreshing, user }: { 
  navBarVisibility: number; 
  scrollOffset: SharedValue<number>; 
  refreshing: boolean;
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

  // Modified banner shift style to maintain position
  const bannerVerticalShiftStyle = useAnimatedStyle(() => {
    const effectiveScroll = isChangingTab.value ? 
      Math.min(0, scrollOffset.value) : 
      scrollOffset.value;
      
    return {
      transform: [{ 
        translateY: interpolate(
          effectiveScroll, 
          [0, BANNER_BOTTOM_MARGIN], 
          [0, -BANNER_BOTTOM_MARGIN], 
          Extrapolate.CLAMP
        ) 
      }],
    };
  });

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
  const parallaxScaleStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollOffset.value, [0, -(windowHeight + bannerTotalHeight.value)], [1, windowHeight / bannerTotalHeight.value], Extrapolate.CLAMP);
    return { transform: [{ scaleY: scale }, { scaleX: scale }] };
  }, [windowHeight]);

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

  return (
    <>
      <Animated.View style={[StyleSheet.absoluteFill, bannerVerticalShiftStyle]}>
        <Animated.View
          onLayout={(e) => (bannerTotalHeight.value = e.nativeEvent.layout.height)}
          style={[parallaxScaleStyle, { minHeight: 110 + BANNER_BOTTOM_MARGIN }]}
        >
          <View style={{ marginBottom: -BANNER_BOTTOM_MARGIN }}>

            
            {canUseBlurEffect ? (
              <BlurView
                style={[StyleSheet.absoluteFill, blurOverlayStyle, { zIndex: 1 }]}
                intensity={80}
                tint="dark"
              />
            ) : (
              <Animated.View
                style={[StyleSheet.absoluteFill, blurOverlayStyle, { backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1 }]}
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
      </Animated.View>

      <View className="absolute w-full top-0 left-0 z-10">
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: PULL_TO_REFRESH_THRESHOLD,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            paddingTop: safeAreaTop,
          }}
        >
          <Animated.View style={arrowStyle}>
            <Feather name="arrow-down" size={24} color="white" />
          </Animated.View>
          <Animated.View style={activityIndicatorStyle}>
            <ActivityIndicator color="white" size="small" />
          </Animated.View>
        </View>

        <Animated.View style={blurOverlayStyle}>
          <View style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
          
        <TopNavigationBar 
          leadingItem={
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
            >
              <Feather color="white" name={'arrow-left'} size={20} />
            </TouchableOpacity>
          }
          trailingItem={
            <View className='flex-row gap-2'>
              <TouchableOpacity className="w-10 h-10 rounded-full bg-black/50 items-center justify-center">
                <Feather name="search" size={20} color='white' />
              </TouchableOpacity>

              <TouchableOpacity className="w-10 h-10 rounded-full bg-black/50 items-center justify-center">
                <Feather name="more-vertical" size={20} color='white' />
              </TouchableOpacity>
            </View>
          }
          centerItem={
          <View
            className="absolute top-0 left-0 w-full flex-row justify-between items-center px-4 z-10"
            style={{ height: safeAreaTop + 50, paddingTop: safeAreaTop, alignItems: 'center', justifyContent: 'space-between' }}
          >
            <TouchableOpacity onPress={() => navigation.goBack()} 
              className="w-10 h-10 rounded-full bg-black/50 items-center justify-center" 
              style={{ alignItems: 'center' }}
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
      </View>


      <Animated.View style={profileRowZIndexStyle} className={` flex  px-${SCREEN_HORIZONTAL_PADDING / 4}`}>
        <Animated.View
          style={[
            { left: Math.max(leftInset, SCREEN_HORIZONTAL_PADDING), right: Math.max(rightInset, SCREEN_HORIZONTAL_PADDING) },
            profileRowVerticalShiftStyle,
            { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
          ]}
        >
          <Animated.View style={profileImageTransformStyle}>
            <TouchableOpacity>
              <ProfileImage
                displaySize={HEADER_PROFILE_IMAGE_SIZE}
                source={{ uri: user.profile_picture }}
                style={{
                  padding:10,
                  backgroundColor: 'white'
                }}
                className="border-[3px] border-white dark:border-black bg-white dark:bg-black"
              />
            </TouchableOpacity>
          </Animated.View>
          <Animated.View
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 8,
            }}
          >
            {/* Profile action buttons can go here */}
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </>
  );
};

const ProfileDetailsHeader = ({ user }: { user: User }) => {
  const { top: topInset } = useSafeAreaInsets();

  const handleLinkPress = useCallback(async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        await Linking.openURL(`https://${url}`);
      } else {
        await Linking.openURL(url);
      }
    } else {
      console.log(`Don't know how to open this URL: ${url}`);
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
                style={{
                  position: 'absolute',
                  top: 0,
                  zIndex: 3 - index,
                  left: (PROFILE_IMAGE_SIZE_MAP.xs / 1.8) * index,
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
  const { id } = useLocalSearchParams();
  
  // Find user by ID or handle
  const user = useMemo(() => {
    const userId = typeof id === 'string' ? id : '';
    // First try to find user by ID
    let foundUser = usersData.find((user: User) => user.id === userId);
    
    // If not found by ID, try to find by handle (for backward compatibility)
    if (!foundUser) {
      foundUser = usersData.find((user: User) => user.handle.toLowerCase() === userId.toLowerCase());
    }
    
    return foundUser || usersData[0]; // Default to first user if not found
  }, [id]);
  
  // Find posts by this user
  const userPosts = useMemo(() => {
    // Check for posts with poster_id (newer format)
    const posterIdPosts = postsData.filter((post: any) => 'poster_id' in post && post.poster_id === user.id);
    
    // Check for posts with authorHandle (older format) for backward compatibility
    const authorHandlePosts = postsData.filter(
      (post: any) => 'authorHandle' in post && post.authorHandle && post.authorHandle.toLowerCase() === user.handle.toLowerCase()
    );
    
    const allUserPosts = [...posterIdPosts, ...authorHandlePosts];
    
    // Convert all posts to FeedContent format
    return allUserPosts.map((post: any) => {
      if ('poster_id' in post) {
        // Handle new format posts
        return {
          poster_id: post.poster_id || user.id, // Ensure it's never undefined
          posted_time: parseInt(post.posted_time),
          message: post.message,
          media_url: post.media_url,
          like_count: post.like_count ? parseInt(post.like_count.toString()) : 0,
          retweet_count: post.retweet_count ? parseInt(post.retweet_count.toString()) : 0,
          reply_count: post.reply_count ? parseInt(post.reply_count.toString()) : 0,
          view_count: post.view_count || "0",
          // Optional fields for backward compatibility
          contentId: post.poster_id + '-' + post.posted_time,
          authorName: user.name,
          authorHandle: user.handle,
          authorImageUrl: user.profile_picture,
          is_organization: user.is_organization || false
        };
      } else {
        // Handle old format posts - converting to new format
        return {
          poster_id: user.id, // Use the user ID we found
          posted_time: parseInt(post.postedTime) || Math.floor(Date.now() / 1000), // Convert to number if possible or use current time
          message: post.message,
          media_url: post.mediaUrl,
          like_count: post.likeCount ? parseInt(post.likeCount.replace(/[KM]/g, '')) : 0,
          retweet_count: post.retweetCount ? parseInt(post.retweetCount.replace(/[KM]/g, '')) : 0,
          reply_count: post.replyCount ? parseInt(post.replyCount.replace(/[KM]/g, '')) : 0,
          view_count: post.viewCount || "0",
          // Keep the original fields for backward compatibility
          contentId: post.contentId,
          authorName: post.authorName,
          authorHandle: post.authorHandle,
          authorImageUrl: post.authorImageUrl,
          is_organization: user.is_organization || false
        };
      }
    });
  }, [user]);

  const feedSections: SectionListData<FeedContent, { title: string }>[] = useMemo(() => [
    { title: 'Feed', data: userPosts },
  ], [userPosts]);

  const profileTabs = ['Posts', 'Affiliates', 'Replies', 'Highlights', 'Videos', 'Photos', 'Articles'];

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollPosition.value = event.contentOffset.y;
    },
  });

  return (
    <>
      <StatusBar style="light" />
      <ScrollingListWithHeader
        NavigationBarComponent={() => <ProfileHeader navBarVisibility={1} scrollOffset={scrollPosition} refreshing={refreshing} user={user} />}
        ExpandedHeaderComponent={() => <ProfileDetailsHeader user={user} />}
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
          />
        }
        ref={listRef}
      />
    </>
  );
}