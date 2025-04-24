import AntDesign from '@expo/vector-icons/AntDesign';
import { LinearGradient } from 'expo-linear-gradient';
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
  ImageBackground,
} from 'react-native';
import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SettingIcon from '~/assets/svg/aside/settings.svg';
import SearchIcon from '~/assets/svg/tabs/search.svg';

const trendingData = [
  {
    id: '1',
    rank: 1,
    category: 'Sports · Trending',
    topic: '#WrestleMania',
    posts: '863K posts',
    trendingWith: 'Joe Hendry, Becky, Randy Orton, Lyra',
  },
  {
    id: '2',
    rank: 2,
    category: 'Sports · Trending',
    topic: 'Ty Jerome',
    posts: '9,687 posts',
    trendingWith: '#LetEmKnow, Cavs, Donovan Mitchell, Garland',
  },
  {
    id: '3',
    rank: 3,
    category: 'Trending in United States',
    topic: 'Logan Paul',
    posts: '18.5K posts',
    trendingWith: 'AJ Styles',
  },
  {
    id: '4',
    rank: 4,
    category: 'Sports · Trending',
    topic: 'Dirty Dom',
    posts: '9,420 posts',
    trendingWith: '',
  },
  {
    id: '5',
    rank: 5,
    category: 'Trending in United States',
    topic: '#TheLastOfUs',
    posts: '23K posts',
    trendingWith: '',
  },
  {
    id: '6',
    category: 'Football · Trending',
    topic: '#ManchesterDerby',
    posts: '188K posts',
    trendingWith: '',
  },
  {
    id: '7',
    category: 'Premier League · Last night',
    topic: 'VAR Controversy Hits Anfield',
    posts: '95K posts',
    trendingWith: '',
  },
  {
    id: '8',
    category: 'Sports · Trending',
    topic: 'Erling Haaland',
    posts: '120K posts',
    trendingWith: '',
  },
  {
    id: '9',
    category: 'Football · Trending',
    topic: 'Transfer Window Rumours',
    posts: '250K posts',
    trendingWith: '',
  },
  {
    id: '10',
    category: 'Premier League · Live',
    topic: 'Weekend Fixtures Update',
    posts: '76K posts',
    trendingWith: '',
  },
];

const APP_PRIMARY_COLOR = '#1DA1F2';

const ExploreHeader = () => {
  return (
    <View className="flex-row items-center justify-between bg-white px-4 py-3">
      <TouchableOpacity>
        <Image
          source={{
            uri: 'https://pbs.twimg.com/profile_images/1742837199005954048/YGI6Kw7P_400x400.jpg',
          }}
          className="h-10 w-10 rounded-full"
        />
      </TouchableOpacity>

      <View className="flex-1 px-4">
        <View className="flex-row items-center gap-2 rounded-full bg-[#EEF3F4] px-3 py-2">
          <SearchIcon width={16} height={16} fill="#5C6A75" />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#6b7280"
            className="relative -top-1 flex-1 text-lg text-gray-900"
          />
        </View>
      </View>

      <TouchableOpacity>
        <SettingIcon width={24} height={24} fill="#000" />
      </TouchableOpacity>
    </View>
  );
};

