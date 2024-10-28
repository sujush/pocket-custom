"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search, FileCheck, FileText, Calculator, Box, Phone } from 'lucide-react';

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
    title: '수출 인보이스 및 패킹리스트 제작',
    description: '간편하게 인보이스와 패킹리스트를 작성할 수 있습니다. (구독자용)',
    icon: FileText,
    link: '/services/invoice'
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
const MainServiceCard = ({ service }) => {
  const router = useRouter();

  const handleClick = () => {
    // 관세율 조회 코드만 동적 경로를 사용
    if (service.title === '관세율 및 수입 요건 확인') {
      const hsCode = "0123456789"; // 예제. 필요에 따라 동적으로 할당
      router.push(`${service.link}/${hsCode}`);
    } else {
      // 정적 경로로 이동
      router.push(service.link);
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg border border-indigo-200 p-6 transform hover:-translate-y-1 hover:scale-105">
      <div className="flex items-center mb-4">
        <service.icon className="h-8 w-8 text-indigo-600 mr-4" />
        <h2 className="text-xl font-semibold text-indigo-800">{service.title}</h2>
      </div>
      <p className="text-gray-700 mb-4 text-sm">{service.description}</p>
      <button onClick={handleClick} className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium text-sm">
        자세히 보기 <ArrowRight className="ml-2 h-4 w-4" />
      </button>
    </div>
  );
};

// AdditionalServiceCard 컴포넌트
const AdditionalServiceCard = ({ service }) => {
  const colorClasses = {
    blue: 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-600 text-blue-800 text-blue-700',
    purple: 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 text-purple-600 text-purple-800 text-purple-700'
  };

  const classes = colorClasses[service.color];

  // 설명을 두 부분으로 나눔
  const [mainDescription, ...contactInfo] = service.description.split('\n');

  // 링크 처리를 위한 함수
  const handleClick = () => {
    if (service.link?.startsWith('http')) {
      window.open(service.link, '_blank'); // 외부 링크일 경우 새 탭에서 열기
    }
  };

  // 연락처 정보를 렌더링하는 함수
  const renderContactInfo = (info) => {
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
    <div className={`${classes} rounded-lg overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md border p-4 transform hover:-translate-y-1 hover:scale-105`}>
      <service.icon className="h-8 w-8 mb-2" />
      <h2 className="text-lg font-semibold mb-2">{service.title}</h2>
      <p className="text-sm whitespace-pre-line">{mainDescription}</p>
      {contactInfo.length > 0 && (
        <p className="text-base leading-relaxed mt-2">
          {renderContactInfo(contactInfo)}
        </p>
      )}
      {service.link && (
        <Link href={service.link} className={`inline-flex items-center mt-4 ${service.color === 'blue' ? 'text-blue-600 hover:text-blue-700' : 'text-purple-600 hover:text-purple-700'} font-medium text-sm`}>
          자세히 보기 <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      )}
    </div>
  );
};

// Services 컴포넌트
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