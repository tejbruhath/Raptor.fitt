import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test basic API call
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 500 });
    }

    // Try to list models
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        error: 'Failed to fetch models',
        status: response.status,
        details: data
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
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
