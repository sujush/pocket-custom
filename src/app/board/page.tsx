// src/app/board/page.tsx

'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { checkIsAdmin } from '@/lib/admin';
import { useEffect } from 'react';

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  password: string;
  createdAt: string;
  comments: Comment[];
}

export default function ServicesPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsAdmin(checkIsAdmin());
  }, []);

  const handleSubmitPost = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newPost: Post = {
      id: posts.length + 1,
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      author: formData.get('author') as string,
      password: formData.get('password') as string,
      createdAt: new Date().toISOString().split('T')[0],
      comments: []
    };

    setPosts([newPost, ...posts]);
    setShowPostForm(false);
    e.currentTarget.reset();
  };

  const handleAddComment = () => {
    if (!selectedPost || !commentContent.trim()) return;
    if (!isAdmin) {
      setError("관리자만 답변을 작성할 수 있습니다.");
      return;
    }

    const newComment: Comment = {
      id: selectedPost.comments.length + 1,
      content: commentContent,
      createdAt: new Date().toISOString().split('T')[0],
      author: "이연관세사무소"
    };

    const updatedPost = {
      ...selectedPost,
      comments: [...selectedPost.comments, newComment]
    };

    setPosts(posts.map(post => 
      post.id === selectedPost.id ? updatedPost : post
    ));
    setSelectedPost(updatedPost);
    setCommentContent("");
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">문의 게시판</h1>
          <p className="text-gray-600 mt-2">
            관세 관련 문의사항을 작성해주시면 최대한 빠르게 답변 드리도록 하겠습니다.
          </p>
        </div>
        {!selectedPost && (
          <Button onClick={() => setShowPostForm(!showPostForm)}>
            {showPostForm ? '작성 취소' : '문의하기'}
          </Button>
        )}
        {selectedPost && (
          <Button variant="outline" onClick={() => setSelectedPost(null)}>
            목록으로
          </Button>
        )}
      </div>

      {showPostForm && !selectedPost && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>문의하기</CardTitle>
            <CardDescription>
              문의하실 내용을 상세히 작성해 주시면 더 정확한 답변을 받으실 수 있습니다.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmitPost}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input id="title" name="title" placeholder="제목을 입력해주세요" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="author">작성자</Label>
                <Input 
                  id="author" 
                  name="author" 
                  placeholder="작성자 이름을 입력해주세요" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input 
                  id="password"
                  name="password"
                  type="password"
                  placeholder="게시글 비밀번호를 입력해주세요"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">문의 내용</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="문의하실 내용을 자세히 작성해주세요"
                  className="h-32"
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit">작성 완료</Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {selectedPost ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{selectedPost.title}</CardTitle>
              <CardDescription>
                작성자: {selectedPost.author} | 작성일: {selectedPost.createdAt}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap mb-8">{selectedPost.content}</p>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">답변</h3>
                {selectedPost.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-4 rounded-lg bg-blue-50"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">
                        ✓ {comment.author}
                      </span>
                      <span className="text-sm text-gray-500">
                        {comment.createdAt}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{comment.content}</p>
                  </div>
                ))}
                
                {/* 관리자 답변 입력 폼 */}
                {isAdmin && (
                  <div className="mt-4 space-y-2">
                    <Textarea
                      placeholder="답변을 입력해주세요"
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button 
                      onClick={handleAddComment}
                      disabled={!commentContent.trim()}
                    >
                      답변 작성
                    </Button>
                  </div>
                )}
                {error && (
                  <p className="text-sm text-red-500 mt-2">{error}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card 
              key={post.id}
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setSelectedPost(post)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription>
                      작성자: {post.author} | 작성일: {post.createdAt}
                    </CardDescription>
                  </div>
                  <span className={`
                    px-3 py-1 rounded-full text-sm
                    ${post.comments.length > 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                  `}>
                    {post.comments.length > 0 ? '답변 완료' : '답변 대기'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2">{post.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}