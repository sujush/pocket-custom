"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Building2, Phone, Award, Info, Zap, CheckCircle } from "lucide-react";

interface Agent {
  name: string;
  phone: string;
  note: string;
  sponsored?: boolean;
  features?: string[];
}

export default function ElectricalAgentsPage() {
  const [agents] = useState<Agent[]>([
    {
      name: "KC 전기인증센터",
      phone: "02-555-4321",
      note: "전기용품 KC인증 전문기관",
      sponsored: true,
      features: [
        "전기용품 시험 및 검사",
        "대기전력 측정 서비스",
        "안전확인 및 자율안전확인",
        "신속한 인증 진행"
      ]
    },
    {
      name: "전기안전연구소",
      phone: "02-777-8888",
      note: "전기안전 및 KC인증 전문",
      sponsored: true,
      features: [
        "EMC 테스트 보유",
        "전기안전 컨설팅",
        "해외 전기인증 병행",
        "원스톱 인증 서비스"
      ]
    },
    {
      name: "스마트인증센터",
      phone: "031-333-4444",
      note: "소형 전기제품 인증 전문",
    },
    {
      name: "전기제품안전연구소",
      phone: "02-888-9999",
      note: "가정용 전기제품 안전인증",
    },
    {
      name: "KC글로벌인증",
      phone: "070-1234-5555",
      note: "해외 전기제품 KC인증 대행",
    },
    {
      name: "안전테스트연구소",
      phone: "02-444-7777",
      note: "테스트 설비 보유",
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
      <h2 className="text-2xl sm:text-3xl mb-2 font-bold text-gray-800">KC 전기인증 대행업체 조회</h2>
      <p className="mb-6 sm:mb-8 text-gray-600 text-sm sm:text-base">
        신뢰할 수 있는 전기제품 KC인증 대행업체를 확인해보세요.
      </p>

      {/* 프리미엄 파트너 섹션 */}
      <div className="mb-8 sm:mb-12">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Award className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">프리미엄 파트너</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {premiumAgents.map((agent, idx) => (
            <Card key={idx} className="p-4 sm:p-6 hover:shadow-lg transition-shadow border-l-4 border-l-yellow-400">
              <div className="flex items-start justify-between">
                <div className="w-full">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0" />
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
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
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

      {/* 안내 메시지 */}
      <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div className="flex gap-3 items-start">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">KC인증 안내</h4>
            <p className="text-sm text-blue-700">
              전기용품 KC인증은 전기용품 및 생활용품 안전관리법에 의거하여 
              제품의 안전성을 확보하기 위한 제도입니다. 인증대행 업체를 통해 
              효율적으로 인증을 진행하실 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}