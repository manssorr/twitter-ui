import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView // Import SafeAreaView for better handling of notches/status bars
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import { Ionicons, MaterialIcons, Feather, SimpleLineIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Link, useRouter, usePathname, useSegments } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { BlurView } from 'expo-blur'; // Import BlurView

import { HeaderButton } from '../../components/HeaderButton'; // Assuming this component exists
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import { useStore } from '../../store/store';
import users from '../../dummy/users.json';

// import Ads from "~/assets/svg/aside/ads.svg"
import Bookmarks from "~/assets/svg/aside/bookmarks.svg"
import Lists from "~/assets/svg/aside/lists.svg"
import Monetization from "~/assets/svg/aside/monetization.svg"
import Premium from "~/assets/svg/aside/premium.svg"
import Profile from "~/assets/svg/aside/profile.svg"
import Settings from "~/assets/svg/aside/settings.svg"
import VerifiedOrgs from "~/assets/svg/aside/verified-orgs.svg"
import Grok from "~/assets/svg/tabs/grok.svg"
import X from "~/assets/svg/aside/x.svg"
import Spaces from "~/assets/svg/aside/spaces.svg"


// --- Custom Drawer Content Component ---
function CustomDrawerContent(props: any) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentUserId } = useStore();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Find the user with the matching ID
    if (currentUserId) {
      const user = users.find(user => user.id === currentUserId);
      if (user) {
        setCurrentUser(user);
      }
    }
  }, [currentUserId]);

  // Set default user if none is selected
  useEffect(() => {
    if (!currentUser && users.length > 0) {
      setCurrentUser(users[0]);
    }
  }, []);

  // Use the current user data or default placeholder
  const userName = currentUser?.name || 'Twitter User';
  const userHandle = currentUser?.handle ? `@${currentUser.handle}` : '@user';
  const followingCount = currentUser?.following_count || 0;
  const followersCount = currentUser?.followed_by || '0';
  const profileImageUrl = currentUser?.profile_picture || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png';
  const verified_badge = currentUser?.verified_badge || '';
  const isVerified = currentUser?.is_verified || false;

  return (
    // Use SafeAreaView and flex-1 for the main container
    <SafeAreaView className="flex-1 flex-col bg-white">
      {/* --- 1. Fixed Header (Profile Section) --- */}
      {/* This View is outside the ScrollView */}

      <View className="px-5 pt-5 pb-4 flex-row items-start border-b border-b-gray-200" style={{ paddingTop: insets.top }}>


        <View className="flex-1">
          <TouchableOpacity onPress={() => router.push('/profile')} className="mr-4 mb-1">
            <Image
              source={{ uri: profileImageUrl }}
              className="w-12 h-12 rounded-sm"
              onError={(e) => console.log("Failed to load image", e.nativeEvent.error)}
            />

          </TouchableOpacity>

          <View className="flex-row items-center gap-1">
            <Text className="text-lg font-extrabold text-gray-900">{userName}</Text>
            {isVerified && (
              <Image
                source={{ uri: verified_badge }}
                className="w-4 h-4"
                onError={(e) => console.log("Failed to load image", e.nativeEvent.error)}
              />
            )}
          </View>
          <Text className="text-base text-gray-500 mb-1">{userHandle}</Text>
          <View className="flex-row mt-1">
            <Text className="text-base text-gray-500 mr-4">
              <Text className="font-bold text-gray-900">{followingCount}</Text> Following
            </Text>
            <Text className="text-base text-gray-500">
              <Text className="font-bold text-gray-900">{followersCount}</Text> Followers
            </Text>
          </View>
        </View>
        <TouchableOpacity className="border border-gray-300 rounded-full"> {/* Added pt-1 for better alignment */}
          <MaterialCommunityIcons name="dots-horizontal" size={24} color="black" opacity={0.6} />
        </TouchableOpacity>
      </View>

      {/* --- 2. Scrollable Middle Section --- */}
      {/* DrawerContentScrollView now only wraps the scrollable items */}
      {/* Added flex-shrink to allow it to shrink if content is short, and flex-grow to let it expand */}
      <DrawerContentScrollView
        {...props}
        className="flex-shrink flex-grow" // Allow shrinking and growing
        contentContainerStyle={{ paddingTop: 0 }} // Remove default top padding if any
        swipeEdgeWidth={width}
      >
        {/* --- Custom Drawer Items Section 1 --- */}
        <View className="mt-4">
          {/* Added slight vertical margin (my-0.5) to DrawerItems for spacing */}
          <DrawerItem
            icon={({ color, size }) => <Feather name="user" color={color} size={size} />}
            label="Profile"
            labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#000' }}
            onPress={() => router.push('/profile')}
            style={{}} // Add vertical spacing
          />
          <DrawerItem
            icon={({ color, size }) => <X width={size} height={size} fill={color} />}
            label="Premium"
            labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#000' }}
            onPress={() => router.push('/premium')}
            style={{}}
          />
          <DrawerItem
            icon={({ color, size }) => <Feather name="users" color={color} size={size} />}
            label="Communities"
            labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#000' }}
            onPress={() => router.push('/communities')}
            style={{}}
          />

          {/* <DrawerItem
            icon={({ color, size }) => <Ads width={size} height={size} fill={color} />}
            label="Ads"
            labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#000' }}
            onPress={() => router.push('/ads')}
            style={{  }}
          /> */}

          <DrawerItem
            icon={({ color, size }) => <Bookmarks width={size} height={size} fill={color} />}
            label="Bookmarks"
            labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#000' }}
            onPress={() => router.push('/bookmarks')}
            style={{}}
          />

          <DrawerItem
            icon={({ color, size }) => <Lists width={size} height={size} fill={color} />}
            label="Lists"
            labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#000' }}
            onPress={() => router.push('/lists')}
            style={{}}
          />



          <DrawerItem
            icon={({ color, size }) => <VerifiedOrgs width={size} height={size} fill={color} />}
            label="Verified Orgs"
            labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#000' }}
            onPress={() => router.push('/verified-orgs')}
            style={{}}
          />
          <DrawerItem
            icon={({ color, size }) => <Spaces width={size} height={size} fill={color} />}
            label="Spaces"
            labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#000' }}
            onPress={() => router.push('/spaces')}
            style={{}}
          />

          <DrawerItem
            icon={({ color, size }) => <Monetization width={size} height={size} fill={color} />}
            label="Monetization"
            labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#000' }}
            onPress={() => router.push('/monetization')}
            style={{}}
          />

        </View>

        {/* --- Divider --- */}
        <View className="h-px bg-gray-200 my-2 mx-5" /> {/* Reduced vertical margin */}

        {/* --- Custom Drawer Items Section 2 --- */}
        <View> {/* Removed mt-0 */}
          <DrawerItem
            icon={({ color, size }) => <Grok width={size} height={size} fill={color} />}
            label="Download Grok"
            labelStyle={{ fontSize: 16, fontWeight: '600', color: '#000', opacity: 0.8 }}
            onPress={() => { /* Add action */ }}
            style={{ marginVertical: -4 }}
          />
          <DrawerItem
            icon={({ color, size }) => <Feather name="settings" color={color} size={size} />}
            label="Settings and privacy"
            labelStyle={{ fontSize: 16, fontWeight: '600', color: '#000', opacity: 0.8 }}
            onPress={() => router.push('/settings')}
            style={{ marginVertical: -4 }}
          />
          <DrawerItem
            icon={({ color, size }) => <Feather name="help-circle" color={color} size={size} />}
            label="Help Center"
            labelStyle={{ fontSize: 16, fontWeight: '600', color: '#000', opacity: 0.8 }}
            onPress={() => router.push('/help')}
            style={{ marginVertical: -4 }}
          />
        </View>
      </DrawerContentScrollView>

      {/* --- 3. Fixed Footer --- */}
      {/* Added bottom safe area padding */}
      <View className="px-5 py-2 border-t border-gray-200" style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }}>
        <View className="flex-row justify-between">
          <TouchableOpacity>
            <Feather name="moon" size={22} color="black" />
          </TouchableOpacity>
          <TouchableOpacity>
            <SimpleLineIcons name="bubble" size={22} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// --- Main Drawer Layout ---
