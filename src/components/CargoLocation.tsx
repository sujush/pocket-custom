"use client";

import Navigation from "@/components/Navigation";
import { Item } from "aws-sdk/clients/simpledb";
import React, { useState } from "react";

// 화물 반출 상태 타입 정의
type ReleaseStatus = "반출불가" | "반출불가-세관심사통과" | "반출가능" | "반출완료";

interface CargoData {
    cargCsclPrgsInfoDtlQryVo?: Array<{
        장치장명: string;
        처리일시: string;
        중량: number;
        중량단위: string;
        포장개수: number;
        처리구분: string;
        포장단위: string;
        장치장부호: string;
    }>;
    품명?: string;
    통관진행상태?: string;
    총중량?: number;
    중량단위?: string;
    용적?: number;
    컨테이너번호?: string;
    입항세관?: string;
    포워더명?: string;
}

// 화물 진행 상태 인터페이스 추가
interface ProcessStatus {
    hasImportDeclaration: boolean;
    hasImportInspection: boolean;
    hasImportApproval: boolean;
    hasSecondEntry: boolean;
    hasImportClearance: boolean;
    hasSecondRelease: boolean;
}

export default function CargoLocation() {
    const [cargoData, setCargoData] = useState<CargoData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [blType, setBlType] = useState("mbl");
    const [blNumber, setBlNumber] = useState("");
    const blYy = "2024";

    // 처리구분 기반 진행 상태 확인 함수
    const checkProcessStatus = (data: CargoData): ProcessStatus => {
        const processStatus = data.cargCsclPrgsInfoDtlQryVo?.map(item => item.처리구분) || [];
        
        // 수정 시작
        const clearanceIndex = processStatus.indexOf("수입신고수리");
        const releaseIndex = processStatus.lastIndexOf("반출신고");
        const hasSecondRelease = clearanceIndex !== -1 && 
                                releaseIndex !== -1 && 
                                releaseIndex > clearanceIndex;
        // 수정 끝
        
        return {
            hasImportDeclaration: processStatus.includes("수입신고"),
            hasImportInspection: processStatus.includes("수입(사용소비) 심사진행"),
            hasImportApproval: processStatus.includes("수입(사용소비) 결재통보"),
            hasSecondEntry: processStatus.includes("반입신고") && 
                processStatus.filter(status => status === "반입신고").length >= 2,
            hasImportClearance: processStatus.includes("수입신고수리"),
            hasSecondRelease
        };
    };

    // 화물 반출 상태 판단 함수
    const determineReleaseStatus = (processStatus: ProcessStatus): ReleaseStatus => {
        const {
            hasImportApproval,
            hasSecondEntry,
            hasImportClearance,
            hasSecondRelease
        } = processStatus;

        if (hasSecondRelease) {
            return "반출완료";
        }

        if (hasImportClearance && hasSecondEntry) {
            return "반출가능";
        }

        if (hasImportApproval) {
            return "반출불가-세관심사통과";
        }

        return "반출불가";
    };

    // 상태별 설명 텍스트 반환 함수
    const getStatusDescription = (status: ReleaseStatus, processStatus: ProcessStatus): string => {
        switch (status) {
            case "반출불가":
                return "현재 통관 절차가 진행 중입니다.";
            case "반출불가-세관심사통과":
                return processStatus.hasSecondEntry
                    ? "세관 심사는 완료되었으나, 관세/부가세 납부가 필요합니다."
                    : "세관 심사는 완료되었으나, 관세/부가세 납부 및 보세창고 반입이 필요합니다.";
            case "반출가능":
                return "화물 수령이 가능합니다. 당일 또는 영업일 기준 최대 2일 내 수령 가능합니다.";
            case "반출완료":
                return "화물이 반출 완료되었습니다.";
        }
    };

    // 상태별 아이콘 반환 함수
    const getStatusIcon = (status: ReleaseStatus): string => {
        switch (status) {
            case "반출불가":
                return "🔴";
            case "반출불가-세관심사통과":
                return "🟡";
            case "반출가능":
                return "🟢";
            case "반출완료":
                return "✅";
        }
    };

    // 진행 상태 표시줄 렌더링 함수
    const renderProgressBar = (processStatus: ProcessStatus) => {
        const steps = [
            { label: "통관진행", completed: processStatus.hasImportDeclaration },
            { label: "세관심사", completed: processStatus.hasImportApproval },
            { label: "보세창고반입", completed: processStatus.hasSecondEntry },
            { label: "수입신고수리", completed: processStatus.hasImportClearance },
            { label: "반출완료", completed: processStatus.hasSecondRelease }
        ];

        return (
            <div className="mt-4 mb-6">
                <div className="flex justify-between items-center">
                    {steps.map((step, index) => (
                        <React.Fragment key={index}>
                            <div className="flex flex-col items-center">
                                <div className={`w-6 h-6 rounded-full ${step.completed ? 'bg-blue-500' : 'bg-gray-300'} mb-2`}></div>
                                <span className="text-sm">{step.label}</span>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`flex-1 h-1 mx-2 ${step.completed ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        );
    };

    const fetchCargoInfo = async () => {
        setLoading(true);
        setError(null);

        try {
            if (!blNumber) {
                setError("BL 번호를 입력해야 합니다.");
                setLoading(false);
                return;
            }

            const query = blType === "mbl" ? `mblNo=${blNumber}&blYy=${blYy}` : `hblNo=${blNumber}&blYy=${blYy}`;
            const response = await fetch(`/api/proxy-cargo?${query}`);

            if (!response.ok) {
                throw new Error("데이터를 가져오지 못했습니다.");
            }

            const data = await response.json();
            setCargoData(data);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("알 수 없는 오류가 발생했습니다.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        fetchCargoInfo();
    };

    const getSummaryText = () => {
        if (!cargoData) return "";

        const {
            품명 = "N/A",
            통관진행상태 = "N/A",
            총중량 = "N/A",
            중량단위 = "N/A",
            용적 = "N/A",
            컨테이너번호 = "N/A",
            입항세관 = "N/A",
            포워더명 = "N/A",
            cargCsclPrgsInfoDtlQryVo = []
        } = cargoData;

        const firstStorage = cargCsclPrgsInfoDtlQryVo[0] || {};
        const 장치장명 = firstStorage.장치장명 || "N/A";
        const 처리구분 = firstStorage.처리구분 || "N/A";

        return `${품명} 화물은 현재 ${통관진행상태} 상태에 있으며 ${총중량}${중량단위}, ${용적} CBM입니다. ${컨테이너번호} 컨테이너에 적입되어 ${입항세관}에서 처리됩니다. 현재 위치는 ${장치장명}이며 ${처리구분} 상태입니다. 운송 관련해서는 ${포워더명}에 연락하시기 바랍니다.`;
    };

    // 화물 상태 정보 컴포넌트
    const CargoStatus = ({ data }: { data: CargoData }) => {
        const processStatus = checkProcessStatus(data);
        const releaseStatus = determineReleaseStatus(processStatus);
        const description = getStatusDescription(releaseStatus, processStatus);
        const icon = getStatusIcon(releaseStatus);

        return (
            <div className="mb-6 p-4 border rounded-lg bg-white shadow-sm">
                <div className="flex items-center mb-4">
                    <span className="text-2xl mr-2">{icon}</span>
                    <h3 className="text-xl font-semibold">{releaseStatus}</h3>
                </div>
                <p className="text-gray-700">{description}</p>
                {renderProgressBar(processStatus)}
            </div>
        );
    };

    const orderedFields = [
        { key: "통관진행상태", label: "통관진행상태" },
        { key: "항차", label: "항차" },
        { key: "품명", label: "품명" },
        { key: "양륙항명", label: "양륙항명" },
        { key: "입항일자", label: "입항일자" },
        { key: "용적", label: "용적" },
        { key: "중량단위", label: "중량단위" },
        { key: "화물구분", label: "화물구분" },
        { key: "포장개수", label: "포장개수" },
        { key: "입항세관", label: "입항세관" },
        { key: "선박명", label: "선박명" },
        { key: "HBL번호", label: "HBL번호" },
        { key: "처리일시", label: "처리일시" },
        { key: "포워더부호", label: "포워더부호" },
        { key: "총중량", label: "총중량" },
        { key: "적재항명", label: "적재항명" },
        { key: "포워더명", label: "포워더명" },
        { key: "화물관리번호", label: "화물관리번호" },
        { key: "컨테이너번호", label: "컨테이너번호" },
        { key: "MBL번호", label: "MBL번호" },
        { key: "적출국가코드", label: "적출국가코드" },
        { key: "진행상태", label: "진행상태" },
        { key: "선사항공사", label: "선사항공사" },
        { key: "포장단위", label: "포장단위" }
    ];

    const groupedFields = [];
    for (let i = 0; i < orderedFields.length; i += 3) {
        groupedFields.push(orderedFields.slice(i, i + 3));
    }

    const formatDate = (datetimeStr: string) => {
        if (!datetimeStr) return "N/A";
        return `${datetimeStr.slice(0, 4)}.${datetimeStr.slice(4, 6)}.${datetimeStr.slice(6, 8)} ${datetimeStr.slice(8, 10)}:${datetimeStr.slice(10, 12)}`;
    };

    return (
        <div className="container mx-auto p-4">
            <Navigation />
            <div className="flex justify-between mb-8">
                <div className="w-1/2 p-4 bg-white shadow-md rounded-lg mr-4">
                    <h1 className="text-2xl font-bold mb-4">화물 위치 및 통관 상태 확인</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <span className="text-gray-700 font-semibold">BL 종류 선택:</span>
                            <div className="flex items-center mt-2 space-x-4">
                                <label className="mr-4">
                                    <input
                                        type="radio"
                                        name="blType"
                                        value="mbl"
                                        checked={blType === "mbl"}
                                        onChange={(e) => setBlType(e.target.value)}
                                    />
                                    <span className="ml-2">FCL 화물</span>
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="blType"
                                        value="hbl"
                                        checked={blType === "hbl"}
                                        onChange={(e) => setBlType(e.target.value)}
                                    />
                                    <span className="ml-2">LCL 화물</span>
                                </label>
                            </div>
                        </div>

                        <label className="block mb-2">
                            {blType === "mbl" ? "Master B/L 번호" : "House B/L 번호"}:
                            <input
                                type="text"
                                value={blNumber}
                                onChange={(e) => setBlNumber(e.target.value)}
                                className="border p-2 w-full"
                                placeholder={`${blType === "mbl" ? "Master" : "House"} B/L 번호를 입력하세요`}
                                required
                            />
                        </label>

                        <button
                            type="submit"
                            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mt-4"
                        >
                            조회
                        </button>
                    </form>
                </div>

                <div className="w-1/2 p-4 bg-gray-50 shadow-md rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">요약 정보</h2>
                    <p className="text-gray-700">{getSummaryText()}</p>
                </div>
            </div>

            {loading && <p>데이터를 불러오는 중입니다...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {cargoData && (
                <div>
                    <CargoStatus data={cargoData} />
                    <h2 className="text-xl font-semibold">조회 결과:</h2>
                    <table className="w-full border-collapse border border-gray-300">
                        <tbody>
                            {groupedFields.map((fieldGroup, rowIndex) => (
                                <tr key={rowIndex}>
                                    {fieldGroup.map(({ key, label }) => (
                                        <React.Fragment key={key}>
                                            <td className="border px-4 py-2 font-semibold">{label}</td>
                                            <td className="border px-4 py-2">
                                                {Array.isArray(cargoData[key as keyof CargoData]) ? (
                                                    (cargoData[key as keyof CargoData] as unknown as Array<Item>).map((item, idx) => (
                                                        <div key={idx}>{JSON.stringify(item)}</div>
                                                    ))
                                                ) : (
                                                    (typeof cargoData[key as keyof CargoData] === 'string' ||
                                                        typeof cargoData[key as keyof CargoData] === 'number' ||
                                                        cargoData[key as keyof CargoData] === null) ? (
                                                        cargoData[key as keyof CargoData] as React.ReactNode
                                                    ) : null
                                                )}
                                            </td>
                                        </React.Fragment>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {cargoData.cargCsclPrgsInfoDtlQryVo && (
                        <>
                            <h3 className="text-xl font-semibold mt-4">장치장 정보</h3>
                            <table className="w-full border-collapse border border-gray-300 mt-4">
                                <thead>
                                    <tr>
                                        <th className="border px-4 py-2">장치장명</th>
                                        <th className="border px-4 py-2">처리일시</th>
                                        <th className="border px-4 py-2">중량</th>
                                        <th className="border px-4 py-2">중량단위</th>
                                        <th className="border px-4 py-2">포장개수</th>
                                        <th className="border px-4 py-2">처리구분</th>
                                        <th className="border px-4 py-2">포장단위</th>
                                        <th className="border px-4 py-2">장치장부호</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cargoData.cargCsclPrgsInfoDtlQryVo.map((item, index) => (
                                        <tr key={index}>
                                            <td className="border px-4 py-2">{item.장치장명}</td>
                                            <td className="border px-4 py-2">{formatDate(item.처리일시)}</td>
                                            <td className="border px-4 py-2">{item.중량}</td>
                                            <td className="border px-4 py-2">{item.중량단위}</td>
                                            <td className="border px-4 py-2">{item.포장개수}</td>
                                            <td className="border px-4 py-2">{item.처리구분}</td>
                                            <td className="border px-4 py-2">{item.포장단위}</td>
                                            <td className="border px-4 py-2">{item.장치장부호}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}