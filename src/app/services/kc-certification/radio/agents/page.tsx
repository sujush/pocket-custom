"use client";

import { useState } from "react";

// 인증대행업체 인터페이스 예시
interface Agent {
  name: string;      // 업체명
  phone: string;     // 전화번호
  note: string;      // 비고
  sponsored?: boolean; // 광고/스폰 여부
}

export default function AgentsPage() {
  // 예시 데이터
  const [agents] = useState<Agent[]>([
    // 가장 위에 따로 표시할 광고 스폰서, sponsored: true
    {
      name: "VIP 전파인증센터",
      phone: "02-1234-5678",
      note: "가장 먼저 보이게 하고 싶은 스폰서 업체",
      sponsored: true,
    },
    // 일반 업체들
    {
      name: "ABC 인증대행",
      phone: "031-222-3333",
      note: "소규모 전파인증 전문",
    },
    {
      name: "한국인증컨설팅",
      phone: "02-555-7777",
      note: "테스트랩 보유",
    },
    {
      name: "글로벌 전파센터",
      phone: "070-9999-8888",
      note: "해외 인증도 함께 진행",
    },
  ]);

  // 스폰서 업체를 먼저, 일반 업체는 그 다음으로
  // (sort 로직: sponsored = true를 최우선)
  const sortedAgents = [...agents].sort((a, b) =>
    (b.sponsored ? 1 : 0) - (a.sponsored ? 1 : 0)
  );

  return (
    <div className="p-8">
      <h2 className="text-2xl mb-4 font-bold">인증대행업체 조회</h2>
      <p className="mb-6">
        전파인증을 대행해주는 업체의 정보를 확인해보세요.
      </p>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">업체명</th>
              <th className="border px-4 py-2">전화번호</th>
              <th className="border px-4 py-2">비고</th>
            </tr>
          </thead>
          <tbody>
            {sortedAgents.map((agent, idx) => (
              <tr key={idx} className={agent.sponsored ? "bg-yellow-50" : ""}>
                <td className="border px-4 py-2 font-semibold">
                  {agent.name}
                  {agent.sponsored && (
                    <span className="ml-2 text-red-500 text-sm font-bold">
                      [광고]
                    </span>
                  )}
                </td>
                <td className="border px-4 py-2">{agent.phone}</td>
                <td className="border px-4 py-2">{agent.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
