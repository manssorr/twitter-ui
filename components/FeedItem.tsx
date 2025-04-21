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
import { Galeria } from '@nandorojo/galeria';
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
import * as ContextMenu from 'zeego/context-menu';
import * as DropdownMenu from 'zeego/dropdown-menu';

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
    // Multiply by 1000 to convert Unix seconds to milliseconds
    const time = dayjs(timestamp * 1000);

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
        <View className={`py-1.5 ${is_organization ? '' : 'rounded-full'}  ${className} `}>
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
    const verified_badge = itemData?.verified_badge || userInfo?.verified_badge;

    const router = useRouter();

    // Function to navigate to post detail
    const goToPost = () => {
        const postId = itemData.contentId;
        if (postId) {
            router.push(`/post/${postId}`);
        } else {
            console.warn("Post ID is missing, cannot navigate");
        }
    };

    return (
        <ContextMenu.Root>
            <ContextMenu.Trigger asChild>
                <TouchableOpacity onPress={onPress} className="p-1 py-2 pr-4 border-b border-neutral-200 dark:border-neutral-800">
                    <View className="flex-row">
                        <ProfileImage source={{ uri: authorImageUrl }} displaySize="s" is_organization={isOrganization} />
                        <View className="ml-1 flex-1">

                            <View className="flex-row items-center justify-between">
                                <TouchableOpacity onPress={() => router.push(`/profile/${authorHandle}`)}>
                                    <View className="flex-row items-center">
                                        <Text className=" text-lg font-bold text-black dark:text-white mr-1">{authorName}</Text>
                                        {verified_badge && (
                                            <Image
                                                source={{ uri: verified_badge }}
                                                className="w-4 h-4"
                                                onError={(e) => console.log('Failed to load verified badge:', e.nativeEvent.error)}
                                            />
                                        )}
                                        <Text className="text-lg text-neutral-500 dark:text-neutral-400 mr-1">@{authorHandle}</Text>
                                        <Text className="text-lg text-neutral-500 dark:text-neutral-400"> · {formatTime(itemData.posted_time, false)}</Text>
                                    </View>
                                </TouchableOpacity>

                                {!detailView && (
                                    <DropdownMenu.Root>
                                        <DropdownMenu.Trigger>
                                            <TouchableOpacity className="p-1 -m-1">
                                                <Feather name="more-horizontal" size={18} color={colorScheme === 'dark' ? 'white' : 'black'} />
                                            </TouchableOpacity>
                                    </DropdownMenu.Trigger>
                                    <DropdownMenu.Content>
                                        <DropdownMenu.Item key="interactions">
                                            <DropdownMenu.ItemTitle>View post interactions</DropdownMenu.ItemTitle>
                                            <DropdownMenu.ItemIcon
                                                ios={{ name: 'chart.bar.xaxis' }}
                                            />
                                        </DropdownMenu.Item>
                                        <DropdownMenu.Item key="report">
                                            <DropdownMenu.ItemTitle>Report post</DropdownMenu.ItemTitle>
                                            <DropdownMenu.ItemIcon
                                                ios={{ name: 'flag' }}
                                            />
                                        </DropdownMenu.Item>
                                        <DropdownMenu.Item key="community-note">
                                            <DropdownMenu.ItemTitle>Request community note</DropdownMenu.ItemTitle>
                                            <DropdownMenu.ItemIcon
                                                ios={{ name: 'note.text' }}
                                            />
                                        </DropdownMenu.Item>
                                        <DropdownMenu.Item key="offline">
                                            <DropdownMenu.ItemTitle>Add to offline</DropdownMenu.ItemTitle>
                                            <DropdownMenu.ItemIcon
                                                ios={{ name: 'arrow.down.circle' }}
                                            />
                                        </DropdownMenu.Item>

                                        <DropdownMenu.Sub>
                                            <DropdownMenu.SubTrigger key="user-actions">
                                                <DropdownMenu.ItemTitle>@{authorHandle}</DropdownMenu.ItemTitle>
                                                <DropdownMenu.ItemIcon ios={{ name: 'chevron.right' }} />
                                            </DropdownMenu.SubTrigger>
                                            <DropdownMenu.SubContent>
                                                <DropdownMenu.Item key="add-remove">
                                                    <DropdownMenu.ItemTitle>Add/remove @{authorHandle} from list</DropdownMenu.ItemTitle>
                                                    <DropdownMenu.ItemIcon ios={{ name: 'list.bullet' }} />
                                                </DropdownMenu.Item>
                                                <DropdownMenu.Item key="mute">
                                                    <DropdownMenu.ItemTitle>Mute @{authorHandle}</DropdownMenu.ItemTitle>
                                                    <DropdownMenu.ItemIcon ios={{ name: 'speaker.slash' }} />
                                                </DropdownMenu.Item>
                                                <DropdownMenu.Item key="block" destructive>
                                                    <DropdownMenu.ItemTitle>Block @{authorHandle}</DropdownMenu.ItemTitle>
                                                    <DropdownMenu.ItemIcon ios={{ name: 'nosign' }} />
                                                </DropdownMenu.Item>
                                            </DropdownMenu.SubContent>
                                        </DropdownMenu.Sub>

                                    </DropdownMenu.Content>
                                </DropdownMenu.Root>
                            )}
                            </View>

                            <Text className="text-black dark:text-white mt-1 text-lg leading-6">{itemData.message}</Text>
                            {itemData.media_url && (
                                <Galeria urls={[itemData.media_url].filter(url => !!url) as string[]}>
                                    <Galeria.Image>
                                        <Image
                                            source={{ uri: itemData.media_url }}
                                            className="w-full aspect-[4/4] mt-2 rounded-lg"
                                            contentFit="cover"
                                        />
                                    </Galeria.Image>
                                </Galeria>
                            )}
                            <EngagementActions itemData={itemData} detailView={false} />
                        </View>
                    </View>
                </TouchableOpacity>
            </ContextMenu.Trigger>
            <ContextMenu.Content>
                <ContextMenu.Item key="view-post" onSelect={goToPost}>
                    <ContextMenu.ItemTitle>View post</ContextMenu.ItemTitle>
                    <ContextMenu.ItemIcon ios={{ name: 'doc.text' }} />
                </ContextMenu.Item>

                <ContextMenu.Item key="report" destructive onSelect={() => console.log('Report post', itemData.contentId)}>
                    <ContextMenu.ItemTitle>Report post</ContextMenu.ItemTitle>
                    <ContextMenu.ItemIcon ios={{ name: 'flag' }} />
                </ContextMenu.Item>

                <ContextMenu.Item key="community-note" onSelect={() => console.log('Request Community Note', itemData.contentId)}>
                    <ContextMenu.ItemTitle>Request community note</ContextMenu.ItemTitle>
                    <ContextMenu.ItemIcon ios={{ name: 'note.text' }} />
                </ContextMenu.Item>

                <ContextMenu.Separator />
                <ContextMenu.Label>{authorName} @{authorHandle}</ContextMenu.Label>

                <ContextMenu.Item key="follow" onSelect={() => console.log('Follow/Unfollow', userInfo?.id)}>
                    <ContextMenu.ItemTitle>Follow @{authorHandle}</ContextMenu.ItemTitle>
                    <ContextMenu.ItemIcon ios={{ name: 'person.badge.plus' }} />
                </ContextMenu.Item>

                <ContextMenu.Sub>
                    <ContextMenu.SubTrigger key="follow-up-trigger">
                        <ContextMenu.ItemTitle>More actions</ContextMenu.ItemTitle>
                        <ContextMenu.ItemIcon ios={{ name: 'ellipsis.circle' }} />
                    </ContextMenu.SubTrigger>
                    <ContextMenu.SubContent>
                        <ContextMenu.Item key="interactions" onSelect={() => console.log('View Interactions', itemData.contentId)}>
                            <ContextMenu.ItemTitle>Interactions</ContextMenu.ItemTitle>
                            <ContextMenu.ItemIcon ios={{ name: 'bubble.left.and.bubble.right' }} />
                        </ContextMenu.Item>

                        <ContextMenu.Item key="add-to-lists" onSelect={() => console.log('Add to Lists', userInfo?.id)}>
                            <ContextMenu.ItemTitle>Add to Lists</ContextMenu.ItemTitle>
                            <ContextMenu.ItemIcon ios={{ name: 'list.bullet' }} />
                        </ContextMenu.Item>

                        <ContextMenu.Item key="block" destructive onSelect={() => console.log('Block User', userInfo?.id)}>
                            <ContextMenu.ItemTitle>Block @{authorHandle}</ContextMenu.ItemTitle>
                            <ContextMenu.ItemIcon ios={{ name: 'nosign' }} />
                        </ContextMenu.Item>

                        <ContextMenu.Item key="mute" onSelect={() => console.log('Mute User', userInfo?.id)}>
                            <ContextMenu.ItemTitle>Mute @{authorHandle}</ContextMenu.ItemTitle>
                            <ContextMenu.ItemIcon ios={{ name: 'speaker.slash' }} />
                        </ContextMenu.Item>
                    </ContextMenu.SubContent>
                </ContextMenu.Sub>
            </ContextMenu.Content>
        </ContextMenu.Root>
    );
};

