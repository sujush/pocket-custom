import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Zap, Radio, Baby, TestTube } from "lucide-react";

export default function CertificationPage() {
  const certifications = [
    {
      title: "전기인증",
      description: "전기 제품의 안전성을 검증하는 인증",
      icon: Zap,
      href: "/services/kc-certification/electrical",
    },
    {
      title: "전파인증",
      description: "전파 관련 제품의 적합성을 검증하는 인증",
      icon: Radio,
      href: "/services/kc-certification/radio",
    },
    {
      title: "어린이제품인증",
      description: "어린이용 제품의 안전성을 검증하는 인증",
      icon: Baby,
      href: "/services/kc-certification/children",
    },
    {
      title: "생활화학제품인증",
      description: "생활화학제품의 안전성을 검증하는 인증",
      icon: TestTube,
      href: "/services/kc-certification/chemical",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-12 text-gray-800">
          KC 인증 서비스
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {certifications.map((cert) => (
            <Link href={cert.href} key={cert.title}>
              <Card className="p-6 hover:scale-105 transition-transform duration-200 cursor-pointer group hover:shadow-lg">
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
  );
}