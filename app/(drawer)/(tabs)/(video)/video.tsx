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
import { FlashList } from '@shopify/flash-list';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useEvent } from 'expo';
import Icon from 'react-native-vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Fontisto from '@expo/vector-icons/Fontisto';

import SettingsIcon from '~/assets/svg/video/settings.svg'; // Ensure these paths are correct
import P2PIcon from '~/assets/svg/video/p2p.svg'; // Ensure these paths are correct
import AudioIcon from '~/assets/svg/video/audio.svg'; // Ensure these paths are correct
import FontAwesome from '@expo/vector-icons/FontAwesome';

import Comment from '~/assets/svg/comment.svg'; // Ensure these paths are correct
import Repost from '~/assets/svg/repost.svg'; // Ensure these paths are correct
import Save from '~/assets/svg/save.svg'; // Ensure these paths are correct
import Views from '~/assets/svg/views.svg'; // Ensure these paths are correct
import LikeButton from '~/components/LikeButton'; // Ensure this path is correct

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');


const samplePosts = [
  {
    "videoId": "1k3xgqw",
    "videoUrl": "https://v.redd.it/hr2t3u7a92we1/DASH_720.mp4?source=fallback",
    "poster": {
      "avatar": "https://placehold.co/50x50/FF5722/white?text=7",
      "headerImage": "https://placehold.co/400x100/cccccc/ffffff?text=Header+1k3xgqw",
      "name": "77SidVid77",
      "username": "77SidVid77",
      "isFollowing": false
    },
    "title": "Valverde's Volley Goal (Stand View)",
    "postedTime": "2h ago",
    "engagement": {
      "commentCount": 44,
      "retweetCount": 530,
      "likeCount": 2649,
      "viewCount": 132450
    }
  },
  {
    "videoId": "1k3sgxg",
    "videoUrl": "https://v.redd.it/4lag4v1a41we1/DASH_1080.mp4?source=fallback",
    "poster": {
      "avatar": "https://placehold.co/50x50/607D8B/white?text=S",
      "headerImage": "https://placehold.co/400x100/cccccc/ffffff?text=Header+1k3sgxg",
      "name": "SirSlapBot",
      "username": "SirSlapBot",
      "isFollowing": true
    },
    "title": "Trent Alexander-Arnold on Special Moments",
    "postedTime": "6h ago",
    "engagement": {
      "commentCount": 322,
      "retweetCount": 505,
      "likeCount": 2523,
      "viewCount": 126150
    }
  },
  {
    "videoId": "1k3irtu",
    "videoUrl": "https://v.redd.it/aup4fk6ekyve1/DASH_720.mp4?source=fallback",
    "poster": {
      "avatar": "https://placehold.co/50x50/795548/white?text=B",
      "headerImage": "https://placehold.co/400x100/cccccc/ffffff?text=Header+1k3irtu",
      "name": "_BigCIitPhobia_",
      "username": "_BigCIitPhobia_",
      "isFollowing": false
    },
    "title": "Old Trafford Vibes: Pitch Invader Hugs Security",
    "postedTime": "15h ago",
    "engagement": {
      "commentCount": 75,
      "retweetCount": 1228,
      "likeCount": 6142,
      "viewCount": 307100
    }
  },
  {
    "videoId": "1k3skev",
    "videoUrl": "https://v.redd.it/rtodftfl41we1/DASH_480.mp4?source=fallback",
    "poster": {
      "avatar": "https://placehold.co/50x50/9C27B0/white?text=T",
      "headerImage": "https://placehold.co/400x100/cccccc/ffffff?text=Header+1k3skev",
      "name": "TastefulAss",
      "username": "TastefulAss",
      "isFollowing": true
    },
    "title": "Barca [4] - 1 Chelsea - Pina Goal (Putellas Assist)",
    "postedTime": "6h ago",
    "engagement": {
      "commentCount": 39,
      "retweetCount": 139,
      "likeCount": 693,
      "viewCount": 34650
    }
  },
  {
    "videoId": "1k3k52t",
    "videoUrl": "https://v.redd.it/3j6fd5ilwyve1/DASH_1080.mp4?source=fallback",
    "poster": {
      "avatar": "https://placehold.co/50x50/00BCD4/white?text=K",
      "headerImage": "https://placehold.co/400x100/cccccc/ffffff?text=Header+1k3k52t",
      "name": "-kousor",
      "username": "-kousor",
      "isFollowing": false
    },
    "title": "Arabic Commentary: Aston Villa's 4th Goal",
    "postedTime": "13h ago",
    "engagement": {
      "commentCount": 92,
      "retweetCount": 475,
      "likeCount": 2374,
      "viewCount": 118700
    }
  },
  {
    "videoId": "1k3wj7z",
    "videoUrl": "https://v.redd.it/7kw26eoi12we1/DASH_480.mp4?source=fallback",
    "poster": {
      "avatar": "https://placehold.co/50x50/03A9F4/white?text=E",
      "headerImage": "https://placehold.co/400x100/cccccc/ffffff?text=Header+1k3wj7z",
      "name": "EiMidagi",
      "username": "EiMidagi",
      "isFollowing": true
    },
    "title": "Vini Jr Trivela Cross",
    "postedTime": "3h ago",
    "engagement": {
      "commentCount": 15,
      "retweetCount": 65,
      "likeCount": 324,
      "viewCount": 16200
    }
  },
  {
    "videoId": "1k3zoeu",
    "videoUrl": "https://v.redd.it/wfhtpcqis2we1/DASH_1080.mp4?source=fallback",
    "poster": {
      "avatar": "https://placehold.co/50x50/8BC34A/white?text=S",
      "headerImage": "https://placehold.co/400x100/cccccc/ffffff?text=Header+1k3zoeu",
      "name": "SirSlapBot",
      "username": "SirSlapBot",
      "isFollowing": false
    },
    "title": "Djokovic Reacts to Valverde Golazo",
    "postedTime": "49m ago",
    "engagement": {
      "commentCount": 17,
      "retweetCount": 32,
      "likeCount": 161,
      "viewCount": 8050
    }
  }
]

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) {
    return '00:00';
  }
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