function DrawerLayout() {
  const { width } = useWindowDimensions();
  const pathname = useSegments();
  const [isInTabRoute, setIsInTabRoute] = React.useState(false);

  // Check if we're in any of the tab routes
  useEffect(() => {
    //weird logic for demo lol  but check route and groups and set a better logic. basically on group childs, we wanna disable drawer swipe.
    setIsInTabRoute(pathname.length > 3);
  }, [pathname]);

  console.log(`PATHNAME__`, pathname);

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        swipeEnabled: true,
        swipeEdgeWidth: isInTabRoute ? 0 : width,
        overlayColor: '#adadad8c',
        drawerStyle: {
          width: '80%',
        }
      }}
    >
      {/* Screen definitions remain the same */}
      {/* You might want headerShown: false on screens if you handle headers elsewhere */}
      <Drawer.Screen name="index" options={{ headerTitle: 'Home' /*, headerShown: false */ }} />
      <Drawer.Screen name="(tabs)" options={{ headerTitle: 'Tabs' /*, headerShown: false */ }} />
      <Drawer.Screen name="profile" options={{ headerTitle: 'Profile' /*, headerShown: false */ }} />
      <Drawer.Screen name="premium" options={{ headerTitle: 'Premium' /*, headerShown: false */ }} />
      <Drawer.Screen name="communities" options={{ headerTitle: 'Communities' /*, headerShown: false */ }} />
      <Drawer.Screen name="bookmarks" options={{ headerTitle: 'Bookmarks' /*, headerShown: false */ }} />
      <Drawer.Screen name="ads" options={{ headerTitle: 'Ads' /*, headerShown: false */ }} />
      <Drawer.Screen name="lists" options={{ headerTitle: 'Lists' /*, headerShown: false */ }} />
      <Drawer.Screen name="spaces" options={{ headerTitle: 'Spaces' /*, headerShown: false */ }} />
      <Drawer.Screen name="monetization" options={{ headerTitle: 'Monetization' /*, headerShown: false */ }} />
      <Drawer.Screen name="settings" options={{ headerTitle: 'Settings' /*, headerShown: false */ }} />
      <Drawer.Screen name="help" options={{ headerTitle: 'Help Center' /*, headerShown: false */ }} />
      <Drawer.Screen name="verified-orgs" options={{ headerTitle: 'Verified Orgs' /*, headerShown: false */ }} />
      <Drawer.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
    </Drawer>
  );
}

export default DrawerLayout;
