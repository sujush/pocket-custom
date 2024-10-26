import path from 'path';
import fs from 'fs';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // URL에서 reqCfrmIstmNm 쿼리 파라미터를 가져옵니다.
  const { searchParams } = new URL(request.url);
  const reqCfrmIstmNm = searchParams.get("reqCfrmIstmNm");

  // JSON 파일 경로 설정
  const filePath = path.join(process.cwd(), 'src/app/services/import-requirements/check/requirements.json');

  try {
    // JSON 파일을 읽고 파싱
    const data = fs.readFileSync(filePath, 'utf8');
    const requirements = JSON.parse(data);

    // reqCfrmIstmNm에 맞는 데이터가 있을 경우 해당 데이터 반환
    if (reqCfrmIstmNm && requirements[reqCfrmIstmNm]) {
      return NextResponse.json({ description: requirements[reqCfrmIstmNm] });
    }

    // reqCfrmIstmNm에 맞는 데이터가 없을 경우 에러 메시지 반환
    return NextResponse.json({ error: "No data found for the provided reqCfrmIstmNm" }, { status: 404 });
  } catch (error) {
    console.error("Error loading requirements:", error);
    return NextResponse.json({ error: "File not found or could not be read" }, { status: 500 });
  }
}
