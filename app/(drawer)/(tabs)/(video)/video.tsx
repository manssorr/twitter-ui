// Required Dependencies:
// npx expo install expo-video @shopify/flash-list react-native-vector-icons expo expo-linear-gradient
// Make sure expo is installed: npx expo install expo
// npx pod-install ios (for iOS)
// Configure app.json/app.config.js for background playback/PiP if needed (see expo-video docs)

// Import necessary modules from React and React Native
import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';

// Import FlashList for optimized list rendering
import { FlashList } from '@shopify/flash-list';

// Import expo-video components and hooks
// Note: We will compare status using strings directly to avoid potential import issues with VideoPlayerStatus
import { VideoView, useVideoPlayer } from 'expo-video';
import { useEvent } from 'expo'; // Import useEvent hook from expo

// Import icons (using FontAwesome as an example)
import Icon from 'react-native-vector-icons/FontAwesome';

// Import LinearGradient for subtle background effect
import { LinearGradient } from 'expo-linear-gradient';
import { router, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


// Get screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- Sample Data ---
// Added isFollowing placeholder
const samplePosts = [
  {
    videoId: '1',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Replace with your actual video URLs
    poster: {
      avatar: 'https://placehold.co/50x50/E91E63/white?text=A',
      headerImage: 'https://placehold.co/400x100/cccccc/ffffff?text=Header+1',
      name: 'Alice Wonderland',
      username: 'alicew',
      isFollowing: false, // Added placeholder
    },
    title: 'Big Buck Bunny Adventures! Check out this amazing animation.',
    postedTime: '9h ago', // Updated format
    engagement: {
      commentCount: 50, // Updated counts
      retweetCount: 417,
      likeCount: 5700, // 5.7k
      viewCount: 345000, // 345k
    },
  },
  {
    videoId: '2',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', // Replace with your actual video URLs
    poster: {
      avatar: 'https://placehold.co/50x50/3F51B5/white?text=B',
      headerImage: 'https://placehold.co/400x100/cccccc/ffffff?text=Header+2',
      name: 'Bob The Builder',
      username: 'bobbuilds',
      isFollowing: true,
    },
    title: 'Elephants Dream - A classic short film with stunning visuals.',
    postedTime: '1d ago',
    engagement: {
      commentCount: 300,
      retweetCount: 120,
      likeCount: 5200,
      viewCount: 105000,
    },
  },
  {
    videoId: '3',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', // Replace with your actual video URLs
    poster: {
      avatar: 'https://placehold.co/50x50/4CAF50/white?text=C',
      headerImage: 'https://placehold.co/400x100/cccccc/ffffff?text=Header+3',
      name: 'Charlie Chaplin',
      username: 'charliec',
      isFollowing: false,
    },
    title: 'For Bigger Blazes - Fun Times and cool effects!',
    postedTime: '2d ago',
    engagement: {
      commentCount: 50,
      retweetCount: 10,
      likeCount: 800,
      viewCount: 12000,
    },
  },
  {
    videoId: '4',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', // Replace with your actual video URLs
    poster: {
      avatar: 'https://placehold.co/50x50/FF9800/white?text=D',
      headerImage: 'https://placehold.co/400x100/cccccc/ffffff?text=Header+4',
      name: 'Diana Prince',
      username: 'wonderdiana',
      isFollowing: true,
    },
    title: 'Escaping the Ordinary - A thrilling adventure awaits.',
    postedTime: '3d ago',
    engagement: {
      commentCount: 450,
      retweetCount: 210,
      likeCount: 9800,
      viewCount: 250000,
    },
  },
];

// Helper function to format seconds into MM:SS
const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) {
    return '00:00';
  }
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};


