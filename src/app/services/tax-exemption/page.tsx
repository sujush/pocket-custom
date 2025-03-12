'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Info } from 'lucide-react';

// 질문 및 결과 타입 정의
type OptionType = {
  id: string;
  text: string;
  next?: string;
  result?: string;
};

type QuestionType = {
  id: string;
  text: string;
  options: OptionType[];
};

type ResultType = {
  id: string;
  title: string;
  description: string;
  isValid: boolean;
};

export default function TaxExemptionPage() {
  // 현재 질문 상태 관리
  const [currentQuestionId, setCurrentQuestionId] = useState<string>('origin');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [result, setResult] = useState<ResultType | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  // 질문 데이터
  const questions: QuestionType[] = [
    {
      id: 'origin',
      text: '수입물품의 원산지가 한국인가요?',
      options: [
        { id: 'origin-yes', text: '예', next: 'repair-export' },
        { id: 'origin-no', text: '아니오', next: 'other-case' }, // 추후 다른 케이스 추가 가능
      ],
    },
    {
      id: 'repair-export',
      text: '해당 제품을 수리하기 위해 해외로 수출하고 다시 수입하는 건가요?',
      options: [
        { id: 'repair-export-yes', text: '예', next: 'same-hscode' },
        { id: 'repair-export-no', text: '아니오', next: 'other-case' }, // 추후 다른 케이스 추가 가능
      ],
    },
    {
      id: 'same-hscode',
      text: '수리하기 위해 수출된 물품과 수리 후 다시 수입되는 물품의 HS CODE 10단위가 동일한가요?',
      options: [
        { id: 'same-hscode-yes', text: '예', next: 'refund-history' },
        { id: 'same-hscode-no', text: '아니오', next: 'reprocessed-product' },
      ],
    },
    {
      id: 'refund-history',
      text: '해당 제품 또는 해당 제품에 사용된 원재료에 대하여 관세법 또는 수출용원재료에 대한 관세등 환급에 관한 특례법(이하 "환급특례법")에 따라 환급을 받은 적이 있나요?',
      options: [
        { id: 'refund-history-yes', text: '예', result: 'no-exemption' },
        { id: 'refund-history-no', text: '아니오', result: 'overseas-processing-reduction' },
      ],
    },
    {
      id: 'reprocessed-product',
      text: '해당 제품이 수율 또는 성능이 저하되어 폐기된 물품을 수출하여 용융과정 등을 거쳐 재생한 후 다시 수입되는 경우이거나, 제품의 제작일련번호 또는 제품의 특성으로 보아 수입물품이 우리나라에서 수출된 물품임을 세관장이 확인할 수 있는 물품인가요?',
      options: [
        { id: 'reprocessed-product-yes', text: '예', next: 'refund-history' },
        { id: 'reprocessed-product-no', text: '아니오', result: 'no-exemption' },
      ],
    },
    {
      id: 'other-case',
      text: '다른 케이스에 대한 질문입니다.',
      options: [
        // 추후 확장 가능
        { id: 'other-case-yes', text: '예', result: 'no-exemption' },
        { id: 'other-case-no', text: '아니오', result: 'no-exemption' },
      ],
    },
  ];

  // 결과 데이터
  const results: ResultType[] = [
    {
      id: 'overseas-processing-reduction',
      title: '관세법 제101조 해외임가공물품 등의 감면제도',
      description: '관세법 제101조 해외임가공물품 등의 감면제도의 1항 2호에 따라 수리 물품의 수출신고가격에 해당 수입물품에 적용되는 관세율을 곱한 금액에 대하여 관세가 경감됩니다. 만약 수입물품이 매매계약상의 하자보수보증기간(수입신고수리일로부터 1년 이내 한정) 내에 하자가 발생하거나 고장이 발생하여 외국 매도인의 부담으로 수리하기 위해 수출된 물품인 경우 1) 상기의 경감액 외에 2) 수출물품의 양륙항까지의 운임 및 보험료, 3) 수리비용, 4) 수리 후 물품의 선적항에서 국내 수입항까지의 운임 및 보험료까지를 포함한 금액까지 추가로 경감 가능합니다.',
      isValid: true,
    },
    {
      id: 'no-exemption',
      title: '적용 가능한 면세/경감제도 없음',
      description: '적용되는 면세 또는 경감제도가 없습니다.',
      isValid: false,
    },
  ];

  // 현재 질문 가져오기
  const currentQuestion = questions.find((q) => q.id === currentQuestionId);

  // 옵션 선택 핸들러
  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  // 다음 단계로 이동
  const handleNextStep = () => {
    if (!selectedOption) return;

    const question = questions.find((q) => q.id === currentQuestionId);
    if (!question) return;

    const selectedOpt = question.options.find((opt) => opt.id === selectedOption);
    if (!selectedOpt) return;

    // 히스토리에 현재 질문 추가
    setHistory([...history, currentQuestionId]);

    // 결과가 있으면 결과 표시
    if (selectedOpt.result) {
      const resultData = results.find((r) => r.id === selectedOpt.result);
      if (resultData) {
        setResult(resultData);
      }
    } 
    // 다음 질문으로 이동
    else if (selectedOpt.next) {
      setCurrentQuestionId(selectedOpt.next);
      setSelectedOption('');
    }
  };

  // 이전 단계로 이동
  const handleBack = () => {
    if (history.length > 0) {
      const prevQuestion = history.pop() || 'origin';
      setCurrentQuestionId(prevQuestion);
      setSelectedOption('');
      setResult(null);
      setHistory([...history]);
    }
  };

  // 처음으로 돌아가기
  const handleReset = () => {
    setCurrentQuestionId('origin');
    setSelectedOption('');
    setResult(null);
    setHistory([]);
  };

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">관세법에 따른 면세/감세/환급 제도 확인</h1>
      
      {/* 진행 과정 표시 */}
      <div className="mb-8">
        <p className="text-sm text-gray-500 mb-2">단계별 질문에 답하여 적용 가능한 제도를 확인하세요.</p>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: result ? '100%' : `${(history.length + 1) * 20}%` }}
          ></div>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          {!result ? (
            <>
              {/* 질문 섹션 */}
              {currentQuestion && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">{currentQuestion.text}</h2>
                  
                  <div className="space-y-3 mb-6">
                    {currentQuestion.options.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={option.id}
                          name="radio-options"
                          value={option.id}
                          checked={selectedOption === option.id}
                          onChange={() => handleOptionSelect(option.id)}
                          className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor={option.id} className="cursor-pointer">{option.text}</Label>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between mt-8">
                    {history.length > 0 ? (
                      <Button variant="outline" onClick={handleBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        이전 단계
                      </Button>
                    ) : (
                      <div></div>
                    )}
                    <Button 
                      onClick={handleNextStep} 
                      disabled={!selectedOption}
                    >
                      다음 단계
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* 결과 섹션 */}
              <div>
                <h2 className="text-xl font-semibold mb-4">결과</h2>
                
                <Alert className={result.isValid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                  <Info className={`h-5 w-5 ${result.isValid ? "text-green-500" : "text-red-500"}`} />
                  <AlertTitle className="text-lg font-semibold">
                    {result.title}
                  </AlertTitle>
                  <AlertDescription className="mt-2 text-sm whitespace-pre-line">
                    {result.description}
                  </AlertDescription>
                </Alert>
                
                <div className="flex justify-center mt-8">
                  <Button onClick={handleReset}>
                    처음부터 다시 확인하기
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      <div className="text-sm text-gray-500 mt-8">
        <p>※ 본 안내는 참고용으로 제공되며, 정확한 내용은 관세법 및 관련 법령을 확인하시기 바랍니다.</p>
        <p>※ 구체적인 사례에 따라 적용 가능한 제도가 달라질 수 있으니, 필요시 관세청 또는 관세사에게 문의하시기 바랍니다.</p>
      </div>
    </div>
  );
}