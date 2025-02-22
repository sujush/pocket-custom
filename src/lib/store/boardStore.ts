// src/lib/store/boardStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Post {
  id: string;
  title: string;
  content: string;
  authorEmail: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
}

interface Comment {
  id: string;
  content: string;
  authorEmail: string;
  authorName: string;
  createdAt: string;
}

interface BoardState {
  posts: Post[];
  currentPost: Post | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setPosts: (posts: Post[]) => void;
  setCurrentPost: (post: Post | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // API 호출 메서드
  fetchPosts: () => Promise<void>;
  fetchPost: (id: string) => Promise<void>;
  createPost: (title: string, content: string) => Promise<void>;
  createComment: (postId: string, content: string) => Promise<void>;
}

const BOARD_API_URL = process.env.NEXT_PUBLIC_BOARD_API_URL;

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      posts: [],
      currentPost: null,
      loading: false,
      error: null,
      
      setPosts: (posts) => set({ posts }),
      setCurrentPost: (post) => set({ currentPost: post }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      fetchPosts: async () => {
        try {
          set({ loading: true, error: null });
          const response = await fetch(`${BOARD_API_URL}/posts`, {
            credentials: 'include'
          });
          const data = await response.json();
          
          if (data.success) {
            set({ posts: data.posts });
          } else {
            set({ error: data.message || '게시글 목록을 불러오는데 실패했습니다.' });
          }
        } catch {
          set({ error: '게시글 목록을 불러오는데 실패했습니다.' });
        } finally {
          set({ loading: false });
        }
      },

      fetchPost: async (id: string) => {
        try {
          set({ loading: true, error: null });
          const response = await fetch(`${BOARD_API_URL}/posts/${id}`, {
            credentials: 'include'
          });
          const data = await response.json();
          
          if (data.success) {
            set({ currentPost: data.post });
          } else {
            set({ error: data.message || '게시글을 불러오는데 실패했습니다.' });
          }
        } catch {
          set({ error: '게시글을 불러오는데 실패했습니다.' });
        } finally {
          set({ loading: false });
        }
      },

      createPost: async (title: string, content: string) => {
        try {
          set({ loading: true, error: null });
          const response = await fetch(`${BOARD_API_URL}/posts`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ title, content })
          });
          
          const data = await response.json();
          
          if (data.success) {
            const { posts } = get();
            set({ posts: [data.post, ...posts] });
          } else {
            set({ error: data.message || '게시글 작성에 실패했습니다.' });
          }
        } catch {
          set({ error: '게시글 작성에 실패했습니다.' });
        } finally {
          set({ loading: false });
        }
      },

      createComment: async (postId: string, content: string) => {
        try {
          set({ loading: true, error: null });
          const response = await fetch(`${BOARD_API_URL}/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ content })
          });
          
          const data = await response.json();
          
          if (data.success) {
            // 현재 게시글의 댓글 목록 업데이트
            const currentPost = get().currentPost;
            if (currentPost && currentPost.id === postId) {
              set({
                currentPost: {
                  ...currentPost,
                  comments: [...currentPost.comments, data.comment]
                }
              });
            }
          } else {
            set({ error: data.message || '댓글 작성에 실패했습니다.' });
          }
        } catch {
          set({ error: '댓글 작성에 실패했습니다.' });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'board-storage',
      partialize: (state) => ({
        posts: state.posts,
        currentPost: state.currentPost,
      }),
    }
  )
);