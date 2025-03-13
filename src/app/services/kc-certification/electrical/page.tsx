"use client"; // 클라이언트 컴포넌트가 필요하다면 선언
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Search, Building2, Zap } from "lucide-react";

export default function ElectricalCertificationPage() {
  const electricalServices = [
    {
      title: "KC 인증정보 검색",
      description: "제품명 또는 모델명으로 전기제품 인증 정보를 조회하세요",
      icon: Search,
      href: "/services/kc-certification/electrical/check-products",
    },
    {
      title: "인증대행업체 조회",
      description: "KC 전기인증 대행업체 목록과 연락처를 확인하세요",
      icon: Building2,
      href: "/services/kc-certification/electrical/agents",
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center mb-8">
          <div className="p-3 rounded-full bg-yellow-100 inline-block">
            <Zap className="w-10 h-10 text-yellow-500" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">
          KC 전기인증 정보
        </h1>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          전기용품 및 생활용품 안전관리법에 따른 KC 전기인증 정보를 조회하고 인증대행업체를 찾아보세요.
        </p>
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
            {electricalServices.map((svc) => (
              <Link href={svc.href} key={svc.title} className="flex justify-center">
                <Card className="p-6 hover:scale-105 transition-transform duration-200 cursor-pointer group hover:shadow-lg w-full max-w-md">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 rounded-full bg-yellow-100 group-hover:bg-yellow-200 transition-colors">
                      <svc.icon className="w-8 h-8 text-yellow-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {svc.title}
                    </h2>
                    <p className="text-gray-600 text-sm">{svc.description}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}