const FeaturedContent = () => {
  const featuredImageUrl =
    'https://pbs.twimg.com/semantic_core_img/1844526946882879503/orUmRvLL?format=jpg&name=900x900';
  return (
    <View className="mb-2">
      <ImageBackground
        source={{ uri: featuredImageUrl }}
        className="relative h-[200px] w-full justify-end p-4"
        resizeMode="cover"
        onError={(e) => console.log('Failed to load featured image:', e.nativeEvent.error)}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          locations={[0, 0.8]}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '100%',
          }}
        />
        <Text className="z-10 text-3xl font-extrabold text-white shadow-lg">
          Devils at Hurricanes
        </Text>
        <Text className="z-10 text-sm text-white shadow-md">NHL · 2 hours ago</Text>
      </ImageBackground>

      <ImageBackground
        source={{ uri: 'https://pbs.twimg.com/media/GjiSI34aIAUxqvk?format=png&name=900x900' }}
        className="mx-2  mt-3 h-24 flex-row justify-end justify-between overflow-hidden rounded-lg p-5"
        resizeMode="cover"
        onError={(e) => console.log('Failed to load featured image:', e.nativeEvent.error)}>
        <View>
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-white">NBA Portal</Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Text className="text-base text-white">
              Brought to you by <Text className="font-bold">Sponsor</Text>
            </Text>

            <Image
              source={{
                uri: 'https://pbs.twimg.com/media/Gjxr_4DXAAAWFR8?format=png&name=900x900',
              }}
              className="h-5 w-16"
              resizeMode="contain"
            />
          </View>
        </View>

        <View className="flex h-full items-center justify-center ">
          <TouchableOpacity className="rounded-full bg-[#0f1419bf] p-2">
            <AntDesign name="arrowright" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
};

