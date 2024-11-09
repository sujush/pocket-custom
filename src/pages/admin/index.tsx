// src/pages/admin/index.tsx - 관리자 페이지 기본 구조
import { useEffect, useState } from 'react'

export default function AdminPage() {
  const [members, setMembers] = useState<{ id: number; email: string; name: string; isPremium: boolean; lastLogin: string }[]>([])

  useEffect(() => {
    // 회원 목록 가져오기 (API 호출)
    fetch('/api/admin/members')
      .then((res) => res.json())
      .then((data) => setMembers(data))
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">관리자 페이지</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">이메일</th>
            <th className="py-2">이름</th>
            <th className="py-2">회원 구분</th>
            <th className="py-2">로그인 일시</th>
            <th className="py-2">기능</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td className="py-2">{member.email}</td>
              <td className="py-2">{member.name}</td>
              <td className="py-2">{member.isPremium ? '프리미엄' : '일반'}</td>
              <td className="py-2">{member.lastLogin}</td>
              <td className="py-2">
                {/* 회원 전환 및 제한 기능 버튼 */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
