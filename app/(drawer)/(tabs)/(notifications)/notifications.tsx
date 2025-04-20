import { Stack } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  GestureResponderEvent,
} from 'react-native';
import { Tabs, MaterialTabBar, MaterialTabItemProps } from 'react-native-collapsible-tab-view';

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
const ScreenHeader = ({ title, avatarUri }: { title: string; avatarUri: string }) => {
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

// Custom MaterialTabItem component
const CustomTabItem = (props: MaterialTabItemProps<string>) => {
  const { name, index, indexDecimal, onPress, label } = props;
  // Check if this tab is active (when index matches the position)
  const isActive = Math.round(indexDecimal.value) === index;
  
  return (
    <TouchableOpacity
      onPress={(e: GestureResponderEvent) => onPress(name)}
      className={`py-3 flex-1 items-center ${
        isActive ? 'border-b-2 border-blue-500' : '' // Active tab style
      }`}
    >
      <Text
        className={`text-base ${
          isActive ? 'font-semibold text-blue-500' : 'text-gray-600' // Active/inactive text style
        }`}
      >
        {typeof label === 'string' ? label : name}
      </Text>
    </TouchableOpacity>
  );
};

// Notification Item Component
const NotificationItem = ({ notification }: { notification: typeof notificationsData[0] }) => {
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
  // Premier League Avatar Placeholder
  const premierLeagueAvatar = 'https://placehold.co/100x100/E6FFFA/319795?text=PL';
  
  // Header component to be used in the collapsible view
  const renderHeader = () => (
    <ScreenHeader 
      title="Notifications" 
      avatarUri={premierLeagueAvatar}
    />
  );
  
  const renderNotificationList = (notifications: typeof notificationsData) => {
    return notifications.map((notification) => (
      <NotificationItem 
        key={notification.id} 
        notification={notification} 
      />
    ));
  };
  
  // Filter notifications based on tab
  const allNotifications = notificationsData;
  const mentionsNotifications = notificationsData.filter(notification => 
    notification.type === 'mention' || notification.type === 'reply'
  );
  const verifiedNotifications = notificationsData; // Placeholder, you can implement actual filtering

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />
      
      <Tabs.Container 
        renderHeader={renderHeader}
        headerHeight={60} // Adjust based on your header height
        tabBarHeight={48} // Height of the tab bar
        renderTabBar={props => (
          <MaterialTabBar 
            {...props} 
            TabItemComponent={CustomTabItem}
            indicatorStyle={{ backgroundColor: '#3b82f6', height: 3 }}
            activeColor="#3b82f6"
            inactiveColor="#4b5563"
            style={{ backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}
          />
        )}
      >
        <Tabs.Tab name="All">
          <Tabs.ScrollView>
            {renderNotificationList(allNotifications)}
          </Tabs.ScrollView>
        </Tabs.Tab>
        
        <Tabs.Tab name="Mentions">
          <Tabs.ScrollView>
            {renderNotificationList(mentionsNotifications)}
          </Tabs.ScrollView>
        </Tabs.Tab>
        
        <Tabs.Tab name="Verified">
          <Tabs.ScrollView>
            {renderNotificationList(verifiedNotifications)}
          </Tabs.ScrollView>
        </Tabs.Tab>
      </Tabs.Container>
    </SafeAreaView>
  );
}
