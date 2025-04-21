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
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

const APP_PRIMARY_COLOR = '#1DA1F2'; // Twitter blue

// --- Components ---

// Header Component for Explore Screen
const ExploreHeader = () => {
  // Premier League Avatar Placeholder
  const premierLeagueAvatar = 'https://placehold.co/80x80/6D28D9/EDE9FE?text=PL';

  return (
    <View className="flex-row items-center space-x-3 px-4 py-2 bg-white border-b border-gray-200">
      {/* Left: User Avatar */}
      <TouchableOpacity>
        <Image
          source={{ uri: premierLeagueAvatar }}
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
        <Image source={{ uri: 'https://placehold.co/80x20/A5B4FC/1E3A8A?text=Sponsor' }} className="h-5 w-16" resizeMode="contain" />
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
  const insets = useSafeAreaInsets();

  // Header component to be used in the collapsible view
  const renderHeader = () => (
    <ExploreHeader />
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
              elevation: 0, shadowOpacity: 0,
              borderBottomWidth: 1, borderBottomColor: '#f0f0f0'
            }}
            labelStyle={{
              marginHorizontal: 10,
              opacity: 1,
              fontWeight: 'bold', textTransform: 'capitalize', height: 24,
              color: '#606E79'
            }}
          />
        )}
      >


        <Tabs.Tab name="For You">
          <Tabs.ScrollView>

            {/* Featured content at the top of the Trending tab */}
            <FeaturedContent />

            {/* Section Title */}
            <Text className="text-lg font-bold px-4 pt-2 pb-2 text-gray-900">
              Premier League Trends
            </Text>

            <View className="p-6 items-center justify-center">
              <Text className="text-gray-500">Personalized content will appear here</Text>
            </View>
          </Tabs.ScrollView>
        </Tabs.Tab>



        <Tabs.Tab name="Trending">
          <Tabs.ScrollView>


            {/* Trending items list */}
            {trendingData.map((item) => (
              <TrendingItem key={item.id} item={item} />
            ))}
          </Tabs.ScrollView>
        </Tabs.Tab>




        <Tabs.Tab name="News">
          <Tabs.ScrollView>
            <View className="p-6 items-center justify-center">
              <Text className="text-gray-500">News content will appear here</Text>
            </View>
          </Tabs.ScrollView>
        </Tabs.Tab>
        <Tabs.Tab name="Sports">
          <Tabs.ScrollView>
            <View className="p-6 items-center justify-center">
              <Text className="text-gray-500">Sports content will appear here</Text>
            </View>
          </Tabs.ScrollView>
        </Tabs.Tab>
        <Tabs.Tab name="Entertainment">
          <Tabs.ScrollView>
            <View className="p-6 items-center justify-center">
              <Text className="text-gray-500">Entertainment content will appear here</Text>
            </View>
          </Tabs.ScrollView>
        </Tabs.Tab>
        <Tabs.Tab name="Saved">
          <Tabs.ScrollView>
            <View className="p-6 items-center justify-center">
              <Text className="text-gray-500">Saved content will appear here</Text>
            </View>
          </Tabs.ScrollView>
        </Tabs.Tab>
      </Tabs.Container>







    </View>
  );
}
