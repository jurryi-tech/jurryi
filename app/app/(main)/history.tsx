import React, { useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, ListRenderItem, Alert, RefreshControl } from 'react-native';
import { Text, Card, Chip, IconButton, Appbar, ActivityIndicator, Menu } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useChatStore } from '@/stores/chatStore';
import { Conversation } from '@/services/chat';
import { formatRelativeTime, truncateText, getProblemTypeLabel } from '@/utils/helpers';
import { COLORS } from '@/utils/constants';

export default function HistoryScreen() {
  const router = useRouter();
  const {
    conversations,
    isLoading,
    loadConversations,
    loadConversation,
    deleteConversation,
    clearError,
  } = useChatStore();

  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  }, [loadConversations]);

  const handleOpenConversation = useCallback(
    async (conversation: Conversation) => {
      await loadConversation(conversation._id);
      router.push('/(main)/chat');
    },
    [loadConversation, router],
  );

  const handleDeleteConversation = useCallback(
    (conversationId: string) => {
      Alert.alert(
        'Delete Conversation',
        'Are you sure you want to delete this conversation? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              deleteConversation(conversationId);
            },
          },
        ],
      );
    },
    [deleteConversation],
  );

  const renderConversation: ListRenderItem<Conversation> = useCallback(
    ({ item }) => {
      const categoryLabel = item.category
        ? getProblemTypeLabel(item.category)
        : '';

      return (
        <Card
          style={styles.card}
          mode="outlined"
          onPress={() => handleOpenConversation(item)}
          onLongPress={() => setMenuVisible(item._id)}
        >
          <Card.Content style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title || 'New Conversation'}
              </Text>
              <Menu
                visible={menuVisible === item._id}
                onDismiss={() => setMenuVisible(null)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    size={20}
                    iconColor="#757575"
                    onPress={() => setMenuVisible(item._id)}
                    style={styles.menuButton}
                  />
                }
              >
                <Menu.Item
                  onPress={() => {
                    setMenuVisible(null);
                    handleDeleteConversation(item._id);
                  }}
                  title="Delete"
                  leadingIcon="delete"
                />
              </Menu>
            </View>

            {item.summary ? (
              <Text style={styles.previewText} numberOfLines={2}>
                {truncateText(item.summary, 120)}
              </Text>
            ) : item.lastMessage ? (
              <Text style={styles.previewText} numberOfLines={2}>
                {truncateText(item.lastMessage, 120)}
              </Text>
            ) : null}

            <View style={styles.cardFooter}>
              {categoryLabel ? (
                <Chip
                  mode="flat"
                  compact
                  style={styles.categoryChip}
                  textStyle={styles.categoryChipText}
                >
                  {categoryLabel}
                </Chip>
              ) : (
                <View />
              )}
              <Text style={styles.dateText}>
                {formatRelativeTime(item.updatedAt || item.createdAt)}
              </Text>
            </View>
          </Card.Content>
        </Card>
      );
    },
    [handleOpenConversation, handleDeleteConversation, menuVisible],
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <IconButton
        icon="chat-outline"
        size={64}
        iconColor="#e0e0e0"
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyTitle}>No conversations yet</Text>
      <Text style={styles.emptySubtitle}>
        Start chatting to get legal guidance!
      </Text>
    </View>
  );

  const renderLoadingSkeleton = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Loading conversations...</Text>
    </View>
  );

  if (isLoading && conversations.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Appbar.Header style={styles.header} elevated>
          <Appbar.Content title="Conversations" titleStyle={styles.headerTitle} />
        </Appbar.Header>
        {renderLoadingSkeleton()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Appbar.Header style={styles.header} elevated>
        <Appbar.Content title="Conversations" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[
          styles.listContent,
          conversations.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a237e',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  listContentEmpty: {
    flex: 1,
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
    borderRadius: 12,
  },
  cardContent: {
    paddingVertical: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
  },
  menuButton: {
    margin: -8,
  },
  previewText: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  categoryChip: {
    backgroundColor: '#e8eaf6',
    height: 28,
  },
  categoryChipText: {
    fontSize: 11,
    color: '#1a237e',
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    color: '#757575',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#757575',
  },
});
