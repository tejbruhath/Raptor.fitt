import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Test basic API call
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 500 });
    }

    // Try to list models via REST using headers (avoids leaking key in URL)
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        error: 'Failed to fetch models',
        status: response.status,
        details: data,
      }, { status: response.status });
    }

    // Filter for Gemini models
    const geminiModels = data.models?.filter((model: any) =>
      model.name.includes('gemini')
    ) || [];

    return NextResponse.json({
      availableModels: geminiModels.map((m: any) => m.name),
      allModels: data.models?.map((m: any) => m.name) || []
    });

  } catch (error: any) {
    console.error('Failed to list models:', error);
    const normalizedError = error instanceof Error ? error : new Error('Unknown error');
    return NextResponse.json({
      error: normalizedError.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: normalizedError.stack })
    }, { status: 500 });
  }
}
