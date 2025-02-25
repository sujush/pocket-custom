//app/page.tsx 에 추가

"use client"

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

const additionalFeatures = [
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
    title: '우편번호별 관할세관 찾기',
    description: '수출신고 시 소재지세관을 확인할 수 있습니다',
    icon: Shield,
    link: '/services/strategic-items'
  }
];

const FeatureCard: React.FC<{
  feature: {
    title: string;
    description: string;
    icon: React.ElementType;
    link: string;
  }
}> = ({ feature }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const handleClick = () => {
    console.log('Feature clicked:', {
      isAuthenticated: useAuthStore.getState().isAuthenticated,
      token: useAuthStore.getState().token,
      featureTitle: feature.title,
      currentPath: window.location.pathname
    });
    router.push(feature.link);
  };

  return (
    <div className={`
      ${!isAuthenticated ? 'opacity-75' : ''}
      bg-gradient-to-r from-emerald-50 to-emerald-100 
      rounded-lg overflow-hidden shadow-md 
      transition-all duration-300 hover:shadow-lg 
      border border-emerald-200 p-6 
      transform hover:-translate-y-1 hover:scale-105
    `}>
      <div className="flex items-center mb-4">
        <feature.icon className="h-8 w-8 text-rose-600 mr-4" />
        <h2 className="text-xl font-semibold text-emerald-800">{feature.title}</h2>
      </div>
      <p className="text-gray-700 mb-4 text-sm">{feature.description}</p>
      <button
        onClick={handleClick}
        className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium text-sm"
      >
        자세히 보기
        <ArrowRight className="ml-2 h-4 w-4" />
      </button>
    </div>
  );
};

export default function AdditionalFeatures() {
  return (
    <div className="my-16">
      <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
        {/* "추가기능" 문구를 제거했습니다. */}
      </h2>
      <div className="grid grid-cols-2 gap-8">
        {additionalFeatures.map((feature, index) => (
          <FeatureCard key={index} feature={feature} />
        ))}
      </div>
    </div>
  );
}