import { Stack } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar, // Import StatusBar
} from 'react-native';

// --- Mock Data ---
// Replace with your actual data fetching logic
const messagesData = [
  {
    id: '1',
    name: 'Sky Sports Football',
    username: '@SkyFootball',
    time: '1h',
    lastMessage: 'Great highlights package from yesterday! Can we get clearance to use a few clips?',
    avatar: 'https://placehold.co/100x100/C6F6D5/2F855A?text=Sky', // Placeholder
    isYou: false,
  },
  {
    id: '2',
    name: 'Manchester United',
    username: '@ManUtd',
    time: '3h',
    lastMessage: 'You: Thanks for sending over the updated squad list for the website.',
    avatar: 'https://placehold.co/100x100/FED7D7/9B2C2C?text=MU', // Placeholder
    isYou: true,
  },
  {
    id: '3',
    name: 'Fantasy Premier League',
    username: '@OfficialFPL',
    time: '2d',
    lastMessage: 'You: Reminder to get the Gameweek 30 deadline graphic ready by tomorrow EOD.',
    avatar: 'https://placehold.co/100x100/E9D5FF/5B21B6?text=FPL', // Placeholder
    isYou: true,
  },
  {
    id: '4',
    name: 'Liverpool FC',
    username: '@LFC',
    time: '2d',
    lastMessage: "Just confirming the kick-off time adjustment for the match on the 25th.",
    avatar: 'https://placehold.co/100x100/FEEBC8/9C4221?text=LFC', // Placeholder
    isYou: false,
  },
   {
    id: '5',
    name: 'Arsenal',
    username: '@Arsenal',
    time: '4d',
    lastMessage: "You: Approved the submitted matchday photos. Look great!",
    avatar: 'https://placehold.co/100x100/FECACA/7F1D1D?text=AFC', // Placeholder
    isYou: true,
  },
   {
    id: '6',
    name: 'BBC Sport',
    username: '@BBCSport',
    time: '5d',
    lastMessage: "Following up on the interview request for the Chief Executive.",
    avatar: 'https://placehold.co/100x100/E0E7FF/312E81?text=BBC', // Placeholder
    isYou: false,
  },
  // Add more messages as needed
];


// --- Components ---

// Header Component
const MessagesHeader = () => {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      {/* Left: User Avatar */}
      <TouchableOpacity>
        <Image
          source={{ uri: 'https://placehold.co/80x80/DBEAFE/1E3A8A?text=Me' }} // Replace with actual user avatar URL
          className="w-8 h-8 rounded-full"
          // Add error handling for images
          onError={(e) => console.log('Failed to load user avatar:', e.nativeEvent.error)}
        />
      </TouchableOpacity>

      {/* Center: Title */}
      <Text className="text-lg font-semibold text-gray-900">Messages</Text>

      {/* Right: Settings Icon */}
      <TouchableOpacity>
        {/* Replace with an actual Icon component if available */}
        <Text className="text-xl">⚙️</Text>
      </TouchableOpacity>
    </View>
  );
};

// Search Bar Component
const SearchBar = () => {
  return (
    <View className="px-4 py-2 bg-white border-b border-gray-200">
      <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
        {/* Search Icon Placeholder */}
        <Text className="mr-2 text-gray-500">🔍</Text>
        <TextInput
          placeholder="Search Direct Messages"
          placeholderTextColor="#6b7280" // gray-500
          className="flex-1 text-base text-gray-900"
        />
      </View>
    </View>
  );
};

// Message Requests Component
const MessageRequests = () => {
  return (
    <TouchableOpacity className="flex-row items-center px-4 py-3 bg-white border-b border-gray-200">
      {/* Icon Placeholder */}
      <Text className="text-2xl mr-4">✉️</Text>
      <View>
        <Text className="text-base font-medium text-gray-900">Message requests</Text>
        <Text className="text-sm text-gray-500">2 people you may know</Text>
      </View>
    </TouchableOpacity>
  );
};

// Message Item Component
const MessageItem = ({ name, username, time, lastMessage, avatar, isYou }) => {
  return (
    <TouchableOpacity className="flex-row items-start px-4 py-3 bg-white border-b border-gray-100">
      {/* Left: Avatar */}
      <Image
        source={{ uri: avatar }}
        className="w-12 h-12 rounded-full mr-4"
        // Add error handling for images
         onError={(e) => console.log(`Failed to load avatar for ${name}:`, e.nativeEvent.error)}
      />
      {/* Right: Message Details */}
      <View className="flex-1">
        {/* Top Row: Name, Username, Time */}
        <View className="flex-row items-center mb-1">
          <Text className="text-base font-semibold text-gray-900 mr-1">{name}</Text>
          <Text className="text-sm text-gray-500 mr-1">{username}</Text>
          <Text className="text-sm text-gray-500">· {time}</Text>
        </View>
        {/* Bottom Row: Last Message Preview */}
        <Text className="text-sm text-gray-600" numberOfLines={2} ellipsizeMode="tail">
           {/* Displaying the message text directly */}
           {lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );
};


// --- Main Screen Component ---
export default function Messages() {
  return (
    // Use SafeAreaView to avoid notches and system UI elements
    <SafeAreaView className="flex-1 bg-gray-100">
       {/* Configure status bar style */}
       <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

       {/* Keep the Stack Screen for navigation header, or remove if
           MessagesHeader should replace it entirely. If replacing,
           configure header options in Stack.Screen */}
      <Stack.Screen options={{ title: 'Messages', headerShown: false }} />

      {/* Custom Header */}
      <MessagesHeader />

      {/* Search Bar */}
      <SearchBar />

      {/* Scrollable Content Area */}
      <ScrollView className="flex-1 bg-white">
        {/* Message Requests Section */}
        <MessageRequests />

        {/* Message List */}
        {messagesData.map((message) => (
          <MessageItem
            key={message.id}
            name={message.name}
            username={message.username}
            time={message.time}
            lastMessage={message.lastMessage}
            avatar={message.avatar}
            isYou={message.isYou}
          />
        ))}
      </ScrollView>

      {/* Optional: Add a bottom tab bar or input area here if needed */}
      {/* <View className="p-4 bg-gray-200 border-t border-gray-300">
        <Text>Bottom Area</Text>
      </View> */}
    </SafeAreaView>
  );
}
