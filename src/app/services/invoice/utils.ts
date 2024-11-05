import { CommonData } from './types';

export const validateCommonData = (commonData: CommonData): { isValid: boolean; errorMessage: string } => {
  const requiredFields = [
    'exporterName',
    'exporterAddress',
    'importerEnglishName',
    'importerKoreanName',
    'importerEnglishAddress',
    'importerKoreanAddress',
    'businessNumber',
    'businessType',
    'businessItem',
    'phoneNumber',
    'email',
    'loadingPort',
  ]

  const missingFields = requiredFields.filter(field => !commonData[field as keyof CommonData])

  if (missingFields.length > 0) {
    return {
      isValid: false,
      errorMessage: `다음 필드를 입력해주세요: ${missingFields.join(', ')}`
    }
  }

  // 이메일 형식 검사
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(commonData.email)) {
    return {
      isValid: false,
      errorMessage: "올바른 이메일 주소를 입력해주세요."
    }
  }

  // 전화번호 형식 검사
  const phoneRegex = /^\d{3}-\d{4}-\d{4}$/
  if (!phoneRegex.test(commonData.phoneNumber)) {
    return {
      isValid: false,
      errorMessage: "올바른 전화번호 형식을 입력해주세요 (예: 010-1234-5678)."
    }
  }

  return { isValid: true, errorMessage: '' }
}

export const calculateAmount = (unitPrice: string, quantity: string): string => {
  const price = parseFloat(unitPrice)
  const qty = parseFloat(quantity)
  return isNaN(price) || isNaN(qty) ? '0' : (price * qty).toFixed(2)
}