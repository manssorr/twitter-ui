import React, { useState, useRef, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { FeedItem, FeedContent } from '~/components/FeedItem'; // Assuming FeedItem is in components
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import sampleFeedItems from '~/dummy/posts.json';
import Grok from '~/assets/svg/tabs/grok.svg';
import AntDesign from '@expo/vector-icons/AntDesign';
import Comments from '~/components/Comments'; // Import the new Comments component

// --- Bottom Sheet Imports ---
import {
    BottomSheetModal,
    // BottomSheetModalProvider, // Removed: Should be in root layout (_layout.tsx)
    BottomSheetView,
    BottomSheetBackdrop // Added for the backdrop
} from '@gorhom/bottom-sheet';
import { Feather } from '@expo/vector-icons';

// Define the possible sort types
type SortType = 'relevant' | 'recent' | 'liked';

// Map sort types to display text
const sortOptions: Record<SortType, string> = {
    relevant: 'Most relevant replies',
    recent: 'Most recent replies',
    liked: 'Most liked replies',
};

export const MoreContextIcons = ({ size = "lg" }: { size?: 'sm' | 'lg' }) => {
    const router = useRouter();
    return (
        <View className="flex-row items-center gap-3  ">
            <TouchableOpacity onPress={() => { router.back() }}>
                <Grok width={size === 'sm' ? 18 : 22} height={size === 'sm' ? 18 : 22} fill={'#536471'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { router.back() }}>
                <Feather name="more-horizontal" size={size === 'sm' ? 18 : 22} color={'#536471'} />
            </TouchableOpacity>
        </View>
    );
};

const PostHeader = () => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    return (
        <View className="p-4  top-0 left-0 right-0 flex-row items-center justify-center">

            <TouchableOpacity onPress={() => { router.back() }} className="absolute left-4">
                <Feather name="arrow-left" size={22} color={'#536471'} />
            </TouchableOpacity>

            <Text className="text-xl font-bold text-black dark:text-white">Post</Text>

            <View className="absolute right-4">
                <MoreContextIcons />
            </View>
        </View>
    );
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

    // Enhanced post finding logic that can handle different post formats
    const findPost = useMemo(() => {
        // First try direct contentId match (legacy format)
        let post = sampleFeedItems.find(item =>
            (item as any).contentId === postId
        );

        // If not found, try checking if the postId is a composite ID (post-poster_id-timestamp)
        if (!post && postId.startsWith('post-')) {
            // Extract the poster_id from the composite ID if possible
            const parts = postId.split('-');
            if (parts.length >= 2) {
                const potentialPosterId = parts[1];

                // Try matching on poster_id for newer format posts
                post = sampleFeedItems.find(item =>
                    (item as any).poster_id === potentialPosterId
                );
            }
        }

        return post as FeedContent | undefined;
    }, [postId]);

    const handleNavigateToProfile = (handle: string) => {
        router.push(`/profile/${handle}`);
    };

    // Screen shown if the post isn't found
    if (!findPost) {
        // No providers needed here anymore if they are in root layout
        return (
            <View className="flex-1 justify-center items-center bg-white dark:bg-black" style={{ paddingTop: insets.top }}>
                <Stack.Screen options={{ title: 'Post Not Found' }} />
                <Text className="text-neutral-500 dark:text-neutral-400">Could not find the requested post (ID: {postId}).</Text>
            </View>
        );
    }
    return (
        <>

            <ScrollView
                className="flex-1 bg-white dark:bg-black"
                style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                <Stack.Screen options={{ title: 'Post' }} />

                <PostHeader />

                {/* Render the main post */}
                <FeedItem
                    itemData={findPost}
                    detailView={true}
                // Ensure profile navigation is handled if needed
                />

                {/* --- Replies Section Header with Sort Trigger --- */}
                <View className="p-4 mt-2 border-t border-neutral-200 dark:border-neutral-800 mb-20">
                    {/* This TouchableOpacity acts as the button to open the sheet */}
                    <TouchableOpacity
                        onPress={handlePresentModalPress} // Opens the sheet on press
                        className="flex-row items-center mb-3"
                    >
                        {/* Display current sort option */}
                        <Text className="text-base font-bold text-neutral-500 dark:text-blue-400 mr-1 ">
                            {sortOptions[selectedSort]}
                        </Text>
                        {/* Dropdown Icon */}
                        <Feather name="chevron-down" size={18} color={'#536471'} />
                    </TouchableOpacity>

                    {/* New Comments component */}
                    <Comments postId={postId} />
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
                            {selectedSort === key ? (
                                <View className="w-[22px] h-[22px]  bg-[#1D9BF0] flex items-center justify-center   rounded-full">
                                    <Feather name="check" size={16} color={'white'} />
                                </View>
                            ) : <>
                                <View className="w-[22px] h-[22px]  border-2 border-gray-400   rounded-full"></View>
                            </>}
                        </TouchableOpacity>
                    ))}
                </BottomSheetView>
            </BottomSheetModal>
        </>
    );
}

// Optional: Add some basic styling for the bottom sheet content area
const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        padding: 4,
    },
});
