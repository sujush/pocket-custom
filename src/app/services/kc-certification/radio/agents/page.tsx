"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Building2, Phone, Award, Star, Info } from "lucide-react";

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

  // 모바일에서 사용할 일반 파트너 카드 컴포넌트
  const RegularAgentCard = ({ agent }: { agent: Agent }) => (
    <Card className="p-4 mb-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <Building2 className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
        <div>
          <h4 className="text-lg font-medium text-gray-800 mb-1">{agent.name}</h4>
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-4 h-4 text-gray-500" />
            <a href={`tel:${agent.phone.replace(/-/g, '')}`} className="text-blue-600 text-sm">
              {agent.phone}
            </a>
          </div>
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">{agent.note}</p>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h2 className="text-2xl sm:text-3xl mb-2 font-bold text-gray-800">인증대행업체 조회</h2>
      <p className="mb-6 sm:mb-8 text-gray-600 text-sm sm:text-base">
        신뢰할 수 있는 전파인증 대행업체를 확인해보세요.
      </p>

      {/* 프리미엄 파트너 섹션 */}
      <div className="mb-8 sm:mb-12">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Award className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">프리미엄 파트너</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {premiumAgents.map((agent, idx) => (
            <Card key={idx} className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="w-full">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <h4 className="text-lg sm:text-xl font-semibold text-gray-800 break-words">{agent.name}</h4>
                  </div>
                  <div className="flex items-center gap-2 mb-4 text-gray-600">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <a href={`tel:${agent.phone.replace(/-/g, '')}`} className="text-blue-600">
                      {agent.phone}
                    </a>
                  </div>
                  <p className="text-gray-700 mb-4 text-sm sm:text-base">{agent.note}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {agent.features?.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-600">{feature}</span>
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
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">인증 대행업체</h3>
        
        {/* 데스크탑용 테이블 */}
        <div className="hidden sm:block bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">업체명</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">전화번호</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">비고</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {regularAgents.map((agent, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-800">{agent.name}</td>
                  <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">
                    <a href={`tel:${agent.phone.replace(/-/g, '')}`} className="text-blue-600">
                      {agent.phone}
                    </a>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">{agent.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* 모바일용 카드 리스트 */}
        <div className="sm:hidden">
          {regularAgents.map((agent, idx) => (
            <RegularAgentCard key={idx} agent={agent} />
          ))}
        </div>
      </div>
    </div>
  );
}