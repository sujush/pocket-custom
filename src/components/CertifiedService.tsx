'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Calculator, 
  RefreshCw, 
  Shield,
  ArrowRight 
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

const exporterServices = [
  {
    title: '인보이스 및 패킹리스트 자동 작성',
    description: '무역 서류 작성을 자동화하여 시간을 절약하고 오류를 방지합니다.',
    icon: FileText,
    link: '/services/auto-documents'
  },
  {
    title: '간이정액환급액 계산',
    description: '수출물품에 대한 간이정액환급액을 신속하게 계산할 수 있습니다.',
    icon: Calculator,
    link: '/services/refund-calculator'
  },
  {
    title: '선ㆍ기적 확인 및 재수출이행 확인',
    description: '수입물품의 선적 기일과 재수출 이행 여부를 확인할 수 있습니다.',
    icon: RefreshCw,
    link: '/services/export-verification'
  },
  {
    title: '전략물자 여부 확인',
    description: '수출입 물품의 전략물자 해당 여부를 검토할 수 있습니다.',
    icon: Shield,
    link: '/services/strategic-items'
  }
];

const ExporterServiceCard: React.FC<{
  service: {
    title: string;
    description: string;
    icon: React.ElementType;
    link: string;
  }
}> = ({ service }) => {
  const router = useRouter();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const handleClick = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    router.push(service.link);
  };

  return (
    <div className="bg-gradient-to-r from-rose-50 to-rose-100 rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg border border-rose-200 p-6 transform hover:-translate-y-1 hover:scale-105">
      <div className="flex items-center mb-4">
        <service.icon className="h-8 w-8 text-rose-600 mr-4" />
        <h2 className="text-xl font-semibold text-rose-800">{service.title}</h2>
      </div>
      <p className="text-rose-700 mb-4 text-sm">{service.description}</p>
      <button
        onClick={handleClick}
        className="inline-flex items-center text-rose-600 hover:text-rose-700 font-medium text-sm"
      >
        자세히 보기
        <ArrowRight className="ml-2 h-4 w-4" />
      </button>
    </div>
  );
};

export default function ExporterServices() {
  return (
    <div className="mt-12">
      <hr className="border-t border-gray-300 mb-12" />
      <div className="grid grid-cols-2 gap-8">
        {exporterServices.map((service, index) => (
          <ExporterServiceCard key={index} service={service} />
        ))}
      </div>
    </div>
  );
}