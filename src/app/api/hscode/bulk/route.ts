// src/app/api/hscode/bulk/route.ts

import { NextResponse } from 'next/server';

// 최대 제품 개수 제한을 설정합니다. 이 값을 바꾸면 조회 가능한 제품 개수가 변경됩니다.
const MAX_PRODUCTS_LIMIT = 10;

export async function POST(request: Request) {
  const { products } = await request.json();

  // 입력된 제품 개수가 최대 개수를 초과하면 에러를 반환합니다.
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
    // 각 제품별로 독립적인 API 요청을 보내고, 모든 요청이 완료될 때까지 기다립니다.
    const hscodes = await Promise.all(products.map(async (product) => {
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
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 100,
          temperature: 0.5,
        }),
      });

      const data = await response.json();
      const hscode = data.choices[0].message.content.trim();

      // 제품명과 HS CODE를 함께 반환
      return { name: product.name, hscode };
    }));

    // 모든 HS CODE 응답을 JSON 형태로 반환
    return NextResponse.json({ hscodes });
  } catch (error) {
    console.error('Error fetching data from OpenAI:', error);  // 상세 오류 로그
    return NextResponse.json({ error: 'Failed to fetch HS CODE' }, { status: 500 });
  }
}
