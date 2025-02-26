import { NextResponse } from "next/server";
import fetch from "node-fetch";
import xml2js from "xml2js";

const API_KEY = "abcdefg";
const API_URL = "https://unipass.customs.go.kr:38010/rest/postNoPrCstmSgnQry/retrievePostNoPrCstmSgnQry";

interface CustomsInfo {
    jrsdCstmSgn: string;
    jrsdCstmSgnNm: string;
}

export async function GET(req: Request) {
    try {
        // URL에서 우편번호 추출
        const { searchParams } = new URL(req.url);
        const postalCode = searchParams.get("postalCode");

        if (!postalCode) {
            return NextResponse.json({ error: "우편번호가 필요합니다." }, { status: 400 });
        }

        // 관세청 API 요청 URL
        const requestUrl = `${API_URL}?crkyCn=${API_KEY}&jrsdPsno=${postalCode}`;
        
        // API 호출
        const response = await fetch(requestUrl);
        if (!response.ok) {
            return NextResponse.json({ error: "외부 API 호출 실패" }, { status: 500 });
        }

        // XML -> JSON 변환
        const xmlText = await response.text();
        const parser = new xml2js.Parser({ explicitArray: false });
        const jsonData = await parser.parseStringPromise(xmlText);

        // 응답 데이터에서 필요한 정보 추출
        const customsInfoList: CustomsInfo[] = jsonData?.psnoPrJrsdCstmQryRtnVo?.psnoPrJrsdCstmQryRsltVoList || [];

        if (!customsInfoList || customsInfoList.length === 0) {
            return NextResponse.json({ error: "해당 우편번호에 대한 세관 정보 없음" }, { status: 404 });
        }

        // JSON 형태로 변환
        const customsList = Array.isArray(customsInfoList) ? customsInfoList : [customsInfoList];

        const result = customsList.map((item: CustomsInfo) => ({
            customsCode: item.jrsdCstmSgn,
            customsName: item.jrsdCstmSgnNm
        }));

        return NextResponse.json({ data: result }, { status: 200 });

    } catch (error) {
        console.error("서버 오류:", error); // 오류 로그 출력하여 ESLint 경고 방지
        return NextResponse.json({ error: "서버 내부 오류" }, { status: 500 });
    }
}
