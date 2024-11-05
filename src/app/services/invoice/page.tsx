import InvoiceAndPackingListForm from './InvoiceAndPackingListForm'

export default function InvoicePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">인보이스 및 패킹리스트 제작</h1>
      <InvoiceAndPackingListForm />
    </div>
  )
}