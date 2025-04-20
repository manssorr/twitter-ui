import React, { useReducer, Reducer } from 'react';
import {
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from "nativewind";
import { StyledExpoImage as Image } from "~/components/Image"
import Comment from "~/assets/svg/comment.svg"
import Repost from "~/assets/svg/repost.svg"
import Like from "~/assets/svg/like.svg"
import Save from "~/assets/svg/save.svg"
import Share from "~/assets/svg/share.svg"
import Views from "~/assets/svg/views.svg"
import { ImageProps } from 'expo-image';
import { router, useRouter } from 'expo-router';
import LikeButton from './LikeButton';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { EngagementActions } from './EngagementActions';
import users from '~/dummy/users.json';
import { MoreContextIcons } from "~/app/(drawer)/(tabs)/(index,search,messages,grok,video,notifications)/post/[id]"


// Initialize dayjs plugins
dayjs.extend(relativeTime);

// Types and Constants moved from profile/[id].tsx
type ProfileImageSize = 'xxs' | 'xs' | 's' | 'm' | 'l';
type ProfileImageProps = ImageProps & { displaySize?: ProfileImageSize; className?: string, is_organization?: boolean };
type ProfileImageReducerState = { isLoading: boolean; hasError: boolean };
type ProfileImageReducerActions = { type: 'loaded' } | { type: 'error' };
type ProfileImageReducer = Reducer<ProfileImageReducerState, ProfileImageReducerActions>;

const PROFILE_IMAGE_DIMENSIONS: Record<ProfileImageSize, number> = {
    xxs: 20,
    xs: 30,
    s: 40,
    m: 60,
    l: 100,
};

export const PROFILE_IMAGE_SIZE_MAP = { ...PROFILE_IMAGE_DIMENSIONS };

// Interface for Feed Content
export interface FeedContent {
    contentId?: string;
    poster_id: string;
    authorName?: string;    // Optional for backward compatibility
    authorHandle?: string;  // Optional for backward compatibility
    authorImageUrl?: string; // Optional for backward compatibility
    posted_time: number;    // Changed from postedTime for consistency
    message: string;
    media_url?: string;     // Changed from mediaUrl for consistency
    like_count?: number;    // Changed for consistency
    retweet_count?: number; // Changed for consistency
    reply_count?: number;   // Changed for consistency
    view_count?: string;    // Changed for consistency
    is_organization?: boolean;
    category?: string;      // Added for category-based filtering
}

// Utility function to format time based on the view
const formatTime = (timestamp: number, isDetailView: boolean): string => {
    const time = dayjs(timestamp);

    if (isDetailView) {
        // For detailed view, show full date and time
        return time.format('h:mm A · MMM D, YYYY');
    } else {
        // For regular view, show relative time (1d, 2h, 45m, etc.)
        const now = dayjs();
        const diffInSeconds = now.diff(time, 'second');

        if (diffInSeconds < 60) {
            return `${diffInSeconds}s`;
        } else if (diffInSeconds < 3600) {
            return `${Math.floor(diffInSeconds / 60)}m`;
        } else if (diffInSeconds < 86400) {
            return `${Math.floor(diffInSeconds / 3600)}h`;
        } else {
            return `${Math.floor(diffInSeconds / 86400)}d`;
        }
    }
};

// Reusable Profile Image Component
export const ProfileImage: React.FC<ProfileImageProps> = ({ style, displaySize = 's', className = '', is_organization = false, ...imageProps }) => {
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
        <View className={`py-1.5 ${is_organization ? '' : 'rounded-full'}  ${className} bg-white`}>
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
                className={is_organization ? '' : 'rounded-full'}
            />
        </View>
    );
};

// Follow Button Component
const FollowButton = () => {
    const { colorScheme } = useColorScheme();
    return (
        <TouchableOpacity
            className="py-1.5 px-4 rounded-full bg-black dark:bg-white"
            onPress={() => console.log('Follow pressed')}
        >
            <Text className="font-bold text-white dark:text-black">Follow</Text>
        </TouchableOpacity>
    );
};

