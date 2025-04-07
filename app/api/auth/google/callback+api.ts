import { API_CONFIG } from '@/config/api';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.googleCallback}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    return Response.json(data);
  } catch (error) {
    return new Response('Authentication failed', {
      status: 500,
    });
  }
}