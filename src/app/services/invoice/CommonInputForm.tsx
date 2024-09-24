// CommonInputForm.tsx

import React from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CommonData } from './types'

type CommonInputFormProps = {
  commonData: CommonData;
  handleCommonInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  isEditingNotifyParty: boolean;
  setIsEditingNotifyParty: (value: boolean) => void;
  handleNextPage: () => void;
}

export default function CommonInputForm({
  commonData,
  handleCommonInputChange,
  handleSelectChange,
  isEditingNotifyParty,
  setIsEditingNotifyParty,
  handleNextPage
}: CommonInputFormProps) {
  return (
    <>
      <h2 className="text-2xl font-bold">공통 입력 사항</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* 수출자 정보 */}
          <div>
            <Label htmlFor="exporterName">수출자 영문상호명</Label>
            <Input id="exporterName" name="exporterName" value={commonData.exporterName} onChange={handleCommonInputChange} />
          </div>
          <div>
            <Label htmlFor="exporterAddress">수출자 영문주소</Label>
            <Textarea id="exporterAddress" name="exporterAddress" value={commonData.exporterAddress} onChange={handleCommonInputChange} />
          </div>
          
          {/* 수입자 정보 */}
          <div>
            <Label htmlFor="importerEnglishName">수입자 영문상호명</Label>
            <Input id="importerEnglishName" name="importerEnglishName" value={commonData.importerEnglishName} onChange={handleCommonInputChange} pattern="^[a-zA-Z0-9\s]+$" />
          </div>
          <div>
            <Label htmlFor="importerKoreanName">수입자 한글상호명</Label>
            <Input id="importerKoreanName" name="importerKoreanName" value={commonData.importerKoreanName} onChange={handleCommonInputChange} pattern="^[가-힣\s]+$" />
          </div>
          <div>
            <Label htmlFor="importerEnglishAddress">수입자 영문주소</Label>
            <Textarea id="importerEnglishAddress" name="importerEnglishAddress" value={commonData.importerEnglishAddress} onChange={handleCommonInputChange} pattern="^[a-zA-Z0-9\s]+$" />
          </div>
          <div>
            <Label htmlFor="importerKoreanAddress">수입자 한글주소</Label>
            <Textarea id="importerKoreanAddress" name="importerKoreanAddress" value={commonData.importerKoreanAddress} onChange={handleCommonInputChange} pattern="^[가-힣\s]+$" />
          </div>
          
          {/* 사업자 정보 */}
          <div>
            <Label htmlFor="businessNumber">사업자등록번호</Label>
            <Input id="businessNumber" name="businessNumber" value={commonData.businessNumber} onChange={handleCommonInputChange} pattern="\d*" maxLength={10} />
          </div>
          <div>
            <Label htmlFor="businessType">업태</Label>
            <Input id="businessType" name="businessType" value={commonData.businessType} onChange={handleCommonInputChange} />
          </div>
          <div>
            <Label htmlFor="businessItem">종목</Label>
            <Input id="businessItem" name="businessItem" value={commonData.businessItem} onChange={handleCommonInputChange} />
          </div>
          
          {/* 연락처 정보 */}
          <div>
            <Label htmlFor="phoneNumber">휴대폰 번호</Label>
            <Input id="phoneNumber" name="phoneNumber" value={commonData.phoneNumber} onChange={handleCommonInputChange} pattern="\d{3}-\d{4}-\d{4}" placeholder="010-0000-0000" />
          </div>
          <div>
            <Label htmlFor="email">이메일 주소</Label>
            <Input id="email" name="email" type="email" value={commonData.email} onChange={handleCommonInputChange} pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" />
          </div>
          
          {/* NOTIFY PARTY */}
          <div>
            <Label htmlFor="notifyParty">NOTIFY PARTY (착하통지서)</Label>
            <Textarea 
              id="notifyParty" 
              name="notifyParty" 
              value={commonData.notifyParty} 
              onChange={handleCommonInputChange}
              disabled={!isEditingNotifyParty}
            />
            <Button onClick={() => setIsEditingNotifyParty(!isEditingNotifyParty)} className="mt-2">
              {isEditingNotifyParty ? '저장' : '수정'}
            </Button>
          </div>
          
          {/* 운송 정보 */}
          <div>
            <Label htmlFor="loadingPort">선적항</Label>
            <Input id="loadingPort" name="loadingPort" value={commonData.loadingPort} onChange={handleCommonInputChange} pattern="^[a-zA-Z\s]+$" />
          </div>
          <div>
            <Label htmlFor="destinationPort">도착항</Label>
            <Input id="destinationPort" name="destinationPort" value={commonData.destinationPort} onChange={handleCommonInputChange} pattern="^[a-zA-Z\s]+$" />
          </div>
          <div>
            <Label htmlFor="transportMethod">운송수단</Label>
            <Select name="common.transportMethod" onValueChange={(value) => handleSelectChange('common.transportMethod', value)}>
              <SelectTrigger>
                <SelectValue placeholder="운송수단 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ship">선박</SelectItem>
                <SelectItem value="air">항공기</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="shippingDate">선적일자</Label>
            <Input 
              id="shippingDate" 
              name="shippingDate" 
              type="date" 
              value={commonData.shippingDate} 
              onChange={handleCommonInputChange}
              placeholder="(모르시면 비워두세요)"
            />
          </div>
        </div>
      </div>
      <Button onClick={handleNextPage} className="mt-4">다음</Button>
    </>
  )
}