// Detail view layout (vertical layout with different structure)
export const FeedItemDetailView: React.FC<FeedItemProps> = ({ itemData, onPress, detailView }) => {
    const { colorScheme } = useColorScheme();

    // Get user information based on poster_id
    const userInfo = findUserById(itemData.poster_id);

    // Use direct properties if available (for backward compatibility) or get from userInfo
    const authorName = itemData.authorName || userInfo?.name || 'Unknown';
    const authorHandle = itemData.authorHandle || userInfo?.handle || 'unknown';
    const authorImageUrl = itemData.authorImageUrl || userInfo?.profile_picture || '';
    const isOrganization = itemData.is_organization || userInfo?.is_organization || false;
    const verified_badge = itemData?.verified_badge || userInfo?.verified_badge;

    const router = useRouter();

    // Function to navigate to post detail
    const goToPost = () => {
        const postId = itemData.contentId;
        if (postId) {
            router.push(`/post/${postId}`);
        } else {
            console.warn("Post ID is missing, cannot navigate");
        }
    };

    return (
        <View className="px-4 dark:border-neutral-800 ">

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
                            {verified_badge && (
                                <Image
                                    source={{ uri: verified_badge }}
                                    className="w-4 h-4"
                                    onError={(e) => console.log('Failed to load verified badge:', e.nativeEvent.error)}
                                />
                            )}
                            <Text className="text-lg text-neutral-500 dark:text-neutral-400 -mt-1">@{authorHandle}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <FollowButton />
            </View>

            <View className="mt-2">
                <Text className="text-lg text-black dark:text-white">{itemData.message}</Text>

                {itemData.media_url && (
                    <Galeria urls={[itemData.media_url].filter(url => !!url) as string[]}>
                        <Galeria.Image>
                            <Image
                                source={{ uri: itemData.media_url }}
                                className="w-full aspect-[4/4] mt-4 rounded-lg"
                                contentFit="cover"
                            />
                        </Galeria.Image>
                    </Galeria>
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
