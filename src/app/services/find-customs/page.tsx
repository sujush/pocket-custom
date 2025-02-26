"use client";

import { useState } from "react";

export default function FindCustoms() {
    const [postalCode, setPostalCode] = useState("");
    const [customsData, setCustomsData] = useState<{ customsCode: string; customsName: string }[]>([]);
    const [error, setError] = useState("");

    const handleSearch = async () => {
        setError("");
        setCustomsData([]);

        if (postalCode.length !== 6) {
            setError("우편번호는 6자리여야 합니다.");
            return;
        }

        try {
            const response = await fetch(`/api/find-customs?postalCode=${postalCode}`);
            const data = await response.json();

            if (response.ok) {
                setCustomsData(data.data);
            } else {
                setError(data.error || "검색 중 오류 발생");
            }
        } catch {
            setError("네트워크 오류");
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 bg-white shadow-lg rounded-lg">
            <h2 className="text-xl font-semibold mb-4">우편번호로 관할 세관 조회</h2>
            <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="border p-2 rounded w-full mb-2"
                placeholder="우편번호 입력 (예: 31718)"
            />
            <button
                onClick={handleSearch}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
            >
                조회하기
            </button>

            {error && <p className="text-red-500 mt-2">{error}</p>}

            {customsData.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold">조회 결과</h3>
                    <ul className="list-disc list-inside">
                        {customsData.map((customs, index) => (
                            <li key={index}>
                                <strong>{customs.customsCode}</strong>: {customs.customsName}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
