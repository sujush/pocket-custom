'use client'

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Download } from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

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

export default function DocumentsMaking() {
  const [formData, setFormData] = useState({
    exporterName: "",
    exporterAddress: "",
    importerName: "",
    importerAddress: "",
    notify: "",
    invoiceNumber: "",
    invoiceDate: "",
    shippingMethod: "",
    incoterms: "",
    portOfLoading: "",
    portOfDischarge: "",
    carrier: "",
    vessel: "",
    remark: "",
    products: [],
  });

  const [productList, setProductList] = useState([
    { cn: "", hsCode: "", description: "", quantity: "", unitPrice: "", amount: "", netWeight: "", grossWeight: "" },
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number | undefined = undefined) => {
    const { name, value } = e.target as { name: keyof Product; value: string };
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
    worksheet.addRow(["COMMERCIAL INVOICE/PACKING LIST"]).font = { size: 24, bold: true };
    worksheet.addRow(["Exporter", formData.exporterName]);
    worksheet.addRow(["Exporter Address", formData.exporterAddress]);
    worksheet.addRow(["Importer", formData.importerName]);
    worksheet.addRow(["Importer Address", formData.importerAddress]);
    worksheet.addRow(["Notify", formData.notify]);
    worksheet.addRow(["Invoice No", formData.invoiceNumber]);
    worksheet.addRow(["Invoice Date", formData.invoiceDate]);
    worksheet.addRow(["Shipping Method", formData.shippingMethod]);
    worksheet.addRow(["Incoterms", formData.incoterms]);
    worksheet.addRow(["Port of Loading", formData.portOfLoading]);
    worksheet.addRow(["Port of Discharge", formData.portOfDischarge]);
    worksheet.addRow(["Carrier", formData.carrier]);
    worksheet.addRow(["Vessel", formData.vessel]);
    worksheet.addRow(["Remark", formData.remark]);
    worksheet.addRow([]);

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
        <Button onClick={addProduct}>상품 추가</Button>
        {productList.map((product, index) => (
          <div key={index} className="grid grid-cols-4 gap-2">
            <Input placeholder="C/N" name="cn" onChange={(e) => handleInputChange(e, index)} />
            <Input placeholder="HS Code" name="hsCode" onChange={(e) => handleInputChange(e, index)} />
            <Input placeholder="Description" name="description" onChange={(e) => handleInputChange(e, index)} />
            <Input placeholder="Quantity" name="quantity" onChange={(e) => handleInputChange(e, index)} />
          </div>
        ))}
        <Button onClick={generateExcel} className="mt-4 flex items-center">
          <Download className="mr-2" /> 엑셀 다운로드
        </Button>
      </div>
    </div>
  );
}
