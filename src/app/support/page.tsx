import { Card, CardContent } from "@/components/ui/card";
import { Building2, Phone, Mail, Clock } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* 헤더 섹션 */}
      <section className="py-16 bg-gradient-to-r from-sky-100/50 to-pink-100/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-4xl font-bold text-slate-800 text-center mb-4">고객지원</h1>
          <p className="text-lg text-slate-600 text-center">
            수출입 통관에 관한 전문적인 상담을 제공해드립니다.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-3xl py-16">
        {/* 연락처 정보 */}
        <Card className="border-none shadow-lg mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-8">연락처 안내</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Building2 className="w-6 h-6 text-sky-500 mt-1" />
                <div>
                  <h3 className="font-medium text-slate-800 text-lg mb-1">주소</h3>
                  <p className="text-slate-600">
                    인천광역시 연수구 인천타워대로 323 A동 1419호
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Phone className="w-6 h-6 text-sky-500 mt-1" />
                <div>
                  <h3 className="font-medium text-slate-800 text-lg mb-1">전화</h3>
                  <a href="tel:032-710-9432" className="text-slate-600 hover:text-sky-500">
                    032-710-9432
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Mail className="w-6 h-6 text-sky-500 mt-1" />
                <div>
                  <h3 className="font-medium text-slate-800 text-lg mb-1">이메일</h3>
                  <a href="mailto:e-yeon@e-yeon.com" className="text-slate-600 hover:text-sky-500">
                    e-yeon@e-yeon.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Clock className="w-6 h-6 text-sky-500 mt-1" />
                <div>
                  <h3 className="font-medium text-slate-800 text-lg mb-1">운영시간</h3>
                  <div className="text-slate-600 space-y-1">
                    <p>평일: 09:00 - 18:00</p>
                    <p>점심시간: 12:00 - 13:00</p>
                    <p>주말 및 공휴일 휴무</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-r from-sky-50 to-pink-50">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              신속한 상담을 원하시나요?
            </h3>
            <p className="text-slate-600">
              업무 시간 내 전화 상담을 통해 더 자세한 안내를 받으실 수 있습니다.
              전문 관세사가 친절하게 상담해 드리겠습니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}