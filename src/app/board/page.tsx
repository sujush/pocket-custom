// src/app/board/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useBoardStore } from '@/lib/store/boardStore';
import { useAuthStore } from '@/lib/store/authStore';

export default function BoardPage() {
  const router = useRouter();
  const { posts, loading, error, fetchPosts } = useBoardStore();
  const { user } = useAuthStore();
  
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="text-center p-8">로딩 중...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-8">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">문의 게시판</h1>
        {user && (
          <Button onClick={() => router.push('/board/write')}>
            글 작성하기
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <Card 
            key={post.id}
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => router.push(`/board/${post.id}`)}
          >
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>{post.title}</CardTitle>
                  <CardDescription>
                    작성자: {post.authorName} | 작성일: {formatDate(post.createdAt)}
                  </CardDescription>
                </div>
                <div className="text-sm text-gray-500">
                  댓글 {post.comments.length}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-2 text-gray-600">
                {post.content}
              </p>
            </CardContent>
          </Card>
        ))}

        {posts.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            아직 작성된 게시글이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}