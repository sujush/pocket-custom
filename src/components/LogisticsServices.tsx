"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Truck, 
  Package, 
  Ship, 
  MapPin,
  ArrowRight 
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

// 물류서비스 항목들
const logisticsServices = [
  {
    title: '중국 LCL 물류비용 계산',
    description: '알리바바, 1688 등에서 사입하는 LCL 화물에 대한 물류 예상비용을 확인할 수 있습니다',
    icon: Package,
    link: '/services/lcl-calculator'
  },
  {
    title: '배송대행지 찾기',
    description: '해외 구매대행 및 배송서비스를 제공하는 업체 정보를 찾아보세요.',
    icon: MapPin,
    link: '/services/delivery-agents'
  },
  {
    title: '포워더 찾기',
    description: '신뢰할 수 있는 화물 포워더를 찾아보세요.',
    icon: Ship,
    link: '/services/find-forwarder'
  },
  {
    title: '내륙운송사 찾기',
    description: '저렴하고 신속한 내륙운송사를 지역별로 검색해보세요.',
    icon: Truck,
    link: '/services/find-inland-transporter'
  }
];

// 개별 카드
const ServiceCard: React.FC<{
  service: {
    title: string;
    description: string;
    icon: React.ElementType;
    link: string;
  };
}> = ({ service }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const handleClick = () => {
    console.log('Service clicked:', {
      isAuthenticated: useAuthStore.getState().isAuthenticated,
      token: useAuthStore.getState().token,
      serviceTitle: service.title,
      currentPath: window.location.pathname
    });
    router.push(service.link);
  };

  return (
    <div
      className={`
        ${!isAuthenticated ? 'opacity-75' : ''}
        bg-gradient-to-r from-blue-50 to-blue-100
        rounded-lg overflow-hidden shadow-md
        transition-all duration-300 hover:shadow-lg
        border border-blue-200 p-6
        transform hover:-translate-y-1 hover:scale-105
      `}
    >
      <div className="flex items-center mb-4">
        <service.icon className="h-8 w-8 text-indigo-600 mr-4" />
        <h2 className="text-xl font-semibold text-blue-800">{service.title}</h2>
      </div>
      <p className="text-gray-700 mb-4 text-sm">{service.description}</p>
      <button
        onClick={handleClick}
        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
      >
        자세히 보기
        <ArrowRight className="ml-2 h-4 w-4" />
      </button>
    </div>
  );
};

// 메인 컴포넌트
export default function LogisticsServices() {
  return (
    <div className="my-16">
      {/* 원하는 제목이 있으면 여기에 표시 */}
      <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
        {/* 예: 물류서비스 */}
      </h2>

      {/* 
        수정 포인트:
        - grid-cols-2 -> grid-cols-1 md:grid-cols-2
        - 좁은 화면: 1열
        - 중간 이상: 2열 
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {logisticsServices.map((service, index) => (
          <ServiceCard key={index} service={service} />
        ))}
      </div>
    </div>
  );
}
