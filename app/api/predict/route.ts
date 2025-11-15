import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getUserMemories } from '@/lib/supabase/queries';
import { CommunicationContext, PredictionResponse } from '@/types/communication';

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

    // Fetch user memories for context
    const memories = await getUserMemories(userId, undefined, 20);

    // Build context for Claude
    const memoryContext = memories
      .map((m) => `- ${m.content} (${m.memoryType})`)
      .join('\n');

    const prompt = `You are an AAC communication assistant helping generate personalized communication options.

USER MEMORIES:
${memoryContext || 'No memories yet - this is a new user.'}

CURRENT CONTEXT:
- Time: ${currentContext.timeOfDay}, Day ${currentContext.dayOfWeek}
- Recent messages: ${currentContext.recentMessages.join(', ') || 'None'}
- Current category: ${currentContext.currentCategory || 'General'}
- Current text: ${currentContext.composedText || 'None'}

Generate 6 helpful communication options that would be most relevant right now. Consider:
1. Time of day (breakfast in morning, bedtime at night, etc.)
2. Recent conversation flow
3. User's known preferences and patterns
4. Common needs and phrases

${excludePrevious.length > 0 ? `AVOID these recently shown options: ${excludePrevious.join(', ')}` : ''}

Return ONLY a valid JSON array with this exact structure (no markdown, no explanation):
[
  {
    "text": "phrase text",
    "category": "needs|feelings|social|activities|people|questions",
    "imageSearchTerm": "simple search term for image",
    "priority": 0.1-1.0
  }
]`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Parse Claude's response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const predictions = JSON.parse(responseText);

    // Transform to CommunicationTile format
    const tiles = predictions.map((p: any, index: number) => ({
      id: `tile-${Date.now()}-${index}`,
      text: p.text,
      category: p.category,
      priority: p.priority,
      symbolSource: 'opensymbols' as const,
      imageSearchTerm: p.imageSearchTerm,
    }));

    const response: PredictionResponse = {
      tiles,
      suggestedCategories: [...new Set(predictions.map((p: any) => p.category))] as string[],
      context: currentContext,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json(
      { error: 'Failed to generate predictions' },
      { status: 500 }
    );
  }
}
