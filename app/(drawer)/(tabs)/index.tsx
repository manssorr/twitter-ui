import React, { useCallback, useMemo, useState, useReducer, Reducer } from 'react';
import {
  Linking,
  // SectionListRenderItem, // No longer needed if using map directly
  StyleSheet, // Keep for StyleSheet.absoluteFill if needed, or replace with inset-0
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Platform,
  ActivityIndicator,
  ScrollView,
  SectionListData, // Keep standard type
  // StyleProp, // No longer needed
  // ViewStyle, // No longer needed
  // TextStyle, // No longer needed
  // ImageStyle, // No longer needed
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native'; // Keep library import
// Import refactored components with new names
import {
  OpacityTransitionView,
  TopNavigationBar,
  ExpandedHeader,
  ScrollingListWithHeader,
} from '~/components/TwitterComponent'; // Adjusted import path/name
import { StatusBar } from 'expo-status-bar'; // Keep library import
import { Feather } from '@expo/vector-icons'; // Keep library import
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated'; // Keep library import
import { BlurView } from 'expo-blur'; // Keep library import
import { Image, ImageProps } from 'expo-image'; // Keep library import

// --- Profile Image Component ---

// Define possible sizes for the profile image
type ProfileImageSize = 'xxs' | 'xs' | 's' | 'm' | 'l';
// Define props for the ProfileImage component, extending expo-image ImageProps
// Added className prop for Tailwind
type ProfileImageProps = ImageProps & { displaySize?: ProfileImageSize; className?: string };

// State for the ProfileImage loading/error status
type ProfileImageReducerState = { isLoading: boolean; hasError: boolean };
// Actions for the ProfileImage reducer
type ProfileImageReducerActions = { type: 'loaded' } | { type: 'error' };
// Type definition for the reducer function
type ProfileImageReducer = Reducer<ProfileImageReducerState, ProfileImageReducerActions>;

// Mapping from size names to pixel values - Still needed for dynamic sizing
const PROFILE_IMAGE_DIMENSIONS: Record<ProfileImageSize, number> = {
  xxs: 20,
  xs: 30,
  s: 50,
  m: 70,
  l: 100,
};

// Export the size map for potential external use
export const PROFILE_IMAGE_SIZE_MAP = { ...PROFILE_IMAGE_DIMENSIONS };

/**
 * Component to display a user's profile image with loading and error states.
 * Uses Tailwind classes for styling.
 */
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
  const dimensionStyle = { width: dimension, height: dimension }; // Dynamic size style

  if (hasError) {
    // Apply dimension style directly for the placeholder icon
    return <Feather name="user" size={dimension} color="grey" style={dimensionStyle} />;
  }

  return (
    // Outer wrapper - uses Tailwind classes now
    <View className={`bg-white dark:bg-neutral-800 p-1 rounded-lg mx-1.5 ${className}`}>
      {/* Loading indicator container */}
      {isLoading && (
        <View
          // Combine dynamic size with Tailwind classes
          style={dimensionStyle}
          className="absolute justify-center items-center bg-neutral-200 dark:bg-neutral-700 rounded-md"
        >
          <ActivityIndicator size="small" color="grey" />
        </View>
      )}

      {/* Image component - uses dynamic size and passed className */}
      <Image
        {...imageProps}
        onError={() => dispatch({ type: 'error' })}
        onLoad={() => dispatch({ type: 'loaded' })}
        contentFit="cover"
        // Combine dynamic size, base Tailwind, and passed style/className
        style={[dimensionStyle, style]} // Keep dynamic style and allow overriding via prop
        className="rounded-md" // Base Tailwind class
      />
    </View>
  );
};


// --- Feed Item Component ---

// Interface defining the structure of a feed item (post)
interface FeedContent {
  contentId: string;
  authorName: string;
  authorHandle: string;
  authorImageUrl: string;
  postedTime: string;
  message: string;
  mediaUrl?: string;
}

// Sample data for feed items
const sampleFeedItems: FeedContent[] = [
  {
    contentId: 'post-abc',
    postedTime: '3h',
    message: 'Building cool stuff with React Native and Expo! Check out the new scrolling header component.',
    mediaUrl: 'https://picsum.photos/seed/media-abc/600/400',
  },
  {
    contentId: 'post-def',
    authorName: 'Code Enthusiast',
    authorHandle: 'coderocks',
    authorImageUrl: 'https://picsum.photos/seed/def/100/100',
    postedTime: '6h',
    message: 'Just refactored a complex component. Renaming everything makes it feel brand new! #CleanCode',
  },
];

