import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
// import { getUserMemories } from '@/lib/supabase/queries'; // Temporarily disabled - database not configured
import { CommunicationContext, PredictionResponse } from '@/types/communication';
import { getWordImagePath, getAvailableWords } from '@/lib/symbols/wordimage-mapper';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'placeholder',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, currentContext, excludePrevious = [] } = body as {
      userId: string;
      currentContext: CommunicationContext;
      excludePrevious?: string[];
    };

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'placeholder' || process.env.ANTHROPIC_API_KEY.startsWith('your_')) {
      console.warn('⚠️ ANTHROPIC_API_KEY not configured. Please add your API key to .env.local');
      return NextResponse.json(
        { error: 'API key not configured. Please add ANTHROPIC_API_KEY to .env.local' },
        { status: 503 }
      );
    }

    // User memories disabled until database is configured
    const memoryContext = '';
    console.log('ℹ️ User memories not available (database not configured). Using default context.');

    // Get list of available wordimages to help Claude prioritize them
    const availableWords = getAvailableWords();
    const wordImageHint = `\n\nAVAILABLE LOCAL IMAGES (prioritize these words when possible):\n${availableWords.slice(0, 30).join(', ')}...`;

    const prompt = `You are an AAC communication assistant helping predict the next SINGLE WORD for communication.

USER MEMORIES:
${memoryContext || 'No memories yet - this is a new user.'}

CURRENT CONTEXT:
- Time: ${currentContext.timeOfDay || 'unknown'}, Day ${currentContext.dayOfWeek || 'unknown'}
- Recent words selected: ${currentContext.recentMessages?.join(', ') || 'None'}
- Current category: ${currentContext.currentCategory || 'General'}
- Current sentence being built: "${currentContext.composedText || 'None'}"

Generate 6 SINGLE WORD predictions for what the user might want to say next. Consider:
1. The current sentence context - what word would naturally come next
2. Time of day (coffee/breakfast in morning, dinner/tired at night, etc.)
3. Common AAC vocabulary (I, want, need, help, yes, no, food, water, etc.)
4. PRIORITIZE words from the available local images list when possible
5. Each option should be ONE WORD ONLY (not phrases or sentences)

${excludePrevious.length > 0 ? `AVOID these recently shown words: ${excludePrevious.join(', ')}` : ''}
${wordImageHint}

IMPORTANT: Return SINGLE WORDS only. Examples: "want", "help", "eat", "happy", "tired", "yes"
NOT: "I want to eat", "Can you help me", "I feel tired"

Return ONLY a valid JSON array with this exact structure (no markdown, no explanation, no code blocks):
[
  {
    "text": "word",
    "category": "needs|feelings|social|activities|people|questions",
    "imageSearchTerm": "simple search term for image",
    "priority": 0.1-1.0
  }
]`;

    console.log('🤖 Calling Claude Haiku for predictions...');
    const startTime = Date.now();

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307', // ✅ Using Haiku model for fast, cost-effective predictions
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const duration = Date.now() - startTime;
    console.log(`✅ Claude Haiku responded in ${duration}ms`);

    // Parse Claude's response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Remove markdown code blocks if present
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    const predictions = JSON.parse(cleanedText);

    // Transform to CommunicationTile format and attach local wordimages
    const tiles = predictions.map((p: any, index: number) => {
      const wordImagePath = getWordImagePath(p.text);

      return {
        id: `tile-${Date.now()}-${index}`,
        text: p.text,
        category: p.category,
        priority: p.priority,
        symbolSource: wordImagePath ? ('custom' as const) : ('opensymbols' as const),
        symbolUrl: wordImagePath, // ✅ Use local wordimage if available
        imageSearchTerm: p.imageSearchTerm,
      };
    });

    const response: PredictionResponse = {
      tiles,
      suggestedCategories: [...new Set(predictions.map((p: any) => p.category))] as string[],
      context: currentContext,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Prediction error:', error);

    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check ANTHROPIC_API_KEY in .env.local' },
          { status: 401 }
        );
      }
      if (error.message.includes('JSON')) {
        return NextResponse.json(
          { error: 'Failed to parse AI response. Please try again.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate predictions. Check console for details.' },
      { status: 500 }
    );
  }
}
