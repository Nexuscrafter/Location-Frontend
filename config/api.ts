const getBaseUrl = (): string => {
    // Always use local IP directly since Expo Go runs on device
    return 'http://192.168.0.102:5454'; // Replace with your machine's local IP if needed
  };
  
  export const API_CONFIG = {
    baseUrl: getBaseUrl(),
    endpoints: {
      auth: {
        login: '/auth/signin',
        signup: '/auth/signup',
        googleUrl: '/login/google',
        
      },
      locations: '/api/location/create', // Ensure this matches your Spring Boot controller endpoint
    },
  };
  