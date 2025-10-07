import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, FlatList, Image, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { auth } from '../firebaseConfig';
import { getClientMeasurements } from '../services/firestoreService';
import ProgressChart from '../components/ProgressChart';
import CommentsSection from '../components/CommentsSection';
import SkeletonPlaceholder from '../components/SkeletonPlaceholder';

const screenWidth = Dimensions.get('window').width;

const ChartSkeleton = () => (
    <View style={styles.chartSection}>
        <SkeletonPlaceholder>
            <View style={{ height: 200, width: '100%', borderRadius: 8 }} />
        </SkeletonPlaceholder>
    </View>
);

const ProgressHubScreen = () => {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Re-fetch data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const fetchMeasurements = async () => {
        try {
          setLoading(true);
          const currentUser = auth.currentUser;
          if (!currentUser) throw new Error("Użytkownik nie jest zalogowany.");

          const measurementList = await getClientMeasurements(currentUser.uid);
          setMeasurements(measurementList);
        } catch (error) {
          Alert.alert("Błąd", "Nie udało się pobrać historii pomiarów.");
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

      fetchMeasurements();
    }, [])
  );

  const weightData = measurements
    .filter(m => m.weight)
    .map(m => ({ date: m.date, value: m.weight }));

  const progressPhotos = measurements
    .filter(m => m.photoUrl)
    .map(m => ({ id: m.id, url: m.photoUrl, date: new Date(m.date.seconds * 1000).toLocaleDateString('pl-PL') }));

  const renderContent = () => {
      if (loading) {
          return (
              <View style={styles.container}>
                  <Text style={styles.header}>Twoje Postępy</Text>
                  <ChartSkeleton />
              </View>
          )
      }

      return (
          <>
            <Text style={styles.header}>Twoje Postępy</Text>

            <View style={styles.chartSection}>
                <ProgressChart title="Zmiana Wagi (kg)" data={weightData} />
            </View>

            <Text style={styles.subHeader}>Galeria Zdjęć</Text>
            {progressPhotos.length > 0 ? (
                <FlatList
                    horizontal
                    data={progressPhotos}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.photoContainer}>
                            <Image source={{ uri: item.url }} style={styles.photo} />
                            <Text style={styles.photoDate}>{item.date}</Text>
                        </View>
                    )}
                    showsHorizontalScrollIndicator={false}
                />
            ) : (
                <Text style={styles.noDataText}>Brak zdjęć progresu. Dodaj swój pierwszy pomiar ze zdjęciem!</Text>
            )}

            <View style={styles.commentsContainer}>
                <CommentsSection
                    targetId={auth.currentUser.uid}
                    targetType="progress_hub"
                    targetOwnerId={auth.currentUser.uid}
                />
            </View>
        </>
      )
  }

  return (
    <ScrollView style={styles.container}>
        {renderContent()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 20,
  },
  chartSection: {
    backgroundColor: '#f9f9f9',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  subHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  photoContainer: {
    marginLeft: 20,
    marginRight: 10,
    alignItems: 'center',
  },
  photo: {
    width: screenWidth * 0.6,
    height: screenWidth * 0.8,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  photoDate: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  noDataText: {
    textAlign: 'center',
    padding: 20,
    color: 'gray',
    paddingHorizontal: 20,
  },
  commentsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    marginTop: 20,
  }
});

export default ProgressHubScreen;