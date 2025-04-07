import { API_CONFIG } from '@/config/api';

export async function GET() {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.googleUrl}`);
    const data = await response.json();
    
    return Response.json(data);
  } catch (error) {
    return new Response('Failed to get authentication URL', {
      status: 500,
    });
  }
}