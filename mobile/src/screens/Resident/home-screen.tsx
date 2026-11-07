import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Announcement } from '@/constants/resident-options';
import ModalCloseButton from '@/components/modal-close-button';
import { useAuth } from '@/context/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { api } from '@/services/api';
import getHomeStyles from '@/styles/home-styles';

type FeedAnnouncement = Announcement & {
  authorName?: string;
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
};

type Comment = {
  _id: string;
  authorName: string;
  message: string;
  createdAt: string;
};

type Photo = { mimeType: string; data: string };

function greeting(name?: string) {
  const hour = new Date().getHours();
  const time = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return `${time}, ${name?.trim().split(/\s+/)[0] || 'Resident'}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeZone: 'Asia/Manila',
  }).format(new Date(value));
}

function FeedCard({
  item,
  styles,
  colors,
  onLike,
  onComment,
  liking,
}: {
  item: FeedAnnouncement;
  styles: ReturnType<typeof getHomeStyles>;
  colors: ReturnType<typeof useAppTheme>;
  onLike: () => void;
  onComment: () => void;
  liking: boolean;
}) {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    let active = true;
    if (!item.images?.length) return;
    api<{ image: Photo }>(`/announcements/${item._id}/images/0`)
      .then(({ image }) => {
        if (active) setPhoto(image);
      })
      .catch(() => {
        if (active) setPhotoError(true);
      });
    return () => {
      active = false;
    };
  }, [item._id, item.images?.length]);

  return (
    <View style={styles.feedCard}>
      {photo ? (
        <Image
          source={{ uri: `data:${photo.mimeType};base64,${photo.data}` }}
          accessibilityLabel={`${item.title} photo`}
          resizeMode="cover"
          style={styles.announcementImage}
        />
      ) : item.images?.length ? (
        <View style={[styles.imagePlaceholder, styles.announcementImage]}>
          <Text style={styles.imagePlaceholderText}>
            {photoError ? 'Announcement photo unavailable' : 'Loading photo…'}
          </Text>
        </View>
      ) : null}
      <View style={styles.feedContent}>
        <View style={styles.feedMetaRow}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.feedDate}>{formatDate(item.publishedAt ?? item.date)}</Text>
        </View>
        <Text style={styles.feedTitle}>{item.title}</Text>
        <Text style={styles.feedMessage}>{item.message}</Text>
        <View style={styles.authorRow}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorInitial}>
              {(item.authorName ?? 'G').trim().charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.authorName}>{item.authorName || 'Green Park Village HOA'}</Text>
        </View>
        <View style={styles.feedActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={item.likedByMe ? 'Unlike announcement' : 'Like announcement'}
            accessibilityState={{ selected: item.likedByMe, disabled: liking }}
            disabled={liking}
            onPress={onLike}
            style={styles.feedAction}>
            <SymbolView
              name={{
                ios: item.likedByMe ? 'heart.fill' : 'heart',
                android: item.likedByMe ? 'favorite' : 'favorite_border',
                web: item.likedByMe ? 'favorite' : 'favorite_border',
              }}
              size={19}
              tintColor={item.likedByMe ? colors.danger : colors.brand}
            />
            <Text style={[styles.actionText, item.likedByMe && styles.likedText]}>
              {item.likesCount} {item.likesCount === 1 ? 'Like' : 'Likes'}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View ${item.commentsCount} comments`}
            onPress={onComment}
            style={styles.feedAction}>
            <SymbolView
              name={{ ios: 'bubble.right', android: 'chat_bubble_outline', web: 'chat_bubble_outline' }}
              size={19}
              tintColor={colors.brand}
            />
            <Text style={styles.actionText}>
              {item.commentsCount} {item.commentsCount === 1 ? 'Comment' : 'Comments'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const colors = useAppTheme();
  const styles = getHomeStyles(colors);
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<FeedAnnouncement[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likingId, setLikingId] = useState('');
  const [selected, setSelected] = useState<FeedAnnouncement | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState('');
  const [draftComment, setDraftComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setError('');
    const [feedResult, notificationResult] = await Promise.allSettled([
      api<{ announcements: FeedAnnouncement[] }>('/announcements'),
      api<{ unreadCount: number }>('/notifications/mine'),
    ]);
    if (feedResult.status === 'fulfilled') {
      setAnnouncements(feedResult.value.announcements ?? []);
    } else {
      setError(feedResult.reason instanceof Error ? feedResult.reason.message : 'Could not load announcements.');
    }
    if (notificationResult.status === 'fulfilled') setUnreadCount(notificationResult.value.unreadCount);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { void loadFeed(); }, [loadFeed]));

  const toggleLike = async (item: FeedAnnouncement) => {
    if (likingId === item._id) return;
    const previousLiked = item.likedByMe;
    const previousCount = item.likesCount;
    const nextLiked = !previousLiked;
    setLikingId(item._id);
    setAnnouncements((current) => current.map((entry) => entry._id === item._id
      ? {
          ...entry,
          likedByMe: nextLiked,
          likesCount: Math.max(0, previousCount + (nextLiked ? 1 : -1)),
        }
      : entry));
    try {
      const result = await api<{ liked: boolean; likesCount: number }>(
        `/announcements/${item._id}/like`,
        { method: 'POST' },
      );
      setAnnouncements((current) => current.map((entry) => entry._id === item._id
        ? { ...entry, likedByMe: result.liked, likesCount: result.likesCount }
        : entry));
    } catch (likeError) {
      setAnnouncements((current) => current.map((entry) => entry._id === item._id
        ? { ...entry, likedByMe: previousLiked, likesCount: previousCount }
        : entry));
      setError(likeError instanceof Error ? likeError.message : 'Could not update your like.');
    } finally {
      setLikingId('');
    }
  };

  const openComments = async (item: FeedAnnouncement) => {
    setSelected(item);
    setDraftComment('');
    setComments([]);
    setCommentsError('');
    setCommentsLoading(true);
    try {
      const result = await api<{ comments: Comment[] }>(`/announcements/${item._id}/comments`);
      setComments(result.comments ?? []);
    } catch (commentsLoadError) {
      setCommentsError(commentsLoadError instanceof Error ? commentsLoadError.message : 'Could not load comments.');
    } finally {
      setCommentsLoading(false);
    }
  };

  const submitComment = async () => {
    const message = draftComment.trim();
    if (!selected || !message || sendingComment) return;
    setSendingComment(true);
    setCommentsError('');
    try {
      const result = await api<{ comment: Comment; commentsCount: number }>(
        `/announcements/${selected._id}/comments`,
        { method: 'POST', body: { message } },
      );
      setComments((current) => [...current, result.comment]);
      setDraftComment('');
      setAnnouncements((current) => current.map((item) => item._id === selected._id
        ? { ...item, commentsCount: result.commentsCount }
        : item));
    } catch (submitError) {
      setCommentsError(submitError instanceof Error ? submitError.message : 'Could not post your comment.');
    } finally {
      setSendingComment(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.page}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <View style={styles.communityBrand}>
                <Image
                  source={require('../../../assets/images/simplified-leaf.png')}
                  style={styles.communityLogo}
                  resizeMode="contain"
                  accessibilityLabel="Green Park Village logo"
                />
                <View>
                  <Text style={styles.communityName}>GREEN PARK VILLAGE</Text>
                  <Text style={styles.hoaLabel}>HOMEOWNERS ASSOCIATION</Text>
                </View>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => router.push('/notifications')}
              style={styles.bellButton}>
              <SymbolView
                name={{ ios: 'bell', android: 'notifications_none', web: 'notifications_none' }}
                size={21}
                tintColor={colors.textInverse}
              />
              {unreadCount > 0 ? (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              ) : null}
            </Pressable>
          </View>
          <Text style={styles.greeting}>{greeting(user?.name)}</Text>
          <Text style={styles.headerSubtitle}>A little closer to the community.</Text>
        </View>

        <View style={styles.feedHeader}>
          <View>
            <Text style={styles.feedEyebrow}>YOUR COMMUNITY</Text>
            <Text style={styles.feedHeading}>Announcements</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/announcements')}
            style={styles.allButton}>
            <Text style={styles.allButtonText}>View all</Text>
          </Pressable>
        </View>

        {error ? (
          <View style={styles.stateCard}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable accessibilityRole="button" onPress={() => void loadFeed()}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={colors.brand} />
            <Text style={styles.stateText}>Gathering the latest community updates…</Text>
          </View>
        ) : announcements.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <SymbolView
                name={{ ios: 'text.bubble', android: 'campaign', web: 'campaign' }}
                size={24}
                tintColor={colors.brand}
              />
            </View>
            <Text style={styles.emptyTitle}>A quiet moment in Green Park</Text>
            <Text style={styles.stateText}>Published community announcements will appear here.</Text>
          </View>
        ) : (
          <View style={styles.feedList}>
            {announcements.map((item) => (
              <FeedCard
                key={item._id}
                item={item}
                styles={styles}
                colors={colors}
                liking={likingId === item._id}
                onLike={() => void toggleLike(item)}
                onComment={() => void openComments(item)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={selected !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelected(null)}>
        <SafeAreaView style={styles.commentPage} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            style={styles.commentFlex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.commentHeader}>
              <View style={styles.commentHeaderText}>
                <Text style={styles.commentTitle}>Conversation</Text>
                <Text numberOfLines={1} style={styles.commentSubtitle}>{selected?.title}</Text>
              </View>
              <ModalCloseButton accessibilityLabel="Close comments" onPress={() => setSelected(null)} />
            </View>
            <ScrollView
              style={styles.commentsScroll}
              contentContainerStyle={styles.commentsContent}
              keyboardShouldPersistTaps="handled">
              {commentsLoading ? (
                <ActivityIndicator color={colors.brand} />
              ) : commentsError && comments.length === 0 ? (
                <Text style={styles.errorText}>{commentsError}</Text>
              ) : comments.length === 0 ? (
                <Text style={styles.stateText}>Be the first to join the conversation.</Text>
              ) : comments.map((comment) => (
                <View key={comment._id} style={styles.commentCard}>
                  <View style={styles.commentMeta}>
                    <Text style={styles.commentAuthor}>{comment.authorName}</Text>
                    <Text style={styles.commentDate}>{formatDate(comment.createdAt)}</Text>
                  </View>
                  <Text style={styles.commentMessage}>{comment.message}</Text>
                </View>
              ))}
            </ScrollView>
            {commentsError && comments.length > 0 ? <Text style={styles.errorText}>{commentsError}</Text> : null}
            <View style={styles.commentComposer}>
              <TextInput
                accessibilityLabel="Write a comment"
                value={draftComment}
                onChangeText={setDraftComment}
                placeholder="Share a thoughtful comment…"
                placeholderTextColor={colors.textMuted}
                maxLength={1000}
                multiline
                style={styles.commentInput}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Post comment"
                disabled={!draftComment.trim() || sendingComment}
                onPress={() => void submitComment()}
                style={[styles.sendButton, (!draftComment.trim() || sendingComment) && styles.sendDisabled]}>
                {sendingComment
                  ? <ActivityIndicator color={colors.textInverse} />
                  : <SymbolView name={{ ios: 'arrow.up', android: 'send', web: 'send' }} size={18} tintColor={colors.textInverse} />}
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
