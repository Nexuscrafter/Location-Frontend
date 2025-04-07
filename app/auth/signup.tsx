import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Play } from 'lucide-react-native';
import { auth } from '@/services/auth';

interface ValidationErrors {
  email?: string;
  phone?: string;
}

export default function SignUp() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return false;
    }
    setValidationErrors(prev => ({ ...prev, email: undefined }));
    return true;
  };

  const validatePhone = (phone: string) => {
    if (phone && !/^\d{10}$/.test(phone)) {
      setValidationErrors(prev => ({ ...prev, phone: 'Phone number must be 10 digits' }));
      return false;
    }
    setValidationErrors(prev => ({ ...prev, phone: undefined }));
    return true;
  };

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!validateEmail(email)) {
      return;
    }

    if (!validatePhone(phone)) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await auth.signUp({
        email,
        password,
        fullName: fullName || null,
        phone: phone || null,
        address: address || null,
      });
      router.replace('/auth/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        <Play size={64} color="#4285F4" style={styles.icon} />
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Location Tracker today</Text>
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email *"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                validateEmail(text);
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />
            {validationErrors.email && (
              <Text style={styles.fieldError}>{validationErrors.email}</Text>
            )}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Full Name (Optional)"
            value={fullName}
            onChangeText={setFullName}
            editable={!isLoading}
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Phone Number (Optional)"
              value={phone}
              onChangeText={(text) => {
                setPhone(text.replace(/[^\d]/g, ''));
                validatePhone(text);
              }}
              keyboardType="numeric"
              maxLength={10}
              editable={!isLoading}
            />
            {validationErrors.phone && (
              <Text style={styles.fieldError}>{validationErrors.phone}</Text>
            )}
          </View>

          <TextInput
            style={[styles.input, styles.addressInput]}
            placeholder="Address (Optional)"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
            editable={!isLoading}
          />

          <TextInput
            style={styles.input}
            placeholder="Password *"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password *"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!isLoading}
          />

          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handleSignUp}
            disabled={isLoading || !email || !password || !confirmPassword}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href="/auth/login" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Sign in</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  form: {
    width: '100%',
    maxWidth: 320,
    gap: 16,
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  addressInput: {
    height: 80,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#dc2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  fieldError: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  linkText: {
    color: '#4285F4',
    fontSize: 14,
    fontWeight: '600',
  },
});