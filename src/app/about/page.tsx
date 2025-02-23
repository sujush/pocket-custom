import { Card, CardContent } from "@/components/ui/card";
import { Building2, Plane, Ship, Code2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* 히어로 섹션 */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-100/50 to-pink-100/30" />
        <div className="absolute inset-0 bg-[url('/images/wave-pattern.svg')] opacity-10" />
        <div className="container mx-auto px-4 max-w-5xl relative">
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold text-slate-800">이연관세사무소</h1>
            <p className="text-2xl text-slate-600 font-light">
              고객을 이롭게, 이어지는 인연으로
            </p>
          </div>
        </div>
      </section>

      {/* 회사 소개 */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <p className="text-lg text-slate-600 leading-relaxed text-center max-w-3xl mx-auto">
              이연관세사무소는 수출입 통관의 전문성과 디지털 혁신을 결합하여,
              더 쉽고 효율적인 무역 환경을 만들어가고 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* 통합 서비스 영역 */}
      <section className="py-16 bg-gradient-to-r from-sky-50 to-pink-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">서비스 안내</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/80 backdrop-blur border-none transform transition hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Ship className="h-12 w-12 text-sky-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">해상 운송</h3>
                  <p className="text-slate-600">
                    FCL/LCL 통관<br/>
                    실시간 화물 추적<br/>
                    세관장 확인
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur border-none transform transition hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Plane className="h-12 w-12 text-pink-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">항공 운송</h3>
                  <p className="text-slate-600">
                    신속 통관 서비스<br/>
                    특송 화물 처리<br/>
                    운송 추적 관리
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur border-none transform transition hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Code2 className="h-12 w-12 text-sky-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">디지털 서비스</h3>
                  <p className="text-slate-600">
                    HS CODE 조회<br/>
                    관세율 계산<br/>
                    요건 확인
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 연혁 섹션 */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">회사 연혁</h2>
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="min-w-[100px] text-sky-500 font-semibold">2023 - 현재</div>
                <div className="space-y-2">
                  <h3 className="font-medium text-slate-800">자체 개발 플랫폼 운영</h3>
                  <p className="text-slate-600">• AWS 기반 통관 플랫폼 개발 및 운영</p>
                  <p className="text-slate-600">• OCR 기술 활용 통관 서류 자동화 시스템 구축</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="min-w-[100px] text-sky-500 font-semibold">2020 - 2022</div>
                <div className="space-y-2">
                  <h3 className="font-medium text-slate-800">컨설팅 서비스 확장</h3>
                  <p className="text-slate-600">• AEO 인증 컨설팅 서비스 개시</p>
                  <p className="text-slate-600">• 수입식품 등 전문 분야 컨설팅 확대</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="min-w-[100px] text-sky-500 font-semibold">2018</div>
                <div className="space-y-2">
                  <h3 className="font-medium text-slate-800">회사 설립</h3>
                  <p className="text-slate-600">• 이연관세사무소 설립</p>
                  <p className="text-slate-600">• 통관 및 무역 컨설팅 서비스 시작</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 연락처 */}
      <section className="py-16 bg-gradient-to-r from-sky-50 to-pink-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-white/80 backdrop-blur rounded-2xl p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-slate-800 text-center mb-8">Contact Us</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Building2 className="w-5 h-5 text-sky-500" />
                  <span className="text-slate-600">
                    인천광역시 연수구 인천타워대로 323 A동 1419호
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <a href="tel:032-710-9432" className="text-slate-600 hover:text-sky-500">
                    Tel: 032-710-9432
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <a href="mailto:e-yeon@e-yeon.com" className="text-slate-600 hover:text-sky-500">
                    Email: e-yeon@e-yeon.com
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <a href="https://www.e-yeon.co.kr" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="text-slate-600 hover:text-sky-500">
                    Website: www.e-yeon.co.kr
                  </a>
                </div>
              </div>
              <div className="bg-gradient-to-br from-sky-50 to-pink-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-slate-800 mb-4">
                  신속한 상담을 원하시나요?
                </h3>
                <p className="text-slate-600">
                  업무 시간 내 전화 상담을 통해 더 자세한 안내를 받으실 수 있습니다.
                  친절하게 상담해 드리겠습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}