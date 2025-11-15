import { NextRequest, NextResponse } from 'next/server';
import { getCachedImage, cacheImage } from '@/lib/supabase/queries';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { term, preferSymbols = true } = body;

    // Check cache first
    const cached = await getCachedImage(term);
    if (cached) {
      return NextResponse.json({
        imageUrl: cached.image_url,
        thumbnailUrl: cached.thumbnail_url,
        source: cached.source,
        cached: true,
      });
    }

    // For now, we'll use a placeholder service
    // In production, you would:
    // 1. Check OpenSymbols library first
    // 2. Fall back to Google Custom Search API
    // 3. Fall back to Unsplash API

    let imageUrl = '';
    let source = '';

    // Try Google Custom Search API if configured
    const googleKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;

    if (googleKey && searchEngineId && !preferSymbols) {
      try {
        const response = await fetch(
          `https://www.googleapis.com/customsearch/v1?key=${googleKey}&cx=${searchEngineId}&q=${encodeURIComponent(term)}&searchType=image&num=1&safe=active&imgSize=medium`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            imageUrl = data.items[0].link;
            source = 'google';
          }
        }
      } catch (error) {
        console.error('Google search error:', error);
      }
    }

    // Try Unsplash if Google failed or not configured
    if (!imageUrl) {
      const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
      if (unsplashKey) {
        try {
          const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(term)}&per_page=1&orientation=squarish`,
            {
              headers: {
                Authorization: `Client-ID ${unsplashKey}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              imageUrl = data.results[0].urls.small;
              source = 'unsplash';
            }
          }
        } catch (error) {
          console.error('Unsplash search error:', error);
        }
      }
    }

    // Fallback to placeholder if no image found
    if (!imageUrl) {
      imageUrl = `https://via.placeholder.com/200x200/4F46E5/FFFFFF?text=${encodeURIComponent(term)}`;
      source = 'placeholder';
    }

    // Cache the result
    try {
      await cacheImage(term, imageUrl, source);
    } catch (error) {
      console.error('Cache error:', error);
    }

    return NextResponse.json({
      imageUrl,
      source,
      cached: false,
    });
  } catch (error) {
    console.error('Image search error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    );
  }
}
