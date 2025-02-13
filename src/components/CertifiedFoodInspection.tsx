'use client'

import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, PlusCircle, Trash2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// 타입 정의
type CategoryType = '가공식품' | '기구ㆍ용기등' | null;
type FeatureType = '한글표시사항 작성' | '검사비용 확인' | null;
type GlassType = 
  | "유리제 (비가열조리용) 포함"
  | "유리제 (열탕용) 포함"
  | "유리제 (전자레인지용) 포함"
  | "유리제 (오븐용) 포함"
  | "유리제 (직화용) 포함"
  | "해당사항 없음"
  | null;

// 인터페이스 정의
interface MaterialCost {
  cost: number;
}

interface SubCategory {
  [key: string]: MaterialCost;
}

interface MidCategory {
  [key: string]: SubCategory;
}

interface MainCategory {
  [key: string]: MidCategory;
}

interface CostSelection {
  id: string;
  mainCategory: string;
  midCategory: string;
  subCategory: string;
  cost: number;
}

interface FormDataType {
  productName: string;
  material: string;
  manufacturer: string;
  importer: string;
  address: string;
  contact: string;
  origin: string;
}

interface ResultType extends FormDataType {
  additionalText: string;
}

interface CategoryItem {
  id: CategoryType;
  label: string;
  description: string;
}

interface FeatureItem {
  id: FeatureType;
  label: string;
  description: string;
}

interface FormField {
  id: keyof FormDataType;
  label: string;
}

interface StepProps {
  number: string;
  title: string;
  active: boolean;
}

// materialsData 정의 (예시 데이터)
const materialsData: MainCategory = {
  "합성수지제": {
    "올레핀계": {
      "폴리에틸렌(PE) 및 폴리프로필렌(PP)": { cost: 100000 },
      "에틸렌-초산비닐 공중합체(EVA)": { cost: 150000 }
    },
    "에스테르계": {
      "폴리부틸렌테레프탈레이트(PBT)": { cost: 200000 }
    }
  },
  "고무제": {
    "고무류": {
      "고무제": { cost: 300000 }
    }
  }
  // 여기에 더 많은 재질과 비용 데이터 추가
};

