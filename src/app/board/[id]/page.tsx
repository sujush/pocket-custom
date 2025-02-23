// src/app/board/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useBoardStore } from '@/lib/store/boardStore';
import { useAuthStore } from '@/lib/store/authStore';

interface PageProps {
    params: {
        id: string;
    };
}

export default function PostDetailPage({ params }: PageProps) {
    const router = useRouter();
    const { currentPost, loading, error, fetchPost, deletePost, createComment } = useBoardStore();
    const [isAdmin, setIsAdmin] = useState(false);
    const { user } = useAuthStore();
    const [commentContent, setCommentContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const adminFlag = localStorage.getItem('isAdmin') === 'true';
        setIsAdmin(adminFlag);
      }, []);

    useEffect(() => {
        fetchPost(params.id);
    }, [params.id, fetchPost]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert('댓글을 작성하려면 로그인이 필요합니다.');
            return;
        }

        if (!commentContent.trim()) {
            alert('댓글 내용을 입력해주세요.');
            return;
        }

        try {
            setIsSubmitting(true);
            await createComment(params.id, commentContent);
            setCommentContent('');
        } catch {
            alert('댓글 작성에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="text-center p-8">로딩 중...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500 p-8">{error}</div>;
    }

    if (!currentPost) {
        return <div className="text-center p-8">게시글을 찾을 수 없습니다.</div>;
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl">{currentPost.title}</CardTitle>
                            <CardDescription>
                                작성자: {currentPost.authorName} | 작성일: {formatDate(currentPost.createdAt)}
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            {isAdmin && (
                                <Button
                                    variant="destructive"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (confirm("게시글을 삭제하시겠습니까?")) {
                                            deletePost(currentPost.id);
                                            router.push('/board');
                                        }
                                    }}
                                >
                                    삭제
                                </Button>
                            )}
                            <Button variant="outline" onClick={() => router.push('/board')}>
                                목록으로
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap text-gray-700 min-h-[200px]">
                        {currentPost.content}
                    </p>
                </CardContent>
            </Card>

            {/* 댓글 목록 */}
            <div className="space-y-4 mb-6">
                <h2 className="text-xl font-semibold">댓글 {currentPost.comments.length}개</h2>
                {currentPost.comments.map((comment) => (
                    <Card key={comment.id}>
                        <CardContent className="py-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">{comment.authorName}</span>
                                <span className="text-sm text-gray-500">
                                    {formatDate(comment.createdAt)}
                                </span>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 댓글 작성 폼 */}
            {user && (
                <Card>
                    <form onSubmit={handleSubmitComment}>
                        <CardContent className="py-4">
                            <Textarea
                                value={commentContent}
                                onChange={(e) => setCommentContent(e.target.value)}
                                placeholder="댓글을 입력하세요"
                                className="mb-2"
                            />
                            <div className="flex justify-end">
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? '작성 중...' : '댓글 작성'}
                                </Button>
                            </div>
                        </CardContent>
                    </form>
                </Card>
            )}
        </div>
    );
}