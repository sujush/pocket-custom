'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Loader2, Search, FileText, ArrowLeft, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


// API 키는 서버 측 API 라우트에서만 사용하므로 클라이언트 코드에서는 필요 없음

// 타입 정의
interface KCCertification {
  certUid: number;
  certOrganName: string;
  certNum: string;
  certState: string;
  certDiv: string;
  certDate: string;
  certChgDate: string | null;
  certChgReason: string | null;
  firstCertNum: string;
  productName: string;
  brandName: string | null;
  modelName: string;
  categoryName: string | null;
  importDiv: string;
  makerName: string;
  makerCntryName: string;
  importerName: string;
  remark: string | null;
  signDate: string;
}

interface KCCertificationDetail extends KCCertification {
  derivationModels: string[];
  certificationImageUrls: string[];
  factories: Factory[];
  similarCertifications: KCCertification[];
}

interface Factory {
  makerName: string;
  makerCntryName: string;
}

interface ApiResponse {
  resultCode: string;
  resultMsg: string;
  resultData: KCCertification[] | KCCertificationDetail;
}

// 메인 페이지 컴포넌트
export default function KCCertificationPage() {
  // 상태 관리
  const [searchType, setSearchType] = useState<string>('all');
  const [searchValue, setSearchValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [certifications, setCertifications] = useState<KCCertification[]>([]);
  const [selectedCertification, setSelectedCertification] = useState<KCCertificationDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // 검색 옵션
  const searchOptions = [
    { value: 'all', label: '전체' },
    { value: 'certNum', label: '인증번호' },
    { value: 'productName', label: '제품명' },
    { value: 'modelName', label: '모델명' },
    { value: 'certDate', label: '인증일자' },
    { value: 'signDate', label: '등록일' },
  ];

  // 초기화 함수
  const handleReset = () => {
    setSearchType('all');
    setSearchValue('');
    setError(null);
    setCertifications([]);
    setSelectedCertification(null);
    setIsDetailModalOpen(false);
    setCurrentPage(1);
  };

  // 검색 실행 함수
  const handleSearch = async () => {
    if (!searchValue && searchType !== 'all') {
      setError('검색어를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCertifications([]);

    try {
      const response = await fetch(`/api/kc-certification/search?conditionKey=${searchType}&conditionValue=${encodeURIComponent(searchValue)}`);
      const data: ApiResponse = await response.json();

      if (data.resultCode === '2000') {
        if (Array.isArray(data.resultData)) {
          setCertifications(data.resultData);
          setCurrentPage(1);
        } else {
          setError('검색 결과가 올바른 형식이 아닙니다.');
        }
      } else {
        setError(`검색 실패: ${data.resultMsg}`);
      }
    } catch (err) {
      setError('검색량이 많아 조회에 실패하였습니다. 재시도 하시거나 검색방법을 변경해서 다시 검색하세요');
      console.error('Search API error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 상세 정보 조회 함수
  const handleViewDetail = async (certNum: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/kc-certification/detail?certNum=${encodeURIComponent(certNum)}`);
      const data: ApiResponse = await response.json();

      if (data.resultCode === '2000') {
        setSelectedCertification(data.resultData as KCCertificationDetail);
        setIsDetailModalOpen(true);
      } else {
        setError(`상세 정보 조회 실패: ${data.resultMsg}`);
      }
    } catch (err) {
      setError('상세 정보 조회 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('Detail API error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 인증상태에 따른 배지 색상
  const getCertStateColor = (state: string) => {
    switch (state) {
      case '적합':
        return 'bg-green-100 text-green-800';
      case '반납':
      case '기간만료':
        return 'bg-gray-100 text-gray-800';
      case '안전인증취소':
      case '안전확인신고 효력상실':
        return 'bg-red-100 text-red-800';
      case '개선명령':
      case '청문실시':
        return 'bg-yellow-100 text-yellow-800';
      case '안전인증표시 사용금지 2개월':
      case '안전인증표시 사용금지 4개월':
      case '안전확인신고표시 사용금지 2개월':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // 날짜 포맷 변환 (YYYYMMDD -> YYYY-MM-DD)
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
  };

  // 페이지네이션 관련 로직
  const totalPages = Math.ceil(certifications.length / itemsPerPage);
  const currentItems = certifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 페이지네이션 컴포넌트
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    // 표시할 페이지 번호 계산
    const pageNumbers = [];
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
              </PaginationItem>
              {startPage > 2 && (
                <PaginationItem>
                  <span className="px-2">...</span>
                </PaginationItem>
              )}
            </>
          )}

          {pageNumbers.map(page => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => handlePageChange(page)}
                isActive={page === currentPage}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <PaginationItem>
                  <span className="px-2">...</span>
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(totalPages)}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  // 모바일용 카드 렌더링
  const renderMobileCard = (cert: KCCertification) => (
    <Card key={cert.certUid} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base font-medium">
              <button
                onClick={() => handleViewDetail(cert.certNum)}
                className="text-blue-600 hover:underline text-left"
              >
                {cert.certNum}
              </button>
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getCertStateColor(cert.certState)}`}>
                {cert.certState}
              </span>
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetail(cert.certNum)}
            className="h-8 w-8 p-0"
          >
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium text-gray-500">제품명: </span>
            {cert.productName}
          </div>
          <div>
            <span className="font-medium text-gray-500">모델명: </span>
            {cert.modelName}
          </div>
          <div>
            <span className="font-medium text-gray-500">{cert.importDiv === '수입' ? '수입사' : '제조사'}: </span>
            {cert.importDiv === '수입' ? cert.importerName : cert.makerName}
          </div>
          <div>
            <span className="font-medium text-gray-500">인증일자: </span>
            {formatDate(cert.certDate)}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full">
        <CardHeader className="bg-slate-50">
          <CardTitle
            className="text-2xl font-bold cursor-pointer"
            onClick={handleReset}
          >
            KC 인증정보 검색
          </CardTitle>
          <CardDescription>
            전체로 검색하는 경우 검색량이 많아 조회가 안될 수 있으니 되도록 제품명이나 모델명 등으로 검색하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {/* 검색 영역 */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Select value={searchType} onValueChange={setSearchType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="검색 조건" />
              </SelectTrigger>
              <SelectContent>
                {searchOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex-1 relative">
              <Input
                placeholder={
                  searchType === 'certDate' || searchType === 'signDate'
                    ? 'YYYYMMDD 형태로 입력해주세요 (예: 20230101)'
                    : '검색어를 입력해주세요'
                }
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                className="pr-10"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={handleSearch}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <Button onClick={handleSearch} disabled={isLoading} className="md:w-[120px]">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  검색 중
                </>
              ) : (
                '검색'
              )}
            </Button>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>오류 발생</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 검색 결과 - 반응형 처리 */}
          {certifications.length > 0 ? (
            <>
              <div className="text-sm text-gray-500 mb-2">
                총 {certifications.length}개의 결과가 검색되었습니다.
              </div>

              {/* 데스크탑 화면용 테이블 (중간 이상 화면에서만 표시) */}
              <div className="hidden md:block rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">인증번호</TableHead>
                      <TableHead className="w-[120px]">인증상태</TableHead>
                      <TableHead>제품명</TableHead>
                      <TableHead>모델명</TableHead>
                      <TableHead className="w-[120px]">제조/수입사</TableHead>
                      <TableHead className="w-[100px]">인증일자</TableHead>
                      <TableHead className="w-[60px] text-right">상세</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.length > 0 ? (
                      currentItems.map((cert) => (
                        <TableRow key={cert.certUid} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            <button
                              onClick={() => handleViewDetail(cert.certNum)}
                              className="text-blue-600 hover:underline"
                            >
                              {cert.certNum}
                            </button>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getCertStateColor(cert.certState)}`}>
                              {cert.certState}
                            </span>
                          </TableCell>
                          <TableCell>{cert.productName}</TableCell>
                          <TableCell>{cert.modelName}</TableCell>
                          <TableCell>{cert.importDiv === '수입' ? cert.importerName : cert.makerName}</TableCell>
                          <TableCell>{formatDate(cert.certDate)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetail(cert.certNum)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          검색 결과가 없습니다.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* 모바일 화면용 카드 리스트 (중간 이하 화면에서만 표시) */}
              <div className="md:hidden space-y-2">
                {currentItems.length > 0 ? (
                  currentItems.map(cert => renderMobileCard(cert))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    검색 결과가 없습니다.
                  </div>
                )}
              </div>

              {renderPagination()}
            </>
          ) : !isLoading && !error ? (
            <div className="text-center py-12 text-gray-500">
              <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg">검색어를 입력하고 검색 버튼을 클릭하세요.</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* 상세 정보 모달 - 모바일 최적화 */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          {selectedCertification ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsDetailModalOpen(false)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  KC 인증정보 상세
                </DialogTitle>
                <DialogDescription className="break-all">
                  인증번호: {selectedCertification.certNum}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="basic" className="w-full mt-4">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                  <TabsTrigger value="basic">기본정보</TabsTrigger>
                  <TabsTrigger value="image">인증이미지</TabsTrigger>
                  <TabsTrigger value="factory">제조공장</TabsTrigger>
                  <TabsTrigger value="similar">연관인증</TabsTrigger>
                </TabsList>

                {/* 기본 정보 탭 */}
                <TabsContent value="basic" className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">인증상태</h3>
                        <p className="mt-1">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getCertStateColor(selectedCertification.certState)}`}>
                            {selectedCertification.certState}
                          </span>
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">인증구분</h3>
                        <p className="mt-1 break-words">{selectedCertification.certDiv}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">제품명</h3>
                        <p className="mt-1 break-words">{selectedCertification.productName}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">브랜드명</h3>
                        <p className="mt-1 break-words">{selectedCertification.brandName || '-'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">모델명</h3>
                        <p className="mt-1 break-words">{selectedCertification.modelName}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">법정 제품분류명</h3>
                        <p className="mt-1 break-words">{selectedCertification.categoryName || '-'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">수입/제조 구분</h3>
                        <p className="mt-1">{selectedCertification.importDiv}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">제조사명</h3>
                        <p className="mt-1 break-words">{selectedCertification.makerName}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">제조국</h3>
                        <p className="mt-1">{selectedCertification.makerCntryName}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">수입사명</h3>
                        <p className="mt-1 break-words">{selectedCertification.importerName || '-'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">인증일자</h3>
                        <p className="mt-1">{formatDate(selectedCertification.certDate)}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">등록일</h3>
                        <p className="mt-1">{formatDate(selectedCertification.signDate)}</p>
                      </div>
                    </div>
                  </div>

                  {/* 파생 모델 정보 */}
                  {selectedCertification.derivationModels && selectedCertification.derivationModels.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">파생 모델</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedCertification.derivationModels.map((model, idx) => (
                          <Badge key={idx} variant="outline" className="break-all">{model}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 상세 내용 */}
                  {selectedCertification.remark && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">상세 내용</h3>
                      <p className="text-sm break-words">{selectedCertification.remark}</p>
                    </div>
                  )}
                </TabsContent>

                {/* 인증 이미지 탭 */}
                <TabsContent value="image" className="pt-4">
                  {selectedCertification.certificationImageUrls && selectedCertification.certificationImageUrls.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {selectedCertification.certificationImageUrls.map((url, idx) => (
                        <div key={idx} className="border rounded-md overflow-hidden">
                          <div className="flex justify-between items-center p-2 bg-gray-50">
                            <span className="text-sm font-medium">이미지 {idx + 1}</span>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 flex items-center text-xs"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              원본 보기
                            </a>
                          </div>
                          <img
                            src={url}
                            alt={`인증 이미지 ${idx + 1}`}
                            className="w-full h-auto"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-image.jpg'; // 에러 시 대체 이미지
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      제공된 인증 이미지가 없습니다.
                    </div>
                  )}
                </TabsContent>

                {/* 연관 인증 탭 - 모바일 최적화 */}
                <TabsContent value="similar" className="pt-4">
                  {selectedCertification.similarCertifications && selectedCertification.similarCertifications.length > 0 ? (
                    <div>
                      {/* 데스크탑용 테이블 */}
                      <div className="hidden md:block rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>인증번호</TableHead>
                              <TableHead>인증상태</TableHead>
                              <TableHead>제품명</TableHead>
                              <TableHead>모델명</TableHead>
                              <TableHead>인증일자</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedCertification.similarCertifications.map((cert) => (
                              <TableRow key={cert.certUid}>
                                <TableCell className="font-medium">
                                  <button
                                    onClick={() => {
                                      setIsDetailModalOpen(false);
                                      setTimeout(() => handleViewDetail(cert.certNum), 300);
                                    }}
                                    className="text-blue-600 hover:underline"
                                  >
                                    {cert.certNum}
                                  </button>
                                </TableCell>
                                <TableCell>
                                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getCertStateColor(cert.certState)}`}>
                                    {cert.certState}
                                  </span>
                                </TableCell>
                                <TableCell>{cert.productName}</TableCell>
                                <TableCell>{cert.modelName}</TableCell>
                                <TableCell>{formatDate(cert.certDate)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* 모바일용 카드 리스트 */}
                      <div className="md:hidden space-y-3">
                        {selectedCertification.similarCertifications.map((cert) => (
                          <Card key={cert.certUid} className="overflow-hidden">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-base font-medium">
                                    <button
                                      onClick={() => {
                                        setIsDetailModalOpen(false);
                                        setTimeout(() => handleViewDetail(cert.certNum), 300);
                                      }}
                                      className="text-blue-600 hover:underline text-left"
                                    >
                                      {cert.certNum}
                                    </button>
                                  </CardTitle>
                                  <CardDescription className="text-sm mt-1">
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getCertStateColor(cert.certState)}`}>
                                      {cert.certState}
                                    </span>
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium text-gray-500">제품명: </span>
                                  <span className="break-words">{cert.productName}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-500">모델명: </span>
                                  <span className="break-words">{cert.modelName}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-500">인증일자: </span>
                                  {formatDate(cert.certDate)}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      연관된 인증 정보가 없습니다.
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}