export default function CertifiedFoodInspection(): JSX.Element {
  // 상태 관리
  const [category, setCategory] = useState<CategoryType>(null)
  const [feature, setFeature] = useState<FeatureType>(null)
  const [inputValue, setInputValue] = useState<string>('')
  const [result, setResult] = useState<ResultType | null>(null)
  const [glassType, setGlassType] = useState<GlassType>(null)
  const [formData, setFormData] = useState<FormDataType>({
    productName: '',
    material: '',
    manufacturer: '',
    importer: '',
    address: '',
    contact: '',
    origin: ''
  })
  const [showTable, setShowTable] = useState<boolean>(false)
  const [selections, setSelections] = useState<CostSelection[]>([{
    id: '1',
    mainCategory: '',
    midCategory: '',
    subCategory: '',
    cost: 0
  }])
  const [totalCost, setTotalCost] = useState<number>(0)

  // 상수 데이터
  const foodTypes: string[] = [
    "과자류, 빵류 또는 떡류",
    "빙과류",
    "코코아가공품류 또는 초콜릿류",
    "당류",
    "잼류",
    "두부류 또는 묵류",
    "식용유지류",
    "면류",
    "음료류",
    "특수용도식품",
    "장류",
    "조미식품",
    "절임류 또는 조림류",
    "주류",
    "농산가공식품류",
    "식육가공품 및 포장육",
    "알가공품류",
    "유가공품",
    "수산가공식품류",
    "동물성가공식품류",
    "벌꿀 및 화분가공품",
    "즉석식품류",
    "기타식품류",
  ]

  const glassTypes: GlassType[] = [
    "유리제 (비가열조리용) 포함",
    "유리제 (열탕용) 포함",
    "유리제 (전자레인지용) 포함",
    "유리제 (오븐용) 포함",
    "유리제 (직화용) 포함",
    "해당사항 없음"
  ]

  const formFields: FormField[] = [
    { id: 'productName', label: '제품명' },
    { id: 'material', label: '식품에 닿는 부분의 재질' },
    { id: 'manufacturer', label: '해외제조업소 영문명' },
    { id: 'importer', label: '수입자 업체명' },
    { id: 'address', label: '수입자 주소 (영업등록증상 주소)' },
    { id: 'contact', label: '수입자 연락처' },
    { id: 'origin', label: '원산지' }
  ]

  const categories: CategoryItem[] = [
    { id: '가공식품', label: '가공식품', description: '식품 첨가물, 건강기능식품 등' },
    { id: '기구ㆍ용기등', label: '기구ㆍ용기등', description: '식품용 기구, 용기, 포장재 등' }
  ]

  const features: FeatureItem[] = [
    { id: '한글표시사항 작성', label: '한글표시사항 작성', description: '제품의 한글 표시사항을 작성합니다' },
    { id: '검사비용 확인', label: '검사비용 확인', description: '예상되는 검사 비용을 확인합니다' }
  ]

  // 유틸리티 함수
  const getGlassMaterial = (type: GlassType): string => {
    switch(type) {
      case "유리제 (열탕용) 포함":
        return "유리제(열탕용)";
      case "유리제 (전자레인지용) 포함":
        return "유리제(전자레인지용)";
      case "유리제 (오븐용) 포함":
        return "유리제(오븐용)";
      case "유리제 (직화용) 포함":
        return "유리제(직화용)";
      default:
        return "";
    }
  }

  const getAdditionalText = (type: GlassType): string => {
    if (type === "유리제 (비가열조리용) 포함") {
      return "가열조리용으로 사용하지 마십시오"
    } else if (type && type !== "해당사항 없음") {
      return "표시된 용도 외로 사용하지 마십시오"
    }
    return ""
  }

  // 이벤트 핸들러
  const handleGlassTypeSelect = (type: GlassType): void => {
    setGlassType(type);
    if (type !== "유리제 (비가열조리용) 포함" && type !== "해당사항 없음" && type !== null) {
      const glassText = getGlassMaterial(type);
      setFormData(prev => ({
        ...prev,
        material: `${glassText}, `
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        material: ''
      }));
    }
  }

  const handleInputChange = (field: keyof FormDataType, value: string): void => {
    if (field === 'material' && 
        glassType && 
        glassType !== "유리제 (비가열조리용) 포함" && 
        glassType !== "해당사항 없음") {
      const baseGlassText = getGlassMaterial(glassType);
      
      if (!value.startsWith(baseGlassText)) {
        value = baseGlassText + value.slice(baseGlassText.length - 1);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }

  const handleFormSubmit = (): void => {
    const isFormComplete = Object.values(formData).every(value => value.trim() !== '');
    
    if (!isFormComplete) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    const modifiedFormData = {
      ...formData,
      productName: `${formData.productName} (식품용)`
    };

    const additionalText = getAdditionalText(glassType);
    setResult({ ...modifiedFormData, additionalText });
    setShowTable(true);
  }

  const handleAddMaterial = (): void => {
    setSelections(prev => [...prev, {
      id: Date.now().toString(),
      mainCategory: '',
      midCategory: '',
      subCategory: '',
      cost: 0
    }]);
  }

  const handleRemoveMaterial = (id: string): void => {
    setSelections(prev => prev.filter(item => item.id !== id));
  }

  const handleSelectionChange = (id: string, field: keyof CostSelection, value: string): void => {
    setSelections(prev => prev.map(selection => {
      if (selection.id === id) {
        const updated = { ...selection, [field]: value };
        
        if (field === 'mainCategory') {
          updated.midCategory = '';
          updated.subCategory = '';
          updated.cost = 0;
        } else if (field === 'midCategory') {
          updated.subCategory = '';
          updated.cost = 0;
        } else if (field === 'subCategory' && updated.mainCategory && updated.midCategory) {
          updated.cost = materialsData[updated.mainCategory][updated.midCategory][value].cost;
        }

        return updated;
      }
      return selection;
    }));
  }

  // 총 비용 계산 Effect
  React.useEffect(() => {
    const total = selections.reduce((sum, selection) => sum + selection.cost, 0);
    setTotalCost(total);
  }, [selections]);

  // Step 컴포넌트
  const Step = ({ number, title, active }: StepProps): JSX.Element => (
    <div className="flex items-center gap-2 text-sm">
      <div className={`rounded-full w-6 h-6 flex items-center justify-center ${
        active ? 'bg-blue-500 text-white' : 'bg-gray-200'
      }`}>
        {number}
      </div>
      <span className={active ? 'font-semibold' : 'text-gray-500'}>{title}</span>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto mt-8 p-8 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">수입식품 검사 서비스</h2>
      
      {/* Progress Steps */}
      <div className="flex justify-between mb-8 px-4">
        <Step number="1" title="검사 유형 선택" active={!category} />
        <Step number="2" title="기능 선택" active={Boolean(category && !feature)} />
        <Step number="3" title="정보 입력" active={Boolean(category && feature)} />
      </div>

      {/* Category Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">검사 유형을 선택하세요:</h3>
        <div className="flex flex-row gap-4 w-full">
          {categories.map((item) => (
            <Card 
              key={item.id}
              className={`cursor-pointer transition-all hover:shadow-md flex-1 ${
                category === item.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => {
                if (category === item.id) {
                  setCategory(null)
                  setFeature(null)
                  setInputValue('')
                  setGlassType(null)
                  setFormData({
                    productName: '',
                    material: '',
                    manufacturer: '',
                    importer: '',
                    address: '',
                    contact: '',
                    origin: ''
                  })
                  setShowTable(false)
                  setSelections([{
                    id: '1',
                    mainCategory: '',
                    midCategory: '',
                    subCategory: '',
                    cost: 0
                  }])
                } else {
                  setCategory(item.id)
                  setInputValue('')
                  setGlassType(null)
                  setFormData({
                    productName: '',
                    material: '',
                    manufacturer: '',
                    importer: '',
                    address: '',
                    contact: '',
                    origin: ''
                  })
                  setShowTable(false)
                }
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{item.label}</h4>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  {category === item.id && <CheckCircle2 className="text-blue-500" />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Feature Selection */}
      {category && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">이용할 기능을 선택하세요:</h3>
          <div className="flex flex-row gap-4 w-full">
            {features.map((item) => (
              <Card 
                key={item.id}
                className={`cursor-pointer transition-all hover:shadow-md flex-1 ${
                  feature === item.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => {
                  if (feature === item.id) {
                    setFeature(null)
                  } else {
                    setFeature(item.id)
                    setGlassType(null)
                    setShowTable(false)
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{item.label}</h4>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    {feature === item.id && <CheckCircle2 className="text-blue-500" />}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Input Forms */}
      {feature && (
        <div className="mb-8">
          {/* 가공식품 - 한글표시사항 작성 */}
          {category === '가공식품' ? (
            <>
              <h3 className="text-lg font-semibold mb-4">식품유형 선택:</h3>
              <div className="space-y-4">
                <Select value={inputValue} onValueChange={setInputValue}>
                  <SelectTrigger className="w-full p-3">
                    <SelectValue placeholder="식품유형을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {foodTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleFormSubmit}
                  className="w-full py-6 text-lg bg-blue-500 hover:bg-blue-600"
                >
                  결과 확인
                </Button>
              </div>
            </>
          ) : category === '기구ㆍ용기등' && feature === '한글표시사항 작성' ? (
            <>
              {!glassType ? (
                <>
                  <h3 className="text-lg font-semibold mb-4">유리제 포함 여부 선택:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {glassTypes.map((type) => (
                      <Card 
                        key={type}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          glassType === type ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => handleGlassTypeSelect(type)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{type}</h4>
                            </div>
                            {glassType === type && <CheckCircle2 className="text-blue-500" />}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-4">상세 정보 입력:</h3>
                  <div className="space-y-4">
                    {formFields.map((field) => (
                      <div key={field.id}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label}
                        </label>
                        <Input
                          key={field.id}
                          className="w-full p-3"
                          value={formData[field.id]}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          placeholder={field.id === 'material' 
                            ? "정확한 재질을 입력하세요 EX) 폴리프로필렌 또는 PP 등" 
                            : `${field.label}을(를) 입력하세요`}
                        />
                      </div>
                    ))}
                    <Button 
                      onClick={handleFormSubmit}
                      className="w-full py-6 text-lg bg-blue-500 hover:bg-blue-600"
                    >
                      결과 확인
                    </Button>
                  </div>
                </>
              )}
            </>
          ) : category === '기구ㆍ용기등' && feature === '검사비용 확인' ? (
            <div className="space-y-6">
              {selections.map((selection, index) => (
                <Card key={selection.id} className="p-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">재질 {index + 1}</h3>
                      {selections.length > 1 && (
                        <Button
                          variant="ghost"
                          onClick={() => handleRemoveMaterial(selection.id)}
                        >
                          <Trash2 className="h-5 w-5 text-red-500" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <Select
                        value={selection.mainCategory}
                        onValueChange={(value) => handleSelectionChange(selection.id, 'mainCategory', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="대분류 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(materialsData).map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={selection.midCategory}
                        onValueChange={(value) => handleSelectionChange(selection.id, 'midCategory', value)}
                        disabled={!selection.mainCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="중분류 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {selection.mainCategory && 
                            Object.keys(materialsData[selection.mainCategory]).map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={selection.subCategory}
                        onValueChange={(value) => handleSelectionChange(selection.id, 'subCategory', value)}
                        disabled={!selection.midCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="소분류 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {selection.mainCategory && selection.midCategory &&
                            Object.keys(materialsData[selection.mainCategory][selection.midCategory]).map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selection.cost > 0 && (
                      <div className="text-right text-sm text-gray-600">
                        예상 비용: {selection.cost.toLocaleString()}원
                      </div>
                    )}
                  </div>
                </Card>
              ))}

              <Button
                onClick={handleAddMaterial}
                variant="outline"
                className="w-full"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                재질 추가
              </Button>

              {totalCost > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold">
                    총 예상 비용: {totalCost.toLocaleString()}원
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    * 해당 비용은 예상비용으로서 실제 발생 비용은 달라질 수 있습니다.
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Result Table */}
      {showTable && result && feature === '한글표시사항 작성' && (
        <div className="mt-8">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th colSpan={2} className="text-center p-4 border-b font-bold">
                  식품위생법에 따른 한글표시사항
                </th>
              </tr>
              <tr>
                <th className="text-left p-4 border-b w-1/3">항목</th>
                <th className="text-left p-4 border-b">내용</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-4 border-b font-medium">제품명</td>
                <td className="p-4 border-b">{result.productName}</td>
              </tr>
              <tr>
                <td className="p-4 border-b font-medium">식품에 닿는 부분의 재질</td>
                <td className="p-4 border-b">{result.material}</td>
              </tr>
              <tr>
                <td className="p-4 border-b font-medium">해외제조업소 영문명</td>
                <td className="p-4 border-b">{result.manufacturer}</td>
              </tr>
              <tr>
                <td className="p-4 border-b font-medium">수입자 업체명</td>
                <td className="p-4 border-b">{result.importer}</td>
              </tr>
              <tr>
                <td className="p-4 border-b font-medium">수입자 주소</td>
                <td className="p-4 border-b">{result.address}</td>
              </tr>
              <tr>
                <td className="p-4 border-b font-medium">수입자 연락처</td>
                <td className="p-4 border-b">{result.contact}</td>
              </tr>
              <tr>
                <td className="p-4 border-b font-medium">원산지</td>
                <td className="p-4 border-b">{result.origin}</td>
              </tr>
              {result.additionalText && (
                <tr>
                  <td className="p-4 border-b font-medium">추가 안내사항</td>
                  <td className="p-4 border-b text-red-500 font-semibold">{result.additionalText}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}          