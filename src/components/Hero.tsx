import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Hero() {
  return (
    <div className="text-center mb-16">
      <div className="flex items-center justify-center mb-4">
        <Avatar className="h-24 w-24 mr-4">
          <AvatarImage src="/eyeon_logo.png" alt="eyeon_logo" /> 
          <AvatarFallback>DR</AvatarFallback>
        </Avatar>
        <h1 className="text-5xl font-bold text-indigo-600">이연 관세사무소</h1>
      </div>
      <p className="text-xl text-gray-700 mb-8">
        모바일은 데스크탑 모드를 이용해주세요.
      </p>
    </div>
  )
}