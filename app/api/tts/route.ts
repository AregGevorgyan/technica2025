import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      text,
      voiceId = 'EXAVITQu4vr4xnSDxMaL', // Rachel - warm, friendly voice
      stability = 0.5,
      similarityBoost = 0.75
    } = body;

    // Check if ElevenLabs API key is configured
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;

    if (!elevenLabsKey || elevenLabsKey.startsWith('your_')) {
      console.warn('⚠️ ELEVENLABS_API_KEY not configured. Falling back to browser TTS.');
      return NextResponse.json({
        useWebSpeech: true,
        message: 'ElevenLabs not configured, use browser TTS',
      }, { status: 503 });
    }

    console.log('🎤 ElevenLabs TTS API: Processing request for:', text.substring(0, 50) + '...');

    // Use ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ElevenLabs API error:', response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    console.log('✅ ElevenLabs API: Audio generated, size:', audioBuffer.byteLength, 'bytes');

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    console.error('❌ TTS API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'TTS failed',
        useWebSpeech: true
      },
      { status: 500 }
    );
  }
}
