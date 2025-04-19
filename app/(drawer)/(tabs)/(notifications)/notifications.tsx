import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';

// --- Mock Data ---
// Assuming the current user is @PremierLeague
// Replace with your actual data fetching logic
const notificationsData = [
  {
    id: '1',
    type: 'like', // 'like', 'follow', 'mention', 'reply' etc.
    user: {
      name: 'LFC Fans Zone',
      avatar: 'https://placehold.co/100x100/FEEBC8/9C4221?text=LFC', // Placeholder
    },
    postPreview: 'What a goal! 🔥 #PL #Football',
    isRead: false,
  },
  {
    id: '2',
    type: 'follow',
    user: {
      name: 'Football Transfers',
      avatar: 'https://placehold.co/100x100/E2E8F0/4A5568?text=FT', // Placeholder
    },
    isRead: false,
  },
  {
    id: '3',
    type: 'mention',
    user: {
      name: 'Sky Sports',
      avatar: 'https://placehold.co/100x100/C6F6D5/2F855A?text=Sky', // Placeholder
    },
    postPreview: 'Latest update on the title race featuring @PremierLeague highlights! Read more...',
    isRead: true, // Example of a read notification
  },
  {
    id: '4',
    type: 'reply',
    user: {
      name: 'Man City News',
      avatar: 'https://placehold.co/100x100/BFDBFE/1E40AF?text=MC', // Placeholder
    },
    postPreview: 'Replying to @PremierLeague\nGreat summary of the weekend matches!',
    isRead: false,
  },
   {
    id: '5',
    type: 'like',
    user: {
      name: 'Chelsea FC Fan Page',
      avatar: 'https://placehold.co/100x100/A5B4FC/312E81?text=CFC', // Placeholder
    },
    postPreview: 'Unbelievable save! Watch the highlights from today\'s @PremierLeague games.',
    isRead: true,
  },
  // Add more notifications as needed
];

// --- Components ---

// Reusable Header Component (Adapted from Messages)
const ScreenHeader = ({ title, avatarUri }) => {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      {/* Left: User Avatar */}
      <TouchableOpacity>
        <Image
          source={{ uri: avatarUri }}
          className="w-8 h-8 rounded-full"
          onError={(e) => console.log('Failed to load user avatar:', e.nativeEvent.error)}
        />
      </TouchableOpacity>

      {/* Center: Title */}
      <Text className="text-lg font-semibold text-gray-900">{title}</Text>

      {/* Right: Settings Icon */}
      <TouchableOpacity>
        {/* Replace with an actual Icon component */}
        <Text className="text-xl">⚙️</Text>
      </TouchableOpacity>
    </View>
  );
};

// Tabs Component
const NotificationTabs = ({ activeTab, setActiveTab }) => {
  const tabs = ['All', 'Mentions', 'Verified']; // Define tabs

  return (
    <View className="flex-row justify-around bg-white border-b border-gray-200">
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => setActiveTab(tab)}
          className={`py-3 flex-1 items-center ${
            activeTab === tab ? 'border-b-2 border-blue-500' : '' // Active tab style
          }`}
        >
          <Text
            className={`text-base ${
              activeTab === tab ? 'font-semibold text-blue-500' : 'text-gray-600' // Active/inactive text style
            }`}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Notification Item Component
const NotificationItem = ({ notification }) => {
  const { type, user, postPreview } = notification;

  // Choose icon based on type
  let icon = '🔔'; // Default
  let actionText = '';

  switch (type) {
    case 'like':
      icon = '❤️';
      actionText = 'liked your post';
      break;
    case 'follow':
      icon = '👤'; // Using a person icon for follow
      actionText = 'followed you';
      break;
    case 'mention':
      icon = '@'; // Using '@' for mention
      actionText = 'mentioned you';
      break;
    case 'reply':
      icon = '💬';
      actionText = 'replied to your post';
      break;
    // Add other notification types as needed
  }

  return (
    <TouchableOpacity className="flex-row items-start px-4 py-4 bg-white border-b border-gray-100">
      {/* Left: Icon */}
      <Text className="text-xl mr-4 w-6 text-center">{icon}</Text>

      {/* Right: Notification Details */}
      <View className="flex-1">
        {/* User Avatar (shown for follow, optional for others) */}
        {type === 'follow' && (
           <Image
             source={{ uri: user.avatar }}
             className="w-8 h-8 rounded-full mb-2"
             onError={(e) => console.log(`Failed to load avatar for ${user.name}:`, e.nativeEvent.error)}
           />
        )}

        {/* Action Text */}
        <Text className="text-base mb-1">
          <Text className="font-semibold">{user.name} </Text>
          <Text className="text-gray-700">{actionText}</Text>
        </Text>

        {/* Post Preview (if available) */}
        {postPreview && (
          <Text className="text-sm text-gray-600" numberOfLines={3} ellipsizeMode="tail">
            {postPreview}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};


// --- Main Screen Component ---
export default function Notifications() {
  const [activeTab, setActiveTab] = useState('All'); // State for active tab

  // Filter notifications based on the active tab (basic example)
  // You might need more complex filtering logic based on your data
  const filteredNotifications = notificationsData.filter(notification => {
    if (activeTab === 'Mentions') {
      return notification.type === 'mention' || notification.type === 'reply'; // Show mentions and replies in Mentions tab
    }
    if (activeTab === 'Verified') {
      // Add logic for verified accounts if applicable
      // For now, just showing all for 'Verified' as placeholder
      return true;
    }
    return true; // 'All' tab shows all notifications
  });

  // Premier League Avatar Placeholder
  const premierLeagueAvatar = 'https://placehold.co/80x80/6D28D9/EDE9FE?text=PL';

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Hide default header */}
      <Stack.Screen options={{ title: 'Notifications', headerShown: false }} />

      {/* Custom Header */}
      <ScreenHeader title="Notifications" avatarUri={premierLeagueAvatar} />

      {/* Tabs */}
      <NotificationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Scrollable Notification List */}
      <ScrollView className="flex-1 bg-white">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        ) : (
          // Show a message if no notifications for the current tab
          <View className="items-center justify-center py-10">
            <Text className="text-gray-500">No notifications here yet.</Text>
          </View>
        )}
      </ScrollView>

      {/* Optional: Floating Action Button (like the '+' in the image) */}
      {/* <TouchableOpacity className="absolute bottom-6 right-6 bg-blue-500 rounded-full p-4 shadow-lg">
        <Text className="text-white text-2xl">+</Text>
      </TouchableOpacity> */}
    </SafeAreaView>
  );
}
