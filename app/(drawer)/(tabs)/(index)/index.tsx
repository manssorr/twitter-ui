import React from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FeedItem, FeedContent } from '~/components/FeedItem';

// Import sample data (ideally, this would come from an API or shared state)
// For now, borrowing from the profile screen's sample data
const sampleFeedItems: FeedContent[] = [
  {
    contentId: 'post-abc',
    authorName: 'Premier League',
    authorHandle: 'premierleague',
    authorImageUrl: 'https://pbs.twimg.com/profile_images/1742837199005954048/YGI6Kw7P_400x400.jpg',
    postedTime: '3h',
    message: `Three points \nClean sheet \nPlayer of the Match \n\nA very happy 20th birthday for Dean Huijsen \n`,
    mediaUrl: 'https://pbs.twimg.com/media/GohzgPVXQAArqUo?format=jpg&name=large',
  },
  {
    contentId: 'post-def',
    authorName: 'Code Enthusiast',
    authorHandle: 'coderocks',
    authorImageUrl: 'https://picsum.photos/seed/def/100/100',
    postedTime: '6h',
    message: `A lightning fast start \n\nIt didn't take Antoine Semenyo long to give the Cherries the lead\n`,
    mediaUrl: 'https://pbs.twimg.com/media/GohLxVvWYAAR7rK?format=jpg&name=4096x4096',
  },
  // Add more sample items if needed
];

export default function HomeScreen() {
    const router = useRouter();

    const handleItemPress = (postId: string) => {
        // Navigate to the post detail screen using contentId
        router.push(`/post/${postId}`);
    };

    const renderFeedItem = ({ item }: { item: FeedContent }) => (
        <FeedItem
            itemData={item}
            // Pass the contentId to the handler
            onPress={() => handleItemPress(item.contentId)}
        />
    );

    return (
        <View className="flex-1 bg-white dark:bg-black">
            <FlatList
                data={sampleFeedItems}
                renderItem={renderFeedItem}
                keyExtractor={(item) => item.contentId}
                // Optional: Add pull-to-refresh or other FlatList props later
            />
        </View>
    );
}
