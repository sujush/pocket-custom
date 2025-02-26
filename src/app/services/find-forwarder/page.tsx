'use client';

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

interface Forwarder {
    no: string;
    code: string;
    representative: string;
    nameKr: string;
    nameEn: string;
}

interface RecommendedForwarder {
    id: number;
    code: string;
    nameKr: string;
    nameEn: string;
    capabilities: string;
    address: string;
    contact: string;
}

interface ForwarderDetail {
    frwrSgn: string;            // 화물운송주선업자부호
    brnchAddr: string;           // 지점주소
    hdofAddr: string;           // 본사주소
    brno: string;             // 사업자등록번호
    telno: string;              // 전화번호
    koreConmNm: string;         // 화물운송주선업자한글명
    englConmNm: string;         // 화물운송주선업자영문명
    [key: string]: string;      // 기타 가능한 필드
}

// CSV 파일의 행 데이터 인터페이스
interface CSVRow {
    No: string;
    '부호': string;
    '대표자명': string;
    '화물운송주선업자명(한글)': string;
    '화물운송주선업자명(영문)': string;
    [key: string]: string;
}

const ForwarderFinder: React.FC = () => {
    const [forwarders, setForwarders] = useState<Forwarder[]>([]);
    const [filteredForwarders, setFilteredForwarders] = useState<Forwarder[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [recommendedForwarders, setRecommendedForwarders] = useState<RecommendedForwarder[]>([]);
    const [selectedForwarder, setSelectedForwarder] = useState<string | null>(null);
    const [forwarderDetail, setForwarderDetail] = useState<ForwarderDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState<boolean>(false);



    useEffect(() => {
        const loadData = async (): Promise<void> => {
            try {
                setLoading(true);
                // public 폴더에 저장된 CSV 파일을 fetch로 로드
                const response = await fetch('/data/forwarder-list.csv');
                const csvText = await response.text();

                // CSV 파싱
                Papa.parse<CSVRow>(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        // 포워더 데이터 저장
                        const data = results.data.map(row => ({
                            no: row.No,
                            code: row['부호'],
                            representative: row['대표자명'],
                            nameKr: row['화물운송주선업자명(한글)'],
                            nameEn: row['화물운송주선업자명(영문)']
                        }));

                        setForwarders(data);
                        setFilteredForwarders(data);

                        // 추천 포워더 예시 데이터
                        const recommended: RecommendedForwarder[] = [
                            {
                                id: 1,
                                code: 'AAAG',
                                nameKr: '주식회사 에이쓰리글로지스',
                                nameEn: 'A3 GLOGIS CO.,LTD',
                                capabilities: '해상운송, 항공운송, 국제물류',
                                address: '서울특별시 강남구 테헤란로 123',
                                contact: '02-1234-5678'
                            },
                            {
                                id: 2,
                                code: 'AALS',
                                nameKr: '(주)에이에이로지스틱스',
                                nameEn: 'AA LOGISTICS CO., LTD',
                                capabilities: '특수화물, 프로젝트 물류',
                                address: '부산광역시 중구 충장대로 456',
                                contact: '051-987-6543'
                            }
                        ];

                        setRecommendedForwarders(recommended);
                        setLoading(false);
                    },
                    error: (error: Error) => {
                        console.error('CSV 파싱 오류:', error);
                        setLoading(false);
                    }
                });
            } catch (error) {
                console.error('데이터 로드 오류:', error);
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // 검색어에 따른 필터링
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        if (term.trim() === '') {
            setFilteredForwarders(forwarders);
        } else {
            setFilteredForwarders(
                forwarders.filter(f =>
                    f.nameKr.toLowerCase().includes(term) ||
                    f.nameEn.toLowerCase().includes(term) ||
                    f.code.toLowerCase().includes(term)
                )
            );
        }
    };

    // fetchForwarderDetail 함수 수정
    const fetchForwarderDetail = async (code: string): Promise<void> => {
        if (!code || code.length !== 4) return;

        setDetailLoading(true);
        setSelectedForwarder(code);

        try {
            // 직접 관세청 API 호출 대신 자체 API 라우트 호출
            const url = `/api/forwarder-detail?code=${encodeURIComponent(code)}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`API 응답 오류: ${response.status}`);
            }

            const xmlText = await response.text();

            // XML 응답을 파싱
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "text/xml");

            // 전체 태그 목록 확인
            const allTags = xmlDoc.getElementsByTagName("*");
            console.log('사용 가능한 태그 목록:');
            const tagNames = new Set();
            for (let i = 0; i < allTags.length; i++) {
                tagNames.add(allTags[i].tagName);
            }
            console.log(Array.from(tagNames));

            // 데이터를 추출할 때 존재 여부 확인 후 기본값 설정
            const detail: ForwarderDetail = {
                frwrSgn: getNodeValue(xmlDoc, 'frwrSgn') || code,
                brnchAddr: getNodeValue(xmlDoc, 'brnchAddr') || '정보 없음',
                hdofAddr: getNodeValue(xmlDoc, 'hdofAddr') || '정보 없음',
                brno: getNodeValue(xmlDoc, 'brno') || '정보 없음',
                telno: getNodeValue(xmlDoc, 'telno') || '정보 없음',
                koreConmNm: getNodeValue(xmlDoc, 'koreConmNm') || '정보 없음',
                englConmNm: getNodeValue(xmlDoc, 'englConmNm') || '정보 없음'
            };

            setForwarderDetail(detail);

        } catch (error) {
            console.error(`화물운송주선업자 내역 조회 오류 (${code}):`, error);
            // 조회 실패 시 기본 데이터로 표시
            const forwarder = forwarders.find(f => f.code === code);
            if (forwarder) {
                setForwarderDetail({
                    frwrSgn: code,
                    brnchAddr: '정보를 불러올 수 없습니다',
                    hdofAddr: '정보를 불러올 수 없습니다',
                    brno: '정보를 불러올 수 없습니다',
                    telno: '정보를 불러올 수 없습니다',
                    koreConmNm: forwarder.nameKr,
                    englConmNm: forwarder.nameEn
                });
            }
        } finally {
            setDetailLoading(false);
        }
    };

    // XML에서 특정 태그의 값을 추출하는 헬퍼 함수
    const getNodeValue = (xmlDoc: Document, tagName: string): string | null => {
        const node = xmlDoc.getElementsByTagName(tagName)[0];
        return node ? node.textContent : null;
    };

    // 상세 정보 모달 닫기
    const closeDetail = (): void => {
        setSelectedForwarder(null);
        setForwarderDetail(null);
    };

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">화물운송주선사업자 찾기</h1>

            {/* 검색 입력 */}
            <div className="mb-6">
                <label htmlFor="search" className="block text-sm font-medium mb-2">업체명 또는 부호로 검색</label>
                <input
                    type="text"
                    id="search"
                    className="w-full p-2 border rounded"
                    placeholder="업체명 또는 부호를 입력하세요..."
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </div>

            {loading ? (
                <div className="text-center py-8">
                    <p>데이터를 불러오는 중입니다...</p>
                </div>
            ) : (
                <>
                    {/* 포워더 추천 섹션 */}
                    {recommendedForwarders.length > 0 && searchTerm.trim() === '' && (
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">포워더 추천</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {recommendedForwarders.map(forwarder => (
                                    <div key={forwarder.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                                        <h3 className="text-lg font-bold text-blue-800">{forwarder.nameKr}</h3>
                                        <p className="text-sm text-gray-600 mb-2">{forwarder.nameEn}</p>
                                        <div className="mt-3">
                                            <p><span className="font-semibold">주요 역량:</span> {forwarder.capabilities}</p>
                                            <p><span className="font-semibold">주소:</span> {forwarder.address}</p>
                                            <p><span className="font-semibold">연락처:</span> {forwarder.contact}</p>
                                        </div>
                                        <div className="mt-4">
                                            <button
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                                onClick={() => fetchForwarderDetail(forwarder.code)}
                                            >
                                                상세 정보 보기
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 포워더 목록 */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">검색 결과</h2>
                        {filteredForwarders.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="py-2 px-4 border text-left">No</th>
                                            <th className="py-2 px-4 border text-left">부호</th>
                                            <th className="py-2 px-4 border text-left">대표자</th>
                                            <th className="py-2 px-4 border text-left">업체명(한글)</th>
                                            <th className="py-2 px-4 border text-left">업체명(영문)</th>
                                            <th className="py-2 px-4 border text-left">상세정보</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredForwarders.slice(0, 100).map((forwarder, index) => (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                                <td className="py-2 px-4 border">{forwarder.no}</td>
                                                <td className="py-2 px-4 border">
                                                    <button
                                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                                        onClick={() => fetchForwarderDetail(forwarder.code)}
                                                    >
                                                        {forwarder.code}
                                                    </button>
                                                </td>
                                                <td className="py-2 px-4 border">{forwarder.representative}</td>
                                                <td className="py-2 px-4 border">{forwarder.nameKr}</td>
                                                <td className="py-2 px-4 border">{forwarder.nameEn}</td>
                                                <td className="py-2 px-4 border">
                                                    <button
                                                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                                        onClick={() => fetchForwarderDetail(forwarder.code)}
                                                    >
                                                        상세보기
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredForwarders.length > 100 && (
                                    <div className="mt-4 text-center text-gray-600">
                                        전체 {filteredForwarders.length}개 결과 중 처음 100개만 표시됩니다.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-center py-4 text-gray-500">
                                검색 결과가 없습니다. 다른 검색어를 입력해보세요.
                            </p>
                        )}
                    </div>

                    {/* 상세 정보 모달 */}
                    {selectedForwarder && (
                        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-bold">
                                            화물운송주선업자 상세 정보
                                        </h3>
                                        <button
                                            className="text-gray-500 hover:text-gray-700 text-2xl"
                                            onClick={closeDetail}
                                        >
                                            &times;
                                        </button>
                                    </div>

                                    {detailLoading ? (
                                        <div className="text-center py-8">
                                            <p>상세 정보를 불러오는 중입니다...</p>
                                        </div>
                                    ) : forwarderDetail ? (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-sm text-gray-500">부호</p>
                                                    <p className="font-semibold">{forwarderDetail.frwrSgn}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">사업자등록번호</p>
                                                    <p className="font-semibold">{forwarderDetail.brno}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-sm text-gray-500">화물운송주선업자명</p>
                                                <p className="font-semibold">{forwarderDetail.koreConmNm}</p>
                                                <p className="text-sm">{forwarderDetail.englConmNm}</p>
                                            </div>

                                            <div>
                                                <p className="text-sm text-gray-500">본사 주소</p>
                                                <p className="font-semibold">{forwarderDetail.hdofAddr}</p>
                                            </div>

                                            <div>
                                                <p className="text-sm text-gray-500">지점 주소</p>
                                                <p className="font-semibold">{forwarderDetail.brnchAddr}</p>
                                            </div>

                                            <div>
                                                <p className="text-sm text-gray-500">연락처</p>
                                                <p className="font-semibold">{forwarderDetail.telno}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-center py-4 text-gray-500">
                                            상세 정보를 불러올 수 없습니다.
                                        </p>
                                    )}

                                    <div className="mt-6 flex justify-end">
                                        <button
                                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                            onClick={closeDetail}
                                        >
                                            닫기
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ForwarderFinder;