const current_user = {
  name: 'Premier League',
  handle: 'premierleague',
  bio: 'The official account of the Premier League 📱',
  url: 'premierleague.com',
  followed_by: 15,
  items_count: 10,
  joined_date: "July 2011",
  category: "Sports, Fitness & Recreation",
  profile_picture: "https://pbs.twimg.com/profile_images/1742837199005954048/YGI6Kw7P_400x400.jpg",
  header_picture: "https://pbs.twimg.com/profile_banners/343627165/1744359099/1500x500",
  is_verified: true,
  verified_badge: "https://upload.wikimedia.org/wikipedia/commons/8/81/Twitter_Verified_Badge_Gold.svg"
};

// Props for the component that renders a single feed item
interface FeedItemProps {
  itemData: FeedContent;
}

/**
 * Component to render a single item in the user's feed.
 * Uses Tailwind classes for styling.
 */
const FeedItem: React.FC<FeedItemProps> = ({ itemData }) => {
  return (
    // Item container with Tailwind classes
    <View className="flex-row px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-700">
      {/* Author's Profile Image - Apply size directly */}
      <Image
        source={{ uri: current_user.profile_picture }}
        className="w-11 h-11 rounded-full mr-2.5 bg-neutral-100 dark:bg-neutral-800" // Tailwind size, shape, margin, background
      />

      {/* Main Content Area */}
      <View className="flex-1">
        {/* Header Section */}
        <View className="flex-row justify-between items-start mb-1">
          {/* Author Info */}
          <View className="flex-row items-center flex-shrink">
            <Text className="font-bold text-base text-white">{  current_user.name}</Text>
            {current_user.is_verified && (
              <Image
                source={{ uri: current_user.verified_badge }}
                className="w-4 h-4 mr-1.5"
              />
            )}
            <Text className="text-sm text-neutral-500 dark:text-neutral-400 ml-1 flex-shrink" numberOfLines={1}>
              @{current_user.handle} · {itemData.postedTime}
            </Text>
          </View>
          {/* More Options Button */}
          <TouchableOpacity className="pl-3">
            <Feather name="more-horizontal" size={18} color="#556677" />
          </TouchableOpacity>
        </View>

        {/* Message Text */}
        <Text className="text-base text-neutral-800 dark:text-neutral-200 leading-snug mb-2">
          {itemData.message}
        </Text>

        {/* Media Image */}
        {itemData.mediaUrl && (
          <Image
            source={{ uri: itemData.mediaUrl }}
            className="w-full aspect-video rounded-xl mt-1.5 mb-2 bg-neutral-100 dark:bg-neutral-800" // Tailwind aspect ratio, rounding, margin, background
            contentFit="cover"
          />
        )}

        {/* Placeholder for action buttons */}
        <View className="h-6"></View>
      </View>
    </View>
  );
};


// --- Screen Components & Logic ---

// Check if BlurView is usable based on Platform and OS version - Keep this logic
const canUseBlurEffect =
  Platform.OS === 'ios' || (Platform.OS === 'android' && Number(Platform.Version) >= 31);

// Constants for layout and styling - Some might be replaced by Tailwind, keep dynamic ones
const SCREEN_HORIZONTAL_PADDING = 8; // Can use p-2 or similar Tailwind class
const APP_PRIMARY_COLOR = '#007AFF'; // Keep for direct color usage (e.g., icons, active tab)
const MUTED_TEXT_COLOR = 'rgba(235, 235, 245, 0.6)'; // Use Tailwind text-neutral-xxx/60 or similar
const HEADER_PROFILE_IMAGE_SIZE: ProfileImageSize = 'm';
const HEADER_PROFILE_IMAGE_START_SCALE = 1;
const HEADER_PROFILE_IMAGE_END_SCALE = 0.5;
const HEADER_PROFILE_IMAGE_SIZE_VALUE = PROFILE_IMAGE_SIZE_MAP[HEADER_PROFILE_IMAGE_SIZE];
const BANNER_BOTTOM_MARGIN = HEADER_PROFILE_IMAGE_SIZE_VALUE;

/**
 * Component rendering the top navigation bar and the banner image.
 * Handles animations based on scroll position. Uses Tailwind for base styles.
 */
