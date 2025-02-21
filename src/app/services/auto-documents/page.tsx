'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Download, Trash2, Plus } from "lucide-react";
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// 인터페이스 정의를 컴포넌트 외부에 선언
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
  // 엑셀 생성
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

    // 고정 레이블 설정
    const labels = [
      { cell: 'A2', value: '1. Shipper / Exporter' },
      { cell: 'F2', value: '8. No & Date of Invoice' },
      { cell: 'F6', value: '9. No. & Date of L/C' },
      { cell: 'A9', value: '2. Consignee' },
      { cell: 'F9', value: '10. L/C Issuing Bank' },
      { cell: 'F13', value: '11. Ship Via' },
      { cell: 'A16', value: '3. Notify' },
      { cell: 'F16', value: '12. Delivery Terms' },
      { cell: 'A20', value: '4. Port of Loading' },
      { cell: 'C20', value: '5. Final Destination' },
      { cell: 'F20', value: '13. Remarks' },
      { cell: 'A22', value: '6. Carrier' },
      { cell: 'C22', value: '7. Sailing on/or about' }
    ];

    labels.forEach(({ cell, value }) => {
      worksheet.getCell(cell).value = value;
      worksheet.getCell(cell).font = { bold: true };
    });

    // 병합 셀 설정 및 데이터 입력
    const mergesWithData = [
      { range: 'A3:E5', value: formData.exporterName + '\n' + formData.exporterAddress },
      { range: 'F3:G3', value: formData.documentNumber },
      { range: 'H3:J3', value: formData.documentDate },
      { range: 'F7:J7', value: formData.lcNumberAndDate },
      { range: 'A10:E12', value: formData.importerName + '\n' + formData.importerAddress },
      { range: 'F14:J15', value: formData.transportMethod },
      { range: 'A17:E19', value: formData.notifyParty },
      { range: 'F17:J19', value: formData.incoterms },
      { range: 'A21:B21', value: formData.loadingPort },
      { range: 'C21:E21', value: formData.dischargePort },
      { range: 'F21:J23', value: formData.remarks },
      { range: 'A23:B23', value: formData.carrier },
      { range: 'C23:E23', value: formData.vesselAndVoyage }
    ];

    mergesWithData.forEach(({ range, value }) => {
      worksheet.mergeCells(range);
      worksheet.getCell(range.split(':')[0]).value = value;
      worksheet.getCell(range.split(':')[0]).alignment = { 
        vertical: 'middle', 
        horizontal: 'center',
        wrapText: true 
      };
    });

    // 상품 데이터 헤더 (24행)
    const productHeaders = [
      { width: 10, header: '14. C/N' },
      { width: 12, header: '15. HS Code' },
      { width: 30, header: '16. Description of Goods' },
      { width: 12, header: '17. Quantity' },
      { width: 12, header: '18. Unit Price' },
      { width: 12, header: '19. Amount' },
      { width: 12, header: 'Net weight' },
      { width: 12, header: 'Gross weight' }
    ];

    worksheet.getRow(24).values = productHeaders.map(h => h.header);
    worksheet.getRow(24).font = { bold: true };
    productHeaders.forEach((h, i) => {
      worksheet.getColumn(i + 1).width = h.width;
    });

    // 상품 데이터 추가
    products.forEach(product => {
      const row = worksheet.addRow([
        product.cn,
        product.hsCode,
        product.description,
        product.quantity,
        product.unitPrice,
        product.amount,
        product.netWeight,
        product.grossWeight
      ]);
      row.height = 20;
      row.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // 총계 행 추가
    const totalRow = worksheet.addRow([
      'TOTAL',
      '',
      '',
      calculateTotals.totalQuantity,
      '',
      calculateTotals.totalAmount,
      calculateTotals.totalNetWeight,
      calculateTotals.totalGrossWeight
    ]);
    totalRow.font = { bold: true };
    totalRow.height = 20;

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
              onChange={(e) => handleProductChange(idx, 'cn', e.target.value)}
            />
            <Input
              placeholder="HS Code"
              value={product.hsCode}
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
              type="number"
              value={product.quantity}
              onChange={(e) => handleProductChange(idx, 'quantity', e.target.value)}
            />
            <Input
              placeholder="Unit Price"
              type="number"
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
              type="number"
              value={product.netWeight}
              onChange={(e) => handleProductChange(idx, 'netWeight', e.target.value)}
            />
            <Input
              placeholder="Gross Weight"
              type="number"
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