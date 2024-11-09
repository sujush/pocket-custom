// components/Navigation.tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { useAuthStore } from '@/lib/store/authStore'

export default function Navigation() {
 const router = useRouter()
 const { isAuthenticated, user, clearAuth } = useAuthStore()

 const handleLogout = () => {
   clearAuth()
   router.push('/')
 }

 return (
   <nav className="bg-white py-4 shadow-sm">
     <div className="container mx-auto px-4 flex items-center">
       <Link href="/" className="text-2xl font-bold text-gray-800 mr-8">
         포켓커스텀
       </Link>
       <div className="flex items-center space-x-6 mr-auto">
         <Link href="/" className="text-gray-600 hover:text-gray-800 transition-colors duration-300">
           회사소개
         </Link>
         <Link href="/services" className="text-gray-600 hover:text-gray-800 transition-colors duration-300">
           문의게시판
         </Link>
         <Link href="/support" className="text-gray-600 hover:text-gray-800 transition-colors duration-300">
           고객 지원
         </Link>
       </div>
       <div className="flex items-center space-x-4">
         {isAuthenticated ? (
           <>
             <span className="text-gray-600">
               {user?.name}님 환영합니다
               {user?.isPremium && " (프리미엄)"}
             </span>
             <Button 
               variant="ghost" 
               className="text-gray-600 hover:text-gray-800"
               onClick={handleLogout}
             >
               로그아웃
             </Button>
             {!user?.isPremium && (
               <Link href="/upgrade">
                 <Button className="bg-yellow-500 text-white hover:bg-yellow-600 transition-colors duration-300">
                   프리미엄 회원 전환
                 </Button>
               </Link>
             )}
           </>
         ) : (
           <>
             <Link href="/login">
               <Button variant="ghost" className="text-gray-600 hover:text-gray-800">
                 로그인
               </Button>
             </Link>
             <Link href="/signup">
               <Button className="bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-300">
                 회원가입
               </Button>
             </Link>
             <Link href="/upgrade">
               <Button className="bg-yellow-500 text-white hover:bg-yellow-600 transition-colors duration-300">
                 프리미엄 회원 전환
               </Button>
             </Link>
           </>
         )}
       </div>
     </div>
   </nav>
 )
}