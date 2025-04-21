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
  ScrollView,
  FlatList,
} from 'react-native';
import { Tabs, MaterialTabBar, MaterialTabItemProps } from 'react-native-collapsible-tab-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SettingIcon from "~/assets/svg/aside/settings.svg"
import HeartIcon from "~/assets/svg/like-filled.svg"
import RetweetIcon from "~/assets/svg/notifications/repost.svg"

// Import dummy users for avatars
import usersData from "~/dummy/users.json";

// --- Mock Data ---
// Updated with more Twitter-like notifications showing multiple followers and likes
const notificationsData = [
  {
    id: '1',
    type: 'follow',
    mainUser: {
      id: '4', // Guillermo Rauch
    },
    otherCount: 7,
    isRead: false,
    timestamp: '2h',
  },
  {
    id: '2',
    type: 'like',
    mainUser: {
      id: '8', // Evan Bacon
    },
    otherCount: 243,
    postPreview: 'Introducing Netflix on React Native!\n\nTwo apps. One\'s built in JavaScript. Can you guess which?',
    isRead: false,
    timestamp: '1d',
  },
  {
    id: '3',
    type: 'retweet',
    mainUser: {
      id: '5', // Paul Graham
    },
    otherCount: 52,
    postPreview: 'Just released a new update for our Twitter UI clone. Check it out!',
    isRead: true,
    timestamp: '3d',
  },
  {
    id: '4',
    type: 'follow',
    mainUser: {
      id: '10', // Andrej Karpathy
    },
    otherCount: 15,
    isRead: false,
    timestamp: '1w',
  },
  {
    id: '5',
    type: 'like',
    mainUser: {
      id: '7', // Cristiano Ronaldo
    },
    otherCount: 1287,
    postPreview: 'Building with React Native has never been easier!',
    isRead: true,
    timestamp: '2w',
  },
  {
    id: '6',
    type: 'retweet',
    mainUser: {
      id: '6', // Andrew Huberman
    },
    otherCount: 89,
    postPreview: 'Here\'s how we implemented the Twitter-like UI in our app',
    isRead: false,
    timestamp: '2w',
  },
];

const APP_PRIMARY_COLOR = '#1DA1F2'; // Twitter blue

// --- Helper Function to Format Numbers ---
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
};

// --- Components ---

// Reusable Header Component (Adapted from Messages)
const ScreenHeader = ({ title, avatarUri }: { title: string; avatarUri: string }) => {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white ">
      <TouchableOpacity>
        <Image
          source={{ uri: 'https://pbs.twimg.com/profile_images/1742837199005954048/YGI6Kw7P_400x400.jpg' }}
          className="w-10 h-10 rounded-full"
        />
      </TouchableOpacity>
      <Text className="text-xl font-bold text-black">Notifications</Text>
      <TouchableOpacity>
        <SettingIcon width={24} height={24} fill="#000" />
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
      className={`py-3 flex-1 items-center ${isActive ? 'border-b-2 border-blue-500' : ''}`}
    >
      <Text
        className={`text-base ${isActive ? 'font-semibold text-blue-500' : 'text-gray-600'}`}
      >
        {typeof label === 'string' ? label : name}
      </Text>
    </TouchableOpacity>
  );
};

// AvatarRow Component for multiple avatars
const AvatarRow = ({ userIds, maxVisible = 8 }: { userIds: string[], maxVisible?: number }) => {
  // Limit the number of avatars to show
  const visibleUsers = userIds.slice(0, maxVisible);

  return (
    <View className="flex-row my-2">
      {visibleUsers.map((userId, index) => {
        // Find user data from usersData
        const user = usersData.find(u => u.id === userId);
        if (!user) return null;

        return (
          <Image 
            key={userId}
            source={{ uri: user.profile_picture }}
            className="w-9 h-9 rounded-full border-2 border-white"
            style={{ marginLeft: index === 0 ? 0 : -10, zIndex: visibleUsers.length - index }}
          />
        );
      })}
    </View>
  );
};

