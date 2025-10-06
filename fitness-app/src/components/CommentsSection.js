import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { auth } from '../firebaseConfig';
import { getCommentsForTarget, addComment, createNotification, getUserDocument } from '../services/firestoreService';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';

const CommentsSection = ({ targetId, targetType, targetOwnerId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [userProfiles, setUserProfiles] = useState({});

  const currentUser = auth.currentUser;

  // Fetch profiles for displaying names/emails
  useEffect(() => {
    const fetchInitialProfiles = async () => {
        if (!currentUser || !targetOwnerId) return;
        const profilesToFetch = [currentUser.uid, targetOwnerId];
        const ownerDoc = await getUserDocument(targetOwnerId);
        if (ownerDoc && ownerDoc.trainerId) {
            profilesToFetch.push(ownerDoc.trainerId);
        }

        const uniqueProfileIds = [...new Set(profilesToFetch)];
        const profiles = {};
        for (const uid of uniqueProfileIds) {
            const userDoc = await getUserDocument(uid);
            profiles[uid] = userDoc ? userDoc.email : 'Nieznany';
        }
        setUserProfiles(profiles);
    };
    fetchInitialProfiles();
  }, [targetOwnerId, currentUser]);

  // Set up the real-time listener for comments
  useEffect(() => {
    if (!targetId) return;
    setLoading(true);
    const unsubscribe = getCommentsForTarget(targetId, (fetchedComments) => {
      setComments(fetchedComments);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [targetId]);

  const handleAddComment = async () => {
    if (newComment.trim() === '') return;

    try {
      await addComment(currentUser.uid, targetId, targetType, newComment.trim());

      const authorDoc = await getUserDocument(currentUser.uid);
      let recipientId = null;

      if (authorDoc.role === 'client' && authorDoc.trainerId) {
        recipientId = authorDoc.trainerId;
      } else if (authorDoc.role === 'trainer') {
        recipientId = targetOwnerId;
      }

      if (recipientId && recipientId !== currentUser.uid) {
        const message = `${authorDoc.email} dodał(a) komentarz.`;
        await createNotification(recipientId, 'new_comment', message, targetId);
      }

      setNewComment('');
    } catch (error) {
      Alert.alert("Błąd", "Nie udało się dodać komentarza.");
    }
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentContainer}>
      <Text style={styles.commentAuthor}>{userProfiles[item.authorId] || '...'}</Text>
      <Text style={styles.commentText}>{item.text}</Text>
      <Text style={styles.commentDate}>
        {item.createdAt ? formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true, locale: pl }) : ''}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Komentarze</Text>
      {loading ? <ActivityIndicator /> : (
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>Brak komentarzy. Bądź pierwszy!</Text>}
        />
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Napisz komentarz..."
          value={newComment}
          onChangeText={setNewComment}
        />
        <Button title="Wyślij" onPress={handleAddComment} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 20, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 8 },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  commentContainer: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#eee' },
  commentAuthor: { fontWeight: 'bold', color: '#3B82F6' },
  commentText: { fontSize: 15, marginVertical: 4 },
  commentDate: { fontSize: 12, color: 'gray', textAlign: 'right' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingTop: 10 },
  input: { flex: 1, backgroundColor: 'white', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10, borderWidth: 1, borderColor: '#ddd' },
  emptyText: { textAlign: 'center', color: 'gray', padding: 20 },
});

export default CommentsSection;