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
import { useRouter } from 'expo-router';

// Types and Constants moved from profile/[id].tsx
type ProfileImageSize = 'xxs' | 'xs' | 's' | 'm' | 'l';
type ProfileImageProps = ImageProps & { displaySize?: ProfileImageSize; className?: string };
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
    contentId: string;
    authorName: string;
    authorHandle: string;
    authorImageUrl: string;
    postedTime: string;
    message: string;
    mediaUrl?: string;
    is_organization?: boolean;
}

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
        <View className={`p-1.5 ${is_organization ? '' : 'rounded-full'} mx-1.5 ${className} bg-white`}>
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

// Reusable Engagement Actions Component
const EngagementActions = () => {
    const { colorScheme } = useColorScheme();
    const iconColor = colorScheme === 'dark' ? '#8b98a5' : '#536471';
    const textColor = "text-sm text-neutral-600 dark:text-neutral-400";

    return (
        <View className="flex-row items-center justify-between mt-2">
            <TouchableOpacity className="flex-row items-center gap-1.5">
                <Comment width={18} height={18} fill={iconColor} />
                <Text className={textColor}>100</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center gap-1.5">
                <Repost width={18} height={18} fill={iconColor} />
                <Text className={textColor}>100</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center gap-1.5">
                <Like width={18} height={18} fill={iconColor} />
                <Text className={textColor}>100</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center gap-1.5">
                <Views width={18} height={18} fill={iconColor} />
                <Text className={textColor}>100</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center gap-1.5">
                <Save width={18} height={18} fill={iconColor} />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center gap-1.5">
                <Feather name="share" size={18} color={iconColor} />
            </TouchableOpacity>
        </View>
    );
};

// Props for FeedItem
interface FeedItemProps {
    itemData: FeedContent;
    onPress?: () => void; // Optional onPress handler for navigation
}

// Reusable Feed Item Component
export const FeedItem: React.FC<FeedItemProps> = ({ itemData, onPress }) => {
    const { colorScheme } = useColorScheme();

    return (
        <TouchableOpacity onPress={onPress} className="p-1 pb-4 pr-4 border-b border-neutral-200 dark:border-neutral-800">
            <View className="flex-row">
                <ProfileImage source={{ uri: itemData.authorImageUrl }} displaySize="s" is_organization />
                <View className="ml-1 flex-1">
                    <View className="flex-row items-center">
                        <Text className=" text-lg font-bold text-black dark:text-white mr-1">{itemData.authorName}</Text>
                        <Text className="text-lg text-neutral-500 dark:text-neutral-400 mr-1">@{itemData.authorHandle}</Text>
                        <Text className="text-lg text-neutral-500 dark:text-neutral-400">· {itemData.postedTime}</Text>
                    </View>
                    <Text className="text-black dark:text-white mt-1">{itemData.message}</Text>
                    {itemData.mediaUrl && (
                        <Image
                            source={{ uri: itemData.mediaUrl }}
                            className="w-full aspect-[4/4] mt-2 rounded-lg"
                            contentFit="cover"
                        />
                    )}
                    <EngagementActions />
                </View>
            </View>
        </TouchableOpacity>
    );
};
