import React, { useState, useRef, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { FeedItem } from '~/components/FeedItem'; // Assuming FeedItem is in components
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import sampleFeedItems from '~/dummy/posts.json';

// --- Bottom Sheet Imports ---
import {
    BottomSheetModal,
    // BottomSheetModalProvider, // Removed: Should be in root layout (_layout.tsx)
    BottomSheetView,
    BottomSheetBackdrop // Added for the backdrop
} from '@gorhom/bottom-sheet';
// --- Gesture Handler Import ---
// GestureHandlerRootView Removed: Should be in root layout (_layout.tsx)
// import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Define the possible sort types
type SortType = 'relevant' | 'recent' | 'liked';

// Map sort types to display text
const sortOptions: Record<SortType, string> = {
    relevant: 'Most relevant replies',
    recent: 'Most recent replies',
    liked: 'Most liked replies',
};

export default function PostDetailScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const postId = params.id as string; // Get post ID from route params

    // --- State for Sorting ---
    const [selectedSort, setSelectedSort] = useState<SortType>('relevant');

    // --- Bottom Sheet Refs and Callbacks ---
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    // variables
    const snapPoints = useMemo(() => ['25%', '30%'], []); // Adjust snap points as needed

    // callbacks
    const handlePresentModalPress = useCallback(() => {
        // Function to open the bottom sheet
        bottomSheetModalRef.current?.present();
    }, []);

    const handleSheetChanges = useCallback((index: number) => {
        // Callback when sheet position changes (optional)
        console.log('handleSheetChanges', index);
    }, []);

    const handleSelectSort = useCallback((sortType: SortType) => {
        // Function called when a sort option is tapped in the sheet
        setSelectedSort(sortType);
        bottomSheetModalRef.current?.dismiss(); // Close the sheet
        // TODO: Add logic here to actually re-fetch or re-sort replies based on sortType
        console.log('Selected sort:', sortType);
    }, []);

    // Find the post (replace with real data fetching)
    const postData = sampleFeedItems.find(item => item.contentId === postId);

    const handleNavigateToProfile = (handle: string) => {
        router.push(`/profile/${handle}`);
    };

    // Screen shown if the post isn't found
    if (!postData) {
        // No providers needed here anymore if they are in root layout
        return (
            <View className="flex-1 justify-center items-center bg-white dark:bg-black" style={{ paddingTop: insets.top }}>
                <Stack.Screen options={{ title: 'Post Not Found' }} />
                <Text className="text-neutral-500 dark:text-neutral-400">Could not find the requested post.</Text>
            </View>
        );
    }

    // Main screen content
    // No GestureHandlerRootView or BottomSheetModalProvider needed here anymore
    return (
        <>
            <ScrollView
                className="flex-1 bg-white dark:bg-black"
                style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                <Stack.Screen options={{ title: 'Post' }} />

                {/* Render the main post */}
                <FeedItem
                    itemData={postData}
                // Ensure profile navigation is handled if needed
                />

                {/* --- Replies Section Header with Sort Trigger --- */}
                <View className="p-4 mt-2 border-t border-neutral-200 dark:border-neutral-800">
                    {/* This TouchableOpacity acts as the button to open the sheet */}
                    <TouchableOpacity
                        onPress={handlePresentModalPress} // Opens the sheet on press
                        className="flex-row items-center mb-3"
                    >
                        {/* Display current sort option */}
                        <Text className="text-sm font-medium text-blue-500 dark:text-blue-400 mr-1">
                            {sortOptions[selectedSort]}
                        </Text>
                        {/* Dropdown Icon */}
                        <Text className="text-sm text-blue-500 dark:text-blue-400">▼</Text>
                    </TouchableOpacity>

                    {/* Placeholder for Replies List */}
                    {/* TODO: This list should be updated/sorted based on selectedSort */}
                    <Text className="text-neutral-500 dark:text-neutral-400">Replies will load here...</Text>
                    {/* Example: Map through sorted replies here */}
                </View>
            </ScrollView>

            {/* --- Bottom Sheet Modal Definition --- */}
            {/* This modal appears when handlePresentModalPress is called */}
            <BottomSheetModal
                ref={bottomSheetModalRef}
                index={1} // Start at the second snap point (index 1 of snapPoints)
                snapPoints={snapPoints} // Define how high the sheet can open
                onChange={handleSheetChanges} // Optional callback for sheet changes
                // --- Add the default backdrop ---
                backdropComponent={props => (
                    <BottomSheetBackdrop
                        {...props}
                        appearsOnIndex={0} // Start fading in when sheet begins opening
                        disappearsOnIndex={-1} // Fully faded out when sheet is closed
                    // You can customize opacity/color: style={[props.style, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
                    />
                )}
                // Optional: Add background style for dark/light mode if needed
                // backgroundStyle={{ backgroundColor: '#ffffff' }} // Example light background
                handleIndicatorStyle={{ backgroundColor: '#EEF3F4', height: 5, width: 35 }} // Example handle color
                backgroundStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: 30
                }}
            >
                <BottomSheetView style={styles.contentContainer}>
                    {/* Title inside the bottom sheet */}
                    <Text className="text-lg font-extrabold text-black dark:text-white  text-center">Sort replies</Text>
                    {/* Map through the sort options to create tappable rows */}
                    {Object.entries(sortOptions).map(([key, value]) => (
                        <TouchableOpacity
                            key={key}
                            onPress={() => handleSelectSort(key as SortType)} // Selects sort and closes sheet
                            className="flex-row justify-between items-center py-3 px-4"
                        >
                            {/* Sort option text */}
                            <Text className="text-base font-semibold text-black dark:text-white">{value}</Text>
                            {/* Show checkmark only for the currently selected option */}
                            {selectedSort === key && (
                                <Text className="text-xl text-blue-500">✓</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </BottomSheetView>
            </BottomSheetModal>
        </> // Use Fragment shorthand <> </> as the outer element now
    );
}

// Optional: Add some basic styling for the bottom sheet content area
const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,

        // Add padding if needed, e.g., paddingHorizontal: 16,
    },
});
