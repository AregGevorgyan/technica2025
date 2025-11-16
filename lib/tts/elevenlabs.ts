// ElevenLabs Text-to-Speech implementation (Client-side)
// API key is now securely stored on the server and accessed via API route

const ELEVENLABS_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Rachel - warm, friendly voice

export interface TTSOptions {
  text: string;
  voiceId?: string;
  stability?: number;
  similarityBoost?: number;
}

export async function speakWithElevenLabs(options: TTSOptions): Promise<void> {
  const {
    text,
    voiceId = ELEVENLABS_VOICE_ID,
    stability = 0.5,
    similarityBoost = 0.75,
  } = options;

  try {
    console.log('🎤 ElevenLabs TTS: Requesting speech for:', text);

    // Call our API route instead of ElevenLabs directly
    // This keeps the API key secure on the server
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voiceId,
        stability,
        similarityBoost,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'TTS request failed');
    }

    // Get audio blob from our API
    const audioBlob = await response.blob();
    console.log('✅ ElevenLabs: Audio received, size:', audioBlob.size, 'bytes');

    // Create audio URL and play
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    // Return a promise that resolves when audio finishes
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        console.log('✅ ElevenLabs: Audio playback complete');
        URL.revokeObjectURL(audioUrl);
        resolve();
      };

      audio.onerror = (error) => {
        console.error('❌ ElevenLabs: Audio playback error:', error);
        URL.revokeObjectURL(audioUrl);
        reject(new Error('Audio playback failed'));
      };

      audio.play().catch((error) => {
        console.error('❌ ElevenLabs: Failed to play audio:', error);
        URL.revokeObjectURL(audioUrl);
        reject(error);
      });
    });
  } catch (error) {
    console.error('❌ ElevenLabs TTS error:', error);
    throw error;
  }
}

export function isElevenLabsAvailable(): boolean {
  // We can't check the API key from client-side anymore
  // This will always return true, and the API route will handle availability
  return true;
}
