import React, { useEffect, useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  StyleSheet
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store/store';
import users from '../dummy/users.json';
import authorizedAccounts from '../dummy/authorized_accounts.json';
import { Feather } from '@expo/vector-icons';
import Sortable from 'react-native-sortables';
import { useRouter } from 'expo-router';

// Define the user type
type User = {
  id: string;
  name: string;
  handle: string;
  profile_picture: string;
  is_verified: boolean;
  verified_badge: string;
};

// Define props for AccountItem - simplified
type AccountItemProps = {
  item: User;
  // drag and isActive are handled by Sortable.Flex internally
  currentUserId: string | null;
};

// Memoized item component - simplified props and removed drag handlers
const AccountItem = memo(({ item, currentUserId }: AccountItemProps) => {
  return (
    // Removed outer TouchableOpacity's onLongPress/disabled props
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: 'white', // isActive styling might need context/hook if desired
        width: '100%',
        alignSelf: 'stretch' // Ensure item stretches full width
      }}
    >
      {/* Drag handle - Removed TouchableOpacity wrapper and onPressIn */}
      <View style={{ marginRight: 12, padding: 4 }}>
        <Feather name="menu" size={22} color="#767676" />
      </View>

      {/* Account info (remains the same) */}
      <Image
        source={{ uri: item.profile_picture }}
        style={{ width: 40, height: 40, borderRadius: 4, marginRight: 12 }}
        onError={(e) => console.log("Failed to load image", e.nativeEvent.error)}
      />

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginRight: 4 }}>{item.name}</Text>
          {item.is_verified && (
            <Image
              source={{ uri: item.verified_badge }}
              style={{ width: 16, height: 16 }}
              onError={(e) => console.log("Failed to load image", e.nativeEvent.error)}
            />
          )}
        </View>
        <Text style={{ fontSize: 14, color: '#657786' }}>@{item.handle}</Text>
      </View>

      {/* Current account indicator */}
      {currentUserId === item.id && (
        <Feather name="check" size={18} color="#1DA1F2" />
      )}
    </View>
  );
});

// Component for the edit accounts screen
export default function EditAccountsScreen() {
  const insets = useSafeAreaInsets();
  const { currentUserId } = useStore();
  const router = useRouter();
  // State for the ordered list of accounts
  const [orderedAccounts, setOrderedAccounts] = useState<User[]>([]);

  // Load accounts on initial render
  useEffect(() => {
    // Get all authorized users
    const authorizedUsers = users.filter(user =>
      authorizedAccounts.includes(user.id)
    );

    setOrderedAccounts(authorizedUsers);
  }, []);

  // Handle saving the new order
  const handleSaveOrder = () => {
    // Here you would save the new order to authorizedAccounts.json
    // This is a mock implementation that would need to be connected to real storage

    // const newOrder = orderedAccounts.map(user => user.id);
    // console.log('New order saved:', newOrder);
    router.back();
    // In a real implementation, you would write this to the file
    // For now we'll just show a success message
    // Alert.alert('Success', 'Account order updated successfully');
  };

  // Handle drag end - Log parameters to inspect structure
  const handleDragEnd = (params: any) => { // Use 'any' temporarily for inspection
    console.log('Sortable.Flex onDragEnd params:', params);
    // TODO: Implement state update logic based on the actual params structure
    // Example (assuming params contains { from: number, to: number }):
    // const { from, to } = params;
    // setOrderedAccounts(currentAccounts => {
    //   const newAccounts = [...currentAccounts];
    //   const [movedItem] = newAccounts.splice(from, 1);
    //   newAccounts.splice(to, 0, movedItem);
    //   return newAccounts;
    // });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white', paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" />

      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
      }}>
        <TouchableOpacity
          onPress={handleSaveOrder}
          style={{ padding: 4, position: 'absolute', left: 16 }}
        >
          <Text style={{ fontSize: 16, fontWeight: '500', color: 'black' }}>Done</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 17, fontWeight: 'bold' }}>Accounts</Text>
      </View>

      {/* Sortable account list using direct children */}
      <View style={{ flex: 1, width: '100%' }}>
        <Sortable.Flex
          onDragEnd={handleDragEnd}
          flexDirection="column"
          width="100%"
          alignContent="flex-start"
          gap={0}
        >
          {orderedAccounts.map((item) => (
            // Render AccountItem directly as a child
            <AccountItem
              key={item.id} // Ensure key is present
              item={item}
              currentUserId={currentUserId}
            />
          ))}
        </Sortable.Flex>
      </View>
    </SafeAreaView>
  );
}