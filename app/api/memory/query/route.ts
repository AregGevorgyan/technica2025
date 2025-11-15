import { NextRequest, NextResponse } from 'next/server';
import { getUserMemories } from '@/lib/supabase/queries';
import { MemoryQueryRequest, MemoryQueryResponse } from '@/types/memory';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as MemoryQueryRequest;
    const { userId, memoryTypes, limit = 50, minImportance = 0 } = body;

    // Fetch memories
    const memories = await getUserMemories(userId, memoryTypes, limit);

    // Filter by importance if specified
    const filteredMemories = memories.filter(m => m.importance >= minImportance);

    const response: MemoryQueryResponse = {
      memories: filteredMemories,
      totalCount: filteredMemories.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Memory query error:', error);
    return NextResponse.json(
      { error: 'Failed to query memories' },
      { status: 500 }
    );
  }
}
