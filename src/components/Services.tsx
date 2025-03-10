"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search, FileCheck, FileText, Calculator, Box, Mail, Phone, Globe } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';


// -------------------------------
// 서비스 데이터들
// -------------------------------
const mainServices = [
  {
    title: 'HS CODE 조회',
    description: '제품 정보를 입력하면 HS CODE를 제공합니다.',
    icon: Search,
    link: '/services/hscode'
  },
  {
    title: '관세율 및 수입 요건 확인',
    description: 'HS CODE를 기반으로 관세율, 협정세율, 세관장 확인대상을 확인할 수 있습니다.',
    icon: FileCheck,
    link: '/services/import-requirements/'
  },
  {
    title: '통관 세액 계산',
    description: '통관 시 발생하는 예상 세액을 조회할 수 있습니다',
    icon: FileText,
    link: '/services/tax-calculation'
  }
];

const additionalServices = [
  {
    title: '창고료 확인',
    description: '창고료 예상비용을 확인할 수 있습니다.',
    icon: Calculator,
    color: 'blue',
    link: '/services/WarehouseCost'
  },
  {
    title: '화물 위치 및 통관 상태 확인',
    description: '현재 화물의 위치와 통관 상태를 확인할 수 있습니다',
    icon: Box,
    color: 'blue',
    link: 'cargo-location'
  },
  {
    title: '통관 대행사 : 이연 관세사무소',
    description: '전문적인 통관 서비스를 제공합니다.',
    color: 'blue',
    link: 'https://www.e-yeon.co.kr/', //외부링크
    contactInfo: {
      phone: '032-710-9432',
      email: 'e-yeon@e-yeon.com',
      website: 'e-yeon@e-yeon.co.kr'
    }
  }
];

// -------------------------------
// MainServiceCard
// -------------------------------
const MainServiceCard: React.FC<{
  service: {
    title: string;
    description: string;
    icon: React.ElementType;
    link: string;
  };
}> = ({ service }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const handleServiceNavigation = () => {
    if (service.title === '관세율 및 수입 요건 확인') {
      const hsCode = "0123456789";
      router.push(`${service.link}/${hsCode}`);
    } else {
      router.push(service.link);
    }
  };

  const handleBulkCheck = () => {
    router.push('/services/hscode/bulk');
  };

  const handleClick = () => {
    handleServiceNavigation();
  };

  const handleClickBulkCheck = () => {
    handleBulkCheck();
  };

  return (
    <div
      className={`${
        !isAuthenticated ? 'opacity-75' : ''
      } bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg border border-indigo-200 p-6 transform hover:-translate-y-1 hover:scale-105`}
    >
      <div className="flex items-center mb-4">
        <service.icon className="h-8 w-8 text-indigo-600 mr-4" />
        <h2 className="text-xl font-semibold text-indigo-800">{service.title}</h2>
      </div>
      <p className="text-gray-700 mb-4 text-sm">{service.description}</p>
      <div className="flex items-center">
        <button
          onClick={handleClick}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium text-sm"
        >
          자세히 보기
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>

        {service.title === 'HS CODE 조회' && (
          <>
            <div className="flex-grow"></div>
            <button
              onClick={handleClickBulkCheck}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-bold"
            >
              HS CODE 대량 조회 (★)
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// -------------------------------
// AdditionalServiceCard
// -------------------------------
type AdditionalServiceProps = {
  title: string;
  description?: string;
  icon?: React.ElementType;
  link: string;
  color?: string;
  ImagePath?: string;
  contactInfo?: {
    phone: string;
    email: string;
    website: string;
  };
};

const AdditionalServiceCard: React.FC<{ service: AdditionalServiceProps }> = ({ service }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const colorClasses = {
    blue: 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-600 text-blue-800 text-blue-700',
    purple: 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 text-purple-600 text-purple-800 text-purple-700'
  };

  const classes = colorClasses[service.color as keyof typeof colorClasses] || colorClasses.blue;

  const handleServiceNavigation = () => {
    if (service.link?.startsWith('http')) {
      window.open(service.link, '_blank');
    } else {
      router.push(service.link);
    }
  };

  // 이연 관세사무소 정보 카드 (특별 처리)
  if (service.contactInfo) {
    return (
      <div
        className={`
          ${classes} ${!isAuthenticated ? 'opacity-75' : ''}
          rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg border border-indigo-200 p-6 transform hover:-translate-y-1 hover:scale-105
        `}
      >
        <div className="flex items-center mb-4">
          <div className="bg-indigo-100 rounded-full p-2 mr-4">
            <FileCheck className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="text-xl font-semibold text-indigo-800">{service.title}</h2>
        </div>
        {service.description && (
          <p className="text-gray-700 mb-4 text-sm">{service.description}</p>
        )}
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center">
            <Phone className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-sm">연락처: {service.contactInfo.phone}</span>
          </div>
          <div className="flex items-center">
            <Mail className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-sm">이메일 주소: {service.contactInfo.email}</span>
          </div>
          <div className="flex items-center">
            <Globe className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-sm">홈페이지: {service.contactInfo.website}</span>
          </div>
        </div>
        
        <button
          onClick={handleServiceNavigation}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium text-sm"
        >
          홈페이지 방문하기
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    );
  }

  // 일반 서비스 카드
  return (
    <div
      className={`
        ${classes} ${!isAuthenticated ? 'opacity-75' : ''}
        rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg border border-indigo-200 p-6 transform hover:-translate-y-1 hover:scale-105
      `}
    >
      <div className="flex items-center mb-4">
        {service.icon && <service.icon className="h-8 w-8 text-indigo-600 mr-4" />}
        <h2 className="text-xl font-semibold text-indigo-800">{service.title}</h2>
      </div>
      {service.description && (
        <p className="text-gray-700 mb-4 text-sm">{service.description}</p>
      )}
      {service.link && (
        <button
          onClick={handleServiceNavigation}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium text-sm"
        >
          자세히 보기
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      )}
    </div>
  );
};

// -------------------------------
// Services (메인 컴포넌트)
// -------------------------------
export default function Services() {
  return (
    // =========================================
    // 수정: 모바일(<=md)은 한 열, md 이상 2열
    // =========================================
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* 좌측(메인서비스)는 그대로 */}
      <div className="space-y-8">
        {mainServices.map((service, index) => (
          <MainServiceCard key={index} service={service} />
        ))}
      </div>

      {/* 오른쪽(추가서비스) 반응형 변경 */}
      <div
        className="grid grid-cols-1 gap-8"
      >
        {/* 추가서비스 첫 두 개 */}
        {additionalServices.slice(0, 2).map((service, index) => (
          <AdditionalServiceCard key={index} service={service} />
        ))}

        {/* 마지막 하나(이연관세사무소) */}
        <AdditionalServiceCard service={additionalServices[2]} />
      </div>
    </div>
  );
}