// --- Video Item Component ---
// Renders a single video post using expo-video with updated UI
const VideoItem = React.memo(({ item, isVisible }) => {
  const videoViewRef = useRef(null); // Ref for VideoView to call methods like fullscreen
  const player = useVideoPlayer(item.videoUrl, (playerInstance) => {
    playerInstance.loop = true;
    // Set time update interval to get progress updates (e.g., 4 times per second)
    playerInstance.timeUpdateEventInterval = 250;
  });

  // State for mute status
  const [isMuted, setIsMuted] = useState(player?.muted ?? false);

  // Get player status and events
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  // Get status as a string directly
  const { status, error } = useEvent(player, 'statusChange', { status: player?.status });
  // Get time updates
  const { currentTime, duration } = useEvent(player, 'timeUpdate', {
    currentTime: player?.currentTime ?? 0,
    duration: player?.duration ?? 0, // Get duration as well
  });

  // --- Effects ---

  // Control playback based on visibility
  useEffect(() => {
    if (!player) return;
    if (isVisible) {
      player.play();
    } else {
      player.pause();
      // Resetting time might be desired or not, depending on UX preference
      // player.currentTime = 0;
    }
  }, [isVisible, player]);

  // Log errors
  useEffect(() => {
    // Compare status directly with the string 'error'
    if (status === 'error' && error) {
      console.error(`Video Error (${item.videoId}):`, error.message);
    }
  }, [status, error, item.videoId]);

  // Sync local mute state with player's mute state
  useEffect(() => {
    if (player) {
      setIsMuted(player.muted);
    }
    // Using player?.muted might cause issues if player becomes null then valid again
    // Better to depend on the player object itself
  }, [player]);


  const insets = useSafeAreaInsets();
  // --- Callbacks ---

  // Toggle play/pause on video tap
  const togglePlayPause = useCallback(() => {
    if (!player) return;
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  }, [player, isPlaying]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!player) return;
    const newMutedState = !isMuted;
    player.muted = newMutedState;
    setIsMuted(newMutedState); // Update local state immediately for responsiveness
  }, [player, isMuted]);

  // Placeholder for Follow action
  const handleFollow = useCallback(() => {
    console.log("Follow button pressed for:", item.poster.username);
    // Add actual follow/unfollow logic here
  }, [item.poster.username]);

  // Placeholder for More action
  const handleMoreOptions = useCallback(() => {
    console.log("More options pressed for:", item.videoId);
    // Add action sheet or menu logic here
  }, [item.videoId]);

  // --- Formatting ---

  // Format large numbers (e.g., 1500 -> 1.5k)
  const formatCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'm';
    } else if (count >= 1000) {
      // Show one decimal place only if it's not .0
      const value = (count / 1000);
      return value % 1 === 0 ? value.toFixed(0) + 'k' : value.toFixed(1) + 'k';
    }
    return count;
  };

  // Calculate progress for the bar
  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <View style={styles.videoContainer}>
      {/* Touchable area for play/pause */}
      <TouchableOpacity activeOpacity={1} onPress={togglePlayPause} style={[StyleSheet.absoluteFill, { top: insets.top }]}>
        <VideoView
          ref={videoViewRef} // Assign ref
          player={player}
          style={styles.videoPlayer}
          contentFit="cover"
          allowsFullscreen={false} // We'll add a custom button if needed
          allowsPictureInPicture={false}
          nativeControls={false}
        />
      </TouchableOpacity>

      {/* Loading Indicator: Compare status directly with the string 'loading' */}
      {status === 'loading' && (
        <ActivityIndicator size="large" color="#fff" style={styles.loadingIndicator} />
      )}

      {/* Bottom Overlay with Gradient */}
      <LinearGradient
        // Reduce gradient intensity slightly if needed
        colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.75)']}
        style={styles.overlayGradient}
      >


        {/* Controls Row - Placeholders for most */}

        <View style={styles.controlsRow}>

          <View className="flex-row items-center gap-2">
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeText}>/ {formatTime(duration)}</Text>
          </View>


          <View className="flex-row items-center gap-2">
            <TouchableOpacity style={styles.controlButton} onPress={() => console.log("Settings pressed")}>
              <Icon name="cog" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={() => console.log("PiP pressed")}>
              <Icon name="picture-o" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
              <Icon name={isMuted ? "volume-off" : "volume-up"} size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={() => console.log("Fullscreen pressed")}>
              <Icon name="expand" size={20} color="#fff" />
            </TouchableOpacity>
          </View>


        </View>


        {/* Progress Bar Area */}
        <View style={styles.progressContainer}>

          {/* Wrap progress bar in a view to handle potential touch events if needed later */}
          <View style={styles.progressBarTouchableArea}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
            </View>
          </View>

        </View>


        {/* Poster Info Row */}
        <View style={styles.posterInfoRow}>
          <Image
            source={{ uri: item.poster.avatar }}
            style={styles.avatar}
            onError={(e) => console.log(`Failed to load avatar: ${e.nativeEvent.error}`)}
          />
          <View style={styles.posterTextContainer}>
            <Text style={styles.posterName} numberOfLines={1}>{item.poster.name}</Text>
            <Text style={styles.posterUsername} numberOfLines={1}>@{item.poster.username} · {item.postedTime}</Text>
          </View>
          <TouchableOpacity
            // Add state logic here if needed for optimistic update
            style={[styles.followButton, item.poster.isFollowing ? styles.followingButton : {}]}
            onPress={handleFollow}
          >
            <Text style={[styles.followButtonText, item.poster.isFollowing ? styles.followingButtonText : {}]}>
              {item.poster.isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreButton} onPress={handleMoreOptions}>
            <Icon name="ellipsis-h" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Title/Caption */}
        <Text style={styles.title} numberOfLines={3}>{item.title}</Text>

        {/* Engagement Row */}
        <View style={styles.engagementRow}>
          <TouchableOpacity style={styles.engagementButton}>
            <Icon name="comment-o" size={20} color="#ccc" />
            <Text style={styles.engagementText}>{formatCount(item.engagement.commentCount)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.engagementButton}>
            {/* Using 'retweet' icon for shares */}
            <Icon name="retweet" size={20} color="#ccc" />
            <Text style={styles.engagementText}>{formatCount(item.engagement.retweetCount)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.engagementButton}>
            <Icon name="heart-o" size={20} color="#ccc" />
            <Text style={styles.engagementText}>{formatCount(item.engagement.likeCount)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.engagementButton}>
            {/* Using 'bar-chart' icon for views */}
            <Icon name="bar-chart" size={20} color="#ccc" />
            <Text style={styles.engagementText}>{formatCount(item.engagement.viewCount)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.engagementButton}>
            <Icon name="bookmark-o" size={20} color="#ccc" />
            {/* Bookmark count often not shown, or shown differently */}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Simple Play/Pause indicator: Compare status directly with the string 'readyToPlay' */}
      {!isPlaying && status === 'readyToPlay' && (
        <View style={styles.playPauseIndicator}>
          <Icon name="play" size={60} color="rgba(255, 255, 255, 0.7)" />
        </View>
      )}

      {/* Error Indicator: Compare status directly with the string 'error' */}
      {status === 'error' && (
        <View style={styles.playPauseIndicator}>
          <Icon name="exclamation-triangle" size={60} color="rgba(255, 0, 0, 0.7)" />
          <Text style={styles.errorText}>Video Error</Text>
        </View>
      )}
    </View>
  );
});

