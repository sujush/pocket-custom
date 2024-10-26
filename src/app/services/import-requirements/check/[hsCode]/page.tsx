'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import xml2js from 'xml2js';

interface RequirementResult {
  dcerCfrmLworNm: string;
  reqCfrmIstmNm: string;
}

async function fetchRequirements(hsCode: string): Promise<RequirementResult[]> {
  const serviceKey = process.env.NEXT_PUBLIC_SERVICE_KEY;
  const apiUrl = process.env.NEXT_PUBLIC_SERVICE_URL;
  const imexTpcd = 2;

  const url = `${apiUrl}?serviceKey=${serviceKey}&hsSgn=${hsCode}&imexTpcd=${imexTpcd}`;

  try {
    const response = await fetch(url);
    const data = await response.text();

    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(data);

    const items = result.response.body[0].items[0].item || [];
    return items.map((item: any) => ({
      dcerCfrmLworNm: item.dcerCfrmLworNm[0],
      reqCfrmIstmNm: item.reqCfrmIstmNm[0],
    }));
  } catch (error) {
    console.error("Error fetching requirements:", error);
    throw error;
  }
}

export default function ImportRequirementsCheckPage({ params }: { params: { hsCode: string } }) {
  const [requirements, setRequirements] = useState<RequirementResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequirement, setSelectedRequirement] = useState<string | null>(null);
  const [requirementDescription, setRequirementDescription] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequirementsData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchRequirements(params.hsCode);
        const uniqueData = data.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.dcerCfrmLworNm === item.dcerCfrmLworNm && t.reqCfrmIstmNm === item.reqCfrmIstmNm),
        );
        setRequirements(uniqueData);
      } catch (error) {
        setError('수입요건 조회 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.hsCode) {
      fetchRequirementsData();
    }
  }, [params.hsCode]);

  const fetchRequirementDescriptions = async (reqCfrmIstmNm: string) => {
    try {
      const response = await fetch(`/api/requirements?reqCfrmIstmNm=${reqCfrmIstmNm}`);
      const data = await response.json();
      setRequirementDescription(data.description || '해당 요건에 대한 설명이 없습니다.');
    } catch (error) {
      console.error('Error fetching requirements description:', error);
      setRequirementDescription('설명을 불러오지 못했습니다.');
    }
  };

  const handleRequirementClick = (reqCfrmIstmNm: string) => {
    setSelectedRequirement(reqCfrmIstmNm);
    fetchRequirementDescriptions(reqCfrmIstmNm);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">수입요건 확인</h1>

      <div className="flex">
        <div className="w-1/2 pr-4">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>조회 품목번호: {params.hsCode}</CardTitle>
            </CardHeader>
          </Card>

          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <Card className="bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          ) : requirements.length > 0 ? (
            <div className="space-y-4">
              {requirements.map((requirement, index) => (
                <Card
                  key={index}
                  onClick={() => handleRequirementClick(requirement.reqCfrmIstmNm)}
                  className="cursor-pointer transition transform hover:scale-105 hover:bg-gray-100"
                >
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="font-semibold">법령명</p>
                        <p>{requirement.dcerCfrmLworNm || '정보 없음'}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="font-semibold">요건확인서</p>
                        <p>{requirement.reqCfrmIstmNm || '정보 없음'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-4">
                <p className="text-center text-gray-500">해당 품목번호에 대한 수입요건이 없습니다.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="w-1/2 pl-4">
          <Card className="h-full bg-gray-50 shadow-lg animate-fade-in">
            <CardHeader>
              <CardTitle>요건 설명</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-gray-600" style={{ whiteSpace: 'pre-line'}}>
                {requirementDescription || '요건 확인서를 선택하여 설명을 확인하세요.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
