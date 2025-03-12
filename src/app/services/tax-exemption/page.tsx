'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Info, RotateCcw } from 'lucide-react';

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
  
  // 진행률 계산을 위한 최대 질문 깊이 (가장 긴 경로의 질문 수)
  const MAX_QUESTION_DEPTH = 5;
  
  // 진행 상태 계산 함수
  const calculateProgress = () => {
    if (result) return 100;
    // 현재까지 진행된 단계(history.length + 현재 1) / 최대 질문 수
    return Math.min(Math.floor((history.length + 1) / MAX_QUESTION_DEPTH * 100), 95);
  };

  // 질문 데이터
  const questions: QuestionType[] = [
    {
      id: 'origin',
      text: '수입물품의 원산지가 한국인가요?',
      options: [
        { id: 'origin-yes', text: '예', next: 'repair-export' },
        { id: 'origin-no', text: '아니오', next: 'overseas-processing' },
      ],
    },
    // 원산지가 한국인 경우의 선택지
    {
      id: 'repair-export',
      text: '해당 제품을 수리하기 위해 해외로 수출하고 다시 수입하는 건가요?',
      options: [
        { id: 'repair-export-yes', text: '예', next: 'same-hscode' },
        { id: 'repair-export-no', text: '아니오', next: 're-import-2years' },
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
    // 재수입면세 관련 케이스
    {
      id: 're-import-2years',
      text: '해당 제품이 우리나라에서 수출(보세가공 수출 포함)된 제품으로서 해외에서 제조, 가공, 수리, 사용 중 어떤 것도 하지 않으면서 수출신고수리일로부터 2년 내에 다시 수입되는 제품인가요?',
      options: [
        { id: 're-import-2years-yes', text: '예', next: 're-import-exclusions' },
        { id: 're-import-2years-no', text: '아니오', next: 'container-research' },
      ],
    },
    {
      id: 're-import-exclusions',
      text: '다음 중 어느 하나에 해당하는 경우가 있나요?\n1) 해당 물품 또는 원자재에 대하여 관세를 감면받은 경우\n2) 이 법 또는 「수출용원재료에 대한 관세 등 환급에 관한 특례법」에 따른 환급을 받은 경우\n3) 이 법 또는 「수출용 원재료에 대한 관세 등 환급에 관한 특례법」에 따른 환급을 받을 수 있는 자 외의 자가 해당 물품을 재수입하는 경우. 다만, 재수입하는 물품에 대하여 환급을 받을 수 있는 자가 환급받을 권리를 포기하였음을 증명하는 서류를 재수입하는 자가 세관장에게 제출하는 경우는 제외합니다.',
      options: [
        { id: 're-import-exclusions-yes', text: '예', result: 'no-exemption' },
        { id: 're-import-exclusions-no', text: '아니오', result: 're-import-exemption' },
      ],
    },
    {
      id: 'container-research',
      text: '해당 제품이 1) 수출물품의 용기로서 다시 수입되는 제품인가요? 또는 2) 해외시험 연구를 목적으로 수출된 후 재수입되는 물품인가요?',
      options: [
        { id: 'container-research-yes', text: '예', result: 're-import-exemption' },
        { id: 'container-research-no', text: '아니오', result: 'no-exemption' },
      ],
    },
    // 원산지가 한국이 아닌 경우의 선택지 (신규 추가)
    {
      id: 'contract-different',
      text: '수입된 해당 제품이 계약 내용과 달라서 다시 수출하려고 하는 물품인가요?',
      options: [
        { id: 'contract-different-yes', text: '예', next: 're-export-check' },
        { id: 'contract-different-no', text: '아니오', result: 'no-exemption' },
      ],
    },
    {
      id: 're-export-check',
      text: '해당 제품이 외국으로부터 수입된 제품(또는 보세공장에서 생산된 물품)으로서 수입신고수리일로부터 1년 이내에 해당 물품을 보세구역(보세구역 외 허가장소 포함), 자유무역지역 또는 통관우체국에 반입한 후 다시 수출하였나요?',
      options: [
        { id: 're-export-check-yes', text: '예', result: 'contract-different-refund' },
        { id: 're-export-check-no', text: '아니오', result: 'no-exemption' },
      ],
    },
    {
      id: 'overseas-processing',
      text: '해당 수입 제품이 원재료 또는 부분품을 수출해서 해외에서 임가공을 통해 수입된 제품으로서 HS CODE 85류 또는 9006호에 해당하는 제품인가요?',
      options: [
        { id: 'overseas-processing-yes', text: '예', next: 'overseas-refund-check' },
        { id: 'overseas-processing-no', text: '아니오', next: 'import-repair' },
      ],
    },
    {
      id: 'overseas-refund-check',
      text: '해당 제품 또는 해당 제품에 사용된 원재료에 대하여 관세법 또는 수출용원재료에 대한 관세등 환급에 관한 특례법(이하 "환급특례법")에 따라 환급을 받은 적이 있나요? 혹은 보세가공 또는 장치기간경과물품을 재수출조건으로 매각함에 따라 관세가 부과되지 아니한 적이 있습니까?',
      options: [
        { id: 'overseas-refund-yes', text: '예', result: 'no-exemption' },
        { id: 'overseas-refund-no', text: '아니오', result: 'overseas-processing-deduction' },
      ],
    },
    {
      id: 'import-repair',
      text: '해당 제품이 수리를 위해 수입되는 물품으로서 해당 제품과, 수리 후 수출하는 물품의 HS CODE 10단위가 일치하나요?',
      options: [
        { id: 'import-repair-yes', text: '예', result: 're-export-exemption' },
        { id: 'import-repair-no', text: '아니오', next: 'rental-long-term' },
      ],
    },
    {
      id: 'rental-long-term',
      text: '해당 제품이 임대차계약, 도급계약 또는 수출계약의 이행을 위해 국내에서 일시적으로 사용하기 위한 제품으로서 장기간에 걸쳐 사용이 가능하며 내용연수가 5년(금형의 경우 2년) 이상이고 개당/세트당 관세액이 500만원 이상인 물품으로서 국내 제작이 곤란한 제품으로 행정기관에게 인정을 받은 제품인가요?',
      options: [
        { id: 'rental-long-term-yes', text: '예', result: 're-export-reduction' },
        { id: 'rental-long-term-no', text: '아니오', next: 'contract-different' },
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
      id: 're-import-exemption',
      title: '관세법 제99조 재수입면세제도',
      description: '관세법 제99조의 재수입면세제도에 따라 수입된 물품의 관세를 전액 면제받을 수 있습니다. 다만, 부가세의 경우에는 소유권의 이전 여부에 따라 면세 여부가 달라집니다. (수출 시 소유권 불이전 시 면세, 소유권 이전 시 과세)',
      isValid: true,
    },
    {
      id: 'overseas-processing-deduction',
      title: '관세법 제101조 해외임가공물품 등의 감면제도',
      description: '관세법 제101조 1항 1호에 따른 해외임가공물품 등 감세제도에 해당합니다. 이 경우 [수입물품의 제조 또는 가공에 사용된 원재료 및 부분품의 수출신고 가격 x 해당 수입물품에 적용되는 관세율] 만큼의 금액을 감면 받을 수 있습니다.',
      isValid: true,
    },
    {
      id: 're-export-exemption',
      title: '관세법 제97조 재수출면세제도',
      description: '관세법 제97조에 따른 재수출면세 적용대상으로서 해당 제품의 수입신고수리일로부터 1년의 기간으로 한정하여 그 수리에 소요될 것으로 인정되는 기간 내에 다시 수출할 경우 해당 수입 제품에 대한 관세가 전액 면제됩니다. 만약 세관장이 인정하는 부득이한 사유가 있는 경우에는 1년의 범위 내에서 기간 연장이 가능합니다 (최대 2년)',
      isValid: true,
    },
    {
      id: 're-export-reduction',
      title: '관세법 제98조 재수출감면제도',
      description: '관세법 제98조에 따른 재수출감면 적용대상으로서, 해당 제품의 수입신고수리일로부터 2년 내 / 만약 장기간 사용이 부득이한 경우 세관장의 승인을 받은 경우에는 4년 내에 해당 제품을 다시 수출하는 경우에는 아래와 같이 관세가 감면됩니다.\n\n1. 재수출기간이 6개월 이내인 경우: 해당 물품에 대한 관세액의 100분의 85\n2. 재수출기간이 6개월 초과 1년 이내인 경우: 해당 물품에 대한 관세액의 100분의 70\n3. 재수출기간이 1년 초과 2년 이내인 경우: 해당 물품에 대한 관세액의 100분의 55\n4. 재수출기간이 2년 초과 3년 이내인 경우: 해당 물품에 대한 관세액의 100분의 40\n5. 재수출기간이 3년 초과 4년 이내인 경우: 해당 물품에 대한 관세액의 100분의 30',
      isValid: true,
    },
    {
      id: 'contract-different-refund',
      title: '관세법 제106조 계약내용과 다른 물품 등에 대한 관세 환급',
      description: '수입신고 당시의 성질과 형태가 변화하지 않았다는 전제 하에 해당 제품은 관세법 제106조에 따른 계약내용과 다른 물품 등에 대한 관세 환급 제도가 적용됩니다. 이 경우 수입 시 납부한 관세를 전액 환급 받을 수 있으며, 만약 일부만 수출된 경우에는 일부에 해당하는 관세를 환급받을 수 있습니다.',
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
      <h1 className="text-3xl font-bold mb-4 text-center">관세법에 따른 면세/감세/환급 제도 확인</h1>
      
      <Alert className="mb-6 bg-blue-50 border-blue-200">
        <Info className="h-5 w-5 text-blue-500" />
        <AlertDescription className="text-sm">
          여기서 확인되는 내용은 통상적인 수입을 전제로 합니다. 전시회, 박람회 등이나 일시 입국자의 수입 물품, 여행자 휴대물품 등에 대해서는 범위에 포함하지 않은 점을 참고 부탁드립니다. 또한 거래 단계를 최소화한 상태를 전제로 하였으므로 복잡한 거래관계 등의 경우에는 관세사에게 문의하시기 바라며, 확인 결과 적용되는 규정이 없는 경우에도 면제 규정 등에 의해 관세가 면제될 수도 있으니 관세사와 상의하시길 바랍니다.
        </AlertDescription>
      </Alert>
      
      {/* 진행 과정 표시 */}
      <div className="mb-8">
        <p className="text-sm text-gray-500 mb-2">단계별 질문에 답하여 적용 가능한 제도를 확인하세요.</p>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${calculateProgress()}%` }}
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
                  <h2 className="text-xl font-semibold mb-4 whitespace-pre-line">{currentQuestion.text}</h2>
                  
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
                
                <div className="flex justify-between mt-8">
                  <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    이전 단계
                  </Button>
                  <Button onClick={handleReset}>
                    <RotateCcw className="mr-2 h-4 w-4" />
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