// Notification Item Component
const NotificationItem = ({ notification }: { notification: typeof notificationsData[0] }) => {
  const { type, mainUser, otherCount, postPreview, isRead, timestamp } = notification;

  // Get the main user details
  const user = usersData.find(u => u.id === mainUser.id);
  if (!user) return null;

  // Generate array of user IDs for the avatar row (use main user + some others from usersData)
  const userIds = [mainUser.id];
  
  // Add different users based on the notification type
  const remainingUsers = usersData
    .filter(u => u.id !== mainUser.id)
    .slice(0, 7); // Get up to 7 other users
  
  userIds.push(...remainingUsers.map(u => u.id));

  // Choose icon and action text based on type
  let icon = null;
  let iconColor = '#000';
  let actionText = '';

  switch (type) {
    case 'like':
      icon = <HeartIcon width={18} height={18} fill="#f91880" />;
      iconColor = '#f91880';
      actionText = `liked your post`;
      break;
    case 'retweet':
      icon = <RetweetIcon width={18} height={18} fill="#00ba7c" />;
      iconColor = '#00ba7c';
      actionText = `retweeted your post`;
      break;
    case 'follow':
      icon = null; // No icon for follow notifications
      actionText = `followed you`;
      break;
  }

  return (
    <TouchableOpacity className={`flex-row px-4 py-3 ${isRead ? 'bg-white' : 'bg-gray-50'} border-b border-gray-100`}>
      {/* Left: Icon (if applicable) */}
      {icon && (
        <View style={{ width: 24 }} className="mr-3 mt-2 items-center">
          {icon}
        </View>
      )}

      {/* Right: Notification Details */}
      <View className="flex-1">
        {/* Avatar Row for all notification types */}
        <AvatarRow userIds={userIds} />

        {/* Action Text */}
        <Text className="text-base mb-1">
          <Text className="font-semibold">{user.name}</Text>
          {otherCount > 0 && (
            <Text className="text-gray-700"> and {formatNumber(otherCount)} others </Text>
          )}
          <Text className="text-gray-700">{actionText}</Text>
        </Text>

        {/* Post Preview (for likes and retweets) */}
        {postPreview && type !== 'follow' && (
          <Text className="text-sm text-gray-600 mb-1" numberOfLines={2} ellipsizeMode="tail">
            {postPreview}
          </Text>
        )}

        {/* Timestamp */}
        <Text className="text-xs text-gray-500 mt-1">{timestamp}</Text>
      </View>
    </TouchableOpacity>
  );
};

// --- Main Screen Component ---
export default function Notifications() {
  // Header component to be used in the collapsible view


  const insets = useSafeAreaInsets();
  const renderHeader = () => (
    <ScreenHeader
      title="Notifications"
      avatarUri="https://pbs.twimg.com/profile_images/1742837199005954048/YGI6Kw7P_400x400.jpg"
    />
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />
      
      <Tabs.Container
        renderHeader={renderHeader}
        pagerProps={{ scrollEnabled: true }}
        renderTabBar={props => (
          <MaterialTabBar
            {...props}
            indicatorStyle={{
              backgroundColor: APP_PRIMARY_COLOR, height: 3, borderRadius: 50
            }}
            activeColor="black"
            scrollEnabled={true}
            style={{
              paddingHorizontal: 16,
              textAlign: 'center',
              elevation: 0, shadowOpacity: 0, borderBottomWidth: 0,
              borderBottomWidth: 1, borderBottomColor: '#f0f0f0'
            }}

            labelStyle={{
              marginHorizontal: 10,
              opacity: 1,
              fontWeight: 'bold', textTransform: 'capitalize', textAlign: 'center', height: 24,
              color: '#606E79'
            }}
            headerContainerStyle={{
              backgroundColor: 'transparent',
              elevation: 0,
              shadowOpacity: 0,
            }}

          />
        )}

        headerContainerStyle={{
          backgroundColor: 'transparent',
          elevation: 0,
          shadowOpacity: 0,
        }}
      >
        <Tabs.Tab name="All">
          <Tabs.ScrollView>
            {notificationsData.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </Tabs.ScrollView>
        </Tabs.Tab>
        
        <Tabs.Tab name="Mentions">
          <Tabs.ScrollView>
            <View className="p-6 items-center justify-center">
              <Text className="text-gray-500">No mentions yet</Text>
            </View>
          </Tabs.ScrollView>
        </Tabs.Tab>
        
        <Tabs.Tab name="Verified">
          <Tabs.ScrollView>
            {notificationsData.filter(n => {
              const user = usersData.find(u => u.id === n.mainUser.id);
              return user?.is_verified;
            }).map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </Tabs.ScrollView>
        </Tabs.Tab>
      </Tabs.Container>
    </View>
  );
}
