import React from 'react'
import Link from 'next/link'
import { ArrowRight, Search, FileCheck, FileText, Calculator, Truck, Phone } from 'lucide-react'

const mainServices = [
  { 
    title: 'HS CODE 조회', 
    description: '제품 정보를 입력하면 정확한 HS CODE를 제공합니다.',
    icon: Search,
    link: '/services/hscode'
  },
  { 
    title: '수입 요건 확인', 
    description: 'HS CODE를 기반으로 관세율, 협정세율, 세관장 확인대상을 확인할 수 있습니다.',
    icon: FileCheck,
    link: '/services/import-requirements'
  },
  { 
    title: '인보이스 및 패킹리스트 제작', 
    description: '간편하게 인보이스와 패킹리스트를 작성할 수 있습니다.',
    icon: FileText,
    link: '/services/invoice'
  }
];

const additionalServices = [
  { title: 'CBM 계산기', description: 'CBM을 계산해드립니다.', icon: Calculator, color: 'blue' },
  { title: '화물추적', description: '내 화물이 현재 어디에 있는지 확인해드립니다.', icon: Truck, color: 'blue' },
  { title: '전문가 상담', description: '보다 자세한 상담을 받아보세요', icon: Phone, color: 'purple' }
];

const MainServiceCard = ({ service }) => (
  <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg border border-indigo-200 p-6">
    <div className="flex items-center mb-4">
      <service.icon className="h-8 w-8 text-indigo-600 mr-4" />
      <h2 className="text-xl font-semibold text-indigo-800">{service.title}</h2>
    </div>
    <p className="text-gray-700 mb-4 text-sm">{service.description}</p>
    <Link href={service.link} className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium text-sm">
      자세히 보기 <ArrowRight className="ml-2 h-4 w-4" />
    </Link>
  </div>
)

const AdditionalServiceCard = ({ service }) => {
  const colorClasses = {
    blue: 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-600 text-blue-800 text-blue-700',
    purple: 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 text-purple-600 text-purple-800 text-purple-700'
  }

  const classes = colorClasses[service.color]

  return (
    <div className={`${classes} rounded-lg overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md border p-4`}>
      <service.icon className="h-8 w-8 mb-2" />
      <h2 className="text-lg font-semibold mb-2">{service.title}</h2>
      <p className="text-sm">{service.description}</p>
    </div>
  )
}

export default function Services() {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-8">
        {mainServices.map((service, index) => (
          <MainServiceCard key={index} service={service} />
        ))}
      </div>
      <div className="grid grid-rows-2 gap-4">
        <div className="grid grid-cols-2 gap-4">
          {additionalServices.slice(0, 2).map((service, index) => (
            <AdditionalServiceCard key={index} service={service} />
          ))}
        </div>
        <AdditionalServiceCard service={additionalServices[2]} />
      </div>
    </div>
  )
}