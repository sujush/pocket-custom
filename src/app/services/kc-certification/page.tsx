import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Zap, Radio } from "lucide-react";

export default function CertificationPage() {
  const certifications = [
    {
      title: "전기인증",
      description: "KC 인증 중 전기인증 제품의 인증 현황 및 대행업체 조회",
      icon: Zap,
      href: "/services/kc-certification/electrical",
    },
    {
      title: "전파인증",
      description: "KC 인증 중 전파인증 제품의 인증현황 및 대행업체 조회",
      icon: Radio,        
      href: "/services/kc-certification/radio",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-12 text-gray-800">
          KC 인증 대상 및 대행업체 확인
        </h1>
        
        {/* 중앙 정렬된 플렉스 컨테이너 */}
        <div className="flex justify-center">
          <div className="flex flex-col md:flex-row gap-6 max-w-3xl">
            {certifications.map((cert) => (
              <Link href={cert.href} key={cert.title} className="w-full md:w-1/2">
                <Card className="p-6 hover:scale-105 transition-transform duration-200 cursor-pointer group hover:shadow-lg h-full">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                      <cert.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {cert.title}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {cert.description}
                    </p>
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