const ProfileHeader = ({ navBarVisibility, scrollOffset }) => {
  const navigation = useNavigation();
  const { left: leftInset, right: rightInset } = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const bannerTotalHeight = useSharedValue(110 + BANNER_BOTTOM_MARGIN);

  // --- Animated Styles (Keep these as they are dynamic) ---
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
  // --- End Animated Styles ---

  return (
    // Use relative positioning for the container
    <View className="relative z-10">
      {/* Animated container for banner */}
      <Animated.View style={[StyleSheet.absoluteFill, bannerVerticalShiftStyle]}>
        {/* Apply parallax scaling */}
        <Animated.View
          onLayout={(e) => (bannerTotalHeight.value = e.nativeEvent.layout.height)}
          style={parallaxScaleStyle}
        >
          {/* Add negative margin */}
          <View style={{ marginBottom: -BANNER_BOTTOM_MARGIN }}>
            {/* Blur effect overlay */}
            {canUseBlurEffect ? (
              <Animated.View style={[StyleSheet.absoluteFill, { zIndex: 1 } /* Ensure overlay is on top */, blurOverlayStyle]}>
                {/* BlurView itself doesn't take className well, style directly */}
                <BlurView style={StyleSheet.absoluteFill} intensity={60} tint="dark" />
              </Animated.View>
            ) : (
              // Fallback overlay with Tailwind
              <Animated.View
                style={blurOverlayStyle} // Apply animated opacity
                className="absolute inset-0 z-10 bg-black/60" // Use Tailwind for background color/opacity
              />
            )}

            {/* Banner Image - Use dynamic width */}
            <Image
              source={{ uri: current_user.header_picture }}
              contentFit="cover"
              contentPosition="center"
              // Apply dynamic width and Tailwind height
              style={[{ width: windowWidth }, { height: bannerTotalHeight.value }]}
              className="h-full w-full"
            />
          </View>
        </Animated.View>
      </Animated.View>

      {/* Top Navigation Bar Component */}
      <TopNavigationBar
        navBarVisibility={navBarVisibility}
        // Right side content with Tailwind styled buttons
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
        // Left side content with Tailwind styled button and text
        leftContent={
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => navigation.canGoBack() && navigation.goBack()}
              className="bg-black/50 dark:bg-white/20 rounded-full p-2"
            >
              <Feather color="white" name={'arrow-left'} size={20} />
            </TouchableOpacity>
            {/* Fading view for user info */}
            <OpacityTransitionView visibilityLevel={navBarVisibility}>
              <Text className="text-lg font-bold text-white">{current_user.name}</Text>
              <Text className="text-xs text-neutral-300">{current_user.items_count} posts</Text>
            </OpacityTransitionView>
          </View>
        }
      />

      {/* Animated Profile Image Row */}
      {/* Apply animated zIndex and base padding */}
      <Animated.View style={profileRowZIndexStyle} className={`px-${SCREEN_HORIZONTAL_PADDING / 4}`}>
        {/* Container with absolute positioning and animated vertical shift */}
        <Animated.View
          style={[
            { left: Math.max(leftInset, SCREEN_HORIZONTAL_PADDING), right: Math.max(rightInset, SCREEN_HORIZONTAL_PADDING) }, // Dynamic positioning
            profileRowVerticalShiftStyle, // Apply animation
          ]}
          // Use Tailwind for layout
          className="absolute flex-row justify-between items-end"
        >
          {/* Animated container for the profile image (handles scaling) */}
          <Animated.View style={profileImageTransformStyle}>
            <TouchableOpacity>
              <ProfileImage
                displaySize={HEADER_PROFILE_IMAGE_SIZE}
                source={{ uri: current_user.profile_picture }}
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Edit Profile Button with Tailwind */}
          <TouchableOpacity className="py-2 px-4 bg-transparent rounded-full border-1.5 border-neutral-400/50 dark:border-neutral-600/50">
            <Text className="text-sm font-bold text-white">Edit Profile</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

/**
 * Component rendering the large, detailed header section. Uses Tailwind.
 */
