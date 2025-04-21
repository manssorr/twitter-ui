import { Stack } from 'expo-router';
import React, { useState } from 'react'; // Import useState
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar, // Import StatusBar
  StyleSheet, // Import StyleSheet for styles not easily handled by Tailwind
  Dimensions, // To potentially calculate swipe distances
} from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view'; // Import SwipeListView
import Pin from "~/assets/svg/chat/pin.svg"
import Report from "~/assets/svg/chat/report.svg"
import Delete from "~/assets/svg/chat/delete.svg"
import Snooze from "~/assets/svg/chat/snooze.svg"

// --- Mock Data ---
// (Keep your messagesData array as it is)
const initialMessagesData = [
  {
    id: '1',
    key: '1', // SwipeListView often uses 'key' by default, good practice to include it
    name: 'Sky Sports Football',
    username: '@SkyFootball',
    time: '1h',
    lastMessage: 'Great highlights package from yesterday! Can we get clearance to use a few clips?',
    avatar: 'https://pbs.twimg.com/profile_images/1605131756310614017/05qwHae-_400x400.jpg', // Placeholder
    isYou: false,
  },
  {
    id: '2',
    key: '2',
    name: 'Manchester United',
    username: '@ManUtd',
    time: '3h',
    lastMessage: 'You: Thanks for sending over the updated squad list for the website.',
    avatar: 'https://placehold.co/100x100/FED7D7/9B2C2C?text=MU', // Placeholder
    isYou: true,
  },
  {
    id: '3',
    key: '3',
    name: 'Fantasy Premier League',
    username: '@OfficialFPL',
    time: '2d',
    lastMessage: 'You: Reminder to get the Gameweek 30 deadline graphic ready by tomorrow EOD.',
    avatar: 'https://placehold.co/100x100/E9D5FF/5B21B6?text=FPL', // Placeholder
    isYou: true,
  },
  {
    id: '4',
    key: '4',
    name: 'Liverpool FC',
    username: '@LFC',
    time: '2d',
    lastMessage: "Just confirming the kick-off time adjustment for the match on the 25th.",
    avatar: 'https://placehold.co/100x100/FEEBC8/9C4221?text=LFC', // Placeholder
    isYou: false,
  },
  {
    id: '5',
    key: '5',
    name: 'Arsenal',
    username: '@Arsenal',
    time: '4d',
    lastMessage: "You: Approved the submitted matchday photos. Look great!",
    avatar: 'https://placehold.co/100x100/FECACA/7F1D1D?text=AFC', // Placeholder
    isYou: true,
  },
  {
    id: '6',
    key: '6',
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

// Header Component (Keep as is)
const MessagesHeader = () => {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white">
      <TouchableOpacity>
        <Image
          source={{ uri: 'https://placehold.co/80x80/DBEAFE/1E3A8A?text=Me' }}
          className="w-8 h-8 rounded-full"
          onError={(e) => console.log('Failed to load user avatar:', e.nativeEvent.error)}
        />
      </TouchableOpacity>
      <Text className="text-lg font-semibold text-gray-900">Messages</Text>
      <TouchableOpacity>
        <Text className="text-xl">⚙️</Text>
      </TouchableOpacity>
    </View>
  );
};

// Search Bar Component (Keep as is)
const SearchBar = () => {
  return (
    <View className="px-4 py-2 bg-white ">
      <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
        <Text className="mr-2 text-gray-500">🔍</Text>
        <TextInput
          placeholder="Search Direct Messages"
          placeholderTextColor="#6b7280"
          className="flex-1 text-base text-gray-900"
        />
      </View>
    </View>
  );
};

// Message Requests Component (Keep as is)
const MessageRequests = () => {
  return (
    <TouchableOpacity className="flex-row items-center px-4 py-3 bg-white ">
      <Text className="text-2xl mr-4">✉️</Text>
      <View>
        <Text className="text-base font-medium text-gray-900">Message requests</Text>
        <Text className="text-sm text-gray-500">2 people you may know</Text>
      </View>
    </TouchableOpacity>
  );
};

// Message Item Component (Visible Row) - Slightly adapted for renderItem
const MessageItem = ({ data }) => {
  const { item } = data; // Destructure item from data passed by SwipeListView
  return (
    // Ensure the row has a background color so it hides the buttons underneath
    <TouchableOpacity
      activeOpacity={1} // Prevent opacity change on press if desired
      className="flex-row items-start px-4 py-3 bg-white"
      // Add onPress for navigation or other actions if needed
      onPress={() => console.log('Pressed message:', item.name)}
    >
      <Image
        source={{ uri: item.avatar }}
        className="w-12 h-12 rounded-full mr-4"
        onError={(e) => console.log(`Failed to load avatar for ${item.name}:`, e.nativeEvent.error)}
      />
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <Text className="text-base font-semibold text-gray-900 mr-1">{item.name}</Text>
          <Text className="text-sm text-gray-500 mr-1">{item.username}</Text>
          <Text className="text-sm text-gray-500">· {item.time}</Text>
        </View>
        <Text className="text-sm text-gray-600" numberOfLines={2} ellipsizeMode="tail">
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Hidden Item Component (Action Buttons)
const HiddenItemWithActions = ({ data, rowMap, onPin, onReport, onSnooze, onDelete }) => {
  const { item } = data;

  // Function to close the row (optional, useful after action)
  const closeRow = () => {
    if (rowMap[item.key]) {
      rowMap[item.key].closeRow();
    }
  };

  return (
    <View style={styles.rowBack}>
      {/* Left Action (Swipe Left-to-Right reveals this) */}
      <TouchableOpacity
        onPress={() => {
          onPin(item.id);
          // closeRow(); // Optionally close row after action
        }}
        className="flex-column items-center gap-3 border-r border-gray-200 w-20"
      >
        <Pin width={24} height={24} fill="#000" />
        <Text className="text-gray-700 text-sm">Pin</Text>
        {/* Add Pin Icon here if you have one */}
      </TouchableOpacity>

      {/* Right Actions (Swipe Right-to-Left reveals these) */}
      <View style={[styles.backRightBtnContainer]}>
        <TouchableOpacity
          onPress={() => {
            onReport(item.id);
            // closeRow();
          }}
          className="flex-column items-center gap-3 border-r border-gray-200 w-20"
        >
          <Report width={24} height={24} fill="#000" />
          <Text className="text-gray-700 text-sm">Report</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            onSnooze(item.id);
            // closeRow();
          }}
          className="flex-column items-center gap-3 border-r border-gray-200 w-20"
        >
          <Snooze width={24} height={24} fill="#000" />
          <Text className="text-gray-700 text-sm">Snooze</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            onDelete(item.id);
            // No need to close row if it's being deleted
          }}
          className="flex-column items-center gap-3 w-20"
        >
          <Delete width={24} height={24} fill="#f4222d" />
          <Text className="text-[#f4222d] text-sm ">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


// --- Main Screen Component ---
export default function Messages() {
  // Use state to manage messages if you want to delete items
  const [messages, setMessages] = useState(initialMessagesData);

  // --- Action Handlers ---
  const handlePin = (id) => {
    console.log('Pin message:', id);
    // Add your pin logic here (e.g., update state, API call)
  };

  const handleReport = (id) => {
    console.log('Report message:', id);
    // Add your report logic here
  };

  const handleSnooze = (id) => {
    console.log('Snooze message:', id);
    // Add your snooze logic here
  };

  const handleDelete = (id) => {
    console.log('Delete message:', id);
    // Example: Update state to remove the message
    setMessages(prevMessages => prevMessages.filter(message => message.id !== id));
    // Add API call for deletion if needed
  };

  // Render Hidden Item wrapper to pass handlers
  const renderHiddenItem = (data, rowMap) => (
    <HiddenItemWithActions
      data={data}
      rowMap={rowMap}
      onPin={handlePin}
      onReport={handleReport}
      onSnooze={handleSnooze}
      onDelete={handleDelete}
    />
  );

  // Calculate swipe distances (adjust these values as needed)
  const swipeRightOpenValue = 240; // Width for Report + Snooze + Delete (e.g., 3 * 80)
  const swipeLeftOpenValue = 80;   // Width for Pin

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Stack.Screen options={{ title: 'Messages', headerShown: false }} />

      <MessagesHeader />
      <SearchBar />

      {/* Message Requests Section - Keep outside the SwipeListView */}
      <MessageRequests />

      {/* Use SwipeListView instead of ScrollView + map */}
      <SwipeListView
        data={messages} // Use state variable
        renderItem={(data, rowMap) => ( // Pass rowMap if needed by MessageItem, usually not
          <MessageItem data={data} />
        )}
        renderHiddenItem={renderHiddenItem} // Render the hidden buttons
        // Swipe right-to-left configuration
        rightOpenValue={-swipeRightOpenValue} // Negative value for right actions
        stopRightSwipe={-swipeRightOpenValue - 20} // Stop slightly beyond the buttons
        // Swipe left-to-right configuration
        leftOpenValue={swipeLeftOpenValue}
        stopLeftSwipe={swipeLeftOpenValue + 20} // Stop slightly beyond the button
        keyExtractor={(item) => item.key} // Use the key extractor
        // Optional: Disable swipes if needed
        // disableRightSwipe={true} // Disables left-to-right swipe
        // disableLeftSwipe={true} // Disables right-to-left swipe
        className="flex-1 bg-white" // Apply styling to the list container
      // Optional: Add ListFooterComponent, ListHeaderComponent etc. like FlatList
      />

    </SafeAreaView>
  );
}

// --- Styles ---
// Use StyleSheet for complex layouts or where Tailwind might be cumbersome
const styles = StyleSheet.create({
  rowBack: {
    alignItems: 'center',
    // backgroundColor: '#DDD', // Background visible during swipe
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between', // Space between left and right actions
    // paddingLeft: 15, // Keep this 0 if left button aligns edge-to-edge
    // paddingRight: 0, // Keep this 0 if right buttons align edge-to-edge
  },
  backRightBtnContainer: {
    flexDirection: 'row', // Arrange right buttons horizontally
    // gap: 40,
    // justifyContent: 'center',
    alignItems: 'center', // Align vertically if needed
    // justifyContent: 'flex-end', // Align to the right
    // height: '100%', // Make container fill height if buttons need vertical centering
  },

});