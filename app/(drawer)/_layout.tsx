import {
  Ionicons,
  MaterialIcons,
  Feather,
  SimpleLineIcons,
  MaterialCommunityIcons,
  FontAwesome5,
} from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { BlurView } from 'expo-blur';
import { Link, useRouter, usePathname, useSegments } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeaderButton } from '../../components/HeaderButton';
import authorizedAccounts from '../../dummy/authorized_accounts.json';
import users from '../../dummy/users.json';
import { useStore } from '../../store/store';

import Bookmarks from '~/assets/svg/aside/bookmarks.svg';
import Lists from '~/assets/svg/aside/lists.svg';
import Monetization from '~/assets/svg/aside/monetization.svg';
import Premium from '~/assets/svg/aside/premium.svg';
import Profile from '~/assets/svg/aside/profile.svg';
import Settings from '~/assets/svg/aside/settings.svg';
import Spaces from '~/assets/svg/aside/spaces.svg';
import VerifiedOrgs from '~/assets/svg/aside/verified-orgs.svg';
import X from '~/assets/svg/aside/x.svg';
import Grok from '~/assets/svg/tabs/grok.svg';

function CustomDrawerContent(props: any) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { currentUserId, setCurrentUserId } = useStore();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authorizedUsers, setAuthorizedUsers] = useState<any[]>([]);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['50%'], []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  const handleSelectAccount = useCallback(
    (userId: string) => {
      setCurrentUserId(userId);
      bottomSheetModalRef.current?.dismiss();
    },
    [setCurrentUserId]
  );

  useEffect(() => {
    const filteredUsers = users.filter((user) => authorizedAccounts.includes(user.id));
    setAuthorizedUsers(filteredUsers);
  }, []);

  useEffect(() => {
    if (currentUserId) {
      const user = users.find((user) => user.id === currentUserId);
      if (user) {
        setCurrentUser(user);
      }
    }
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUser && authorizedUsers.length > 0) {
      setCurrentUser(authorizedUsers[0]);
      setCurrentUserId(authorizedUsers[0].id);
    }
  }, [authorizedUsers, currentUser, setCurrentUserId]);

  const userName = currentUser?.name || 'Twitter User';
  const userHandle = currentUser?.handle ? `@${currentUser.handle}` : '@user';
  const followingCount = currentUser?.following_count || 0;
  const followersCount = currentUser?.followed_by || '0';
  const profileImageUrl =
    currentUser?.profile_picture ||
    'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png';
  const verified_badge = currentUser?.verified_badge || '';
  const isVerified = currentUser?.is_verified || false;

  return (
    <SafeAreaView className="flex-1 flex-col bg-white">
      <View className="flex-row items-start border-b border-b-gray-200 px-5 pb-4 pt-5" style={{}}>
        <View className="flex-1">
          <TouchableOpacity onPress={() => router.push('/profile')} className="mb-1 mr-4">
            <Image
              source={{ uri: profileImageUrl }}
              className="h-12 w-12 rounded-sm"
              onError={(e) => console.log('Failed to load image', e.nativeEvent.error)}
            />
          </TouchableOpacity>

          <View className="flex-row items-center gap-1">
            <Text className="text-lg font-extrabold text-gray-900">{userName}</Text>
            {isVerified && (
              <Image
                source={{ uri: verified_badge }}
                className="h-4 w-4"
                onError={(e) => console.log('Failed to load image', e.nativeEvent.error)}
              />
            )}
          </View>
          <Text className="mb-1 text-base text-gray-500">{userHandle}</Text>
          <View className="mt-1 flex-row">
            <Text className="mr-4 text-base text-gray-500">
              <Text className="font-bold text-gray-900">{followingCount}</Text> Following
            </Text>
            <Text className="text-base text-gray-500">
              <Text className="font-bold text-gray-900">{followersCount}</Text> Followers
            </Text>
          </View>
        </View>
        <TouchableOpacity
          className="rounded-full border border-gray-300 p-1"
          onPress={handlePresentModalPress}>
          <MaterialCommunityIcons name="dots-horizontal" size={24} color="black" opacity={0.6} />
        </TouchableOpacity>
      </View>

      <DrawerContentScrollView
        {...props}
        className="flex-shrink flex-grow"
        contentContainerStyle={{ paddingTop: 0 }}
        swipeEdgeWidth={width}>
        <View className="mt-4">
          <DrawerItem
            icon={({ color, size }) => <Feather name="user" color={color} size={size} />}
            label="Profile"
            labelStyle={{ fontSize: 18, fontWeight: 'bold', color: '#000' }}
            onPress={() => router.push('/profile')}
            style={{}}
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

        <View className="mx-5 my-2 h-px bg-gray-200" />

        <View>
          <DrawerItem
            icon={({ color, size }) => <Grok width={size} height={size} fill={color} />}
            label="Download Grok"
            labelStyle={{ fontSize: 16, fontWeight: '600', color: '#000', opacity: 0.8 }}
            onPress={() => {
              /* Add action */
            }}
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

      <View
        className="border-t border-gray-200 px-8 pt-4"
        style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }}>
        <View className="flex-row justify-between">
          <TouchableOpacity>
            <Feather name="moon" size={22} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
        )}
        handleIndicatorStyle={{ backgroundColor: '#EEF3F4', height: 5, width: 35 }}
        backgroundStyle={{
          backgroundColor: '#ffffff',
          borderRadius: 24,
        }}>
        <BottomSheetView style={styles.contentContainer}>
          <View className="mb-4 flex-row items-center justify-center">
            <TouchableOpacity
              onPress={() => {
                bottomSheetModalRef.current?.dismiss();
                router.push('/edit-accounts');
              }}
              className="absolute  left-4">
              <Text className="text-xl ">Edit</Text>
            </TouchableOpacity>

            <Text className="px-4 text-xl font-bold  text-black">Accounts</Text>
          </View>

          {authorizedUsers.map((user) => (
            <TouchableOpacity
              key={user.id}
              onPress={() => handleSelectAccount(user.id)}
              className="flex-row items-center px-4 py-3">
              <Image
                source={{ uri: user.profile_picture }}
                className="mr-3 h-10 w-10 rounded-sm"
                onError={(e) => console.log('Failed to load image', e.nativeEvent.error)}
              />
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-base font-semibold text-black">{user.name}</Text>
                  {user.is_verified && (
                    <Image
                      source={{ uri: user.verified_badge }}
                      className="ml-1 h-4 w-4"
                      onError={(e) => console.log('Failed to load image', e.nativeEvent.error)}
                    />
                  )}
                </View>
                <Text className="text-gray-500">@{user.handle}</Text>
              </View>
              {currentUserId === user.id && <Feather name="check" size={18} color="#1DA1F2" />}
            </TouchableOpacity>
          ))}

          <View className="mt-2 border-t border-gray-200 px-4 pt-2">
            <TouchableOpacity className="flex-row items-center py-3">
              <Text className="ml-3 text-base font-semibold text-blue-500">
                Create a new account
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center py-3">
              <Text className="ml-3 text-base font-semibold text-blue-500">
                Add an Existing Account
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}