const ProfileDetailsHeader = () => {
  const { top: topInset } = useSafeAreaInsets();

  const handleLinkPress = useCallback(async (url: string) => {
    try {
      const isSupported = await Linking.canOpenURL(url);
      if (isSupported) {
        await Linking.openURL(url);
      } else {
        console.warn(`Cannot open URL: ${url}`);
      }
    } catch (error) {
      console.error("Error opening link:", error);
    }
  }, []);

  return (
    // Use ExpandedHeader base
    <ExpandedHeader>
      {/* Inner wrapper with dynamic margin top and Tailwind */}
      <View
        style={{ marginTop: topInset + 10 + HEADER_PROFILE_IMAGE_SIZE_VALUE / 2 + 10 }} // Keep dynamic margin
        className={`flex-col gap-3 px-${SCREEN_HORIZONTAL_PADDING / 4} w-full`} // Tailwind layout
      >
        {/* User Name Row */}
        <View className="flex-row gap-2 items-center">
          <Text className="text-2xl font-extrabold text-black dark:text-white">{current_user.name}</Text>
          {current_user.is_verified && (
            <Image
              source={{ uri: current_user.verified_badge }}
              style={{ width: 16, height: 16, alignItems: 'center' }}
            />
          )}
        </View>

        {/* User Handle */}
        <Text className="text-neutral-400 text-base -mt-3">@{current_user.handle}</Text>

        {/* Bio Text */}
        <Text className="text-white text-sm leading-relaxed">
          {current_user.bio}
        </Text>

        {/* Meta Data Row */}
        <View className="flex-row gap-4 items-center">
          <View className="flex-row gap-1.5 items-center">
            <Feather name="map-pin" color="rgb(163 163 163)" size={14} />{/* Use Tailwind color equivalent */}
            <Text className="text-neutral-400 text-sm">{current_user.category}</Text>
          </View>
          <View className="flex-row gap-1.5 items-center">
            <Feather name="link" color="rgb(163 163 163)" size={14} />
            <Text onPress={() => handleLinkPress(current_user.url)} className="text-sky-500 text-sm">
              {current_user.url}
            </Text>
          </View>
        </View>

        {/* Joined Date */}
        <View className="flex-row gap-1.5 items-center">
          <Feather name="calendar" color="rgb(163 163 163)" size={14} />
          <Text className="text-neutral-400 text-sm">Joined {current_user.joined_date}</Text>
        </View>

        {/* Stats Row */}
        <View className="flex-row gap-4 items-center">
          <TouchableOpacity className="flex-row gap-1.5 items-center">
            <Text className="text-white text-sm font-semibold">250</Text>
            <Text className="text-neutral-400 text-sm">Following</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row gap-1.5 items-center">
            <Text className="text-white text-sm font-semibold">15.3K</Text>
            <Text className="text-neutral-400 text-sm">Followers</Text>
          </TouchableOpacity>
        </View>

        {/* Followed By Row */}
        <View className="flex-row gap-2.5 items-center">
          {/* Avatar Stack */}
          <View className="relative" style={{ width: PROFILE_IMAGE_SIZE_MAP.xs + (PROFILE_IMAGE_SIZE_MAP.xs / 1.8) * 2, height: PROFILE_IMAGE_SIZE_MAP.xs + 6 }}>
            {[10, 20, 30].map((imgNum, index) => (
              <ProfileImage
                key={`follower-${imgNum}`}
                displaySize="xs"
                source={{ uri: `https://i.pravatar.cc/128?img=${imgNum}` }}
                // Apply positioning styles directly, use Tailwind for border
                style={{
                  position: 'absolute',
                  top: 0,
                  zIndex: 3 - index,
                  left: (PROFILE_IMAGE_SIZE_MAP.xs / 1.8) * index,
                }}
                className="border-2 border-black" // Tailwind border
              />
            ))}
          </View>
          {/* Followed By Text */}
          <Text className="text-neutral-400 text-sm flex-1">
            Followed by {current_user.followed_by} Dev Friend, Design Lead, and 15 others
          </Text>
        </View>
      </View>
    </ExpandedHeader>
  );
};

/**
 * The main screen component for displaying a user profile. Uses Tailwind.
 */
export default function UserProfileScreen() {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const feedSections: SectionListData<FeedContent, { title: string }>[] = useMemo(() => [
    { title: 'Feed', data: sampleFeedItems },
  ], []);

  const profileTabs = ['Feed', 'Replies', 'Media', 'Likes'];

  return (
    <>
      <StatusBar style="light" />
      {/* Use ScrollingListWithHeader with Tailwind classes passed down */}
      <ScrollingListWithHeader
        NavigationBarComponent={ProfileHeader}
        ExpandedHeaderComponent={ProfileDetailsHeader}
        sections={feedSections}
        ignoreLeftPadding
        ignoreRightPadding
        expandedHeaderCollapseThreshold={0.25}
        // Use Tailwind for container styles
        style={{ flex: 1 }} // Keep flex: 1 for base layout if needed
        contentContainerStyle={{ paddingBottom: bottomInset, flexGrow: 1 }} // Keep dynamic padding and background
        renderItem={({ item }: { item: FeedContent }) => <FeedItem itemData={item} />}
        contentContainerClassName="bg-white dark:bg-black" // Base background
        stickySectionHeadersEnabled
        // Render Section Header (Tab Bar) with Tailwind
        renderSectionHeader={() => (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            // Use Tailwind for tab bar container
            contentContainerStyle={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING / 4 }}
            contentContainerClassName="flex-row items-center border-b border-neutral-800" // Layout, background, border
          >
            {profileTabs.map((tabName, index) => (
              <TouchableOpacity
                key={`tab-${index}`}
                // Use Tailwind for tab item
                className="px-4 justify-center items-center h-12 relative" // Padding, layout, height, positioning context
                onPress={() => setSelectedTabIndex(index)}
              >
                <Text className="text-white text-base font-semibold">{tabName}</Text>
                {/* Active Tab Indicator with Tailwind */}
                {selectedTabIndex === index && (
                  <View
                    className="h-1 w-3/5 rounded absolute bottom-0" // Size, shape, positioning
                    style={{ backgroundColor: APP_PRIMARY_COLOR }} // Use direct color for indicator
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      />
    </>
  );
};

