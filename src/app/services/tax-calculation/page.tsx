/* services/tax-calculation/page.tsx */
"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,  
} from "react";
import { Factory, Anchor, Building } from "lucide-react";

/* -----------------------------------------------------------------------
   1. 타입 정의
----------------------------------------------------------------------- */

// 인코텀즈 아이콘 표시를 위한 타입
interface Incoterm {
  id: string;
  name: string;
  icon: React.ElementType; // React 컴포넌트 타입
  description: string;
}

// HS CODE 입력 폼용 타입
interface HsCodeInput {
  id: string;            // 내부 관리용 ID
  code: string;          // HS CODE
  description: string;   // 제품 설명
  productUsd: number;    // 제품 개별 인보이스 금액 (USD)
  results?: HsApiItem[]; // API 조회 결과 (관세율 목록 등)
  error?: string | null; // API 조회 에러 메시지
}

// 관세율 API 응답 아이템 타입
interface HsApiItem {
  품목번호: string;
  관세율구분: string;
  관세율?: string;
  [key: string]: string | undefined; // 필요한 필드가 더 있을 수 있으므로 보완용
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


// 수입 국가 타입 (FTA 등에 따라 달라지는 협정세율을 구분하기 위한 예시)
interface ImportCountry {
  code: string; // 예: "US", "CN", "EU"
  name: string; // 예: "미국", "중국", "유럽연합"
}

/* -----------------------------------------------------------------------
   2. 메인 컴포넌트: TaxCalculationPage
----------------------------------------------------------------------- */

export default function TaxCalculationPage() {
  /* ---------------------------------------------------------------------
     2-1) 상태 정의
  --------------------------------------------------------------------- */
  // (A) 인코텀즈 선택 상태
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

  // (B) 환율 (미국 USD만 필요하다고 가정)
  const [usdRate, setUsdRate] = useState<number>(0);

  // (C) 과세환율, 인보이스, 운임 등 입력값
  //     - 인보이스 금액은 USD
  //     - 운임, 기타 비용 등은 KRW
  const [invoiceUsd, setInvoiceUsd] = useState<number>(0);  // 인보이스 총 금액(USD)
  const [krwCosts, setKrwCosts] = useState<number>(0);      // 운임/기타비용 합계(KRW)

  // (D) CIF 비율(= (invoiceUsd×usdRate + krwCosts) / invoiceUsd ) 등 계산 결과
  const [cifRatio, setCifRatio] = useState<number>(0);
  const [cifInKrw, setCifInKrw] = useState<number>(0); // 인보이스 총액을 원화 환산했을 때 + 비용 합의 합계

  // (E) HS CODE 리스트(각 제품 입력 폼)
  const [hsCodes, setHsCodes] = useState<HsCodeInput[]>([
    { id: "1", code: "", description: "", productUsd: 0 }
  ]);

  // (F) HS CODE 입력 시 API 호출에 대한 로딩 여부, 오류 메시지
  //     → 각 제품별로 관리할 수 있지만, 여기서는 간단히 전역 메시지로 처리해도 됨
  //     → 현재는 HsCodeInput 내부에 error를 둘 수도 있음

  // (G) 사용자 입력한 수입 국가 (FTA 관세율 결정)
  const [selectedCountry, setSelectedCountry] = useState<string>(""); // 예: 'US', 'CN' 등

  // (H) 전체 관세액, 부가세 등 최종 결과
  const [totalDuty, setTotalDuty] = useState<number>(0);
  const [totalVat, setTotalVat] = useState<number>(0);

  /* ---------------------------------------------------------------------
     2-2) 정적 데이터 예시
  --------------------------------------------------------------------- */
  // 인코텀즈 목록
  const incoterms: Incoterm[] = [
    { id: "exw-fca", name: "EXW/FCA", icon: Factory, description: "수출국 공장 (EXW/FCA)" },
    { id: "fob", name: "FOB", icon: Anchor, description: "수출국 항구 (FOB)" },
    { id: "cfr-cif", name: "CFR/CIF", icon: Anchor, description: "수입국 항구 (CFR/CIF)" },
    { id: "dap-ddp", name: "DAP/DDP", icon: Building, description: "수입국 도착지 (DAP/DDP)" }
  ];

  // 수입 국가 목록 (예시)
  const importCountries: ImportCountry[] = [
    { code: "US", name: "미국" },
    { code: "CN", name: "중국" },
    { code: "EU", name: "유럽연합" },
    { code: "JP", name: "일본" },
    { code: "VN", name: "베트남" }
  ];

  // 관세율구분 코드 매핑 예시 (기본세율 A / 협정세율 등)
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
     3. 환율(USD) 가져오는 로직
  --------------------------------------------------------------------- */
  const parseExchangeRates = useCallback((xmlText: string): number => {
    // XML 파싱
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
        // 미국 환율만 추출
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
     4. 이벤트 핸들러 및 로직
  --------------------------------------------------------------------- */

  // 인코텀즈 선택 시
  const handleTermClick = (termId: string) => {
    setSelectedTerm(termId);
    // 리셋할 항목들
    setInvoiceUsd(0);
    setKrwCosts(0);
    setCifRatio(0);
    setCifInKrw(0);
    setHsCodes([{ id: "1", code: "", description: "", productUsd: 0 }]);
    setTotalDuty(0);
    setTotalVat(0);
  };

  // 인보이스 총 금액(USD) 입력 핸들러
  const handleInvoiceUsdChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim() === "" ? 0 : parseFloat(e.target.value);
    setInvoiceUsd(isNaN(val) ? 0 : val);
  };

  // 운임 및 기타 비용(KRW) 입력 핸들러
  const handleKrwCostsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim() === "" ? 0 : parseFloat(e.target.value);
    setKrwCosts(isNaN(val) ? 0 : val);
  };

  // CIF 계산 (비율 + CIF 원화 총액)
  const handleCalculateCIF = () => {
    if (!selectedTerm) return;
    if (invoiceUsd <= 0 || usdRate <= 0) {
      alert("인보이스 금액 또는 환율(USD) 값이 올바르지 않습니다.");
      return;
    }

    // 인코텀즈별로 더하거나 빼야 할 내용이 달라질 수 있지만,
    // 여기서는 ‘운임/기타비용’ 전체를 단순합(+) 또는 단순차감(-) 하는 예시 구조.
    // 사용자 요청에 따르면:
    // EXW/FCA, FOB, CFR/CIF → + 비용
    // DAP/DDP → - 비용
    let adjustedKrw = krwCosts; // 기본값 +비용
    if (selectedTerm === "dap-ddp") {
      // DAP/DDP는 비용을 빼는 로직
      adjustedKrw = -1 * Math.abs(krwCosts);
    }

    // (인보이스 × usdRate + (±운임비용)) / 인보이스
    const totalInKrw = invoiceUsd * usdRate + adjustedKrw;
    const ratio = totalInKrw / invoiceUsd;

    setCifInKrw(totalInKrw); // CIF 총 원화금액
    setCifRatio(ratio);      // CIF 비율
  };

  // HS Code 리스트 관리
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
          ? {
              ...item,
              [field]:
                field === "productUsd"
                  ? isNaN(parseFloat(value)) ? 0 : parseFloat(value)
                  : value
            }
          : item
      )
    );
  };

  // HS CODE API 조회 (각 제품별)
  const fetchHsCodeData = async (itemId: string, code: string) => {
    try {
      if (code.length !== 10) {
        // 관세청 API는 10자리일 때만 유효. (예시)
        setHsCodes((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? { ...item, error: "HS CODE는 10자리여야 합니다.", results: [] }
              : item
          )
        );
        return;
      }

      // env 로부터 API_URL, API_KEY 가져온다고 가정
      const apiUrl = process.env.NEXT_PUBLIC_TARIFF_API_URL;
      const apiKey = process.env.NEXT_PUBLIC_TARIFF_API_KEY;
      if (!apiUrl || !apiKey) {
        throw new Error("관세율 API 설정이 올바르지 않습니다.");
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
        // 품목번호를 10자리로 맞춤
        const formattedData = filteredData.map((d) => ({
          ...d,
          품목번호: d.품목번호
            ? d.품목번호.toString().padStart(10, "0")
            : "0000000000"
        }));

        // A(기본세율)을 최상단으로, 나머지는 관세율 오름차순
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

  // “최종 계산하기” → 각 제품별 관세액, 전체 관세, 부가세 계산
  const handleFinalCalculate = () => {
    // 1) 제품들의 USD 합계가 invoiceUsd와 일치하는지 체크
    const sumOfProducts = hsCodes.reduce((acc, cur) => acc + (cur.productUsd || 0), 0);
    if (sumOfProducts !== invoiceUsd) {
      alert(
        `제품들의 인보이스 금액 합계(${sumOfProducts.toFixed(2)} USD)가 인보이스 총 금액(${invoiceUsd.toFixed(
          2
        )} USD)와 일치하지 않습니다.`
      );
      return;
    }

    // 2) CIF 비율이 0이면 계산 불가
    if (cifRatio === 0) {
      alert("먼저 ‘CIF 비율 계산’을 진행해주세요.");
      return;
    }

    // 3) 각 제품별로 (USD 금액 × cifRatio)를 KRW로 환산 → 관세율 적용
    //    수입 국가에 따라 협정세율 우선 적용 가능(예: FUS1=한-미국)
    //    아래는 단순 예시 로직: 'A'(기본세율)와 'FUS1'(미국 협정세율)만 찾아서 비교
    let dutySum = 0;

    hsCodes.forEach((item) => {
      // 제품의 CIF 원화 환산 금액
      const productCifKrw = item.productUsd * cifRatio;

      // HS CODE 조회 결과 중 우선 적용할 세율
      // 예: selectedCountry가 'US'인 경우, 'FUS1'을 찾아서 존재하면 협정세율 사용, 없으면 'A' 사용
      let applicableRateStr = "";
      if (item.results && item.results.length > 0) {
        // 미국(US) 예시:
        if (selectedCountry === "US") {
          const fus1 = item.results.find((r) => r.관세율구분 === "FUS1");
          if (fus1 && fus1.관세율) {
            // 협정세율 적용
            applicableRateStr = fus1.관세율;
          } else {
            // 기본세율(A) 찾기
            const basic = item.results.find((r) => r.관세율구분 === "A");
            if (basic && basic.관세율) {
              applicableRateStr = basic.관세율;
            }
          }
        }
        // 그 외 국가에 대한 로직은 비슷하게 추가 가능
        else {
          // 일단 기본세율(A)만 찾는 예시
          const basic = item.results.find((r) => r.관세율구분 === "A");
          if (basic && basic.관세율) {
            applicableRateStr = basic.관세율;
          }
        }
      }

      // 관세율 추출(숫자만)
      const numericDutyRate = parseFloat(applicableRateStr.replace(/[^\d.]/g, "")) || 0;
      // 관세액(= productCifKrw × (관세율/100))
      const productDuty = productCifKrw * (numericDutyRate / 100);

      dutySum += productDuty;
    });

    // 4) 부가세 = (CIF 원화금액 + 관세액) × 10%
    //    여기서 CIF 원화금액은 “모든 제품 합계”가 아니라 “invoiceUsd × cifRatio” 자체,
    //    즉 ‘통합 CIF 금액’을 쓰면 됨
    const vat = (cifInKrw + dutySum) * 0.1;

    setTotalDuty(dutySum);
    setTotalVat(vat);
  };

  /* ---------------------------------------------------------------------
     5. 렌더링
  --------------------------------------------------------------------- */
  return (
    <div className="min-h-screen p-8">
      <h2 className="text-3xl font-bold mb-6">
        1. 적합한 인코텀즈 조건을 선택해주세요.
      </h2>

      {/* 인코텀즈 선택 */}
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

      {/* 인보이스 / 비용 / CIF 계산 */}
      {!selectedTerm && (
        <div className="space-y-4 mt-12">
          <p className="text-lg">
            통관 시 예상세액을 계산할 수 있는 공간입니다.
          </p>
          <p className="text-gray-600">
            위의 조건 중 하나를 선택하여 세액 계산을 시작하세요.
          </p>
        </div>
      )}

      {selectedTerm && (
        <div className="space-y-4 mt-12">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">
              2. 과세표준을 위해 아래 내용을 기입해주세요.
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  인보이스 총 금액 (USD)
                </label>
                <input
                  type="number"
                  value={invoiceUsd === 0 ? "" : invoiceUsd}
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
                  value={krwCosts === 0 ? "" : krwCosts}
                  onChange={handleKrwCostsChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="0"
                />
              </div>
            </div>

            {/* 환율(usdRate) 표시 */}
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

            {/* CIF 계산 결과 */}
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

            {/* 계산하기 버튼 */}
            <div className="mt-6">
              <button
                onClick={handleCalculateCIF}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                CIF 비율 계산
              </button>
            </div>
          </div>

          {/* 제품별 HS CODE 입력 */}
          {cifRatio !== 0 && (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-6">
              <h2 className="text-xl font-semibold mb-4">
                3. 제품의 HS CODE 및 개별 인보이스 금액(USD)을 입력해주세요.
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
                          // 포커스 잃을 때 API 조회
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
                        value={hsItem.productUsd === 0 ? "" : hsItem.productUsd}
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

                  {/* HS CODE 조회 결과 표시 (기본세율/협정세율 등) */}
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
                        return (
                          <div
                            key={String(i)}
                            className={`border p-2 rounded-md ${
                              res.관세율구분 === "A"
                                ? "border-blue-400 bg-blue-50"
                                : "border-gray-200 bg-white"
                            }`}
                          >
                            <p className="text-xs text-gray-700">
                              구분: {dutyName} / 관세율: {res.관세율 || "-"}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              {/* 제품 추가 버튼 */}
              <div className="mt-4 space-x-2">
                <button
                  onClick={addHsCode}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  + 제품 추가
                </button>
              </div>
            </div>
          )}

          {/* 수입 국가 선택 */}
          {cifRatio !== 0 && (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-6">
              <h2 className="text-xl font-semibold mb-4">
                4. 수입 국가를 선택해주세요 (협정세율 반영)
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

          {/* 최종 계산하기 */}
          {cifRatio !== 0 && selectedCountry && (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-6">
              <h2 className="text-xl font-semibold mb-4">5. 관세/부가세 계산</h2>
              <div className="mt-4">
                <button
                  onClick={handleFinalCalculate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  최종 계산하기
                </button>
              </div>

              {totalDuty > 0 && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="font-medium text-yellow-800 mb-1">
                    총 관세액: {Math.round(totalDuty).toLocaleString()} 원
                  </p>
                  <p className="font-medium text-yellow-800 mb-1">
                    총 부가세액: {Math.round(totalVat).toLocaleString()} 원
                  </p>
                  <p className="text-yellow-700 text-sm mt-2">
                    (CIF 원화금액 + 관세액) × 10% = 부가세
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
