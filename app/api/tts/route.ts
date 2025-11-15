import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voiceId } = body;

    // Check if ElevenLabs API key is configured
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;

    if (elevenLabsKey) {
      // Use ElevenLabs API
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId || '21m00Tcm4TlvDq8ikWAM'}`,
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
              stability: 0.5,
              similarity_boost: 0.5,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error('ElevenLabs API error');
      }

      const audioBuffer = await response.arrayBuffer();

      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
        },
      });
    } else {
      // Return instruction to use Web Speech API on client side
      return NextResponse.json({
        useWebSpeech: true,
        message: 'ElevenLabs not configured, use browser TTS',
      });
    }
  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json(
      { error: 'TTS failed', useWebSpeech: true },
      { status: 500 }
    );
  }
}