const VideoItem = React.memo(({ item, isVisible }) => {
  const videoViewRef = useRef(null);
  const player = useVideoPlayer(item.videoUrl, (playerInstance) => {
    playerInstance.loop = true;
    playerInstance.timeUpdateEventInterval = 250;
  });

  const [isMuted, setIsMuted] = useState(player?.muted ?? false);

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const { status, error } = useEvent(player, 'statusChange', { status: player?.status });
  const { currentTime, duration } = useEvent(player, 'timeUpdate', {
    currentTime: player?.currentTime ?? 0,
    duration: player?.duration ?? 0,
  });

  useEffect(() => {
    if (!player) return;
    if (isVisible) {
      player.play();
    } else {
      player.pause();
    }
  }, [isVisible, player]);

  useEffect(() => {
    if (status === 'error' && error) {
      console.error(`Video Error (${item.videoId}):`, error.message, error); // Log the full error object
    }
  }, [status, error, item.videoId]);

  useEffect(() => {
    if (player) {
      setIsMuted(player.muted);
    }
  }, [player]);


  const insets = useSafeAreaInsets();

  const togglePlayPause = useCallback(() => {
    if (!player) return;
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  }, [player, isPlaying]);

  const toggleMute = useCallback(() => {
    if (!player) return;
    const newMutedState = !isMuted;
    player.muted = newMutedState;
    setIsMuted(newMutedState);
  }, [player, isMuted]);

  const handleFollow = useCallback(() => {
    console.log("Follow button pressed for:", item.poster.username);
  }, [item.poster.username]);

  const handleMoreOptions = useCallback(() => {
    console.log("More options pressed for:", item.videoId);
  }, [item.videoId]);

  const formatCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'm';
    } else if (count >= 1000) {
      const value = (count / 1000);
      return value % 1 === 0 ? value.toFixed(0) + 'k' : value.toFixed(1) + 'k';
    }
    return count;
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <View style={styles.videoContainer}>
      <TouchableOpacity activeOpacity={1} onPress={togglePlayPause} style={[StyleSheet.absoluteFill, { top: insets.top }]}>
        <VideoView
          ref={videoViewRef}
          player={player}
          style={styles.videoPlayer}
          contentFit="cover"
          allowsFullscreen={false}
          allowsPictureInPicture={false}
          nativeControls={false}
          onError={(e) => console.error(`VideoView Error (${item.videoId}):`, e.error)} // Added direct error handler
        />
      </TouchableOpacity>

      {status === 'loading' && (
        <ActivityIndicator size="large" color="#fff" style={styles.loadingIndicator} />
      )}

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.75)']}
        style={styles.overlayGradient}
      >
        <View style={styles.controlsRow}>
          <View style={styles.timeDisplayContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeText}>/ {formatTime(duration)}</Text>
          </View>

          <View style={styles.iconControlsContainer}>
            <TouchableOpacity style={styles.controlButton} onPress={() => console.log("Settings pressed")}>
              <SettingsIcon width={20} height={20} fill="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={() => console.log("PiP pressed")}>
              <Fontisto name="airplay" size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
              <AudioIcon width={20} height={20} fill={isMuted ? '#aaa' : '#fff'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={() => console.log("Fullscreen pressed")}>
              <P2PIcon width={20} height={20} fill="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <TouchableOpacity onPress={togglePlayPause}>
             <FontAwesome name={isPlaying ? "pause" : "play"} size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.progressBarTouchableArea}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
            </View>
          </View>
        </View>

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

        <Text style={styles.title} numberOfLines={3}>{item.title}</Text>

        <View style={styles.engagementRow}>
          <TouchableOpacity style={styles.engagementButton}>
            <Comment width={16} height={16} fill="#ccc" />
            <Text style={styles.engagementText}>{formatCount(item.engagement.commentCount)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.engagementButton}>
            <Repost width={16} height={16} fill="#ccc" />
            <Text style={styles.engagementText}>{formatCount(item.engagement.retweetCount)}</Text>
          </TouchableOpacity>
          {/* Example of integrating LikeButton - adjust props as needed */}
          <LikeButton initialLikes={item.engagement.likeCount} iconSize={16} textColor="#ccc" />
          <TouchableOpacity style={styles.engagementButton}>
            <Views width={16} height={16} fill="#ccc" />
            <Text style={styles.engagementText}>{formatCount(item.engagement.viewCount)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.engagementButton}>
            <Save width={16} height={16} fill="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.engagementButton}>
            <Feather name="share" size={16} color="#ccc" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {!isPlaying && status === 'readyToPlay' && (
        <View style={styles.playPauseIndicator} pointerEvents="none">
          <Icon name="play" size={60} color="rgba(255, 255, 255, 0.7)" />
        </View>
      )}

      {status === 'error' && (
        <View style={styles.playPauseIndicator}>
          <Icon name="exclamation-triangle" size={60} color="rgba(255, 0, 0, 0.7)" />
          <Text style={styles.errorText}>Video Error</Text>
        </View>
      )}
    </View>
  );
});

