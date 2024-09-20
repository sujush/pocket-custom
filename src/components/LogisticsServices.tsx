import React from 'react'
import Link from 'next/link'
import { ArrowRight, Truck, Ship, Plane, BarChart } from 'lucide-react'

const logisticsServices = [
  {
    title: '해상 운송',
    description: 'FCL, LCL 등 다양한 해상 운송 서비스를 제공합니다.',
    icon: Ship
  },
  {
    title: '항공 운송',
    description: '신속하고 안전한 항공 운송 서비스를 제공합니다.',
    icon: Plane
  },
  {
    title: '내륙 운송',
    description: '트럭을 이용한 효율적인 내륙 운송 서비스를 제공합니다.',
    icon: Truck
  },
  {
    title: '물류 분석',
    description: '데이터 기반의 물류 분석 및 최적화 서비스를 제공합니다.',
    icon: BarChart
  }
];

const LogisticsServiceCard = ({ service }) => (
  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg border border-green-200 p-6">
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

export default function LogisticsServices() {
  return (
    <div className="mt-12">
      <hr className="border-t border-gray-300 mb-12" />
      <div className="grid grid-cols-2 gap-8">
        {logisticsServices.map((service, index) => (
          <LogisticsServiceCard key={index} service={service} />
        ))}
      </div>
    </div>
  )
}