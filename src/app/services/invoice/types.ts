// types.ts

export type Product = {
    id: string;
    hsCode: string;
    englishName: string;
  }
  
  export type CommonData = {
    exporterName: string;
    exporterAddress: string;
    importerEnglishName: string;
    importerKoreanName: string;
    importerEnglishAddress: string;
    importerKoreanAddress: string;
    businessNumber: string;
    businessType: string;
    businessItem: string;
    phoneNumber: string;
    email: string;
    notifyParty: string;
    loadingPort: string;
    destinationPort: string;
    transportMethod: string;
    shippingDate: string;
  }
  
  export type ProductData = {
    hsCode: string;
    englishName: string;
    unitPrice: string;
    quantity: string;
    currency: string;
    quantityUnit: string;
    amount: string;
    netWeight: string;
    grossWeight: string;
  }