import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, StarsBackground } from '../../components/ui';
import { Heading1, Heading3, Body, BodySmall, Caption } from '../../components/ui/Typography';
import { theme } from '../../lib/theme';
import { useHomeStore, useAuthStore } from '../../store';
import { formatRelativeTime } from '../../lib/utils/index';

const { width: screenWidth } = Dimensions.get('window');

export const HomeScreen: React.FC = () => {
  const [refreshing] = useState(false);
  const { user } = useAuthStore();
  const {
    announcements,
    videos,
    photos,
    fetchDashboardData,
    refreshDashboardData,
    markAnnouncementAsRead,
    markVideoAsWatched,
    likePhoto,
    unlikePhoto,
  } = useHomeStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Initial data fetch
    fetchDashboardData();

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRefresh = async () => {
    await refreshDashboardData();
  };

  const handleAnnouncementPress = (announcementId: string) => {
    markAnnouncementAsRead(announcementId);
  };

  const handleVideoPress = (videoId: string) => {
    markVideoAsWatched(videoId);
    // Navigate to video player or open video
  };

  const handlePhotoLike = (photoId: string, isLiked: boolean) => {
    if (isLiked) {
      unlikePhoto(photoId);
    } else {
      likePhoto(photoId);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const unreadAnnouncements = announcements.filter(a => !a.isRead);
  const unwatchedVideos = videos.filter(v => !v.isWatched);

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[
          theme.colors.background.primary,
          theme.colors.background.secondary,
        ]}
        style={styles.backgroundGradient}
      />

      {/* Enhanced Night Sky Background */}
      <StarsBackground 
        starCount={60} 
        animated={true} 
        showClouds={true} 
        showNebula={true} 
        dynamicMotion={true} 
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.neon.blue}
              colors={[theme.colors.neon.blue]}
            />
          }
        >
          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.greeting}>
              <Heading1 style={styles.greetingText}>
                {getGreeting()}, {user?.firstName || 'Golfer'}!
              </Heading1>
              <Body style={styles.subtitle}>
                Ready to light up the course?
              </Body>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Body style={styles.statNumber}>{unreadAnnouncements.length}</Body>
                <Caption style={styles.statLabel}>New Updates</Caption>
              </View>
              <View style={styles.statItem}>
                <Body style={styles.statNumber}>{unwatchedVideos.length}</Body>
                <Caption style={styles.statLabel}>New Videos</Caption>
              </View>
              <View style={styles.statItem}>
                <Body style={styles.statNumber}>{photos.length}</Body>
                <Caption style={styles.statLabel}>Gallery Photos</Caption>
              </View>
            </View>
          </Animated.View>

          {/* Announcements Section */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Heading3 style={styles.sectionTitle}>Latest Updates</Heading3>
              {unreadAnnouncements.length > 0 && (
                <View style={styles.badge}>
                  <Caption style={styles.badgeText}>{unreadAnnouncements.length}</Caption>
                </View>
              )}
            </View>

            {announcements.slice(0, 3).map((announcement) => (
              <TouchableOpacity
                key={announcement.id}
                onPress={() => handleAnnouncementPress(announcement.id)}
              >
                <Card style={StyleSheet.flatten([styles.announcementCard, !announcement.isRead && styles.unreadCard])}>
                  <View style={styles.announcementHeader}>
                    <Body style={styles.announcementTitle}>{announcement.title}</Body>
                    {!announcement.isRead && <View style={styles.unreadDot} />}
                  </View>
                  <BodySmall style={styles.announcementContent} numberOfLines={2}>
                    {announcement.message}
                  </BodySmall>
                  <Caption style={styles.announcementDate}>
                    {formatRelativeTime(announcement.createdAt)}
                  </Caption>
                </Card>
              </TouchableOpacity>
            ))}
          </Animated.View>

          {/* Videos Section */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Heading3 style={styles.sectionTitle}>Instructional Videos</Heading3>
              {unwatchedVideos.length > 0 && (
                <View style={styles.badge}>
                  <Caption style={styles.badgeText}>{unwatchedVideos.length}</Caption>
                </View>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.videosContainer}
            >
              {videos.map((video) => (
                <TouchableOpacity
                  key={video.id}
                  onPress={() => handleVideoPress(video.id)}
                  style={styles.videoCard}
                >
                  <Card style={styles.videoCardInner}>
                    <View style={styles.videoThumbnail}>
                      <Image
                        source={{ uri: video.thumbnailUrl }}
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                      />
                      <View style={styles.playButton}>
                        <Body style={styles.playIcon}>▶️</Body>
                      </View>
                      {!video.isWatched && <View style={styles.newVideoBadge} />}
                    </View>
                    <View style={styles.videoInfo}>
                      <BodySmall style={styles.videoTitle} numberOfLines={2}>
                        {video.title}
                      </BodySmall>
                      <Caption style={styles.videoDuration}>{video.duration}</Caption>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Photo Gallery Section */}
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Heading3 style={styles.sectionTitle}>Community Gallery</Heading3>
            </View>

            <View style={styles.photosGrid}>
              {photos.slice(0, 6).map((photo) => (
                <TouchableOpacity
                  key={photo.id}
                  style={styles.photoCard}
                  onPress={() => handlePhotoLike(photo.id, photo.isLiked)}
                >
                  <Image
                    source={{ uri: photo.imageUrl }}
                    style={styles.photoImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.photoOverlay}
                  >
                    <View style={styles.photoInfo}>
                      <View style={styles.photoLikes}>
                        <Body style={StyleSheet.flatten([styles.likeIcon, photo.isLiked && styles.likedIcon])}>
                          {photo.isLiked ? '❤️' : '🤍'}
                        </Body>
                        <Caption style={styles.likesCount}>{photo.likes}</Caption>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  greeting: {
    marginBottom: theme.spacing.lg,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.background.secondary + '40',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.neon.green,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  badge: {
    backgroundColor: theme.colors.neon.blue,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.background.primary,
  },
  announcementCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.neon.blue,
  },
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.neon.blue,
    marginLeft: theme.spacing.sm,
  },
  announcementContent: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  announcementDate: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
  },
  videosContainer: {
    paddingRight: theme.spacing.lg,
  },
  videoCard: {
    marginRight: theme.spacing.md,
    width: 200,
  },
  videoCardInner: {
    padding: 0,
    overflow: 'hidden',
  },
  videoThumbnail: {
    position: 'relative',
    height: 120,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 12,
    color: theme.colors.text.primary,
  },
  newVideoBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.neon.green,
  },
  videoInfo: {
    padding: theme.spacing.md,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    lineHeight: 18,
  },
  videoDuration: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoCard: {
    width: (screenWidth - theme.spacing.lg * 2 - theme.spacing.md * 2) / 3,
    height: 120,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
  },
  photoInfo: {
    padding: theme.spacing.sm,
  },
  photoLikes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeIcon: {
    fontSize: 16,
    marginRight: theme.spacing.xs,
  },
  likedIcon: {
    transform: [{ scale: 1.1 }],
  },
  likesCount: {
    fontSize: 12,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
});