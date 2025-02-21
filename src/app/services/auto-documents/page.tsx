'use client'

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Download } from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";


export default function DocumentsMaking() {
  const [formData, setFormData] = useState({
    exporterName: "",
    exporterAddress: "",
    importerName: "",
    importerAddress: "",
    notify: "",
    invoiceNumber: "",
    invoiceDate: "",
    lcNumberAndDate: "",
    shippingMethod: "",
    incoterms: "",
    portOfLoading: "",
    portOfDischarge: "",
    carrier: "",
    vessel: "",
    remark: "",
    products: [],
  });

  type Product = {
    cn: string;
    hsCode: string;
    description: string;
    quantity: string;
    unitPrice: string;
    amount: string;
    netWeight: string;
    grossWeight: string;
};


  const [productList, setProductList] = useState([
    { cn: "", hsCode: "", description: "", quantity: "", unitPrice: "", amount: "", netWeight: "", grossWeight: "" },
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number | undefined = undefined) => {
    const { name, value } = e.target as { name: keyof Product; value: string }; // name의 타입을 명시적으로 설정
    if (index !== undefined) {
      const newProducts = [...productList];
      newProducts[index][name] = value;
      setProductList(newProducts);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addProduct = () => {
    setProductList([...productList, { cn: "", hsCode: "", description: "", quantity: "", unitPrice: "", amount: "", netWeight: "", grossWeight: "" }]);
  };

  const generateExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Invoice & Packing List");

    // 자동으로 입력되는 기본 데이터
    worksheet.mergeCells("A1:J1");
    worksheet.getCell("A1").value = "COMMERCIAL INVOICE/PACKING LIST";
    worksheet.getCell("A1").font = { size: 24, bold: true };
    
    const autoFillData = [
      ["A3:E3", "Exporter Name"], ["F3:J3", formData.exporterName],
      ["A4:E4", "Exporter Address"], ["F4:J4", formData.exporterAddress],
      ["A10:E10", "Importer Name"], ["F10:J10", formData.importerName],
      ["A11:E11", "Importer Address"], ["F11:J11", formData.importerAddress],
      ["A6:E6", "Notify"], ["F6:J6", formData.notify],
      ["A7:E7", "Invoice No"], ["F7:J7", formData.invoiceNumber],
      ["A8:E8", "Invoice Date"], ["F8:J8", formData.invoiceDate],
      ["F6:J6", "9. No. & Date of L/C"], ["F7:J7", formData.lcNumberAndDate],
      ["A9:E9", "Shipping Method"], ["F9:J9", formData.shippingMethod],
      ["A12:E12", "Incoterms"], ["F12:J12", formData.incoterms],
      ["A13:E13", "Port of Loading"], ["F13:J13", formData.portOfLoading],
      ["A14:E14", "Port of Discharge"], ["F14:J14", formData.portOfDischarge],
      ["A15:E15", "Carrier"], ["F15:J15", formData.carrier],
      ["A16:E16", "Vessel"], ["F16:J16", formData.vessel],
      ["A17:E17", "Remark"], ["F17:J17", formData.remark],
    ];

    autoFillData.forEach(([range, value]) => {
      worksheet.mergeCells(range);
      worksheet.getCell(range.split(":")[0]).value = value;
      worksheet.getCell(range.split(":")[0]).alignment = { horizontal: "center", vertical: "middle" };
    });

    // 제품 리스트 헤더
    worksheet.addRow(["C/N", "HS Code", "Description of Goods", "Quantity", "Unit Price", "Amount", "Net Weight", "Gross Weight"]);

    // 제품 리스트 입력
    productList.forEach((product) => {
      worksheet.addRow([
        product.cn,
        product.hsCode,
        product.description,
        product.quantity,
        product.unitPrice,
        product.amount,
        product.netWeight,
        product.grossWeight,
      ]);
    });

    // 파일 저장
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "Invoice_PackingList.xlsx");
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">수출 시 필요한 인보이스 및 패킹리스트 생성</h1>
      <div className="space-y-4">
        <Input placeholder="수출자명" name="exporterName" onChange={handleInputChange} />
        <Textarea placeholder="수출자 주소" name="exporterAddress" onChange={handleInputChange} />
        <Input placeholder="수입자명" name="importerName" onChange={handleInputChange} />
        <Textarea placeholder="수입자 주소" name="importerAddress" onChange={handleInputChange} />
        <Input placeholder="착화 통지처" name="notify" onChange={handleInputChange} />
        <Input placeholder="서류 번호" name="invoiceNumber" onChange={handleInputChange} />
        <Input placeholder="작성일자" name="invoiceDate" onChange={handleInputChange} />
        <Input placeholder="신용장 번호 및 날짜" name="lcNumberAndDate" onChange={handleInputChange} />
        <Input placeholder="운송방식" name="shippingMethod" onChange={handleInputChange} />
        <Input placeholder="인코텀즈 조건" name="incoterms" onChange={handleInputChange} />
        <Input placeholder="선적항" name="portOfLoading" onChange={handleInputChange} />
        <Input placeholder="양륙항" name="portOfDischarge" onChange={handleInputChange} />
        <Input placeholder="운송사" name="carrier" onChange={handleInputChange} />
        <Input placeholder="선박명 및 항차" name="vessel" onChange={handleInputChange} />
        <Textarea placeholder="비고" name="remark" onChange={handleInputChange} />
        <Button onClick={addProduct}>상품 추가</Button>
        <Button onClick={generateExcel} className="mt-4 flex items-center">
          <Download className="mr-2" /> 엑셀 다운로드
        </Button>
      </div>
    </div>
  );
}
