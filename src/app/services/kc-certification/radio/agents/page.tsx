"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Building2, Phone, Award, Star } from "lucide-react";

interface Agent {
  name: string;
  phone: string;
  note: string;
  sponsored?: boolean;
  features?: string[];
}

export default function AgentsPage() {
  const [agents] = useState<Agent[]>([
    {
      name: "VIP 전파인증센터",
      phone: "02-1234-5678",
      note: "대한민국 최고의 전파인증 전문기관",
      sponsored: true,
      features: [
        "24시간 신속 상담",
        "전문 테스트랩 보유",
        "해외인증 원스톱 진행",
        "100% 책임 인증"
      ]
    },
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

  const premiumAgents = agents.filter(agent => agent.sponsored);
  const regularAgents = agents.filter(agent => !agent.sponsored);

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h2 className="text-3xl mb-2 font-bold text-gray-800">인증대행업체 조회</h2>
      <p className="mb-8 text-gray-600">
        신뢰할 수 있는 전파인증 대행업체를 확인해보세요.
      </p>

      {/* 프리미엄 파트너 섹션 */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Award className="w-6 h-6 text-blue-600" />
          <h3 className="text-2xl font-semibold text-gray-800">프리미엄 파트너</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {premiumAgents.map((agent, idx) => (
            <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <h4 className="text-xl font-semibold text-gray-800">{agent.name}</h4>
                  </div>
                  <div className="flex items-center gap-2 mb-4 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{agent.phone}</span>
                  </div>
                  <p className="text-gray-700 mb-4">{agent.note}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {agent.features?.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 일반 파트너 섹션 */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-800">인증 대행업체</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">업체명</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">전화번호</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">비고</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {regularAgents.map((agent, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{agent.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{agent.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{agent.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}