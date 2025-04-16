import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { FeedItem, FeedContent } from '~/components/FeedItem'; // Assuming FeedItem is in components
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Sample data (replace with actual data source/fetching)
const sampleFeedItems: FeedContent[] = [
  {
    contentId: 'post-abc',
    authorName: 'Premier League',
    authorHandle: 'premierleague',
    authorImageUrl: 'https://pbs.twimg.com/profile_images/1742837199005954048/YGI6Kw7P_400x400.jpg',
    postedTime: '3h',
    message: `Three points ✅\nClean sheet ✅\nPlayer of the Match ✅\n\nA very happy 20th birthday for Dean Huijsen 🎂\n`,
    mediaUrl: 'https://pbs.twimg.com/media/GohzgPVXQAArqUo?format=jpg&name=large',
  },
  {
    contentId: 'post-def',
    authorName: 'Code Enthusiast',
    authorHandle: 'coderocks',
    authorImageUrl: 'https://picsum.photos/seed/def/100/100',
    postedTime: '6h',
    message: `A lightning fast start ⚡️⚡️⚡️\n\nIt didn't take Antoine Semenyo long to give the Cherries the lead\n`,
    mediaUrl: 'https://pbs.twimg.com/media/GohLxVvWYAAR7rK?format=jpg&name=4096x4096',
  },
    // Add more items as needed
];

export default function PostDetailScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const postId = params.id as string; // Get post ID from route params

    // Find the post (replace with real data fetching)
    const postData = sampleFeedItems.find(item => item.contentId === postId);

    const handleNavigateToProfile = (handle: string) => {
        router.push(`/profile/${handle}`);
    };

    if (!postData) {
        return (
            <View className="flex-1 justify-center items-center bg-white dark:bg-black" style={{ paddingTop: insets.top }}>
                <Stack.Screen options={{ title: 'Post Not Found' }} />
                <Text className="text-neutral-500 dark:text-neutral-400">Could not find the requested post.</Text>
            </View>
        );
    }

    // Note: To enable navigation to the author's profile from *within* this screen,
    // the FeedItem component might need modification to handle presses on the author info
    // separately from the main item press.

    return (
        <ScrollView
            className="flex-1 bg-white dark:bg-black"
            style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
            contentContainerStyle={{ flexGrow: 1 }}
        >
            <Stack.Screen options={{ title: 'Post' /* Or dynamically set title based on postData */ }} />

            {/* Render the main post */}
            <FeedItem
                itemData={postData}
                // onPress prop is omitted here, so clicking the whole item doesn't navigate away.
                // Profile navigation needs to be handled internally by FeedItem or via specific pressable areas.
            />

            {/* Placeholder for Replies/Comments */}
            <View className="p-4 mt-2 border-t border-neutral-200 dark:border-neutral-800">
                <Text className="text-lg font-semibold text-black dark:text-white mb-2">Replies</Text>
                {/* Map through replies here later */}
                <Text className="text-neutral-500 dark:text-neutral-400">No replies yet.</Text>
            </View>
        </ScrollView>
    );
}
