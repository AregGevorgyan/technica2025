// ElevenLabs Text-to-Speech implementation

const ELEVENLABS_API_KEY = 'sk_223d40be254c38d4b2ea211eea6aefae2779fc7c784dbff8';
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

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
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
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    // Get audio blob
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
  return !!ELEVENLABS_API_KEY;
}
