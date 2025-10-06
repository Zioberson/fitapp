import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const FullPlanViewScreen = ({ route }) => {
  const { workoutPlan } = route.params; // Get the full plan object

  if (!workoutPlan) {
    return (
      <View style={styles.container}>
        <Text>Nie znaleziono planu treningowego.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.planTitle}>{workoutPlan.name}</Text>
      {workoutPlan.description && <Text style={styles.planDescription}>{workoutPlan.description}</Text>}

      {workoutPlan.weeks?.map((week, weekIndex) => (
        <View key={`week-${weekIndex}`} style={styles.weekContainer}>
          <Text style={styles.weekTitle}>Tydzień {week.weekNumber}</Text>
          {week.days?.map((day, dayIndex) => (
            <View key={`day-${dayIndex}`} style={styles.dayContainer}>
              <Text style={styles.dayTitle}>Dzień {day.dayNumber}: {day.name}</Text>
              {day.exercises?.map((exercise, exerciseIndex) => (
                <View key={`ex-${exerciseIndex}`} style={styles.exerciseContainer}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseDetails}>
                    {exercise.series} serie po {exercise.reps} powtórzeń, przerwa: {exercise.rest || 'brak'}s
                  </Text>
                  {exercise.videoUrl && <Text style={styles.videoLink}>Link do wideo: {exercise.videoUrl}</Text>}
                </View>
              ))}
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
  },
  planTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  planDescription: {
    fontSize: 16,
    fontStyle: 'italic',
    color: 'gray',
    textAlign: 'center',
    marginBottom: 20,
  },
  weekContainer: {
    marginBottom: 20,
  },
  weekTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#22C55E',
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#22C55E',
    paddingBottom: 5,
  },
  dayContainer: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  exerciseContainer: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#333',
  },
  videoLink: {
    fontSize: 12,
    color: '#3B82F6',
    fontStyle: 'italic',
    marginTop: 4,
  },
});

export default FullPlanViewScreen;