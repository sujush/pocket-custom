'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Download, Trash2, Plus } from "lucide-react";
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// 인터페이스 정의
interface IFormData {
  exporterName: string;
  exporterAddress: string;
  importerName: string;
  importerAddress: string;
  notifyParty: string;
  documentNumber: string;
  documentDate: string;
  lcNumberAndDate: string;
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

  const productsForCalculation = useMemo(() => 
    products.map(p => ({
      quantity: p.quantity,
      unitPrice: p.unitPrice
    })),
    [products]
  );

  useEffect(() => {
    const updatedProducts = products.map(product => {
      const quantity = parseFloat(product.quantity) || 0;
      const unitPrice = parseFloat(product.unitPrice) || 0;
      return {
        ...product,
        amount: (quantity * unitPrice).toFixed(2)
      };
    });
    setProducts(updatedProducts);
  }, [productsForCalculation, products]);

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
      { range: 'A3:E5', value: `${formData.exporterName}\n${formData.exporterAddress}` },
      { range: 'F3:J3', value: formData.documentNumber },
      { range: 'F7:J7', value: formData.lcNumberAndDate },
      { range: 'A10:E12', value: `${formData.importerName}\n${formData.importerAddress}` },
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
      '17. Quantity',
      '18. Unit Price',
      '19. Amount',
      'Net weight',
      'Gross weight'
    ];
    
    worksheet.getRow(24).values = headers;
    worksheet.getRow(24).font = { bold: true };

    // 상품 데이터 추가
    products.forEach(product => {
      worksheet.addRow([
        product.cn,
        product.hsCode,
        product.description,
        product.quantity,
        product.unitPrice,
        product.amount,
        product.netWeight,
        product.grossWeight
      ]);
    });

    // TOTAL 행 추가 (C열부터 시작)
    const totalRow = worksheet.addRow([
      '',
      '',
      'TOTAL',
      calculateTotals.totalQuantity.toString(),
      '',
      calculateTotals.totalAmount.toFixed(2),
      calculateTotals.totalNetWeight.toFixed(2),
      calculateTotals.totalGrossWeight.toFixed(2)
    ]);
    totalRow.font = { bold: true };

    // 테두리 및 정렬 스타일 적용
    worksheet.eachRow(row => {
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        if (!cell.alignment) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
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
        <h2 className="text-lg font-semibold">1. Shipper / Exporter Information</h2>
        <Input
          placeholder="Exporter Name"
          name="exporterName"
          value={formData.exporterName}
          onChange={handleFormChange}
        />
        <Textarea
          placeholder="Exporter Address"
          name="exporterAddress"
          value={formData.exporterAddress}
          onChange={handleFormChange}
        />
      </div>

      {/* 수입자 정보 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">2. Consignee Information</h2>
        <Input
          placeholder="Importer Name"
          name="importerName"
          value={formData.importerName}
          onChange={handleFormChange}
        />
        <Textarea
          placeholder="Importer Address"
          name="importerAddress"
          value={formData.importerAddress}
          onChange={handleFormChange}
        />
      </div>

      {/* 착화통지처 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">3. Notify Party</h2>
        <Textarea
          placeholder="Notify Party"
          name="notifyParty"
          value={formData.notifyParty}
          onChange={handleFormChange}
        />
      </div>

      {/* 서류 정보 */}
      <div className="grid grid-cols-3 gap-4">
        <Input
          placeholder="Document Number"
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
          placeholder="L/C Number and Date"
          name="lcNumberAndDate"
          value={formData.lcNumberAndDate}
          onChange={handleFormChange}
        />
      </div>

      {/* 운송 정보 */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          placeholder="Transport Method"
          name="transportMethod"
          value={formData.transportMethod}
          onChange={handleFormChange}
        />
        <Input
          placeholder="Incoterms"
          name="incoterms"
          value={formData.incoterms}
          onChange={handleFormChange}
        />
        <Input
          placeholder="Loading Port"
          name="loadingPort"
          value={formData.loadingPort}
          onChange={handleFormChange}
        />
        <Input
          placeholder="Discharge Port"
          name="dischargePort"
          value={formData.dischargePort}
          onChange={handleFormChange}
        />
        <Input
          placeholder="Carrier"
          name="carrier"
          value={formData.carrier}
          onChange={handleFormChange}
        />
        <Input
          placeholder="Vessel and Voyage"
          name="vesselAndVoyage"
          value={formData.vesselAndVoyage}
          onChange={handleFormChange}
        />
      </div>

      {/* Remarks */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Remarks</h2>
        <Textarea
          placeholder="Remarks"
          name="remarks"
          value={formData.remarks}
          onChange={handleFormChange}
        />
      </div>

      {/* 상품 정보 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Products</h2>
          <Button onClick={addProduct} className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
        
        {products.map((product, idx) => (
          <div key={idx} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
            <Input
              placeholder="C/N"
              value={product.cn}
              onChange={(e) => handleProductChange(idx, 'hsCode', e.target.value)}
            />
            <Input
              placeholder="Description"
              value={product.description}
              onChange={(e) => handleProductChange(idx, 'description', e.target.value)}
              className="col-span-2"
            />
            <Input
              placeholder="Quantity"
              value={product.quantity}
              onChange={(e) => handleProductChange(idx, 'quantity', e.target.value)}
            />
            <Input
              placeholder="Unit Price"
              value={product.unitPrice}
              onChange={(e) => handleProductChange(idx, 'unitPrice', e.target.value)}
            />
            <Input
              placeholder="Amount"
              value={product.amount}
              disabled
              className="bg-gray-100"
            />
            <Input
              placeholder="Net Weight"
              value={product.netWeight}
              onChange={(e) => handleProductChange(idx, 'netWeight', e.target.value)}
            />
            <Input
              placeholder="Gross Weight"
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