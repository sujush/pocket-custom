"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation"; // Navigation 컴포넌트 임포트

export default function CargoLocation() {
    const [cargoData, setCargoData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [blType, setBlType] = useState("mbl");
    const [blNumber, setBlNumber] = useState("");
    const blYy = "2024";

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
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchCargoInfo();
    };

    const orderedFields = [
        "통관진행상태", "항차", "품명", "양륙항명", "입항일자", "용적", "중량단위", "화물구분", 
        "포장개수", "입항세관", "선박명", "HBL번호", "처리일시", "포워더부호", "총중량", 
        "적재항명", "포워더명", "화물관리번호", "컨테이너번호", "MBL번호", "적출국가코드", 
        "진행상태", "선사항공사", "포장단위"
    ];

    const groupedFields = [];
    for (let i = 0; i < orderedFields.length; i += 3) {
        groupedFields.push(orderedFields.slice(i, i + 3));
    }

    const getSummaryText = () => {
        if (!cargoData) return "";

        const {
            품명 = "N/A",
            통관진행상태 = "N/A",
            포장개수 = "N/A",
            포장단위 = "N/A",
            총중량 = "N/A",
            중량단위 = "N/A",
            용적 = "N/A",
            컨테이너번호 = "N/A",
            입항세관 = "N/A",
            포워더명 = "N/A"
        } = cargoData;

        const firstStorage = cargoData.cargCsclPrgsInfoDtlQryVo?.[0] || {};
        const 장치장명 = firstStorage.장치장명 || "N/A";
        const 처리구분 = firstStorage.처리구분 || "N/A";

        return `${품명} 화물은 현재 ${통관진행상태} 상태에 있으며 ${포장개수}${포장단위}, ${총중량}${중량단위}이고 용적은 ${용적} CBM입니다. ${컨테이너번호} 컨테이너에 적입되어 ${입항세관}의 심사에 따라 통관되었거나 통관될 예정입니다. 현재 위치는 ${장치장명}이며 ${처리구분} 상태입니다. 운송 관련해서는 ${포워더명}에 연락하시기 바랍니다.`;
    };

    return (
        <div className="container mx-auto p-4">
            <Navigation /> {/* 상단 Navigation 추가 */}
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
                    <h2 className="text-xl font-semibold">조회 결과:</h2>
                    <table className="w-full border-collapse border border-gray-300">
                        <tbody>
                            {groupedFields.map((fieldGroup, rowIndex) => (
                                <tr key={rowIndex}>
                                    {fieldGroup.map((field) => (
                                        <td key={field} className="border px-4 py-2 font-semibold">{field}</td>
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
                                            <td className="border px-4 py-2">{item.처리일시}</td>
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
