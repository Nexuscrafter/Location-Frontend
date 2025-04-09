import { StyleSheet, View, Text, TouchableOpacity, Platform, Alert } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Play, Square } from 'lucide-react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import { api } from '@/services/api';
import { useEffect, useState } from 'react';

const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const location = locations[0];
    if (location) {
      try {
        await api.locations.update(location);
      } catch (error) {
        console.error('Failed to send location update:', error);
      }
    }
  }
});

export default function TrackingScreen() {
  const [isTracking, setIsTracking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        setErrorMsg('Foreground location permission denied');
        return;
      }

      if (Platform.OS === 'android') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          setErrorMsg('Background location permission denied');
          return;
        }

        // Prompt the user to disable battery optimization
        Alert.alert(
          'Disable Battery Optimization',
          'To ensure reliable background location tracking, please disable battery optimization for this app.',
          [
            {
              text: 'Open Settings',
              onPress: () =>
                IntentLauncher.startActivityAsync(
                  IntentLauncher.ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS
                ),
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      const stored = await AsyncStorage.getItem('isTracking');
      setIsTracking(started && stored === 'true');
    })();
  }, []);

  const startLocationTracking = async () => {
    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      if (!hasStarted) {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 900000, // 15 minutes
          distanceInterval: 0,
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: 'Tracking Location',
            notificationBody: 'Your location is being tracked in background',
          },
        });
      }
      await AsyncStorage.setItem('isTracking', 'true');
      setIsTracking(true);
    } catch (err) {
      console.error('Could not start location tracking', err);
      setErrorMsg('Could not start location tracking');
    }
  };

  const stopLocationTracking = async () => {
    try {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      await AsyncStorage.setItem('isTracking', 'false');
      setIsTracking(false);
    } catch (err) {
      console.error('Could not stop location tracking', err);
      setErrorMsg('Could not stop location tracking');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {errorMsg ? (
          <Text style={styles.errorText}>{errorMsg}</Text>
        ) : (
          <>
            <View style={[styles.statusIndicator, isTracking ? styles.statusActive : styles.statusInactive]} />
            <Text style={styles.statusText}>
              {isTracking ? 'Tracking Active' : 'Tracking Inactive'}
            </Text>
            <TouchableOpacity
              style={[styles.button, isTracking ? styles.stopButton : styles.startButton]}
              onPress={isTracking ? stopLocationTracking : startLocationTracking}
            >
              {isTracking ? <Square size={24} color="#fff" /> : <Play size={24} color="#fff" />}
              <Text style={styles.buttonText}>
                {isTracking ? 'Stop Tracking' : 'Start Tracking'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  statusIndicator: { width: 16, height: 16, borderRadius: 8, marginBottom: 8 },
  statusActive: { backgroundColor: '#4CAF50' },
  statusInactive: { backgroundColor: '#F44336' },
  statusText: { fontSize: 18, marginBottom: 32, color: '#333' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  startButton: { backgroundColor: '#4285F4' },
  stopButton: { backgroundColor: '#F44336' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  errorText: { color: '#F44336', textAlign: 'center', fontSize: 16 },
})