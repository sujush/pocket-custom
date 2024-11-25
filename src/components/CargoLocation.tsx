"use client";

import Navigation from "@/components/Navigation";
import React, { useState } from "react";

// BL 타입과 화물 타입 정의
type BLType = "mbl" | "hbl";  // Master B/L or House B/L
type CargoType = "fcl" | "lcl";  // FCL or LCL
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

interface ProcessStatus {
    hasImportDeclaration: boolean;
    hasImportInspection: boolean;
    hasImportApproval: boolean;
    hasSecondEntry: boolean;
    hasImportClearance: boolean;
    hasSecondRelease: boolean;
}

interface CargoFormData {
    blType: BLType;
    cargoType: CargoType;
    blNumber: string;
}

export default function CargoLocation() {
    const [cargoData, setCargoData] = useState<CargoData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<CargoFormData>({
        blType: "mbl",
        cargoType: "fcl",
        blNumber: ""
    });
    const blYy = "2024";

    // BL 타입 변경 핸들러
    const handleBLTypeChange = (type: BLType) => {
        setFormData(prev => ({
            ...prev,
            blType: type,
            // Master B/L 선택 시 자동으로 FCL로 설정
            cargoType: type === "mbl" ? "fcl" : prev.cargoType
        }));
    };

    const checkProcessStatus = (data: CargoData, formData: CargoFormData): ProcessStatus => {
        const processStatus = data.cargCsclPrgsInfoDtlQryVo?.map(item => ({
            type: item.처리구분,
            time: item.처리일시
        })) || [];

        // 시간 순서대로 정렬
        const sortedProcess = [...processStatus].sort((a, b) =>
            parseInt(a.time) - parseInt(b.time)
        );

        // 공통 상태 체크
        const hasImportDeclaration = processStatus.some(p => p.type === "수입신고");
        const hasImportInspection = processStatus.some(p => p.type === "수입(사용소비) 심사진행");
        const hasImportApproval = processStatus.some(p => p.type === "수입(사용소비) 결재통보");
        const hasClearance = processStatus.some(p => p.type === "수입신고수리");

        // 화물 타입 결정 (Master B/L은 무조건 FCL)
        const cargoType = formData.blType === "mbl" ? "fcl" : formData.cargoType;

        const isLCL = cargoType === "lcl";
        const hasCustomsTransit = processStatus.some(p =>
            p.type === "보세운송 신고" || p.type === "보세운송 수리"
        );

        // 마지막 수입신고수리와 반출신고 찾기
        const lastClearance = [...sortedProcess]
            .reverse()
            .find(p => p.type === "수입신고수리");
        const lastRelease = [...sortedProcess]
            .reverse()
            .find(p => p.type === "반출신고");

        // 반출완료 상태 체크
        const hasSecondRelease = Boolean(
            lastClearance &&
            lastRelease &&
            parseInt(lastRelease.time) > parseInt(lastClearance.time)
        );

        // 반입신고 횟수 체크
        const entryCount = processStatus.filter(p => p.type === "반입신고").length;
        const hasUnloadingDeclaration = processStatus.some(p => p.type === "하선신고수리");

        // FCL 특별 케이스: 입항전 수입신고
        const isPreEntryCleared = cargoType === "fcl" &&
            lastClearance && !hasUnloadingDeclaration;

        // 반입완료 상태 체크
        const hasSecondEntry = isLCL || hasCustomsTransit ?
            entryCount >= 2 : entryCount >= 1;

        // 수입신고수리 상태 체크
        const hasImportClearance = Boolean(
            (lastClearance && (!lastRelease || parseInt(lastRelease.time) < parseInt(lastClearance.time))) ||
            isPreEntryCleared
        );

        return {
            // 수입신고수리가 있으면 이전 단계는 모두 완료된 것으로 처리
            hasImportDeclaration: hasClearance || hasImportDeclaration,
            hasImportInspection: hasClearance || hasImportInspection,
            hasImportApproval: hasClearance || hasImportApproval,
            hasSecondEntry: hasClearance || hasSecondEntry,
            hasImportClearance,
            hasSecondRelease
        };
    };

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

    // formatDate 함수 추가
    const formatDate = (datetimeStr: string) => {
        if (!datetimeStr) return "N/A";
        return `${datetimeStr.slice(0, 4)}.${datetimeStr.slice(4, 6)}.${datetimeStr.slice(6, 8)} ${datetimeStr.slice(8, 10)}:${datetimeStr.slice(10, 12)}`;
    };

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

    const renderProgressBar = (processStatus: ProcessStatus, formData: CargoFormData) => {
        const cargoType = formData.blType === "mbl" ? "fcl" : formData.cargoType;

        const steps = [
            {
                label: "통관진행",
                completed: processStatus.hasImportDeclaration
            },
            {
                label: "세관심사",
                completed: processStatus.hasImportApproval
            },
            {
                label: cargoType === "fcl" ? "반입신고" : "보세창고반입",
                completed: processStatus.hasSecondEntry
            },
            {
                label: "수입신고수리",
                completed: processStatus.hasImportClearance || processStatus.hasSecondRelease
            },
            {
                label: "반출완료",
                completed: processStatus.hasSecondRelease
            }
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

    const fetchCargoInfo = async () => {
        setLoading(true);
        setError(null);

        try {
            if (!formData.blNumber) {
                setError("B/L 번호를 입력해야 합니다.");
                setLoading(false);
                return;
            }

            const query = formData.blType === "mbl"
                ? `mblNo=${formData.blNumber}&blYy=${blYy}`
                : `hblNo=${formData.blNumber}&blYy=${blYy}`;

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

    // 화물 상태 정보 컴포넌트
    const CargoStatus = ({ data, formData }: { data: CargoData; formData: CargoFormData }) => {
        const processStatus = checkProcessStatus(data, formData);
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
                {renderProgressBar(processStatus, formData)}
            </div>
        );
    };

    return (
        <div className="container mx-auto p-4">
            <Navigation />
            <div className="flex justify-between mb-8">
                <div className="w-1/2 p-4 bg-white shadow-md rounded-lg mr-4">
                    <h1 className="text-2xl font-bold mb-4">화물 위치 및 통관 상태 확인</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <span className="text-gray-700 font-semibold">B/L 종류 선택:</span>
                            <div className="flex items-center mt-2 space-x-4">
                                <label className="mr-4">
                                    <input
                                        type="radio"
                                        name="blType"
                                        value="mbl"
                                        checked={formData.blType === "mbl"}
                                        onChange={() => handleBLTypeChange("mbl")}
                                    />
                                    <span className="ml-2">Master B/L</span>
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="blType"
                                        value="hbl"
                                        checked={formData.blType === "hbl"}
                                        onChange={() => handleBLTypeChange("hbl")}
                                    />
                                    <span className="ml-2">House B/L</span>
                                </label>
                            </div>
                        </div>

                        {formData.blType === "hbl" && (
                            <div className="mb-4">
                                <span className="text-gray-700 font-semibold">화물 구분:</span>
                                <div className="flex items-center mt-2 space-x-4">
                                    <label className="mr-4">
                                        <input
                                            type="radio"
                                            name="cargoType"
                                            value="fcl"
                                            checked={formData.cargoType === "fcl"}
                                            onChange={() => setFormData(prev => ({
                                                ...prev,
                                                cargoType: "fcl"
                                            }))}
                                        />
                                        <span className="ml-2">FCL 화물</span>
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="cargoType"
                                            value="lcl"
                                            checked={formData.cargoType === "lcl"}
                                            onChange={() => setFormData(prev => ({
                                                ...prev,
                                                cargoType: "lcl"
                                            }))}
                                        />
                                        <span className="ml-2">LCL 화물</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        <label className="block mb-2">
                            {formData.blType === "mbl" ? "Master B/L 번호" : "House B/L 번호"}:
                            <input
                                type="text"
                                value={formData.blNumber}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    blNumber: e.target.value
                                }))}
                                className="border p-2 w-full"
                                placeholder={`${formData.blType === "mbl" ? "Master" : "House"} B/L 번호를 입력하세요`}
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
                    <CargoStatus data={cargoData} formData={formData} />
                    <h2 className="text-xl font-semibold">조회 결과:</h2>
                    <table className="w-full border-collapse border border-gray-300">
                        <tbody>
                            {/* 기존 테이블 내용 유지 */}
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