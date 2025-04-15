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



const PULL_TO_REFRESH_THRESHOLD = 70; // Pixels to pull down to trigger refresh
const PULL_TO_REFRESH_VISIBLE_THRESHOLD = 10; // Pixels to pull down before arrow starts appearing
const BANNER_BOTTOM_MARGIN = 60; // Margin at the bottom of the banner
const HEADER_PROFILE_IMAGE_SIZE = 'l';
const HEADER_PROFILE_IMAGE_SIZE_VALUE = 100;
const HEADER_PROFILE_IMAGE_START_SCALE = 1;
const HEADER_PROFILE_IMAGE_END_SCALE = 0.6;
const SCREEN_HORIZONTAL_PADDING = 16;

type ProfileImageSize = 'xxs' | 'xs' | 's' | 'm' | 'l';
type ProfileImageProps = ImageProps & { displaySize?: ProfileImageSize; className?: string };

type ProfileImageReducerState = { isLoading: boolean; hasError: boolean };
type ProfileImageReducerActions = { type: 'loaded' } | { type: 'error' };
type ProfileImageReducer = Reducer<ProfileImageReducerState, ProfileImageReducerActions>;

const PROFILE_IMAGE_DIMENSIONS: Record<ProfileImageSize, number> = {
  xxs: 20,
  xs: 30,
  s: 40,
  m: 70,
  l: 100,
};

export const PROFILE_IMAGE_SIZE_MAP = { ...PROFILE_IMAGE_DIMENSIONS };

export const ProfileImage: React.FC<ProfileImageProps> = ({ style, displaySize = 's', className = '', ...imageProps }) => {
  const [{ isLoading, hasError }, dispatch] = useReducer<ProfileImageReducer>(
    (state, action) => {
      if (action.type === 'loaded') return { isLoading: false, hasError: false };
      if (action.type === 'error') return { isLoading: false, hasError: true };
      return state;
    },
    { isLoading: true, hasError: false }
  );

  const dimension = PROFILE_IMAGE_DIMENSIONS[displaySize];
  const dimensionStyle = { width: dimension, height: dimension };

  if (hasError) {
    return <Feather name="user" size={dimension} color="grey" style={dimensionStyle} />;
  }

  return (
    <View className={` p-1 rounded-lg mx-1.5 ${className}`}>
      {isLoading && (
        <View
          style={dimensionStyle}
          className="absolute justify-center items-center bg-neutral-200 dark:bg-neutral-700 rounded-md"
        >
          <ActivityIndicator size="small" color="grey" />
        </View>
      )}
      <Image
        {...imageProps}
        onError={() => dispatch({ type: 'error' })}
        onLoad={() => dispatch({ type: 'loaded' })}
        contentFit="cover"
        style={[dimensionStyle, style]}
        className="rounded-md"
      />
    </View>
  );
};

const EngagementActions = () => {
  const colorScheme = useColorScheme();
  return (
    <View className="flex-row items-center gap-1.5 justify-between">
      <TouchableOpacity className="flex-row items-center gap-1.5">
        <Comment width={20} height={20} fill={colorScheme === 'dark' ? '#8b98a5' : '#536471'} />
        <Text className="text-sm text-neutral-600 dark:text-neutral-400">100</Text>
      </TouchableOpacity>

      <TouchableOpacity className="flex-row items-center gap-1.5">
        <Repost width={20} height={20} fill={colorScheme === 'dark' ? '#8b98a5' : '#536471'} />
        <Text className="text-sm text-neutral-600 dark:text-neutral-400">100</Text>
      </TouchableOpacity>

      <TouchableOpacity className="flex-row items-center gap-1.5">
        <Like width={20} height={20} fill={colorScheme === 'dark' ? '#8b98a5' : '#536471'} />
        <Text className="text-sm text-neutral-600 dark:text-neutral-400">100</Text>
      </TouchableOpacity>

      <TouchableOpacity className="flex-row items-center gap-1.5">
        <Views width={20} height={20} fill={colorScheme === 'dark' ? '#8b98a5' : '#536471'} />
        <Text className="text-sm text-neutral-600 dark:text-neutral-400">100</Text>
      </TouchableOpacity>

      <TouchableOpacity className="flex-row items-center gap-1.5">
        <Save width={20} height={20} fill={colorScheme === 'dark' ? '#8b98a5' : '#536471'} />
      </TouchableOpacity>


      <TouchableOpacity className="flex-row items-center gap-1.5">
        <Feather name="share" size={20} color={colorScheme === 'dark' ? '#8b98a5' : '#536471'} />
      </TouchableOpacity>
    </View>
  );
};