// --- Main Video Feed Component ---
// (No changes needed here)
const VideoFeed = () => {
  const viewableItems = useRef([]);
  const onViewableItemsChanged = useCallback(({ viewableItems: currentViewableItems }) => {
    viewableItems.current = currentViewableItems
      .filter(item => item.key != null)
      .map(item => item.key);
  }, []);
  const renderItem = useCallback(({ item }) => {
    const isVisible = viewableItems.current.includes(item.videoId);
    return <VideoItem item={item} isVisible={isVisible} />;
  }, []);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>

      <TouchableOpacity onPress={() => { router.back() }} className="absolute left-4" style={{ top: insets.top + 10 }}>
        <Feather name="arrow-left" size={22} color={'#536471'} />
      </TouchableOpacity>

      <FlashList
        data={samplePosts}
        renderItem={renderItem}
        keyExtractor={(item) => item.videoId}
        estimatedItemSize={SCREEN_HEIGHT}
        pagingEnabled={true}
        snapToInterval={SCREEN_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  videoPlayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  // Gradient overlay for better text visibility at the bottom
  overlayGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 10, // Reduced padding
    paddingBottom: Platform.OS === 'ios' ? 35 : 25, // Adjust bottom padding
    paddingHorizontal: 15,
  },
  // Progress Bar Styles
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10, // Increased space
    height: 20,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
  },
  // Added touchable area wrapper for potential seeking later
  progressBarTouchableArea: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 5, // Add vertical padding for easier touch
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  // Controls Row Styles
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 30,
  },
  controlButton: {
    padding: 5,
  },
  // Poster Info Row Styles
  posterInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
    marginRight: 10,
    backgroundColor: '#333',
  },
  posterTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  posterName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  posterUsername: {
    color: '#ccc',
    fontSize: 13,
  },
  followButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 10,
  },
  followingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent background when following
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  followButtonText: {
    color: '#000', // Black text for 'Follow'
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
  followingButtonText: {
    color: '#fff', // White text for 'Following'
  },
  moreButton: {
    padding: 5,
  },
  // Title Style
  title: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 18,
  },
  // Engagement Row Styles
  engagementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  engagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    // Let space-between handle horizontal spacing
  },
  engagementText: {
    color: '#ccc',
    fontSize: 13,
    marginLeft: 6, // Slightly more space
    fontWeight: '600',
  },
  // Indicators
  loadingIndicator: {
    position: 'absolute',
  },
  playPauseIndicator: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  errorText: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  }
});

// Export the main component
export default VideoFeed;
