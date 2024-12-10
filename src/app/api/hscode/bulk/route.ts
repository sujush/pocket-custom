// src/app/api/hscode/bulk/route.ts
import { NextResponse } from 'next/server';
import { getRemainingSearches, checkIPLimit } from '@/lib/utils/rateLimit';

const MAX_PRODUCTS_LIMIT = 10;

export async function POST(request: Request) {
  const { products } = await request.json();

  // 입력된 제품 개수 제한 확인
  if (products.length > MAX_PRODUCTS_LIMIT) {
    return NextResponse.json(
      { error: `제품의 개수가 너무 많습니다. 최대 ${MAX_PRODUCTS_LIMIT}개까지 조회할 수 있습니다.` },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    // 검색 제한 확인
    const limitCheck = await checkIPLimit(request, 'bulk');
    if (!limitCheck.success) {
      return NextResponse.json(
        { message: limitCheck.message },
        { status: 429 }
      );
    }

    const hscodes = await Promise.all(products.map(async (product: { name: string; material: string; description: string; }) => {
      const prompt = `
        너는 무역을 전공한 사람이고, HS CODE 품목분류의 전문가야. 제품의 상세사항에 기반해서
        오직 6자리의 HS CODE를 제공해. 다른 부가적인 말은 필요없이 6자리의 HS CODE 값만 도출해.

        해당 제품의 이름은 ${product.name} 입니다.
        해당 제품의 재질은 ${product.material} 입니다.
        해당 제품에 대해 설명할 기타 내용은 ${product.description} 입니다.
      `;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo-0125',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 100,
          temperature: 0.5,
        }),
      });

      const data = await response.json();
      const hscode = data.choices[0].message.content.trim();

      return { name: product.name, hscode };
    }));

    // 남은 검색 횟수 확인 및 응답에 포함
    const remainingSearches = await getRemainingSearches(request);

    return NextResponse.json({
      hscodes,
      remaining: remainingSearches, // 남은 검색 횟수 포함
    });
  } catch (error) {
    console.error('Error fetching data from OpenAI:', error);
    return NextResponse.json({ error: 'Failed to fetch HS CODE' }, { status: 500 });
  }
}
