import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '@/config/api';

const TOKEN_KEY = '@auth_token';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignUpCredentials {
  email: string;
  password: string;
  fullName: string | null;
  phone: string | null;
  address: string | null;
}


export const auth = {
  async signUp(credentials: SignUpCredentials): Promise<void> {
    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.signup}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create account');
    }

    // Extract the token from the Authorization header if available.
    const authHeader = response.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer')) {
      const token = authHeader.substring(7); // Remove the "Bearer " prefix.
      await this.private.setToken(token);
    }
  },

  async login(credentials: LoginCredentials): Promise<void> {
    console.log("Logging in with:", credentials);

    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.login}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      }
    );

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    // Extract the token from the Authorization header if available.
    const authHeader = response.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7); // Remove the "Bearer " prefix.
      await this.private.setToken(token);
    } else {
      // Fallback: if your API sends the token in the body, you can extract it like this:
      const { jwt } = await response.json();
      await this.private.setToken(jwt);
    }
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  },

  private: {
    async setToken(token: string): Promise<void> {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    },
  },
};
