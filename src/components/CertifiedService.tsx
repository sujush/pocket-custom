import React from 'react'
import Link from 'next/link'
import { ArrowRight, Rocket, Utensils, Laptop, ScrollText } from 'lucide-react'

const CertifiedServices = [
  {
    title: '수입식품 검사',
    description: '농산물 , 가공식품, 기구용기 등 검사비용 및 한글표시사항을 확인할 수 있습니다 ',
    icon: Utensils
  },
  {
    title: 'KC인증',
    description: 'KC인증대상 및 KC인증 방법과 비용을 확인할 수 있습니다.',
    icon: Laptop
  },
  {
    title: '전략물자 확인',
    description: '수출물품의 전략물자 여부를 확인할 수 있습니다',
    icon: Rocket
  },
  {
    title: '원산지증명서 및 인증수출자',
    description: '수출물품의 원산지증명서 발급방법 등을 확인할 수 있습니다',
    icon: ScrollText
  }
];

const CertifiedServiceCard: React.FC<{ service: any }> = ({ service }) => (
  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg border border-green-200 p-6 transform hover:-translate-y-1 hover:scale-105">
    <div className="flex items-center mb-4">
      <service.icon className="h-8 w-8 text-green-600 mr-4" />
      <h2 className="text-xl font-semibold text-green-800">{service.title}</h2>
    </div>
    <p className="text-green-700 mb-4 text-sm">{service.description}</p>
    <Link href="/logistics-services" className="inline-flex items-center text-green-600 hover:text-green-700 font-medium text-sm">
      자세히 보기 <ArrowRight className="ml-2 h-4 w-4" />
    </Link>
  </div>
)

export default function CertifiedService() { // 함수 이름 변경
  return (
    <div className="mt-12">
      <hr className="border-t border-gray-300 mb-12" />
      <div className="grid grid-cols-2 gap-8">
        {CertifiedServices.map((service, index) => (
          <CertifiedServiceCard key={index} service={service} />
        ))}
      </div>
    </div>
  )
}
