//app/page.tsx 에 적용

'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Rocket, Utensils, Laptop, ScrollText } from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'

const CertifiedServices = [
 {
   title: '수입식품 검사',
   description: '농산물 , 가공식품, 기구용기 등 검사비용 및 한글표시사항을 확인할 수 있습니다 ',
   icon: Utensils,
   link: '/services/food-inspection'
 },
 {
   title: 'KC인증',
   description: 'KC인증대상 및 KC인증 방법과 비용을 확인할 수 있습니다.',
   icon: Laptop,
   link: '/services/kc-certification'
 },
 {
   title: '전략물자 확인',
   description: '수출물품의 전략물자 여부를 확인할 수 있습니다',
   icon: Rocket,
   link: '/services/strategic-items'
 },
 {
   title: '원산지증명서 및 인증수출자',
   description: '수출물품의 원산지증명서 발급방법 등을 확인할 수 있습니다',
   icon: ScrollText,
   link: '/services/origin-certification'
 }
];

const CertifiedServiceCard: React.FC<{ service: { title: string; description: string; icon: React.ElementType; link: string } }> = ({ service }) => {
 const router = useRouter();
 const isAuthenticated = useAuthStore(state => state.isAuthenticated); //로그인해야 이용가능하도록 하는 기능

 const handleClick = () => {
   if (!isAuthenticated) {
     router.push('/login');
     return;
   }
   router.push(service.link);
 };

 return (
   <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg border border-green-200 p-6 transform hover:-translate-y-1 hover:scale-105">
     <div className="flex items-center mb-4">
       <service.icon className="h-8 w-8 text-green-600 mr-4" />
       <h2 className="text-xl font-semibold text-green-800">{service.title}</h2>
     </div>
     <p className="text-green-700 mb-4 text-sm">{service.description}</p>
     <button 
       onClick={handleClick}
       className="inline-flex items-center text-green-600 hover:text-green-700 font-medium text-sm"
     >
       자세히 보기 <ArrowRight className="ml-2 h-4 w-4" />
     </button>
   </div>
 )
}

export default function CertifiedService() {
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