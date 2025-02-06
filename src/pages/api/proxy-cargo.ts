// pages/api/proxy-cargo.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { parseStringPromise } from 'xml2js'

// 영어 필드명을 한글 필드명으로 매핑
const fieldMap = {
  "cargMtNo": "화물관리번호",
  "prgsStts": "진행상태",
  "prgsStCd": "진행상태코드",
  "shipNat": "선박국적",
  "shipNatNm": "선박국적명",
  "mblNo": "MBL번호",
  "hblNo": "HBL번호",
  "agnc": "대리점",
  "shcoFlcoSgn": "선사항공사부호",
  "shcoFlco": "선사항공사",
  "cargTp": "화물구분",
  "ldprCd": "적재항코드",
  "ldprNm": "적재항명",
  "lodCntyCd": "적출국가코드",
  "shipNm": "선박명",
  "pckGcnt": "포장개수",
  "pckUt": "포장단위",
  "blPt": "B/L유형",
  "blPtNm": "B/L유형명",
  "dsprCd": "양륙항코드",
  "dsprNm": "양륙항명",
  "etprCstm": "입항세관",
  "etprDt": "입항일자",
  "msrm": "용적",
  "ttwg": "총중량",
  "wghtUt": "중량단위",
  "prnm": "품명",
  "cntrGcnt": "컨테이너개수",
  "cntrNo": "컨테이너번호",
  "csclPrgsStts": "통관진행상태",
  "prcsDttm": "처리일시",
  "frwrSgn": "포워더부호",
  "frwrEntsConm": "포워더명",
  "vydf": "항차",
  "spcnCargCd": "특수화물코드",
  "mtTrgtCargYnNm": "관리대상화물여부명",
  "rlseDtyPridPassTpcd": "반출의무과태료여부",
  "dclrDelyAdtxYn": "신고지연가산세여부"
};

// 장치장 정보에 대한 매핑
const subFieldMap = {
  "shedNm": "장치장명",
  "prcsDttm": "처리일시",
  "wght": "중량",
  "wghtUt": "중량단위",
  "pckGcnt": "포장개수",
  "cargTrcnRelaBsopTpcd": "처리구분",
  "pckUt": "포장단위",
  "shedSgn": "장치장부호"
};

// 필요한 필드만 남기고 이름을 한글로 변환하는 함수
function transformFields(data: Record<string, unknown>, map: Record<string, string>): Record<string, unknown> {
  const transformed: Record<string, unknown> = {};
  for (const key in data) {
    if (map[key]) {
      transformed[map[key]] = data[key];
    }
  }
  return transformed;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { mblNo, hblNo, blYy } = req.query
  const apiKey = process.env.NEXT_PUBLIC_UNIPASS_API_KEY
  const unipassBaseUrl = "https://unipass.customs.go.kr:38010/ext/rest/cargCsclPrgsInfoQry"

  const unipassUrl = `${unipassBaseUrl}/retrieveCargCsclPrgsInfo?crkyCn=${apiKey}${
    mblNo ? `&mblNo=${mblNo}&blYy=${blYy}` : `&hblNo=${hblNo}&blYy=${blYy}`
  }`;

  console.log(" Unipass API 요청 URL:", unipassUrl);

  try {
    const response = await fetch(unipassUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/xml',
      },
    });

    console.log("Unipass API 응답상태 코드:", response.status);

    if (!response.ok) {
      console.error("Unipass API 요청 실패:", response.statusText);
      throw new Error('Unipass API 요청 실패');
    }

    const xml = await response.text();
    console.log("Unipass API 응답 XML:", xml);
    const jsonData = await parseStringPromise(xml, { explicitArray: false });

    // 최상위 필드 필터링 및 변환
    const mainData = transformFields(jsonData.cargCsclPrgsInfoQryRtnVo.cargCsclPrgsInfoQryVo, fieldMap);

    // 하위 필드 필터링 및 변환
    const subData = jsonData.cargCsclPrgsInfoQryRtnVo.cargCsclPrgsInfoDtlQryVo.map((item: Record<string, unknown>) => transformFields(item, subFieldMap));

    // 최종 데이터 조합
    const result = {
      ...mainData,
      cargCsclPrgsInfoDtlQryVo: subData
    };

    res.status(200).json(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Unipass API 요청 오류:", error.message);
      res.status(500).json({ error: 'Unipass API 요청에 실패했습니다.', details: error.message });
    } else {
      console.error("Unipass API 요청 오류:", error);
      res.status(500).json({ error: 'Unipass API 요청에 실패했습니다.', details: '알 수 없는 오류 발생' });
    }
  }
}