interface FeedContent {
  contentId: string;
  authorName: string;
  authorHandle: string;
  authorImageUrl: string;
  postedTime: string;
  message: string;
  mediaUrl?: string;
}

const sampleFeedItems: FeedContent[] = [
  {
    contentId: 'post-abc',
    authorName: 'Premier League', // Added missing fields
    authorHandle: 'premierleague', // Added missing fields
    authorImageUrl: 'https://pbs.twimg.com/profile_images/1742837199005954048/YGI6Kw7P_400x400.jpg', // Added missing fields
    postedTime: '3h',
    message: `Three points ✅
Clean sheet ✅
Player of the Match ✅

A very happy 20th birthday for Dean Huijsen 🎂
`,
    mediaUrl: 'https://pbs.twimg.com/media/GohzgPVXQAArqUo?format=jpg&name=large',
  },
  {
    contentId: 'post-def',
    authorName: 'Code Enthusiast',
    authorHandle: 'coderocks',
    authorImageUrl: 'https://picsum.photos/seed/def/100/100',
    postedTime: '6h',
    message: `A lightning fast start ⚡️⚡️⚡️

It didn't take Antoine Semenyo long to give the Cherries the lead
`,
    mediaUrl: 'https://pbs.twimg.com/media/GohLxVvWYAAR7rK?format=jpg&name=4096x4096',
  },
];

const current_user = {
  name: 'Premier League',
  handle: 'premierleague',
  bio: 'The official account of the Premier League 📱',
  url: 'premierleague.com',
  followed_by: '45.5M',
  items_count: '166.6K',
  following_count: 80,
  joined_date: "July 2011",
  category: "Sports, Fitness & Recreation",
  profile_picture: "https://pbs.twimg.com/profile_images/1742837199005954048/YGI6Kw7P_400x400.jpg",
  header_picture: "https://pbs.twimg.com/profile_banners/343627165/1744359099/1500x500",
  is_verified: true,
  verified_badge: "https://upload.wikimedia.org/wikipedia/commons/8/81/Twitter_Verified_Badge_Gold.svg"
};

interface FeedItemProps {
  itemData: FeedContent;
}

const FeedItem: React.FC<FeedItemProps> = ({ itemData }) => {
  return (
    <View className="flex-row px-2 py-2.5 border-b border-neutral-200 dark:border-neutral-700 pr-4">
      <ProfileImage
        displaySize="s"
        source={{ uri: current_user.profile_picture }}
        className="rounded-full"
      />
      <View className="flex-1">
        <View className="flex-row justify-between items-start mb-1">
          <View className="flex-row items-center flex-shrink mr-1">

            <Text className="font-bold text-base text-black dark:text-white mr-1">{current_user.name}</Text>
            {current_user.is_verified && (
              <Image
                source={{ uri: current_user.verified_badge }}
                className="w-4 h-4 mr-1" // Removed mr-1.5, adjusted spacing above
              />
            )}
            <Text className="text-base text-neutral-500 dark:text-neutral-400 flex-shrink" numberOfLines={1}>
              @{current_user.handle} · {itemData.postedTime}
            </Text>
          </View>
          <TouchableOpacity className="pl-2">
            <Feather name="more-horizontal" size={18} color="#556677" />
          </TouchableOpacity>
        </View>
        <Text className="text-lg text-black dark:text-neutral-100 leading-snug">
          {itemData.message}
        </Text>

        <Image
          source={{ uri: itemData.mediaUrl }}
          className="w-full h-[400px]  rounded-xl mb-2 bg-neutral-100 dark:bg-neutral-800 
            
            "
          contentFit="cover"
        />

        <View className="">
          <EngagementActions />
        </View>
      </View>


    </View>
  );
};


