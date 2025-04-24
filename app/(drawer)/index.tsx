import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

import users from '../../dummy/users.json';
import { useStore } from '../../store/store';

export default function Home() {
  const router = useRouter();
  const { setCurrentUserId } = useStore();
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);

  useEffect(() => {
    if (users.length > 0) {
      setCurrentUserId(users[selectedUserIndex].id);
    }
  }, [selectedUserIndex]);

  const navigateToTabs = () => {
    router.push('/(drawer)/(tabs)/(index)');
  };

  const handleNextUser = () => {
    if (users.length > 1) {
      setSelectedUserIndex((prev) => (prev + 1) % users.length);
    }
  };

  const currentUser = users[selectedUserIndex];

  return (
    <View className="flex-1 justify-center gap-10 bg-black px-8 py-10">
      <Text className="mb-10 text-[100px] text-white">𝕏</Text>
      <View className="flex-col gap-2">
        <Text className="mb-2.5 text-5xl font-bold tracking-tighter text-white">Happening now</Text>
        <Text className="mb-12 text-3xl font-semibold tracking-tighter text-white">
          Join today.
        </Text>
      </View>
      <TouchableOpacity
        className="w-full flex-row items-center rounded-full bg-white px-6 py-4"
        onPress={navigateToTabs}>
        {currentUser && (
          <>
            <Image
              source={{ uri: currentUser.profile_picture }}
              className="mr-4 h-8 w-8 rounded-full"
            />
            <Text className="text-lg font-bold text-black">
              Continue with @{currentUser.handle}
            </Text>
          </>
        )}
        {!currentUser && <Text className="text-lg font-bold text-black">Continue</Text>}
      </TouchableOpacity>

      {users.length > 1 && (
        <TouchableOpacity className="mt-2 items-center" onPress={handleNextUser}>
          <Text className="text-base text-[#1d9bf0]">Switch account</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
