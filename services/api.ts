import { LocationObject } from 'expo-location';
import { auth } from './auth';
import { API_CONFIG } from '@/config/api';


interface LocationUpdate {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  phoneNumber: string | null;
  address: string | null;
}

export const api = {
  locations: {
    async update(location: LocationObject): Promise<void> {
      try {
        const token = await auth.getToken();
        if (!token) {
          throw new Error('Not authenticated');
        }

        const locationData: LocationUpdate = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: new Date(location.timestamp).toISOString(),
        };

        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.locations}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(locationData),
        });

        if (!response.ok) {
          throw new Error('Failed to update location');
        }
      } catch (error) {
        console.error('Error updating location:', error);
        throw error;
      }
    },
  },
  profile: {
    async get(): Promise<UserProfile> {
      const token = await auth.getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_CONFIG.baseUrl}/api/user/user-profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
       
        throw new Error('Failed to fetch profile');
        
      }
     

      return response.json();
    },
  },
};