import React from 'react';
import {
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useColorScheme } from "nativewind";
import { ProfileImage } from "./FeedItem";
import { router } from 'expo-router';
import Comment from "~/assets/svg/comment.svg";
import Like from "~/assets/svg/like.svg";
import LikeButton from './LikeButton';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { EngagementActions } from '~/components/EngagementActions';
import { MoreContextIcons } from "~/app/(drawer)/(tabs)/(index,search,messages,grok,video,notifications)/post/[id]"

// Initialize dayjs plugins
dayjs.extend(relativeTime);

// Interface for Comment Content
export interface CommentContent {
    commentId: string;
    contentId: string; // ID of the post this comment belongs to
    authorName: string;
    authorHandle: string;
    authorImageUrl: string;
    postedTime: number; // timestamp
    message: string;
    is_organization?: boolean;
}

// Dummy comments data
export const dummyComments: CommentContent[] = [
    {
        commentId: 'comment1',
        contentId: 'post1',
        authorName: 'Jane Smith',
        authorHandle: 'janesmith',
        authorImageUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
        postedTime: Date.now() - 1000 * 60 * 30, // 30 minutes ago
        message: 'This is a great post! I totally agree with your thoughts on this topic.',
    },
    {
        commentId: 'comment2',
        contentId: 'post1',
        authorName: 'John Doe',
        authorHandle: 'johndoe',
        authorImageUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
        postedTime: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
        message: 'Interesting perspective! Have you considered the alternative approach?',
    },
    {
        commentId: 'comment3',
        contentId: 'post1',
        authorName: 'Tech Company',
        authorHandle: 'techcompany',
        authorImageUrl: 'https://randomuser.me/api/portraits/lego/1.jpg',
        postedTime: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
        message: 'We\'ve been working on similar solutions. Would love to connect and discuss further!',
        is_organization: true,
    },
    {
        commentId: 'comment4',
        contentId: 'post1',
        authorName: 'Alex Johnson',
        authorHandle: 'alexj',
        authorImageUrl: 'https://randomuser.me/api/portraits/men/2.jpg',
        postedTime: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
        message: 'I had a different experience with this. Let me share what worked for me...',
    },
    {
        commentId: 'comment5',
        contentId: 'post1',
        authorName: 'Sarah Williams',
        authorHandle: 'sarahw',
        authorImageUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
        postedTime: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
        message: 'Thanks for sharing! This helped me solve a problem I\'ve been stuck on.',
    }
];

// Utility function to format time
const formatTime = (timestamp: number): string => {
    const time = dayjs(timestamp);
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
};

// Engagement actions for comments (simplified version)
// const CommentEngagementActions = () => {
//     const { colorScheme } = useColorScheme();
//     const iconColor = colorScheme === 'dark' ? '#8b98a5' : '#536471';
//     const textColor = "text-sm text-neutral-600 dark:text-neutral-400";

//     return (
//         <View className="flex-row items-center gap-8 mt-1">
//             <TouchableOpacity className="flex-row items-center gap-1.5">
//                 <Comment width={16} height={16} fill={iconColor} />
//                 <Text className={textColor}>12</Text>
//             </TouchableOpacity>

//             <LikeButton iconColor={iconColor} textColor={textColor} />
//         </View>
//     );
// };

// Props for CommentItem
interface CommentItemProps {
    commentData: CommentContent;
}

// Single Comment Item Component
export const CommentItem: React.FC<CommentItemProps> = ({ commentData }) => {
    return (
        <View className="p-1 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <View className="flex-row">
                <ProfileImage
                    source={{ uri: commentData.authorImageUrl }}
                    displaySize="xs"
                    is_organization={commentData.is_organization}
                />
                <View className="ml-2 flex-1">
                    <View className="flex-row items-center justify-between">
                        <TouchableOpacity onPress={() => router.push(`/profile/${commentData.authorHandle}`)}>
                            <View className="flex-row items-center">
                                <Text className="text-base font-bold text-black dark:text-white mr-1">{commentData.authorName}</Text>
                                <Text className="text-base text-neutral-500 dark:text-neutral-400 mr-1">@{commentData.authorHandle}</Text>
                                <Text className="text-base text-neutral-500 dark:text-neutral-400">· {formatTime(commentData.postedTime)}</Text>
                            </View>
                        </TouchableOpacity>
                        <MoreContextIcons size="sm" />
                    </View>
                    <Text className="text-black dark:text-white mt-1">{commentData.message}</Text>
                    {/* <CommentEngagementActions /> */}
                    <EngagementActions  />
                </View>
            </View>
        </View>
    );
};

// Props for Comments component
interface CommentsProps {
    postId: string;
    comments?: CommentContent[];
}

// Main Comments Component
const Comments: React.FC<CommentsProps> = ({ postId, comments = dummyComments }) => {
    // Filter comments by postId if needed
    // const filteredComments = comments.filter(comment => 
    //     comment.contentId === postId || postId === 'all'
    // );
    const filteredComments = comments;

    return (
        <View className="mt-2">
            {filteredComments.map(comment => (
                <CommentItem key={comment.commentId} commentData={comment} />
            ))}
        </View>
    );
};

export default Comments;
