import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as XLSX from 'xlsx';

export default function InvoiceForm({ onSubmit }: { onSubmit: () => void }) {
  const [formData, setFormData] = useState({
    exporterName: '',
    exporterAddress: '',
    importerName: '',
    importerAddress: '',
    hsCode: '',
    productName: '',
    quantity: '',
    unitPrice: '',
    currency: 'USD',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    generateExcel();
    onSubmit();
  };

  const generateExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([formData]);
    XLSX.utils.book_append_sheet(wb, ws, "Invoice");
    XLSX.writeFile(wb, "invoice.xlsx");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="exporterName">수출자 이름</Label>
        <Input
          id="exporterName"
          name="exporterName"
          value={formData.exporterName}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="exporterAddress">수출자 주소</Label>
        <Input
          id="exporterAddress"
          name="exporterAddress"
          value={formData.exporterAddress}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="importerName">수입자 이름</Label>
        <Input
          id="importerName"
          name="importerName"
          value={formData.importerName}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="importerAddress">수입자 주소</Label>
        <Input
          id="importerAddress"
          name="importerAddress"
          value={formData.importerAddress}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="hsCode">HS CODE</Label>
        <Input
          id="hsCode"
          name="hsCode"
          value={formData.hsCode}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="productName">제품명</Label>
        <Input
          id="productName"
          name="productName"
          value={formData.productName}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="quantity">수량</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          value={formData.quantity}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="unitPrice">단가</Label>
        <Input
          id="unitPrice"
          name="unitPrice"
          type="number"
          value={formData.unitPrice}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="currency">통화</Label>
        <select
          id="currency"
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="JPY">JPY</option>
          <option value="KRW">KRW</option>
        </select>
      </div>
      <Button type="submit">인보이스 생성</Button>
    </form>
  );
}