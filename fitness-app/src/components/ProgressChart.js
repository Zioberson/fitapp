import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const ProgressChart = ({ title, data }) => {
  // react-native-chart-kit requires at least one data point to render.
  if (!data || data.length < 1) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.noDataText}>Brak wystarczających danych do narysowania wykresu.</Text>
      </View>
    );
  }

  // Format data for the chart library
  // We want dates on the X-axis and values on the Y-axis.
  // Let's show up to 6 labels on the X-axis for readability.
  const labels = data.map(item => new Date(item.date.seconds * 1000).toLocaleDateString('pl-PL', { month: 'short', day: 'numeric' })).reverse();
  const values = data.map(item => item.value).reverse();

  const chartData = {
    labels: labels.slice(0, 6), // Limit to last 6 entries for clarity
    datasets: [
      {
        data: values.slice(0, 6),
        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`, // primary color
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#22C55E',
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <LineChart
        data={chartData}
        width={screenWidth - 40} // from parent padding
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataText: {
    textAlign: 'center',
    padding: 20,
    color: 'gray',
  },
});

export default ProgressChart;