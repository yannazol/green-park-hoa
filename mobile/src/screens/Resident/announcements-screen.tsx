import { useCallback, useState } from 'react';
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

import Badge from '@/components/badge';
import Button from '@/components/button';
import Card from '@/components/card';
import type { Announcement } from '@/constants/resident-options';
import { useAppTheme } from '@/hooks/use-app-theme';
import { api } from '@/services/api';
import getAnnouncementStyles from '@/styles/announcement-styles';

const CATEGORY_VARIANTS = {
  Notice: 'info',
  Maintenance: 'warning',
  Reminder: 'neutral',
  Fees: 'danger',
} as const;

type Comment = {
  _id: string;
  authorName: string;
  message: string;
  createdAt: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Manila',
  }).format(new Date(value));
}

export default function AnnouncementsScreen() {
  const c = useAppTheme();
  const s = getAnnouncementStyles(c);
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');
  const [imageErrorId, setImageErrorId] = useState('');
  const [imageLoadingId, setImageLoadingId] = useState('');
  const [likingId, setLikingId] = useState('');
  const [selected, setSelected] = useState<Announcement | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [commentDraft, setCommentDraft] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api<{ announcements: Announcement[] }>('/announcements');
      setAnnouncements(result.announcements ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load announcements.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadAnnouncements();
    }, [loadAnnouncements]),
  );

  const toggleExpanded = async (item: Announcement) => {
    const id = item._id;
    if (!expandedIds.has(id) && item.images?.some((image) => !image.data)) {
      setImageLoadingId(id);
      setImageError('');
      setImageErrorId('');
      try {
        const { announcement } = await api<{ announcement: Announcement }>(`/announcements/${id}`);
        setAnnouncements((current) =>
          current.map((entry) => (entry._id === id ? announcement : entry)),
        );
      } catch (loadError) {
        setImageError(loadError instanceof Error ? loadError.message : 'Could not load photos.');
        setImageErrorId(id);
        setImageLoadingId('');
        return;
      }
      setImageLoadingId('');
    }

    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleLike = async (item: Announcement) => {
    setLikingId(item._id);
    try {
      const result = await api<{ liked: boolean; likesCount: number }>(
        `/announcements/${item._id}/like`,
        { method: 'POST' },
      );
      setAnnouncements((current) => current.map((entry) => entry._id === item._id
        ? { ...entry, likedByMe: result.liked, likesCount: result.likesCount }
        : entry));
    } catch (likeError) {
      setError(likeError instanceof Error ? likeError.message : 'Could not update your like.');
    } finally {
      setLikingId('');
    }
  };

  const openComments = async (item: Announcement) => {
    setSelected(item);
    setComments([]);
    setCommentDraft('');
    setCommentError('');
    setCommentLoading(true);
    try {
      const result = await api<{ comments: Comment[] }>(`/announcements/${item._id}/comments`);
      setComments(result.comments ?? []);
    } catch (loadError) {
      setCommentError(loadError instanceof Error ? loadError.message : 'Could not load comments.');
    } finally {
      setCommentLoading(false);
    }
  };

  const submitComment = async () => {
    const message = commentDraft.trim();
    if (!selected || !message || sendingComment) return;
    setSendingComment(true);
    setCommentError('');
    try {
      const result = await api<{ comment: Comment; commentsCount: number }>(
        `/announcements/${selected._id}/comments`,
        { method: 'POST', body: { message } },
      );
      setComments((current) => [...current, result.comment]);
      setCommentDraft('');
      setAnnouncements((current) => current.map((item) => item._id === selected._id
        ? { ...item, commentsCount: result.commentsCount }
        : item));
    } catch (submitError) {
      setCommentError(submitError instanceof Error ? submitError.message : 'Could not post your comment.');
    } finally {
      setSendingComment(false);
    }
  };

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <ScrollView style={s.page} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.pageHeader}>
          <View style={s.pageHeaderText}>
            <Text style={s.title}>Announcements</Text>
            <Text style={s.subtitle}>Updates and notices from your community.</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/services')}
            style={s.servicesLink}>
            <SymbolView name={{ ios: 'person.2', android: 'groups', web: 'groups' }} size={17} tintColor={c.brand} />
            <Text style={s.servicesLinkText}>Services</Text>
          </Pressable>
        </View>

        {loading ? (
          <Card style={s.emptyCard}>
            <Text style={s.emptyText}>Loading announcements...</Text>
          </Card>
        ) : error ? (
          <Card style={s.emptyCard}>
            <Text style={s.errorText}>{error}</Text>
            <Button title="Try again" variant="outline" onPress={() => void loadAnnouncements()} />
          </Card>
        ) : announcements.length === 0 ? (
          <Card style={s.emptyCard}>
            <Text style={s.emptyTitle}>No announcements yet</Text>
            <Text style={s.emptyText}>Published community updates will appear here.</Text>
          </Card>
        ) : (
          announcements.map((item) => {
            const expanded = expandedIds.has(item._id);
            return (
              <Card key={item._id} style={s.card}>
                <View style={s.metaRow}>
                  <Badge label={item.category} variant={CATEGORY_VARIANTS[item.category] ?? 'neutral'} />
                  <Text style={s.date}>{formatDate(item.publishedAt ?? item.date)}</Text>
                </View>
                <Text style={s.cardTitle}>{item.title}</Text>
                <Text numberOfLines={expanded ? undefined : 3} style={s.message}>
                  {item.message}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={expanded ? 'Show less' : 'Read more'}
                  onPress={() => void toggleExpanded(item)}
                  style={s.readMore}>
                  <Text style={s.readMoreText}>
                    {imageLoadingId === item._id ? 'Loading...' : expanded ? 'Show less' : 'Read more'}
                  </Text>
                </Pressable>
                {imageError && imageErrorId === item._id ? <Text style={s.errorText}>{imageError}</Text> : null}
                {item.images?.length ? (
                  <View style={s.images}>
                    {item.images.map((image, index) => (
                      <Image
                        key={`${item._id}-${index}`}
                        source={{ uri: `data:${image.mimeType};base64,${image.data}` }}
                        accessibilityLabel={image.name || `Announcement photo ${index + 1}`}
                        resizeMode="cover"
                        style={s.image}
                      />
                    ))}
                  </View>
                ) : null}
                <View style={s.authorRow}>
                  <View style={s.authorAvatar}>
                    <Text style={s.authorInitial}>{(item.authorName || 'G').charAt(0).toUpperCase()}</Text>
                  </View>
                  <Text style={s.authorName}>{item.authorName || 'Green Park Village HOA'}</Text>
                </View>
                <View style={s.feedActions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={item.likedByMe ? 'Unlike announcement' : 'Like announcement'}
                    disabled={likingId === item._id}
                    onPress={() => void toggleLike(item)}
                    style={s.feedAction}>
                    <SymbolView
                      name={{
                        ios: item.likedByMe ? 'heart.fill' : 'heart',
                        android: item.likedByMe ? 'favorite' : 'favorite_border',
                        web: item.likedByMe ? 'favorite' : 'favorite_border',
                      }}
                      size={19}
                      tintColor={item.likedByMe ? c.danger : c.brand}
                    />
                    <Text style={[s.actionText, item.likedByMe && s.likedText]}>
                      {item.likesCount ?? 0} Likes
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`View ${item.commentsCount ?? 0} comments`}
                    onPress={() => void openComments(item)}
                    style={s.feedAction}>
                    <SymbolView
                      name={{ ios: 'bubble.right', android: 'chat_bubble_outline', web: 'chat_bubble_outline' }}
                      size={19}
                      tintColor={c.brand}
                    />
                    <Text style={s.actionText}>{item.commentsCount ?? 0} Comments</Text>
                  </Pressable>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
      <Modal
        visible={selected !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelected(null)}>
        <SafeAreaView style={s.commentPage} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            style={s.commentFlex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={s.commentHeader}>
              <View style={s.pageHeaderText}>
                <Text style={s.commentTitle}>Conversation</Text>
                <Text numberOfLines={1} style={s.subtitle}>{selected?.title}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close comments"
                onPress={() => setSelected(null)}
                style={s.closeButton}>
                <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={17} tintColor={c.text} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={s.commentsContent} keyboardShouldPersistTaps="handled">
              {commentLoading ? (
                <ActivityIndicator color={c.brand} />
              ) : commentError && comments.length === 0 ? (
                <Text style={s.errorText}>{commentError}</Text>
              ) : comments.length === 0 ? (
                <Text style={s.emptyText}>Be the first to join the conversation.</Text>
              ) : comments.map((comment) => (
                <View key={comment._id} style={s.commentCard}>
                  <View style={s.commentMeta}>
                    <Text style={s.commentAuthor}>{comment.authorName}</Text>
                    <Text style={s.date}>{formatDate(comment.createdAt)}</Text>
                  </View>
                  <Text style={s.commentMessage}>{comment.message}</Text>
                </View>
              ))}
            </ScrollView>
            {commentError && comments.length > 0 ? <Text style={s.errorText}>{commentError}</Text> : null}
            <View style={s.commentComposer}>
              <TextInput
                accessibilityLabel="Write a comment"
                value={commentDraft}
                onChangeText={setCommentDraft}
                placeholder="Share a thoughtful comment…"
                placeholderTextColor={c.textMuted}
                maxLength={1000}
                multiline
                style={s.commentInput}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Post comment"
                disabled={!commentDraft.trim() || sendingComment}
                onPress={() => void submitComment()}
                style={[s.sendButton, (!commentDraft.trim() || sendingComment) && s.sendDisabled]}>
                {sendingComment
                  ? <ActivityIndicator color={c.textInverse} />
                  : <SymbolView name={{ ios: 'arrow.up', android: 'send', web: 'send' }} size={18} tintColor={c.textInverse} />}
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
