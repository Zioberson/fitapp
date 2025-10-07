import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebaseConfig';
import { getUserNotifications, markNotificationAsRead } from '../services/firestoreService';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return () => {};

    const unsubscribe = getUserNotifications(currentUser.uid, (fetchedNotifications) => {
      setNotifications(fetchedNotifications);
      setLoading(false);
      setRefreshing(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = fetchNotifications();
    return () => unsubscribe();
  }, [fetchNotifications]);

  const onRefresh = useCallback(() => {
      setRefreshing(true);
      fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationPress = async (notification) => {
    try {
      if (!notification.read) {
        await markNotificationAsRead(notification.id);
      }
      // TODO: Navigate to the relevant screen based on notification.targetId and type
      Alert.alert("Nawigacja", `Docelowo, to przekieruje Cię do wątku komentarzy o ID: ${notification.targetId}`);
    } catch (error) {
      Alert.alert("Błąd", "Nie udało się zaktualizować powiadomienia.");
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadItem]}
      onPress={() => handleNotificationPress(item)}
    >
      <Text style={styles.notificationText}>{item.message}</Text>
      <Text style={styles.notificationDate}>
        {item.createdAt ? formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true, locale: pl }) : ''}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={notifications}
      renderItem={renderNotification}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<Text style={styles.emptyText}>Nie masz żadnych nowych powiadomień.</Text>}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#22C55E"]} />
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  unreadItem: {
    backgroundColor: '#e6fffa', // A light green tint for unread items
  },
  notificationText: {
    fontSize: 16,
  },
  notificationDate: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'right',
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: 'gray',
    padding: 50,
    fontSize: 16,
  },
});

export default NotificationsScreen;