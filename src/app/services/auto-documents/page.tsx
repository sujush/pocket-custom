'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Download, Trash2, Plus } from "lucide-react";
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface IFormData {
  exporterName: string;
  exporterAddress: string;
  importerName: string;
  importerAddress: string;
  notifyParty: string;
  documentNumber: string;
  documentDate: string;
  lcNumberAndDate: string;
  lcIssuingBank: string;
  transportMethod: string;
  incoterms: string;
  loadingPort: string;
  dischargePort: string;
  carrier: string;
  vesselAndVoyage: string;
  remarks: string;
}

interface IProduct {
  cn: string;
  hsCode: string;
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
  netWeight: string;
  grossWeight: string;
}

interface ITotals {
  totalQuantity: number;
  totalAmount: number;
  totalNetWeight: number;
  totalGrossWeight: number;
}

export default function DocumentsMaking() {
  const [formData, setFormData] = useState<IFormData>({
    exporterName: '',
    exporterAddress: '',
    importerName: '',
    importerAddress: '',
    notifyParty: '',
    documentNumber: '',
    documentDate: '',
    lcNumberAndDate: '',
    lcIssuingBank: '',
    transportMethod: '',
    incoterms: '',
    loadingPort: '',
    dischargePort: '',
    carrier: '',
    vesselAndVoyage: '',
    remarks: ''
  });

  const [products, setProducts] = useState<IProduct[]>([{
    cn: '',
    hsCode: '',
    description: '',
    quantity: '',
    unitPrice: '',
    amount: '',
    netWeight: '',
    grossWeight: ''
  }]);


  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductChange = (
    index: number,
    field: keyof IProduct,
    value: string
  ): void => {
    const newProducts = [...products];
    newProducts[index] = {
      ...newProducts[index],
      [field]: value
    };
    
    // 만약 quantity 또는 unitPrice가 바뀌면 amount 계산하기
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = parseFloat(newProducts[index].quantity) || 0;
      const unitPrice = parseFloat(newProducts[index].unitPrice) || 0;
      newProducts[index].amount = (quantity * unitPrice).toFixed(2);
    }
    
    setProducts(newProducts);
  };

  const addProduct = (): void => {
    setProducts(prev => [...prev, {
      cn: '',
      hsCode: '',
      description: '',
      quantity: '',
      unitPrice: '',
      amount: '',
      netWeight: '',
      grossWeight: ''
    }]);
  };

  const removeProduct = (index: number): void => {
    setProducts(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotals = useMemo((): ITotals => {
    return products.reduce((acc, curr) => ({
      totalQuantity: acc.totalQuantity + (parseFloat(curr.quantity) || 0),
      totalAmount: acc.totalAmount + (parseFloat(curr.amount) || 0),
      totalNetWeight: acc.totalNetWeight + (parseFloat(curr.netWeight) || 0),
      totalGrossWeight: acc.totalGrossWeight + (parseFloat(curr.grossWeight) || 0)
    }), {
      totalQuantity: 0,
      totalAmount: 0,
      totalNetWeight: 0,
      totalGrossWeight: 0
    });
  }, [products]);

  const generateExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Invoice & Packing List');

    // 기본 스타일 설정
    worksheet.properties.defaultRowHeight = 20;
    worksheet.properties.defaultColWidth = 15;

    // 제목 행 (1행)
    worksheet.mergeCells('A1:J1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'COMMERCIAL INVOICE/PACKING LIST';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // 고정 레이블 설정 및 병합
    const headerMerges = [
      { range: 'A2:E2', value: '1. Shipper / Exporter' },
      { range: 'F2:J2', value: '8. No & Date of Invoice' },
      { range: 'F6:J6', value: '9. No. & Date of L/C' },
      { range: 'A9:E9', value: '2. Consignee' },
      { range: 'F9:J9', value: '10. L/C Issuing Bank' },
      { range: 'F13:J13', value: '11. Ship Via' },
      { range: 'A16:E16', value: '3. Notify' },
      { range: 'F16:J16', value: '12. Delivery Terms' },
      { range: 'A20:B20', value: '4. Port of Loading' },
      { range: 'C20:E20', value: '5. Final Destination' },
      { range: 'F20:J20', value: '13. Remarks' },
      { range: 'A22:B22', value: '6. Carrier' },
      { range: 'C22:E22', value: '7. Sailing on/or about' }
    ];

    // 데이터 병합 및 값 설정
    const dataMerges = [
      { range: 'A3:E8', value: `${formData.exporterName}\n${formData.exporterAddress}` },
      { range: 'F3:J5', value: formData.documentNumber },
      { range: 'F7:J8', value: formData.lcNumberAndDate },
      { range: 'A10:E15', value: `${formData.importerName}\n${formData.importerAddress}` },
      { range: 'F10:J12', value: formData.lcIssuingBank },
      { range: 'F14:J15', value: formData.transportMethod },
      { range: 'A17:E19', value: formData.notifyParty },
      { range: 'F17:J19', value: formData.incoterms },
      { range: 'F21:J23', value: formData.remarks }
    ];

    // 헤더 병합 및 스타일 적용
    headerMerges.forEach(({ range, value }) => {
      worksheet.mergeCells(range);
      const cell = worksheet.getCell(range.split(':')[0]);
      cell.value = value;
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    });

    // 데이터 병합 및 스타일 적용
    dataMerges.forEach(({ range, value }) => {
      worksheet.mergeCells(range);
      const cell = worksheet.getCell(range.split(':')[0]);
      cell.value = value;
      cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    });

    // 상품 데이터 헤더 (24행)
    const headers = [
      '14. C/N',
      '15. HS Code',
      '16. Description of Goods',
      '',
      '',
      '17. Quantity',
      '18. Unit Price',
      '19. Amount',
      'Net weight',
      'Gross weight'
    ];
    
    worksheet.getRow(24).values = headers;
    worksheet.getRow(24).font = { bold: true };
    worksheet.mergeCells('C24:E24');

    // 상품 데이터 추가
    products.forEach((product, index) => {
      const row = worksheet.addRow([
        product.cn,
        product.hsCode,
        product.description,
        '',
        '',
        product.quantity,
        product.unitPrice,
        product.amount,
        product.netWeight,
        product.grossWeight
      ]);
      worksheet.mergeCells(`C${25 + index}:E${25 + index}`);
      row.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // TOTAL 행 추가 (C열부터 시작)
    const totalRowNumber = 25 + products.length;
    const totalRow = worksheet.addRow([
      '',
      '',
      'TOTAL',
      '',
      '',
      calculateTotals.totalQuantity.toString(),
      '',
      calculateTotals.totalAmount.toFixed(2),
      calculateTotals.totalNetWeight.toFixed(2),
      calculateTotals.totalGrossWeight.toFixed(2)
    ]);
    worksheet.mergeCells(`C${totalRowNumber}:E${totalRowNumber}`);
    totalRow.font = { bold: true };
    totalRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // 테두리 스타일 적용
    worksheet.eachRow(row => {
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // 파일 저장
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Invoice_PackingList_${formData.documentNumber}.xlsx`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Commercial Invoice & Packing List Generator</h1>
      
      {/* 수출자 정보 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">1. Shipper / Exporter Information (수출자정보) </h2>
        <Input
          placeholder="Exporter Name 수출자명"
          name="exporterName"
          value={formData.exporterName}
          onChange={handleFormChange}
        />
        <Textarea
          placeholder="Exporter Address 수출자주소"
          name="exporterAddress"
          value={formData.exporterAddress}
          onChange={handleFormChange}
        />
      </div>

      {/* 수입자 정보 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">2. Consignee Information (수입자 정보) </h2>
        <Input
          placeholder="Importer Name 수입자명"
          name="importerName"
          value={formData.importerName}
          onChange={handleFormChange}
        />
        <Textarea
          placeholder="Importer Address 수입자주소"
          name="importerAddress"
          value={formData.importerAddress}
          onChange={handleFormChange}
        />
      </div>

      {/* 착화통지처 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">3. Notify Party 통지처 </h2>
        <Textarea
          placeholder="Notify Party (동일하면 Same Above) "
          name="notifyParty"
          value={formData.notifyParty}
          onChange={handleFormChange}
        />
      </div>

      {/* Other Information */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">4. Other Information 기타 정보들</h2>
        
        {/* Document Information */}
        <div className="grid grid-cols-3 gap-4">
          <Input
            placeholder="Document Number 인보이스 번호 "
            name="documentNumber"
            value={formData.documentNumber}
            onChange={handleFormChange}
          />
          <Input
            placeholder="Document Date"
            name="documentDate"
            type="date"
            value={formData.documentDate}
            onChange={handleFormChange}
          />
          <Input
            placeholder="L/C Number and Date 신용장 번호 및 날짜"
            name="lcNumberAndDate"
            value={formData.lcNumberAndDate}
            onChange={handleFormChange}
          />
          <Textarea
            placeholder="L/C Issuing Bank 신용장 개설은행"
            name="lcIssuingBank"
            value={formData.lcIssuingBank}
            onChange={handleFormChange}
            className="col-span-3"
          />
        </div>

        {/* Transport Information */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="Transport Method 운송수단"
            name="transportMethod"
            value={formData.transportMethod}
            onChange={handleFormChange}
          />
          <Input
            placeholder="Incoterms 인코텀즈 조건"
            name="incoterms"
            value={formData.incoterms}
            onChange={handleFormChange}
          />
          <Input
            placeholder="Loading Port 선적항"
            name="loadingPort"
            value={formData.loadingPort}
            onChange={handleFormChange}
          />
          <Input
            placeholder="Discharge Port 양륙향"
            name="dischargePort"
            value={formData.dischargePort}
            onChange={handleFormChange}
          />
          <Input
            placeholder="Carrier 운송사"
            name="carrier"
            value={formData.carrier}
            onChange={handleFormChange}
          />
          <Input
            placeholder="Vessel and Voyage 선박명 및 항차"
            name="vesselAndVoyage"
            value={formData.vesselAndVoyage}
            onChange={handleFormChange}
          />
        </div>

        {/* Remarks */}
        <Textarea
          placeholder="Remarks 비고"
          name="remarks"
          value={formData.remarks}
          onChange={handleFormChange}
        />
      </div>

      {/* 상품 정보 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Products 제품정보</h2>
          <Button onClick={addProduct} className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
        
        {products.map((product, idx) => (
          <div key={idx} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
            <Input
              placeholder="C/N 박스번호"
              value={product.cn}
              onChange={(e) => handleProductChange(idx, 'cn', e.target.value)}
            />
            <Input
              placeholder="HS Code"
              value={product.hsCode}
              onChange={(e) => handleProductChange(idx, 'hsCode', e.target.value)}
            />
            <Input
              placeholder="Description 제품명(영어로)"
              value={product.description}
              onChange={(e) => handleProductChange(idx, 'description', e.target.value)}
              className="col-span-2"
            />
            <Input
              placeholder="Quantity 수량"
              value={product.quantity}
              onChange={(e) => handleProductChange(idx, 'quantity', e.target.value)}
            />
            <Input
              placeholder="Unit Price 단가"
              value={product.unitPrice}
              onChange={(e) => handleProductChange(idx, 'unitPrice', e.target.value)}
            />
            <Input
              placeholder="Amount 금액"
              value={product.amount}
              disabled
              className="bg-gray-100"
            />
            <Input
              placeholder="Net Weight 순중량"
              value={product.netWeight}
              onChange={(e) => handleProductChange(idx, 'netWeight', e.target.value)}
            />
            <Input
              placeholder="Gross Weight 총중량"
              value={product.grossWeight}
              onChange={(e) => handleProductChange(idx, 'grossWeight', e.target.value)}
            />
            {products.length > 1 && (
              <Button
                variant="destructive"
                onClick={() => removeProduct(idx)}
                className="col-span-4"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Product
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* 총계 표시 */}
      <div className="border-t pt-4">
        <h3 className="font-semibold mb-2">Totals:</h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Quantity</p>
            <p className="font-semibold">{calculateTotals.totalQuantity}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="font-semibold">${calculateTotals.totalAmount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Net Weight</p>
            <p className="font-semibold">{calculateTotals.totalNetWeight.toFixed(2)} KG</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Gross Weight</p>
            <p className="font-semibold">{calculateTotals.totalGrossWeight.toFixed(2)} KG</p>
          </div>
        </div>
      </div>

      {/* 다운로드 버튼 */}
      <Button 
        onClick={generateExcel}
        className="w-full flex items-center justify-center mt-6"
      >
        <Download className="w-4 h-4 mr-2" />
        Download Excel
      </Button>
    </div>
  );
}