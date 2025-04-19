import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ImageBackground, // Needed for featured section
} from 'react-native';

// --- Mock Data ---
// Premier League relevant trending topics
// Replace with your actual data fetching logic
const trendingData = [
  {
    id: '1',
    category: 'Football · Trending',
    topic: '#ManchesterDerby',
    posts: '188K posts',
    image: 'https://placehold.co/150x100/EF4444/FFFFFF?text=Derby', // Placeholder
  },
  {
    id: '2',
    category: 'Premier League · Last night',
    topic: 'VAR Controversy Hits Anfield',
    posts: '95K posts',
     image: 'https://placehold.co/150x100/F97316/FFFFFF?text=VAR', // Placeholder
  },
  {
    id: '3',
    category: 'Sports · Trending',
    topic: 'Erling Haaland',
    posts: '120K posts',
    image: 'https://placehold.co/150x100/22C55E/FFFFFF?text=Haaland', // Placeholder
  },
  {
    id: '4',
    category: 'Football · Trending',
    topic: 'Transfer Window Rumours',
    posts: '250K posts',
    image: 'https://placehold.co/150x100/8B5CF6/FFFFFF?text=Transfer', // Placeholder
  },
   {
    id: '5',
    category: 'Premier League · Live',
    topic: 'Weekend Fixtures Update',
    posts: '76K posts',
    image: 'https://placehold.co/150x100/EC4899/FFFFFF?text=Fixtures', // Placeholder
  },
  // Add more trends as needed
];

// --- Components ---

// Header Component for Explore Screen
const ExploreHeader = ({ avatarUri }) => {
  return (
    <View className="flex-row items-center space-x-3 px-4 py-2 bg-white border-b border-gray-200">
      {/* Left: User Avatar */}
      <TouchableOpacity>
        <Image
          source={{ uri: avatarUri }}
          className="w-8 h-8 rounded-full"
          onError={(e) => console.log('Failed to load user avatar:', e.nativeEvent.error)}
        />
      </TouchableOpacity>

      {/* Center: Search Bar */}
      <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-3 py-1.5">
        <Text className="text-gray-500 mr-2">🔍</Text>
        <TextInput
          placeholder="Search Premier League"
          placeholderTextColor="#6b7280" // gray-500
          className="flex-1 text-base text-gray-900"
        />
      </View>

      {/* Right: Settings Icon */}
      <TouchableOpacity>
        {/* Replace with an actual Icon component */}
        <Text className="text-xl">⚙️</Text>
      </TouchableOpacity>
    </View>
  );
};

