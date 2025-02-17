"use client"; // 클라이언트 컴포넌트가 필요하다면 선언
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Search, FileText } from "lucide-react";

export default function RadioCertificationPage() {
  const radioServices = [
    {
      title: "인증제품 확인",
      description: "제품명 또는 모델명으로 인증 이력을 조회하세요",
      icon: Search,
      href: "/services/kc-certification/radio/check-products",
    },
    {
      title: "검사비용 확인",
      description: "전파인증 관련 검사비용 정보를 확인하세요",
      icon: FileText,
      href: "/services/kc-certification/radio/cost-info",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-12 text-gray-800">
          전파인증 정보
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {radioServices.map((svc) => (
            <Link href={svc.href} key={svc.title}>
              <Card className="p-6 hover:scale-105 transition-transform duration-200 cursor-pointer group hover:shadow-lg">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                    <svc.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {svc.title}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {svc.description}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