// Find user by ID from users array
export const findUserById = (id: string) => {
    return users.find(user => user.id === id);
};

// Props for FeedItem
interface FeedItemProps {
    itemData: FeedContent;
    onPress?: () => void; // Optional onPress handler for navigation
    detailView?: boolean;
}

// Reusable Feed Item Component
export const FeedItem: React.FC<FeedItemProps> = ({ itemData, onPress, detailView }) => {
    const { colorScheme } = useColorScheme();

    // Get user information based on poster_id
    const userInfo = findUserById(itemData.poster_id);

    // Use direct properties if available (for backward compatibility) or get from userInfo
    const authorName = itemData.authorName || userInfo?.name || 'Unknown';
    const authorHandle = itemData.authorHandle || userInfo?.handle || 'unknown';
    const authorImageUrl = itemData.authorImageUrl || userInfo?.profile_picture || '';
    const isOrganization = itemData.is_organization || userInfo?.is_organization || false;

    // Regular feed item layout (horizontal layout)
    if (!detailView) {
        return (
            <TouchableOpacity onPress={onPress} className="p-1 pb-4 pr-4 border-b border-neutral-200 dark:border-neutral-800">
                <View className="flex-row">
                    <ProfileImage source={{ uri: authorImageUrl }} displaySize="s" is_organization={isOrganization} />
                    <View className="ml-1 flex-1">

                        <View className="flex-row items-center justify-between">
                            <TouchableOpacity onPress={() => router.push(`/profile/${authorHandle}`)}>
                                <View className="flex-row items-center">
                                    <Text className=" text-lg font-bold text-black dark:text-white mr-1">{authorName}</Text>
                                    <Text className="text-lg text-neutral-500 dark:text-neutral-400 mr-1">@{authorHandle}</Text>
                                    <Text className="text-lg text-neutral-500 dark:text-neutral-400">· {formatTime(itemData.posted_time, false)}</Text>
                                </View>
                            </TouchableOpacity>
                            <MoreContextIcons size="sm" />
                        </View>

                        <Text className="text-black dark:text-white mt-1">{itemData.message}</Text>
                        {itemData.media_url && (
                            <Image
                                source={{ uri: itemData.media_url }}
                                className="w-full aspect-[4/4] mt-2 rounded-lg"
                                contentFit="cover"
                            />
                        )}
                        <EngagementActions itemData={itemData} detailView={false}/>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    // Detail view layout (vertical layout with different structure)
    return (
        <View className="px-3 dark:border-neutral-800">

            {/* Second row: Name, Username and Follow Button */}
            <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                    <ProfileImage
                        source={{ uri: authorImageUrl }}
                        displaySize="s"
                        is_organization={isOrganization}
                    />
                    <TouchableOpacity
                        onPress={() => router.push(`/profile/${authorHandle}`)}
                    >
                        <View className="flex-col">
                            <Text className="text-lg font-bold text-black dark:text-white">{authorName}</Text>
                            <Text className="text-lg text-neutral-500 dark:text-neutral-400 -mt-1">@{authorHandle}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <FollowButton />
            </View>

            {/* Third row: Content Block */}
            <View className="mt-2">
                <Text className="text-lg text-black dark:text-white">{itemData.message}</Text>

                {itemData.media_url && (
                    <Image
                        source={{ uri: itemData.media_url }}
                        className="w-full aspect-[4/4] mt-4 rounded-lg"
                        contentFit="cover"
                    />
                )}


                <View className="flex-row items-center mt-2 gap-2">
                    <Text className="text-neutral-500 dark:text-neutral-400 mt-2 text-lg">{formatTime(itemData.posted_time, true)}</Text>
                    <Text className="text-neutral-500 dark:text-neutral-400 mt-2 text-lg"><Text className="text-black dark:text-white font-semibold">{itemData.view_count}</Text> Views</Text>
                </View>


                <View className="">
                    <EngagementActions 
                    itemData={itemData}
                    detailView={true} />
                </View>
            </View>
        </View>
    );
};