const TrendingItem = ({ item }) => {
  return (
    <TouchableOpacity className="flex-row border-b border-gray-100 bg-white px-4 py-3">
      <View className="flex-1">
        <View className="flex-row items-center">
          {item.rank && <Text className="mr-2 text-sm text-gray-500">{item.rank} ·</Text>}
          <Text className="text-sm text-gray-500">{item.category}</Text>

          <Text className="ml-auto text-gray-400">···</Text>
        </View>

        <Text className="mt-0.5 text-lg font-bold text-gray-900">{item.topic}</Text>

        <Text className="mt-0.5 text-sm text-gray-500">{item.posts}</Text>

        {item.trendingWith && item.trendingWith.length > 0 && (
          <Text className="mt-0.5 text-base text-gray-500">
            Trending with <Text className="text-gray-800">{item.trendingWith}</Text>
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const storiesData = [
  {
    id: '1',
    title: "Elon Musk's Easter Doges: A Viral Celebration",
    category: 'Celebrity',
    status: 'Trending now',
    posts: '10K posts',
    profileImages: [
      'https://pbs.twimg.com/profile_images/1893803697185910784/Na5lOWi5_normal.jpg',
      'https://pbs.twimg.com/profile_images/1881092586040934401/bWIAQBgO_normal.jpg',
      'https://pbs.twimg.com/profile_images/1672319913925419014/HD2CDQOv_400x400.jpg',
    ],
  },
  {
    id: '2',
    title: 'Elon Musk Highlights Government Spending Concerns',
    category: 'Politics',
    status: 'Trending now',
    posts: '3.7K posts',
    profileImages: [
      'https://pbs.twimg.com/profile_images/1881368435453542400/NnD56DYV_400x400.jpg',
      'https://pbs.twimg.com/profile_images/1893803697185910784/Na5lOWi5_normal.jpg',
      'https://pbs.twimg.com/profile_images/1899401226158039040/SmC-Bb8i_400x400.jpg',
    ],
  },
  {
    id: '3',
    title: 'Trump Defends Tariff Policy, Critiques Business Critics',
    category: 'Politics',
    status: '9 hours ago',
    posts: '8.4K posts',
    profileImages: [
      'https://pbs.twimg.com/profile_images/1043187066832650240/6iaOQ7xL_400x400.jpg',
      'https://pbs.twimg.com/profile_images/1913234634801926144/yVHVVAid_400x400.jpg',
      'https://pbs.twimg.com/profile_images/1867641239685713920/7jTW4Eag_400x400.jpg',
    ],
  },
  {
    id: '4',
    title: 'Gold Prices Surge to Record Highs',
    category: 'Finance',
    status: 'Trending now',
    posts: '1.1K posts',
    profileImages: [
      'https://pbs.twimg.com/profile_images/1582467096331501568/TA06rLOk_400x400.jpg',
      'https://pbs.twimg.com/profile_images/914888589670043654/KVvwjcWA_400x400.jpg',
      'https://pbs.twimg.com/profile_images/1145865652533547008/XBahoZmX_400x400.png',
    ],
  },
];

const StoriesForYou = () => {
  return (
    <View className="mb-4 mt-4">
      <Text className="px-4 pb-8 pt-2 text-xl font-extrabold text-gray-900">Stories For You</Text>

      {storiesData.map((story, index) => (
        <TouchableOpacity key={story.id} className="mb-5">
          <View className="px-4">
            <Text className="mb-2 text-lg font-extrabold text-gray-900">{story.title}</Text>

            <View className="mb-1 flex-row items-center">
              <View className="mr-3 flex-row">
                {story.profileImages.map((img, imgIndex) => (
                  <Image
                    key={imgIndex}
                    source={{ uri: img }}
                    className="h-8 w-8 rounded-full"
                    style={{
                      marginLeft: imgIndex > 0 ? -12 : 0,
                      borderWidth: 2,
                      borderColor: 'white',
                      zIndex: 3 - imgIndex,
                    }}
                  />
                ))}
              </View>

              <Text className="text-gray-500">
                {story.status} · {story.category} · {story.posts}
              </Text>
            </View>
          </View>

          {index < storiesData.length - 1 && <View className="mt-4 h-[0.5px] w-full bg-gray-200" />}
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default function Search() {
  const insets = useSafeAreaInsets();

  const renderHeader = () => (
    <View style={{ paddingTop: insets.top }} className="w-full bg-white">
      <ExploreHeader />
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      <Tabs.Container
        renderHeader={renderHeader}
        pagerProps={{ scrollEnabled: true }}
        renderTabBar={(props) => (
          <MaterialTabBar
            {...props}
            indicatorStyle={{
              backgroundColor: APP_PRIMARY_COLOR,
              height: 3,
              borderRadius: 50,
            }}
            activeColor="black"
            scrollEnabled
            style={{
              paddingHorizontal: 16,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: '#f0f0f0',
            }}
            labelStyle={{
              marginHorizontal: 10,
              opacity: 1,
              fontWeight: 'bold',
              textTransform: 'capitalize',
              height: 24,
              color: '#606E79',
            }}
          />
        )}
        headerContainerStyle={{
          backgroundColor: 'transparent',
          elevation: 0,
          shadowOpacity: 0,
        }}
        minHeaderHeight={-100}>
        <Tabs.Tab name="For You">
          <Tabs.ScrollView>
            <FeaturedContent />

            <StoriesForYou />
          </Tabs.ScrollView>
        </Tabs.Tab>

        <Tabs.Tab name="Trending">
          <Tabs.ScrollView>
            {trendingData.map((item) => (
              <TrendingItem key={item.id} item={item} />
            ))}
          </Tabs.ScrollView>
        </Tabs.Tab>

        <Tabs.Tab name="News">
          <Tabs.ScrollView>
            <View className="items-center justify-center p-6">
              <Text className="text-gray-500">News content will appear here</Text>
            </View>
          </Tabs.ScrollView>
        </Tabs.Tab>
        <Tabs.Tab name="Sports">
          <Tabs.ScrollView>
            <View className="items-center justify-center p-6">
              <Text className="text-gray-500">Sports content will appear here</Text>
            </View>
          </Tabs.ScrollView>
        </Tabs.Tab>
        <Tabs.Tab name="Entertainment">
          <Tabs.ScrollView>
            <View className="items-center justify-center p-6">
              <Text className="text-gray-500">Entertainment content will appear here</Text>
            </View>
          </Tabs.ScrollView>
        </Tabs.Tab>
        <Tabs.Tab name="Saved">
          <Tabs.ScrollView>
            <View className="items-center justify-center p-6">
              <Text className="text-gray-500">Saved content will appear here</Text>
            </View>
          </Tabs.ScrollView>
        </Tabs.Tab>
      </Tabs.Container>
    </View>
  );
}
