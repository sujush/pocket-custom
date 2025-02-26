/* services/tax-calculation/page.tsx */
"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent
} from "react";
import { Factory, Anchor, Building } from "lucide-react";

/* -----------------------------------------------------------------------
   1. 타입 정의
----------------------------------------------------------------------- */

// 인코텀즈 아이콘 표시를 위한 타입
interface Incoterm {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
}

// 관세율 API 응답 아이템 타입
interface HsApiItem {
  품목번호: string;
  관세율구분: string;
  관세율?: string;
  [key: string]: string | undefined;
}

// API 응답 구조
interface HsApiResponse {
  currentCount: number;
  data: HsApiItem[];
  matchCount: number;
  page: number;
  perPage: number;
  totalCount: number;
}

// 수입 국가 타입
interface ImportCountry {
  code: string; // "US", "CN", "EU", "JP", "VN" 등
  name: string; // "미국", "중국", "유럽연합", "일본", "베트남" 등
}

// 제품 입력 폼 타입
interface HsCodeInput {
  id: string;
  code: string;
  description: string;
  productUsd: number;
  error?: string | null;
  results?: HsApiItem[];
  selectedBasicCode?: string;
  selectedFtaCode?: string;
}

export default function TaxCalculationPage() {
  /* ---------------------------------------------------------------------
     2. 상태 정의
  --------------------------------------------------------------------- */
  // 인코텀즈 선택
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

  // 과세 환율(USD)
  const [usdRate, setUsdRate] = useState<number>(0);

  // 인보이스 금액(USD), 운임 및 기타 비용(KRW)
  const [invoiceUsd, setInvoiceUsd] = useState<number>(0);
  const [krwCosts, setKrwCosts] = useState<number>(0);

  // CIF 계산 결과
  const [cifRatio, setCifRatio] = useState<number>(0);
  const [cifInKrw, setCifInKrw] = useState<number>(0);

  // HS CODE 입력 리스트
  const [hsCodes, setHsCodes] = useState<HsCodeInput[]>([
    { id: "1", code: "", description: "", productUsd: 0 }
  ]);

  // 수입 국가
  const [selectedCountry, setSelectedCountry] = useState<string>("");

  // 최종 관세/부가세 (기본세율 / 협정세율)
  const [totalDutyBasic, setTotalDutyBasic] = useState<number>(0);
  const [totalVatBasic, setTotalVatBasic] = useState<number>(0);
  const [totalDutyFta, setTotalDutyFta] = useState<number>(0);
  const [totalVatFta, setTotalVatFta] = useState<number>(0);

  /* ---------------------------------------------------------------------
     2-2) 정적 데이터
  --------------------------------------------------------------------- */
  // 인코텀즈 목록
  const incoterms: Incoterm[] = [
    { id: "exw-fca", name: "EXW/FCA", icon: Factory, description: "수출국 공장 (EXW/FCA)" },
    { id: "fob", name: "FOB", icon: Anchor, description: "수출국 항구 (FOB)" },
    { id: "cfr-cif", name: "CFR/CIF", icon: Anchor, description: "수입국 항구 (CFR/CIF)" },
    { id: "dap-ddp", name: "DAP/DDP", icon: Building, description: "수입국 도착지 (DAP/DDP)" }
  ];

  // 수입 국가 목록
  const importCountries: ImportCountry[] = [
    { code: "US", name: "미국" },
    { code: "CN", name: "중국" },
    { code: "EU", name: "유럽연합" },
    { code: "JP", name: "일본" },
    { code: "VN", name: "베트남" }
  ];

  // 관세율 구분 → 표시 문자열 매핑
  const RATE_TYPE_MAPPING: Record<string, string> = {
    A: "A (기본세율)",
    C: "C (WTO협정세율)",
    E1: "E1 (아ㆍ태 협정)",
    FAS1: "FAS1 (한-아세안)",
    FCA1: "FCA1 (한-캐나다)",
    FCN1: "FCN1 (한-중국)",
    FEU1: "FEU1 (한-EU)",
    FUS1: "FUS1 (한-미국)",
    FVN1: "FVN1 (한-베트남)",
    P1: "P1 (할당관세-추천)",
    P3: "P3 (할당관세-전량)",
    R: "R (최빈국 특혜)",
    W1: "W1 (WTO-추천)",
    W2: "W2 (WTO-미추천)"
  };

  /* ---------------------------------------------------------------------
     3. 환율(USD) 가져오기
  --------------------------------------------------------------------- */
  const parseExchangeRates = useCallback((xmlText: string): number => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    const rateElements = xmlDoc.getElementsByTagName("trifFxrtInfoQryRsltVo");

    let foundUsdRate = 0;
    Array.from(rateElements).forEach((rateElement: Element) => {
      const countryCode = rateElement.getElementsByTagName("cntySgn")[0]?.textContent || "";
      const rateValue = rateElement.getElementsByTagName("fxrt")[0]?.textContent || "0";
      if (countryCode.includes("US")) {
        foundUsdRate = parseFloat(rateValue);
      }
    });
    return foundUsdRate;
  }, []);

  useEffect(() => {
    const fetchUsdExchangeRate = async () => {
      try {
        const response = await fetch("/api/exchange-rates");
        if (!response.ok) {
          throw new Error("환율 정보를 가져오는데 실패했습니다.");
        }
        const xmlText = await response.text();
        const usd = parseExchangeRates(xmlText);
        setUsdRate(usd);
      } catch (err) {
        console.error("Fetch USD Rate Error:", err);
        setUsdRate(0);
      }
    };
    fetchUsdExchangeRate();
  }, [parseExchangeRates]);

  /* ---------------------------------------------------------------------
     4. “조회 실패”와 “0% 관세” 구분을 위한 함수
  --------------------------------------------------------------------- */
  function getNumericRate(results: HsApiItem[], code: string): number {
    // -1: 조회되지 않음, 0 이상: 실제 관세율 (0%도 유효)
    const found = results.find((r) => r.관세율구분 === code);
    if (!found || !found.관세율) {
      return -1;
    }
    const numeric = parseFloat(found.관세율.replace(/[^\d.]/g, "") || "");
    return isNaN(numeric) ? -1 : numeric;
  }

  /* ---------------------------------------------------------------------
     4-1) 기본세율 찾기 (A vs C 중 낮은 쪽)
  --------------------------------------------------------------------- */
  function findBasicRateWithCode(results: HsApiItem[]): {
    code: string;
    rate: number;
  } {
    const aRate = getNumericRate(results, "A");
    const cRate = getNumericRate(results, "C");

    // 둘 다 -1이면 “없음”
    if (aRate === -1 && cRate === -1) {
      return { code: "", rate: 0 };
    }
    // A만 없으면 C
    if (aRate === -1) {
      return { code: "C", rate: cRate };
    }
    // C만 없으면 A
    if (cRate === -1) {
      return { code: "A", rate: aRate };
    }
    // 둘 다 유효하면 더 낮은 쪽
    if (aRate <= cRate) {
      return { code: "A", rate: aRate };
    }
    return { code: "C", rate: cRate };
  }

  /* ---------------------------------------------------------------------
     4-2) 협정세율 찾기 (국가별)
  --------------------------------------------------------------------- */
  function findFtaRateWithCode(
    results: HsApiItem[],
    country: string,
    basicCode: string,
    basicRate: number
  ): { code: string; rate: number } {
    switch (country) {
      case "US": {
        // 미국 → FUS1
        const fus1 = getNumericRate(results, "FUS1");
        return fus1 >= 0 ? { code: fus1 === -1 ? "" : "FUS1", rate: Math.max(fus1, 0) } : { code: "", rate: 0 };
      }
      case "CN": {
        // 중국 → FCN1 vs E1 중 낮은 쪽
        const fcn1 = getNumericRate(results, "FCN1");
        const e1   = getNumericRate(results, "E1");

        const bothNotFound = (fcn1 === -1 && e1 === -1);
        if (bothNotFound) return { code: "", rate: 0 };

        if (fcn1 === -1) return { code: "E1", rate: e1 };
        if (e1 === -1)  return { code: "FCN1", rate: fcn1 };

        // 둘 다 0 이상이므로 작은 쪽 우선
        return fcn1 <= e1
          ? { code: "FCN1", rate: fcn1 }
          : { code: "E1",   rate: e1 };
      }
      case "EU": {
        const feu1 = getNumericRate(results, "FEU1");
        return feu1 >= 0
          ? { code: feu1 === -1 ? "" : "FEU1", rate: Math.max(feu1, 0) }
          : { code: "", rate: 0 };
      }
      case "VN": {
        // 베트남 → FAS1 vs FVN1
        const fas1 = getNumericRate(results, "FAS1");
        const fvn1 = getNumericRate(results, "FVN1");

        if (fas1 === -1 && fvn1 === -1) return { code: "", rate: 0 };
        if (fas1 === -1) return { code: "FVN1", rate: fvn1 };
        if (fvn1 === -1) return { code: "FAS1", rate: fas1 };
        return fas1 <= fvn1
          ? { code: "FAS1", rate: fas1 }
          : { code: "FVN1", rate: fvn1 };
      }
      case "JP": {
        // 일본 → 기본세율과 동일, 별도 안내
        return { code: basicCode, rate: basicRate };
      }
      default:
        return { code: "", rate: 0 };
    }
  }

  /* ---------------------------------------------------------------------
     5. 이벤트 핸들러
  --------------------------------------------------------------------- */
  // 인코텀즈 선택
  const handleTermClick = (termId: string) => {
    setSelectedTerm(termId);

    // 초기화
    setInvoiceUsd(0);
    setKrwCosts(0);
    setCifRatio(0);
    setCifInKrw(0);
    setHsCodes([{ id: "1", code: "", description: "", productUsd: 0 }]);
    setSelectedCountry("");
    setTotalDutyBasic(0);
    setTotalVatBasic(0);
    setTotalDutyFta(0);
    setTotalVatFta(0);
  };

  // 인보이스 금액(USD)
  const handleInvoiceUsdChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    setInvoiceUsd(val);
  };

  // 운임/기타 비용(KRW)
  const handleKrwCostsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    setKrwCosts(val);
  };

  // CIF 계산
  const handleCalculateCIF = () => {
    if (!selectedTerm) return;
    if (invoiceUsd <= 0 || usdRate <= 0) {
      alert("인보이스 금액 또는 환율이 올바르지 않습니다.");
      return;
    }

    let adjustedKrw = krwCosts;
    if (selectedTerm === "dap-ddp") {
      adjustedKrw = -Math.abs(krwCosts);
    }

    const totalInKrw = invoiceUsd * usdRate + adjustedKrw;
    const ratio = totalInKrw / invoiceUsd;

    setCifInKrw(totalInKrw);
    setCifRatio(ratio);
  };

  // HS CODE 리스트 조작
  const addHsCode = () => {
    setHsCodes((prev) => [
      ...prev,
      { id: String(prev.length + 1), code: "", description: "", productUsd: 0 }
    ]);
  };

  const removeHsCode = (id: string) => {
    setHsCodes((prev) => prev.filter((item) => item.id !== id));
  };

  const updateHsCodeField = (
    id: string,
    field: "code" | "description" | "productUsd",
    value: string
  ) => {
    setHsCodes((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, [field]: field === "productUsd" ? parseFloat(value) || 0 : value }
          : item
      )
    );
  };

  // 관세율 API 조회
  const fetchHsCodeData = async (itemId: string, code: string) => {
    if (code.length !== 10) {
      setHsCodes((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, error: "HS CODE는 10자리여야 합니다.", results: [] }
            : item
        )
      );
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_TARIFF_API_URL;
      const apiKey = process.env.NEXT_PUBLIC_TARIFF_API_KEY;
      if (!apiUrl || !apiKey) {
        throw new Error("관세율 API 설정이 잘못되었습니다.");
      }

      const fullUrl = `${apiUrl}?serviceKey=${apiKey}&page=1&perPage=100&returnType=JSON&cond[품목번호::EQ]=${code}`;
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error("HS CODE 관세율 API 조회 실패");
      }

      const data: HsApiResponse = await response.json();
      const ALLOWED_RATE_TYPES = Object.keys(RATE_TYPE_MAPPING);
      const filteredData = data.data.filter((d) =>
        ALLOWED_RATE_TYPES.includes(d.관세율구분)
      );

      if (filteredData.length === 0) {
        setHsCodes((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  error: "입력하신 HS CODE에 대한 데이터가 없습니다.",
                  results: []
                }
              : item
          )
        );
      } else {
        // 품목번호 10자리 보정
        const formattedData = filteredData.map((d) => ({
          ...d,
          품목번호: d.품목번호
            ? d.품목번호.toString().padStart(10, "0")
            : "0000000000"
        }));

        // 기본세율(A)을 맨 앞에, 나머지는 오름차순
        const sortedData = formattedData.sort((a, b) => {
          if (a.관세율구분 === "A") return -1;
          if (b.관세율구분 === "A") return 1;
          const rateA = parseFloat(a.관세율?.replace(/[^\d.]/g, "") || "0");
          const rateB = parseFloat(b.관세율?.replace(/[^\d.]/g, "") || "0");
          return rateA - rateB;
        });

        setHsCodes((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? { ...item, error: null, results: sortedData }
              : item
          )
        );
      }
    } catch (error) {
      console.error("데이터 조회 오류:", error);
      setHsCodes((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                error: "데이터 조회 중 오류가 발생했습니다.",
                results: []
              }
            : item
        )
      );
    }
  };

  // 수입 국가 선택
  const handleCountryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(e.target.value);
  };

  // 최종 계산 (기본/협정)
  const handleFinalCalculate = () => {
    // 제품별 USD 합 vs 전체 인보이스 USD
    const sumOfProducts = hsCodes.reduce((acc, cur) => acc + cur.productUsd, 0);
    if (sumOfProducts !== invoiceUsd) {
      alert(
        `제품들의 인보이스 합계(${sumOfProducts.toFixed(2)} USD)가 전체(${invoiceUsd.toFixed(
          2
        )} USD)와 일치하지 않습니다.`
      );
      return;
    }

    if (cifRatio === 0) {
      alert("먼저 ‘CIF 비율 계산’을 해주세요.");
      return;
    }

    let basicDutySum = 0;
    let ftaDutySum   = 0;

    const updatedHsCodes = hsCodes.map((item) => {
      const productCifKrw = item.productUsd * cifRatio;

      // 기본세율
      const { code: basicCode, rate: basicRate } = findBasicRateWithCode(item.results || []);

      // 협정세율
      const { code: ftaCode, rate: ftaRate } = findFtaRateWithCode(
        item.results || [],
        selectedCountry,
        basicCode,
        basicRate
      );

      // 관세액 계산
      const dutyBasic = productCifKrw * (basicRate / 100);
      const dutyFta   = productCifKrw * (ftaRate / 100);

      basicDutySum += dutyBasic;
      ftaDutySum   += dutyFta;

      return {
        ...item,
        selectedBasicCode: basicCode,
        selectedFtaCode: ftaCode
      };
    });

    const basicVat = (cifInKrw + basicDutySum) * 0.1;
    const ftaVat   = (cifInKrw + ftaDutySum) * 0.1;

    setTotalDutyBasic(basicDutySum);
    setTotalVatBasic(basicVat);
    setTotalDutyFta(ftaDutySum);
    setTotalVatFta(ftaVat);

    setHsCodes(updatedHsCodes);

    if (selectedCountry === "JP") {
      alert("일본의 경우 RCEP 적용 가능성이 있으니 관세사와 상담하세요.");
    }
  };

  /* ---------------------------------------------------------------------
     6. 렌더링 - 단계 순서:
       1) 인코텀즈 선택
       2) 과세표준(CIF) 계산
       3) 수입 국가 선택
       4) 제품 정보 입력
  --------------------------------------------------------------------- */
  return (
    <div className="min-h-screen p-8">
      <h2 className="text-3xl font-bold mb-6">
        1. 적합한 인코텀즈 조건을 선택해주세요.
      </h2>

      <div className="my-12">
        <div className="relative flex items-center justify-between max-w-4xl mx-auto">
          <div className="absolute h-1 bg-blue-500 left-10 right-10 top-10 z-0"></div>
          <div className="flex justify-between w-full relative z-10">
            {incoterms.map((term) => (
              <div
                key={term.id}
                className="flex flex-col items-center cursor-pointer"
                onClick={() => handleTermClick(term.id)}
              >
                <div
                  className={`
                    w-20 h-20 rounded-full flex items-center justify-center
                    ${selectedTerm === term.id ? "bg-blue-600" : "bg-blue-100"}
                    border-4 border-white shadow-lg transition-all duration-300
                  `}
                >
                  <term.icon
                    className={`w-10 h-10 ${
                      selectedTerm === term.id ? "text-white" : "text-blue-600"
                    }`}
                  />
                </div>
                <div className="mt-3 text-center">
                  <p className="font-bold text-lg">{term.name}</p>
                  <p className="text-sm text-gray-600">{term.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2) 과세표준(CIF) 계산 */}
      {selectedTerm && (
        <div className="space-y-4 mt-12">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">
              2. 과세표준(CIF)을 위해 아래 내용을 기입해주세요.
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  인보이스 총 금액 (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={invoiceUsd || ""}
                  onChange={handleInvoiceUsdChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  운임 및 기타 비용 (KRW)
                </label>
                <input
                  type="number"
                  value={krwCosts || ""}
                  onChange={handleKrwCostsChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="font-medium text-blue-800">
                현재 환율 (USD → KRW) :{" "}
                {usdRate
                  ? `${usdRate.toLocaleString("ko-KR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} 원`
                  : "정보 없음"}
              </p>
            </div>

            {cifRatio !== 0 && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="font-medium text-green-800 mb-2">
                  CIF 환산 금액 (KRW) : {Math.round(cifInKrw).toLocaleString()} 원
                </p>
                <p className="text-green-800">
                  CIF 비율 : {cifRatio.toFixed(4)}
                </p>
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={handleCalculateCIF}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                CIF 비율 계산
              </button>
            </div>
          </div>

          {/* 3) 수입 국가 선택 */}
          {cifRatio !== 0 && (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-6">
              <h2 className="text-xl font-semibold mb-4">
                3. 수입 국가 선택 (협정세율 반영)
              </h2>
              <select
                value={selectedCountry}
                onChange={handleCountryChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">-- 수입 국가 선택 --</option>
                {importCountries.map((ct) => (
                  <option key={ct.code} value={ct.code}>
                    {ct.name} ({ct.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 4) 제품 정보 입력 */}
          {cifRatio !== 0 && selectedCountry && (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-6">
              <h2 className="text-xl font-semibold mb-4">
                4. 제품의 HS CODE 및 개별 인보이스 금액(USD)
              </h2>

              {hsCodes.map((hsItem, index) => (
                <div
                  key={hsItem.id}
                  className="mb-4 p-4 border border-gray-200 rounded-md bg-white"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">제품 {index + 1}</h3>
                    {index > 0 && (
                      <button
                        onClick={() => removeHsCode(hsItem.id)}
                        className="text-red-600 text-sm"
                      >
                        삭제
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        HS CODE (10자리)
                      </label>
                      <input
                        type="text"
                        maxLength={10}
                        value={hsItem.code}
                        onChange={(e) =>
                          updateHsCodeField(hsItem.id, "code", e.target.value)
                        }
                        onBlur={() => {
                          if (hsItem.code.length === 10) {
                            void fetchHsCodeData(hsItem.id, hsItem.code);
                          }
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="예: 8471300000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        제품 설명
                      </label>
                      <input
                        type="text"
                        value={hsItem.description}
                        onChange={(e) =>
                          updateHsCodeField(
                            hsItem.id,
                            "description",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="예: 노트북"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        제품별 인보이스 금액 (USD)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={hsItem.productUsd || ""}
                        onChange={(e) =>
                          updateHsCodeField(
                            hsItem.id,
                            "productUsd",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* 조회 결과 표시 */}
                  {hsItem.error && (
                    <p className="text-sm text-red-600 mt-2">{hsItem.error}</p>
                  )}
                  {hsItem.results && hsItem.results.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-gray-600">
                        조회된 관세율 목록 ({hsItem.results.length}개)
                      </p>
                      {hsItem.results.map((res, i) => {
                        const dutyName =
                          RATE_TYPE_MAPPING[res.관세율구분] || res.관세율구분;

                        const isSelectedBasic =
                          res.관세율구분 === hsItem.selectedBasicCode;
                        const isSelectedFta =
                          res.관세율구분 === hsItem.selectedFtaCode;

                        const basicMark = isSelectedBasic ? "✔ (기본세율 적용)" : "";
                        const ftaMark   = isSelectedFta   ? "✔ (협정세율 적용)" : "";

                        return (
                          <div
                            key={String(i)}
                            className={`border p-2 rounded-md ${
                              isSelectedBasic || isSelectedFta
                                ? "border-blue-400 bg-blue-50"
                                : "border-gray-200 bg-white"
                            }`}
                          >
                            <p className="text-xs text-gray-700">
                              구분: {dutyName} / 관세율: {res.관세율 || "-"}
                            </p>
                            {(basicMark || ftaMark) && (
                              <p className="text-xs text-green-600 mt-1">
                                {basicMark} {ftaMark}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              <div className="mt-4 space-x-2">
                <button
                  onClick={addHsCode}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  + 제품 추가
                </button>
              </div>

              {/* 최종 계산하기 버튼 */}
              <div className="mt-6">
                <button
                  onClick={handleFinalCalculate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  최종 계산하기
                </button>
              </div>

              {/* 기본세율/협정세율 결과 */}
              {(totalDutyBasic > 0 || totalDutyFta > 0) && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h3 className="font-medium text-yellow-800 mb-2">
                    기본세율 적용 시
                  </h3>
                  <p className="mb-1">
                    관세액: {Math.round(totalDutyBasic).toLocaleString()} 원
                  </p>
                  <p className="mb-4">
                    부가세: {Math.round(totalVatBasic).toLocaleString()} 원
                  </p>

                  <hr className="my-4" />

                  <h3 className="font-medium text-yellow-800 mb-2">
                    협정세율 적용 시
                  </h3>
                  <p className="mb-1">
                    관세액: {Math.round(totalDutyFta).toLocaleString()} 원
                  </p>
                  <p>
                    부가세: {Math.round(totalVatFta).toLocaleString()} 원
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
