import { Metadata } from 'next'
import { WarehouseCostForm } from '@/components/WarehouseCostForm'
import ProtectedRoute from '@/components/ProtectedRoute'; // ProtectedRoute 임포트



export const metadata: Metadata = {
  title: '창고료 조회 | 서비스 이름',
  description: '창고료 예상비용을 확인할 수 있는 서비스입니다.',
}
// 페이지 컴포넌트의 이름은 임포트 컴포넌트와 다르게 할 것
export default function WarehouseCostPage() {
  return (
    <ProtectedRoute> {/* ProtectedRoute로 감싸서 로그인한 사람만 볼 수 있게 하기 */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">창고료 조회</h1>
        <WarehouseCostForm />
      </div>
    </ProtectedRoute>
  )
}