const canUseBlurEffect =
  Platform.OS === 'ios' || (Platform.OS === 'android' && Number(Platform.Version) >= 31);

const APP_PRIMARY_COLOR = '#1d9bf0';

const ProfileHeader = ({ navBarVisibility, scrollOffset }) => {
  const navigation = useNavigation();
  const { left: leftInset, right: rightInset, top: safeAreaTop } = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const bannerTotalHeight = useSharedValue(110 + BANNER_BOTTOM_MARGIN);
  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<any>(null);
  const pullToRefreshThreshold = PULL_TO_REFRESH_THRESHOLD;

  const blurOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(Math.abs(scrollOffset.value), [0, 50], [0, 1], Extrapolate.CLAMP),
  }));
  const profileImageCurrentScale = useDerivedValue(() => interpolate(
    scrollOffset.value, [0, BANNER_BOTTOM_MARGIN], [HEADER_PROFILE_IMAGE_START_SCALE, HEADER_PROFILE_IMAGE_END_SCALE], Extrapolate.CLAMP
  ));
  const bannerVerticalShiftStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollOffset.value, [0, BANNER_BOTTOM_MARGIN], [0, -BANNER_BOTTOM_MARGIN], Extrapolate.CLAMP) }],
  }));
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






  // Animate scroll back to top when refreshing finishes
  useEffect(() => {
    if (!refreshing && listRef.current && Math.round(scrollOffset.value) < 0) {
      // Use optional chaining to safely access scrollToLocation
      listRef.current?.scrollToLocation?.({
        sectionIndex: 0,
        itemIndex: 0,
        viewOffset: 0,
        animated: true,
      });
    }
  }, [refreshing, listRef, scrollOffset]);

  // Style for the pull-down arrow icon
  const arrowStyle = useAnimatedStyle(() => {
    const opacity = refreshing ? 0 : interpolate(
      -scrollOffset.value, // Use negative scroll offset (positive when pulling)
      [PULL_TO_REFRESH_VISIBLE_THRESHOLD, pullToRefreshThreshold],
      [0, 1],
      Extrapolate.CLAMP
    );
    return {
      opacity: withTiming(opacity, { duration: 100, easing: Easing.ease }),
    };
  });


  return (
    <View className="relative z-10">
      <Animated.View style={[StyleSheet.absoluteFill, bannerVerticalShiftStyle]}>
        <Animated.View
          onLayout={(e) => (bannerTotalHeight.value = e.nativeEvent.layout.height)}
          style={parallaxScaleStyle}
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
              source={{ uri: current_user.header_picture }}
              contentFit="cover"
              contentPosition="center"
              style={[{ width: windowWidth }, { height: bannerTotalHeight.value }]}
              className="h-full w-full"
            />
          </View>




        </Animated.View>


      </Animated.View>



    {/* Pull-to-Refresh Indicator Area */}
    <Animated.View style={[scrollingListStyles.refreshIndicatorContainer, { top: safeAreaTop + 44 + 10 }]}>
        {refreshing ? (
          <ActivityIndicator size="large" color={'#fff'} />
        ) : (
          <Animated.View style={arrowStyle} className="absolute bottom-0 left-0 right-0 items-center justify-center w-full">
            <Feather name="arrow-down" size={24} color={'#fff'} />
          </Animated.View>
        )}
      </Animated.View>



      <TopNavigationBar
        navBarVisibility={navBarVisibility}
        rightContent={
          <View className="flex-row gap-1.5">
            <TouchableOpacity className="bg-black/50 dark:bg-white/20 rounded-full p-2">
              <Feather color="white" name="more-horizontal" size={20} />
            </TouchableOpacity>
            <TouchableOpacity className="bg-black/50 dark:bg-white/20 rounded-full p-2">
              <Feather color="white" name="search" size={20} />
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
              <Text className="text-lg font-bold text-white">{current_user.name}</Text>
              <Text className="text-xs text-neutral-300">{current_user.items_count} posts</Text>
            </OpacityTransitionView>
          </View>
        }
      />


      <Animated.View style={profileRowZIndexStyle} className={` flex  px-${SCREEN_HORIZONTAL_PADDING / 4}`}>
        <Animated.View
          style={[
            { left: Math.max(leftInset, SCREEN_HORIZONTAL_PADDING), right: Math.max(rightInset, SCREEN_HORIZONTAL_PADDING) },
            profileRowVerticalShiftStyle,
            { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'end' },
          ]}
          className="absolute flex-row justify-between items-end "
        >
          <Animated.View style={profileImageTransformStyle}>
            <TouchableOpacity>
              <ProfileImage
                displaySize={HEADER_PROFILE_IMAGE_SIZE}
                source={{ uri: current_user.profile_picture }}
              />
            </TouchableOpacity>
          </Animated.View>
          <TouchableOpacity className="absolute bottom-0 right-0 py-1 px-3 bg-transparent rounded-full border border-neutral-400/50 dark:border-neutral-600/50 flex flex-start  ">
            <Text className="text-base font-bold text-black dark:text-white">Edit Profile</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const ProfileDetailsHeader = () => {
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
        style={{ marginTop: topInset + 10 + HEADER_PROFILE_IMAGE_SIZE_VALUE / 2 + 10 }}
        className={`flex-col gap-3 px-${SCREEN_HORIZONTAL_PADDING / 4} w-full`}
      >
        <View className="flex-row gap-2 items-center">
          <Text className="text-2xl font-extrabold text-black dark:text-white">{current_user.name}</Text>
          {current_user.is_verified && (
            <Image
              source={{ uri: current_user.verified_badge }}
              style={{ width: 16, height: 16, alignItems: 'center' }}
            />
          )}
        </View>
        <Text className="text-neutral-500 dark:text-neutral-400 text-base -mt-3">@{current_user.handle}</Text>
        <Text className="text-black dark:text-white text-lg leading-relaxed">
          {current_user.bio}
        </Text>
        <View className="flex-row gap-2 items-center flex-wrap">
          <View className="flex-row gap-1.5 items-center">
            <Category width={16} height={16} opacity={0.5} />
            <Text className="text-neutral-500 dark:text-neutral-400 text-base">{current_user.category}</Text>
          </View>
          <View className="flex-row gap-1.5 items-center">
            <Feather name="link" color="rgb(163 163 163)" size={14} />
            <Text onPress={() => handleLinkPress(current_user.url)} className="text-sky-500 dark:text-sky-400 text-base">
              {current_user.url}
            </Text>
          </View>
        </View>
        <View className="flex-row gap-1.5 items-center">
          <Feather name="calendar" color="rgb(163 163 163)" size={14} />
          <Text className="text-neutral-500 dark:text-neutral-400 text-base">Joined {current_user.joined_date}</Text>
        </View>
        <View className="flex-row gap-4 items-center">
          <TouchableOpacity className="flex-row gap-1.5 items-center">
            <Text className="text-black dark:text-white text-base font-semibold">{current_user.following_count}</Text>
            <Text className="text-neutral-500 dark:text-neutral-400 text-base">Following</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row gap-1.5 items-center">
            <Text className="text-black dark:text-white text-base font-semibold">{current_user.followed_by}</Text>
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
                // `https://i.pravatar.cc/128?img=${imgNum}` }}
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
  const scrollOffset = useSharedValue(0);

  const feedSections: SectionListData<FeedContent, { title: string }>[] = useMemo(() => [
    { title: 'Feed', data: sampleFeedItems },
  ], []);

  const profileTabs = ['Posts', 'Affiliates', 'Replies', 'Highlights', 'Videos', 'Photos', 'Articles'];

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <ScrollingListWithHeader
        NavigationBarComponent={ProfileHeader}
        ExpandedHeaderComponent={ProfileDetailsHeader}
        sections={feedSections}
        ignoreLeftPadding
        ignoreRightPadding
        expandedHeaderCollapseThreshold={0.25}
        style={{ flex: 1 }}
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
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5, // Above list, below nav bar
    height: 60,
  },
});