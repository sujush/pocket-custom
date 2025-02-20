//app/page.tsx 에 적용

"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search, FileCheck, FileText, Calculator, Box, Phone } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

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
    title: '검사 대행 찾기',
    description: '검사대행 서비스를 이용할 수 있습니다. \n 의뢰인 또는 검사자가 중개인없이 컨택이 가능합니다.',
    icon: Phone,
    color: 'purple',
    link: 'https://www.customs-inspection.net/' //외부링크
  }
];

// MainServiceCard 컴포넌트
const MainServiceCard: React.FC<{ service: { title: string; description: string; icon: React.ElementType; link: string } }> = ({ service }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const handleServiceNavigation = () => {
    console.log('서비스 클릭 시 상태:', {
      isAuthenticated: useAuthStore.getState().isAuthenticated,
      token: useAuthStore.getState().token,
      serviceTitle: service.title,
      currentPath: window.location.pathname
    });

    if (service.title === '관세율 및 수입 요건 확인') {
      const hsCode = "0123456789";
      router.push(`${service.link}/${hsCode}`);
    } else {
      router.push(service.link);
    }
  };

  const handleBulkCheck = () => {
    console.log('대량 조회 클릭  상태:', {
      isAuthenticated: useAuthStore.getState().isAuthenticated,
      token: useAuthStore.getState().token,
      currentPath: window.location.pathname
    });

    router.push('/services/hscode/bulk');
  };

  // 로그인 체크는 ProtectedRoute에서 처리하도록 수정
  const handleClick = () => {
    handleServiceNavigation();
  };

  const handleClickBulkCheck = () => {
    handleBulkCheck();
  };

  return (
    <div className={`${!isAuthenticated ? 'opacity-75' : ''
      } bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg border border-indigo-200 p-6 transform hover:-translate-y-1 hover:scale-105`}>
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

// AdditionalServiceCard 컴포넌트
const AdditionalServiceCard: React.FC<{ service: { title: string; description: string; icon: React.ElementType; link: string; color?: string } }> = ({ service }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const colorClasses = {
    blue: 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-600 text-blue-800 text-blue-700',
    purple: 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 text-purple-600 text-purple-800 text-purple-700'
  };

  const classes = colorClasses[service.color as keyof typeof colorClasses] || colorClasses.blue;
  const [mainDescription, ...contactInfo] = service.description.split('\n');

  const handleServiceNavigation = () => {
    console.log('추가 서비스 클릭 시 상태:', {
      isAuthenticated: useAuthStore.getState().isAuthenticated,
      token: useAuthStore.getState().token,
      serviceTitle: service.title,
      currentPath: window.location.pathname
    });

    if (service.link?.startsWith('http')) {
      window.open(service.link, '_blank');
    } else {
      router.push(service.link);
    }
  };

  const handleClick = () => {
    handleServiceNavigation();
  };

  const renderContactInfo = (info: string[]) => {
    return info.map((line, index) => {
      if (line.includes('이연관세사무소')) {
        return (
          <React.Fragment key={index}>
            <span className="font-bold">{line}</span>
            <br />
          </React.Fragment>
        );
      }
      return (
        <React.Fragment key={index}>
          {line}
          <br />
        </React.Fragment>
      );
    });
  };

  return (
    <div className={`${classes} ${!isAuthenticated ? 'opacity-75' : ''} rounded-lg overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md border p-4 transform hover:-translate-y-1 hover:scale-105`}>
      <service.icon className="h-8 w-8 mb-2" />
      <h2 className="text-lg font-semibold mb-2">{service.title}</h2>
      <p className="text-sm whitespace-pre-line">{mainDescription}</p>
      {contactInfo.length > 0 && (
        <p className="text-base leading-relaxed mt-2">
          {renderContactInfo(contactInfo)}
        </p>
      )}
      {service.link && (
        <button
          onClick={handleClick}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium text-sm"
        >
          자세히 보기
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      )}
    </div>
  );
};// Services 컴포넌트
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
  );
}