// Tabs Component (Similar to Notifications, potentially needs horizontal scroll)
const ExploreTabs = ({ activeTab, setActiveTab }) => {
  const tabs = ['For you', 'Trending', 'News', 'Sports', 'Entertainment'];

  return (
    // Use ScrollView for horizontal scrolling if tabs overflow
    <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="bg-white border-b border-gray-200"
        contentContainerStyle={{ flexGrow: 1 }} // Ensure it tries to fill width
    >
        <View className="flex-row flex-grow">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              // Adjust padding and potentially add minWidth if using horizontal scroll
              className={`py-3 px-4 items-center flex-grow ${ // flex-grow distributes space
                activeTab === tab ? 'border-b-2 border-blue-500' : ''
              }`}
              style={{ minWidth: 80 }} // Example minimum width per tab
            >
              <Text
                className={`text-base whitespace-nowrap ${ // Prevent text wrapping
                  activeTab === tab ? 'font-semibold text-blue-500' : 'text-gray-600'
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
    </ScrollView>
  );
};

// Featured Content Component
const FeaturedContent = () => {
    // Placeholder image for Premier League featured content
    const featuredImageUrl = 'https://placehold.co/600x300/3B82F6/FFFFFF?text=Premier+League+Highlights';
    return (
        <View className="mb-4">
            <ImageBackground
                source={{ uri: featuredImageUrl }}
                className="h-48 w-full justify-end p-4" // Height and padding
                resizeMode="cover" // Cover the area
                onError={(e) => console.log('Failed to load featured image:', e.nativeEvent.error)}
            >
                <Text className="text-white text-2xl font-bold shadow-lg">This Weekend's Action</Text>
                <Text className="text-white text-sm shadow-md">Catch all the goals and highlights!</Text>
                {/* Optional: Add overlay or gradient for better text visibility */}
            </ImageBackground>
            {/* Optional: Promoted/Sponsored Banner */}
            <View className="flex-row items-center justify-between bg-blue-50 p-3 mt-1 border-t border-b border-blue-100">
                <Text className="text-blue-800 font-semibold">PL Portal</Text>
                <Text className="text-xs text-gray-500">Brought to you by <Text className="font-bold">Sponsor</Text></Text>
                 {/* Replace with actual sponsor logo if available */}
                <Image source={{uri: 'https://placehold.co/80x20/A5B4FC/1E3A8A?text=Sponsor'}} className="h-5 w-16" resizeMode="contain" />
            </View>
        </View>
    );
};


// Trending Item Component
const TrendingItem = ({ item }) => {
  return (
    <TouchableOpacity className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
      {/* Left: Text Content */}
      <View className="flex-1 mr-3">
        <Text className="text-xs text-gray-500 mb-0.5">{item.category}</Text>
        <Text className="text-base font-semibold text-gray-900 mb-0.5">{item.topic}</Text>
        <Text className="text-xs text-gray-500">{item.posts}</Text>
      </View>
      {/* Right: Optional Image */}
      {item.image && (
         <Image
            source={{ uri: item.image }}
            className="w-16 h-16 rounded-lg" // Adjust size as needed
            onError={(e) => console.log(`Failed to load trend image for ${item.topic}:`, e.nativeEvent.error)}
         />
      )}
    </TouchableOpacity>
  );
};


// --- Main Screen Component ---
export default function Search() {
  // Default to 'Sports' tab for Premier League context
  const [activeTab, setActiveTab] = useState('Sports');

  // Premier League Avatar Placeholder
  const premierLeagueAvatar = 'https://placehold.co/80x80/6D28D9/EDE9FE?text=PL';

  // Filter content based on tab - Placeholder logic
  // In a real app, you'd fetch different data per tab
  const currentContent = activeTab === 'Trending' || activeTab === 'Sports' || activeTab === 'For you'
    ? trendingData // Show PL trends for these tabs
    : []; // Show nothing or different content for other tabs

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Hide default header */}
      <Stack.Screen options={{ title: 'Search', headerShown: false }} />

      {/* Custom Header with Search */}
      <ExploreHeader avatarUri={premierLeagueAvatar} />

      {/* Tabs */}
      <ExploreTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Scrollable Content Area */}
      <ScrollView className="flex-1 bg-white">

        {/* Show featured content only on certain tabs like 'For you' or 'Sports' */}
        {(activeTab === 'For you' || activeTab === 'Sports') && <FeaturedContent />}

        {/* Section Title (Optional) */}
         <Text className="text-lg font-bold px-4 pt-4 pb-2 text-gray-900">
           {activeTab === 'Trending' ? 'Premier League Trends' : 'For You'}
         </Text>

        {/* List of Trending Items or other content */}
        {currentContent.length > 0 ? (
          currentContent.map((item) => (
            <TrendingItem key={item.id} item={item} />
          ))
        ) : (
          // Message for empty tabs
          <View className="items-center justify-center py-10">
            <Text className="text-gray-500">No content available for {activeTab}.</Text>
          </View>
        )}
      </ScrollView>

      {/* Optional: Floating Action Button */}
      {/* <TouchableOpacity className="absolute bottom-6 right-6 bg-blue-500 rounded-full p-4 shadow-lg">
        <Text className="text-white text-2xl">+</Text>
      </TouchableOpacity> */}
    </SafeAreaView>
  );
}
