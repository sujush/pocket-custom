import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as XLSX from 'xlsx';

export default function PackingListForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    exporterName: '',
    exporterAddress: '',
    importerName: '',
    importerAddress: '',
    hsCode: '',
    productName: '',
    quantity: '',
    netWeight: '',
    grossWeight: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generateExcel();
    onSubmit();
  };

  const generateExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([formData]);
    XLSX.utils.book_append_sheet(wb, ws, "Packing List");
    XLSX.writeFile(wb, "packing_list.xlsx");
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
        <Label htmlFor="netWeight">순중량 (kg)</Label>
        <Input
          id="netWeight"
          name="netWeight"
          type="number"
          value={formData.netWeight}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="grossWeight">총중량 (kg)</Label>
        <Input
          id="grossWeight"
          name="grossWeight"
          type="number"
          value={formData.grossWeight}
          onChange={handleChange}
          required
        />
      </div>
      <Button type="submit">패킹리스트 생성</Button>
    </form>
  );
}