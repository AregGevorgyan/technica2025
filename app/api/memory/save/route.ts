import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { createMemory, getRecentInteractions, logInteraction } from '@/lib/supabase/queries';
import { CommunicationInteraction } from '@/types/memory';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'placeholder',
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, interaction } = body as {
      userId: string;
      interaction: Omit<CommunicationInteraction, 'id' | 'createdAt' | 'userId'>;
    };

    // Log the interaction
    await logInteraction({
      userId,
      ...interaction,
    });

    // Get recent interactions to analyze patterns
    const recentInteractions = await getRecentInteractions(userId, 20);

    // Only analyze if we have enough data (e.g., 5+ interactions)
    if (recentInteractions.length < 5) {
      return NextResponse.json({
        success: true,
        message: 'Interaction logged, not enough data for analysis yet',
      });
    }

    // Analyze patterns with Claude every 5 interactions
    if (recentInteractions.length % 5 === 0) {
      const interactionSummary = recentInteractions
        .map(
          (i) =>
            `Selected "${i.selected_option}" at ${new Date(i.created_at).toLocaleString()}`
        )
        .join('\n');

      const analysisPrompt = `Analyze these recent AAC communication interactions and extract meaningful learnings about the user:

${interactionSummary}

Identify patterns such as:
- Preferences (specific words/phrases they prefer)
- Routines (time-based patterns)
- Relationships (people they mention)
- Interests (topics they communicate about)
- Needs (recurring requests)
- Communication patterns (how they structure messages)

Return ONLY a JSON array of memories (no markdown, no explanation):
[
  {
    "memoryType": "preference|routine|relationship|interest|need|communication_pattern",
    "content": "Natural language description of the learning",
    "importance": 0.1-1.0,
    "metadata": {}
  }
]

Only include significant, non-obvious patterns. If no clear patterns, return empty array.`;

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: analysisPrompt,
          },
        ],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '[]';
      const learnings = JSON.parse(responseText);

      // Create embeddings and save memories
      for (const learning of learnings) {
        try {
          // Generate embedding for semantic search
          const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: learning.content,
          });

          const embedding = embeddingResponse.data[0].embedding;

          await createMemory({
            userId,
            memoryType: learning.memoryType,
            content: learning.content,
            importance: learning.importance,
            frequency: 1,
            embedding,
            metadata: learning.metadata,
          });
        } catch (error) {
          console.error('Error creating memory:', error);
        }
      }

      return NextResponse.json({
        success: true,
        memoriesCreated: learnings.length,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Interaction logged',
    });
  } catch (error) {
    console.error('Memory save error:', error);
    return NextResponse.json({ error: 'Failed to save interaction' }, { status: 500 });
  }
}