const VideoFeed = () => {
  const viewableItems = useRef([]);
  const onViewableItemsChanged = useCallback(({ viewableItems: currentViewableItems }) => {
    viewableItems.current = currentViewableItems
      .filter(item => item.isViewable && item.item) // Ensure item exists and is viewable
      .map(item => item.item.videoId); // Map to videoId
  }, []);

  const renderItem = useCallback(({ item }) => {
    // Check if item and item.videoId exist before accessing
    const isVisible = item?.videoId ? viewableItems.current.includes(item.videoId) : false;
    if (!item) return null; // Render nothing if item is somehow null/undefined
    return <VideoItem item={item} isVisible={isVisible} />;
  }, []);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => { router.back() }} style={[styles.backButton, { top: insets.top + 10 }]}>
        <Feather name="arrow-left" size={22} color={'#fff'} />
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
        removeClippedSubviews={true} // Optimization
        initialNumToRender={1} // Optimization
        maxToRenderPerBatch={1} // Optimization
        windowSize={3} // Optimization: Render items within 3 screens
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backButton: {
     position: 'absolute',
     left: 15,
     zIndex: 10, // Ensure it's above the list
     padding: 5, // Add padding for easier tapping
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
  overlayGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 35 : 25,
    paddingHorizontal: 15,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    height: 20,
    gap: 10,
  },
  timeDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
  },
  progressBarTouchableArea: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 5,
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
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5, // Reduced margin slightly
  },
  iconControlsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10, // Add gap between icons
  },
  controlButton: {
    padding: 5,
  },
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  followButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
  followingButtonText: {
    color: '#fff',
  },
  moreButton: {
    padding: 5,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 18,
  },
  engagementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  engagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  engagementText: {
    color: '#ccc',
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '600',
  },
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

export default VideoFeed;