function DrawerLayout() {
  const { width } = useWindowDimensions();
  const pathname = useSegments();

  console.log(pathname);

  //testing only grok tab for now
  const allowedDrawerRoutes = ['grok'];

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        swipeEnabled: allowedDrawerRoutes.includes(pathname[3] || ''),
        swipeEdgeWidth: width,

        overlayColor: '#adadad8c',
        drawerStyle: {
          width: '80%',
        },
      }}>
      <Drawer.Screen name="index" options={{ headerTitle: 'Home' /*, headerShown: false */ }} />
      <Drawer.Screen name="(tabs)" options={{ headerTitle: 'Tabs' /*, headerShown: false */ }} />
      <Drawer.Screen
        name="profile"
        options={{ headerTitle: 'Profile' /*, headerShown: false */ }}
      />
      <Drawer.Screen
        name="premium"
        options={{ headerTitle: 'Premium' /*, headerShown: false */ }}
      />
      <Drawer.Screen
        name="communities"
        options={{ headerTitle: 'Communities' /*, headerShown: false */ }}
      />
      <Drawer.Screen
        name="bookmarks"
        options={{ headerTitle: 'Bookmarks' /*, headerShown: false */ }}
      />
      <Drawer.Screen name="ads" options={{ headerTitle: 'Ads' /*, headerShown: false */ }} />
      <Drawer.Screen name="lists" options={{ headerTitle: 'Lists' /*, headerShown: false */ }} />
      <Drawer.Screen name="spaces" options={{ headerTitle: 'Spaces' /*, headerShown: false */ }} />
      <Drawer.Screen
        name="monetization"
        options={{ headerTitle: 'Monetization' /*, headerShown: false */ }}
      />
      <Drawer.Screen
        name="settings"
        options={{ headerTitle: 'Settings' /*, headerShown: false */ }}
      />
      <Drawer.Screen
        name="help"
        options={{ headerTitle: 'Help Center' /*, headerShown: false */ }}
      />
      <Drawer.Screen
        name="verified-orgs"
        options={{ headerTitle: 'Verified Orgs' /*, headerShown: false */ }}
      />
      <Drawer.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
      <Drawer.Screen
        name="edit-accounts"
        options={{ headerTitle: 'Edit Accounts' /*, headerShown: false */ }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    marginBottom: 80,
  },
});

export default DrawerLayout;
