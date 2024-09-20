import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Hero() {
  return (
    <div className="text-center mb-16">
      <div className="flex items-center justify-center mb-4">
        <Avatar className="h-24 w-24 mr-4">
          <AvatarImage src="/cute-doctor.png" alt="Cute Doctor" />
          <AvatarFallback>DR</AvatarFallback>
        </Avatar>
        <h1 className="text-5xl font-bold text-indigo-600">포켓커스텀</h1>
      </div>
      <p className="text-xl text-gray-700 mb-8">
        내 손 안의 작은 관세사를 만나보세요.
      </p>
    </div>
  )
}