import { HSCodeForm } from '@/components/HSCodeForm'

export default function HSCodeLookupPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">HS CODE 조회</h1>
      <HSCodeForm />
    </div>
  )
}