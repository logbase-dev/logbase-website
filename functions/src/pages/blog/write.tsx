'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import { RSSItem } from '@/types/rss';
import dynamic from 'next/dynamic';
import styles from './write.module.css';
import type { Editor as ToastUIEditor } from '@toast-ui/react-editor';

// Editor wrapper with explicit forwardedRef to ensure ref wiring in dynamic import
const EditorWithRef = dynamic(() => import('./EditorWithRef'), { ssr: false });

interface BlogFormData {
  title: string;
  description: string;
  content: string;
  link: string;
  blogName: string;
  feedType: 'logbase' | 'competitor' | 'noncompetitor';
  keywords: string[];
  author: string;
}

interface DraftData {
  id: string;
  title: string;
  description: string;
  content: string;
  keywords: string[];
  author: string;
  savedAt: string;
}

export default function BlogWritePage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editorInstance, setEditorInstance] = useState<ToastUIEditor | null>(null);
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    description: '',
    content: '',
    link: '',
    blogName: 'Logbase Blog',
    feedType: 'logbase',
    keywords: [],
    author: user?.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [drafts, setDrafts] = useState<DraftData[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  // 임시저장 데이터 로드
  useEffect(() => {
    const savedDrafts = localStorage.getItem('blog-drafts');
    if (savedDrafts) {
      try {
        setDrafts(JSON.parse(savedDrafts));
      } catch (error) {
        console.error('임시저장 데이터 로드 실패:', error);
      }
    }
  }, []);

  // 임시저장
  const handleSaveDraft = useCallback(async () => {
    if (!formData.title && !formData.content) return;

    setIsDraftSaving(true);
    try {
      const draftId = `draft-${Date.now()}`;
      const draftData: DraftData = {
        id: draftId,
        title: formData.title,
        description: formData.description,
        content: formData.content,
        keywords: formData.keywords,
        author: formData.author,
        savedAt: new Date().toISOString()
      };

      const updatedDrafts = [draftData, ...drafts.filter(d => d.id !== draftId)].slice(0, 10); // 최대 10개
      setDrafts(updatedDrafts);
      localStorage.setItem('blog-drafts', JSON.stringify(updatedDrafts));
      
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 3000);
    } catch (error) {
      console.error('임시저장 실패:', error);
    } finally {
      setIsDraftSaving(false);
    }
  }, [formData, drafts]);

  // 디바운스 유틸리티 함수
  function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // 디바운스된 에디터 변경 핸들러
  const debouncedEditorChange = useCallback(() => {
    if (editorInstance && editorLoaded) {
      try {
        const markdown = (editorInstance as any).getMarkdown();
        const html = (editorInstance as any).getHTML() || '';
        
        setFormData(prev => ({
          ...prev,
          content: markdown
        }));

        // 글자 수 및 단어 수 계산
        const textContent = html.replace(/<[^>]*>/g, '').trim();
        setCharCount(textContent.length);
        setWordCount(textContent.split(/\s+/).filter((word: string) => word.length > 0).length);
      } catch (error) {
        console.error('에디터 내용 가져오기 실패:', error);
      }
    }
  }, [editorLoaded, editorInstance]);

  // 디바운스된 함수 생성
  const debouncedChange = useMemo(
    () => debounce(debouncedEditorChange, 300),
    [debouncedEditorChange]
  );

  // 에디터 변경 핸들러: 이제는 상태 업데이트 대신, 디바운스된 통계 계산만 호출합니다.
  const handleEditorChange = useCallback(() => {
    console.log('📝 에디터 변경 감지');
    if (!editorLoaded) {
      setEditorLoaded(true);
    }
    debouncedChange(); // 디바운스된 함수 호출
  }, [debouncedChange, editorLoaded]);

  // 임시저장 불러오기
  const handleLoadDraft = useCallback((draft: DraftData) => {
    // 폼 데이터 먼저 설정
    setFormData(prev => ({
      ...prev,
      title: draft.title,
      description: draft.description,
      content: draft.content,
      keywords: draft.keywords,
      author: draft.author
    }));

    // 에디터에 내용 설정 - 여러 방법으로 시도
    const setEditorContent = () => {
      if (editorInstance) { // 상태에 저장된 인스턴스 사용
        try {
          // 방법 1: reset 후 setMarkdown
          (editorInstance as any).reset();
          (editorInstance as any).setMarkdown(draft.content);
          console.log('✅ 임시저장 내용을 에디터에 설정했습니다.');
          return true;
        } catch (error) {
          console.error('방법 1 실패:', error);
          
          try {
            // 방법 2: insertText 사용
            (editorInstance as any).reset();
            (editorInstance as any).insertText(draft.content);
            console.log('✅ insertText로 임시저장 내용을 설정했습니다.');
            return true;
          } catch (error2) {
            console.error('방법 2 실패:', error2);
            
            try {
              // 방법 3: exec 사용
              (editorInstance as any).exec('reset');
              (editorInstance as any).exec('addText', draft.content);
              console.log('✅ exec으로 임시저장 내용을 설정했습니다.');
              return true;
            } catch (error3) {
              console.error('방법 3 실패:', error3);
              return false;
            }
          }
        }
      }
      return false;
    };

    // 즉시 시도
    if (!setEditorContent()) {
      // 실패하면 에디터 로드 완료를 기다린 후 재시도
      const retryInterval = setInterval(() => {
        if (setEditorContent()) {
          clearInterval(retryInterval);
        }
      }, 500);
      
      // 10초 후 타임아웃
      setTimeout(() => {
        clearInterval(retryInterval);
        console.warn('⚠️ 에디터 내용 설정 타임아웃');
      }, 10000);
    }

    setShowDrafts(false);
  }, [editorInstance]);

  // 임시저장 삭제
  const handleDeleteDraft = useCallback((draftId: string) => {
    const updatedDrafts = drafts.filter(d => d.id !== draftId);
    setDrafts(updatedDrafts);
    localStorage.setItem('blog-drafts', JSON.stringify(updatedDrafts));
  }, [drafts]);

  // 이미지 압축 함수
  const compressImage = (file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // 이미지 크기 계산
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 이미지 그리기
        ctx?.drawImage(img, 0, 0, width, height);
        
        // 압축된 이미지를 Base64로 변환
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // 이미지 업로드 처리 (최적화됨)
  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB 제한으로 증가
      setError('이미지 크기는 10MB 이하여야 합니다.');
      return;
    }

    try {
      // 이미지 압축
      const compressedBase64 = await compressImage(file, 1200, 0.8);
      
      if (editorInstance) { // 상태에 저장된 인스턴스 사용
        try {
          // 압축된 이미지 삽입
          const imageMarkdown = `![${file.name}](${compressedBase64})`;
          const currentMarkdown = (editorInstance as any).getMarkdown();
          const cursorPos = (editorInstance as any).getSelection();
          
          // 커서 위치에 이미지 삽입
          const newMarkdown = currentMarkdown.slice(0, cursorPos[0]) + 
                            imageMarkdown + '\n\n' + 
                            currentMarkdown.slice(cursorPos[1]);
          
          (editorInstance as any).setMarkdown(newMarkdown);
          // 이미지 삽입 후에는 상태를 직접 업데이트하여 즉시 반영
          setFormData(prev => ({
            ...prev,
            content: newMarkdown
          }));
          
          // 메모리 정리
          URL.revokeObjectURL(URL.createObjectURL(file));
        } catch (error) {
          console.error('이미지 삽입 실패:', error);
          setError('이미지 삽입에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      setError('이미지 업로드에 실패했습니다.');
    }
  }, [editorInstance]);

  // 드래그앤드롭 핸들러 (최적화됨)
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🎯 드롭 이벤트 발생 - 오버레이 제거 시작');
    
    // 타이머 클리어
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
    
    // 즉시 드래그 상태 해제
    setIsDragOver(false);
    console.log('✅ 드롭 후 isDragOver를 false로 설정');
    
    // 추가 안전장치: 100ms 후에도 강제로 false 설정
    setTimeout(() => {
      setIsDragOver(false);
      console.log('🔄 추가 안전장치: isDragOver 강제 false 설정');
    }, 100);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      console.log('📁 이미지 파일 드롭됨:', imageFiles[0].name);
      // 첫 번째 이미지만 처리 (다중 업로드 방지)
      handleImageUpload(imageFiles[0]);
    } else {
      console.log('❌ 이미지가 아닌 파일 드롭됨');
      // 이미지가 아닌 파일이 드롭된 경우
      setError('이미지 파일만 업로드할 수 있습니다.');
    }
  }, [handleImageUpload]);

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 키워드 입력 핸들러
  const handleKeywordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeywordInput(e.target.value);
  };

  // 키워드 추가
  const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const keyword = keywordInput.trim();
      if (keyword && !formData.keywords.includes(keyword)) {
        setFormData(prev => ({
          ...prev,
          keywords: [...prev.keywords, keyword]
        }));
        setKeywordInput('');
      }
    }
  };

  // 키워드 삭제
  const handleRemoveKeyword = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }));
  }, []);


  // handleSubmit 함수 (단순화)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('🚀 블로그 글 저장 시작');

      // 제출 시점에 에디터 인스턴스에서 직접 최신 내용을 가져옵니다.
      const currentContent = (editorInstance as any)?.getMarkdown() || '';

      console.log('📊 handleSubmit에서 최종 검증 데이터:', {
        title: formData.title,
        contentLength: currentContent.length,
        contentPreview: currentContent.substring(0, 100)
      });

      // 유효성 검사

      if (!formData.title.trim()) {
        throw new Error('제목을 입력해주세요.');
      }

      if (!currentContent.trim()) {
        throw new Error('내용을 입력해주세요. 에디터에 텍스트를 입력한 후 다시 시도해주세요.');
      }

      // 본문에서 HTML 태그 제거 후 200자 추출하여 description 생성
      const htmlContent = currentContent.replace(/<[^>]*>/g, '').trim();
      const description = htmlContent.length > 200 
        ? htmlContent.substring(0, 200) + '...' 
        : htmlContent;

      // 한국시간으로 날짜 생성
      const now = new Date();
      const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC+9
      const isoDate = koreaTime.toISOString();
      const pubDate = koreaTime.toUTCString();
      
      // 고유 ID 생성
      const uniqueId = `logbase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const blogItem: RSSItem = {
        title: formData.title,
        description: description,
        content: currentContent,
        contentSnippet: description,
        link: `https://www.logbase.kr/blog/${uniqueId}`,
        pubDate,
        isoDate,
        guid: uniqueId,
        blogName: 'Logbase',
        feedType: 'noncompetitor',
        matchedKeywords: formData.keywords,
        categories: formData.keywords,
        author: formData.author,
        creator: formData.author,
        'dc:creator': formData.author,
        collectedDate: isoDate
      };

      console.log('📝 블로그 글 저장 요청:', {
        title: blogItem.title,
        description: blogItem.description,
        contentLength: (blogItem.content || '').length,
        categories: blogItem.categories
      });

      // API 호출로 데이터베이스에 저장
      const response = await fetch('/api/blog/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogItem),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '블로그 글 저장에 실패했습니다.');
      }

      const result = await response.json();
      console.log('✅ 블로그 글 저장 성공:', result);

      setSuccess(`블로그 글이 성공적으로 저장되었습니다! 목록으로 이동합니다...`);
      
      // 임시저장 데이터 삭제
      const updatedDrafts = drafts.filter(d => 
        !(d.title === formData.title && d.content === currentContent)
      );
      setDrafts(updatedDrafts);
      localStorage.setItem('blog-drafts', JSON.stringify(updatedDrafts));
      
      // 즉시 RSS 피드 페이지로 이동 (가장 빠름)
      router.push('/rss-feed');

    } catch (err) {
      console.error('❌ 블로그 글 저장 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };


  // 드래그 오버 핸들러
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🎯 드래그 오버 감지');
    setIsDragOver(true);
    
    // 기존 타이머 클리어
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    
    // 500ms 후 자동으로 오버레이 제거 (안전장치)
    dragTimeoutRef.current = setTimeout(() => {
      console.log('⏰ 드래그 오버 타임아웃 - 오버레이 제거');
      setIsDragOver(false);
    }, 500);
  }, []);

  // 드래그 리브 핸들러
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🎯 드래그 리브 감지');
    
    // 관련된 타겟이 현재 요소인지 확인
    const currentTarget = e.currentTarget as HTMLElement;
    const relatedTarget = e.relatedTarget as HTMLElement;
    
    // relatedTarget이 없거나 현재 요소의 자식이 아닌 경우에만 드래그 상태 해제
    if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
      console.log('✅ 드래그 리브 - 오버레이 제거');
      // 기존 타이머 클리어
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
      
      // 즉시 드래그 상태 해제
      setIsDragOver(false);
    }
  }, []);

  // 드래그 엔터 핸들러 (새로 추가)
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🎯 드래그 엔터 감지');
    
    // 기존 타이머 클리어
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
      dragTimeoutRef.current = null;
    }
    
    // 드래그 상태 활성화
    setIsDragOver(true);
  }, []);


  // 키워드 태그 렌더링
  const MemoizedKeywordTags = useMemo(() => {
    return formData.keywords.map((keyword: string, index: number) => (
      <span key={index} className={styles.keywordTag}>
        {keyword}
        <button
          type="button"
          onClick={() => handleRemoveKeyword(index)}
          className={styles.removeKeywordBtn}
        >
          ✕
        </button>
      </span>
    ));
  }, [formData.keywords, handleRemoveKeyword]);

  // 임시저장 목록 렌더링
  const MemoizedDraftsList = useMemo(() => {
    if (drafts.length === 0) {
      return <p style={{ textAlign: 'center', margin: '20px 0' }}>임시저장된 글이 없습니다.</p>;
    }

    return (
      <div className={styles.draftsList}>
        {drafts.map(draft => (
          <div key={draft.id} className={styles.draftItem}>
            <div className={styles.draftHeader}>
              <h4>{draft.title}</h4>
              <button
                type="button"
                onClick={() => handleLoadDraft(draft)}
                className={styles.loadDraftBtn}
              >
                불러오기
              </button>
              <button
                type="button"
                onClick={() => handleDeleteDraft(draft.id)}
                className={styles.deleteDraftBtn}
              >
                삭제
              </button>
            </div>
            <p>{draft.description}</p>
            <p>작성자: {draft.author}</p>
            <p>작성일: {new Date(draft.savedAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    );
  }, [drafts, handleLoadDraft, handleDeleteDraft]);

  // 에디터 마운트 후 자동 로드 상태 확인
  useEffect(() => {
    // editorInstance 상태가 설정되면 editorLoaded를 true로 변경
    if (editorInstance && !editorLoaded) {
      console.log('✅ 에디터 인스턴스 상태 설정됨, 로드 상태 업데이트');
      setEditorLoaded(true);
    };
  }, [editorInstance, editorLoaded]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
    };
  }, []);

  // 드래그 상태 강제 리셋 (안전장치)
  useEffect(() => {
    const handleGlobalDragEnd = () => {
      console.log('🔄 전역 드래그 종료 감지 - 오버레이 제거');
      setIsDragOver(false);
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
        dragTimeoutRef.current = null;
      }
    };

    const handleGlobalDrop = (e: DragEvent) => {
      console.log('🔄 전역 드롭 감지 - 오버레이 제거');
      setIsDragOver(false);
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
        dragTimeoutRef.current = null;
      }
    };

    const handleGlobalDragLeave = (e: DragEvent) => {
      // 문서 전체에서 드래그가 벗어났을 때
      if (!e.relatedTarget) {
        console.log('🔄 전역 드래그 리브 감지 - 오버레이 제거');
        setIsDragOver(false);
        if (dragTimeoutRef.current) {
          clearTimeout(dragTimeoutRef.current);
          dragTimeoutRef.current = null;
        }
      }
    };

    // 마우스 업 이벤트로 드래그 종료 감지 (추가 안전장치)
    const handleMouseUp = (e: MouseEvent) => {
      console.log('🔄 마우스 업 감지 - 오버레이 제거', e.target);
      // 즉시 오버레이 제거
      setIsDragOver(false);
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
        dragTimeoutRef.current = null;
      }
    };

    // 추가 안전장치: 클릭 이벤트로도 감지
    const handleClick = () => {
      console.log('🔄 클릭 감지 - 오버레이 제거');
      setIsDragOver(false);
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
        dragTimeoutRef.current = null;
      }
    };

    // 전역 드래그 이벤트 리스너 추가
    document.addEventListener('dragend', handleGlobalDragEnd);
    document.addEventListener('drop', handleGlobalDrop);
    document.addEventListener('dragleave', handleGlobalDragLeave);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('click', handleClick);
    window.addEventListener('dragend', handleGlobalDragEnd);
    window.addEventListener('drop', handleGlobalDrop);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('dragend', handleGlobalDragEnd);
      document.removeEventListener('drop', handleGlobalDrop);
      document.removeEventListener('dragleave', handleGlobalDragLeave);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('click', handleClick);
      window.removeEventListener('dragend', handleGlobalDragEnd);
      window.removeEventListener('drop', handleGlobalDrop);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  if (!user) {
    return (
      <div className="rss-feed-container">
        <div className="rss-header">
          <h1>로그인이 필요합니다</h1>
          <div className="rss-controls" style={{ justifyContent: 'center' }}>
            <p style={{ textAlign: 'center', margin: '20px 0' }}>
              블로그 글을 작성하려면 로그인해주세요.
            </p>
            <button
              onClick={() => router.push('/auth/signin')}
              className="migrate-btn"
              style={{ background: '#3b82f6' }}
            >
              로그인하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>블로그 글 작성 - Logbase</title>
        <meta name="description" content="새로운 블로그 글을 작성하세요" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" />
        {/* TOAST UI Editor CSS */}
        <link 
          rel="stylesheet" 
          href="https://uicdn.toast.com/editor/latest/toastui-editor.min.css" 
        />
        <style jsx global>{`
          .toastui-editor-defaultUI {
            border: none !important;
          }
          .toastui-editor-defaultUI-toolbar {
            border-bottom: 1px solid #e5e7eb !important;
          }
        `}</style>
      </Head>

      <div className="rss-feed-container">
        <div className="rss-header">
          <h1>블로그 글 작성</h1>
          <p style={{ textAlign: 'center', margin: '10px 0', color: '#666' }}>
            새로운 블로그 글을 작성하여 RSS 피드에 추가하세요.
          </p>
        </div>

        <div className="rss-content">
          <form onSubmit={handleSubmit} className={styles.blogForm}>
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            {success && (
              <div className={styles.successMessage}>
                {success}
              </div>
            )}

            {/* 임시저장 알림 */}
            {draftSaved && (
              <div className={styles.draftSavedMessage}>
                ✅ 임시저장 완료
              </div>
            )}

            <div className={styles.formSection}>
              <h3>기본 정보</h3>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="title">제목 *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="블로그 글 제목을 입력하세요"
                    required
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="blogName">블로그 이름</label>
                  <input
                    type="text"
                    id="blogName"
                    name="blogName"
                    value={formData.blogName}
                    onChange={handleInputChange}
                    placeholder="블로그 이름"
                    className={styles.formInput}
                  />
                </div>
              </div>

              {/* 설명 입력
              <div className={styles.formGroup}>
                <label htmlFor="description">설명 *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="블로그 글의 간단한 설명을 입력하세요"
                  required
                  className={styles.formTextarea}
                />
              </div>
               */}
            </div>

            <div className={styles.formSection}>
              <div className={styles.editorHeader}>
                <h3>내용 작성</h3>
                {/* 에디터 모드 선택 및 컨트롤
                <div className={styles.editorControls}>
                  <div className={styles.editorModeSwitch}>
                    <button
                      type="button"
                      className={`${styles.modeBtn} ${editorMode === 'wysiwyg' ? styles.active : ''}`}
                      onClick={() => handleModeChange('wysiwyg')}
                      disabled={!editorLoaded}
                    >
                      WYSIWYG
                    </button>&nbsp;
                    <button
                      type="button"
                      className={`${styles.modeBtn} ${editorMode === 'markdown' ? styles.active : ''}`}
                      onClick={() => handleModeChange('markdown')}
                      disabled={!editorLoaded}
                    >
                      Markdown
                    </button>
                  </div>
                  
                  <div className={styles.editorActions}>
                    <button
                      type="button"
                      className={styles.previewBtn}
                      onClick={handleTogglePreview}
                      disabled={!editorLoaded}
                    >
                      {showPreview ? '✏️ 편집' : '👁️ 미리보기'}
                    </button>
                    
                    <button
                      type="button"
                      className={styles.clearBtn}
                      onClick={handleClearEditor}
                      disabled={!editorLoaded}
                      title="에디터 내용 초기화"
                    >
                      🗑️ 초기화
                    </button>
                  </div>
                </div>
                 */}
              </div>
              
              <div className={styles.formGroup}>
                <label>내용 *</label>
                
                {showPreview ? (
                  <div className={styles.previewContainer}>
                    <div className={styles.previewHeader}>
                      <h4>미리보기</h4>
                      <button
                        type="button"
                        className={styles.closePreviewBtn}
                        onClick={() => setShowPreview(false)}
                      >
                        ✕
                      </button>
                    </div>
                    <div 
                      className={styles.previewContent}
                      dangerouslySetInnerHTML={{ 
                        __html: formData.content.replace(/\n/g, '<br>') 
                      }}
                    />
                  </div>
                ) : (
                  <div 
                    className={`${styles.editorContainer} ${isDragOver ? styles.dragOver : ''}`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <EditorWithRef
                      height="500px"
                      initialEditType="wysiwyg"
                      previewStyle="vertical"
                      initialValue=""
                      toolbarItems={[
                        ['heading', 'bold', 'italic', 'strike'],
                        ['hr', 'quote'],
                        ['ul', 'ol', 'task', 'indent', 'outdent'],
                        ['table', 'image', 'link'],
                        ['code', 'codeblock']
                      ]}
                      onLoad={(instance: ToastUIEditor) => {
                        console.log('✅ 에디터 로드 완료');
                        // onLoad 콜백에서 받은 인스턴스를 상태에 저장합니다.
                        setEditorInstance(instance);
                        setEditorLoaded(true);
                      }}
                      onChange={handleEditorChange}
                    />
                    
                    {isDragOver && (
                      <div className={styles.dragOverlay}>
                        <div className={styles.dragMessage}>
                          📁 이미지를 여기에 드롭하세요
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className={styles.editorFooter}>
                  <div className={styles.editorStatus}>
                    {editorLoaded ? (
                      <>
                        <span className={`${styles.statusIndicator} ${styles.success}`}>✅ 에디터 준비됨</span>
                        <span className={styles.modeIndicator}>모드: WYSIWYG</span>
                      </>
                    ) : (
                      <span className={`${styles.statusIndicator} ${styles.loading}`}>⏳ 에디터 로딩 중...</span>
                    )}
                  </div>
                  <div className={styles.editorStats}>
                    <span className={styles.statItem}>단어: {wordCount}</span>
                    <span className={styles.statItem}>글자: {charCount}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h3>추가 설정</h3>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="link">링크</label>
                  <input
                    type="url"
                    id="link"
                    name="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    placeholder="https://example.com/article"
                    className={styles.formInput}
                  />
                  <p className={styles.formHelp}>비워두면 자동으로 생성됩니다.</p>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="feedType">피드 타입</label>
                  <select
                    id="feedType"
                    name="feedType"
                    value={formData.feedType}
                    onChange={handleInputChange}
                    className={styles.formSelect}
                  >
                    <option value="logbase">Logbase 블로그</option>
                    <option value="noncompetitor">일반 블로그</option>
                    <option value="competitor">경쟁사 블로그</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="keywords">키워드</label>
                  <div className={styles.keywordInputContainer}>
                    <input
                      type="text"
                      id="keywords"
                      value={keywordInput}
                      onChange={handleKeywordInputChange}
                      onKeyDown={handleAddKeyword}
                      placeholder="키워드를 입력하고 Enter 또는 쉼표를 누르세요"
                      className={`${styles.formInput} ${styles.keywordInput}`}
                    />
                    {MemoizedKeywordTags}
                  </div>
                  <p className={styles.formHelp}>
                    키워드를 입력하고 Enter 또는 쉼표(,)를 눌러 추가하세요. 
                    {formData.keywords.length > 0 && ` 현재 ${formData.keywords.length}개 키워드가 추가되었습니다.`}
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="author">작성자</label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    placeholder="작성자 이름"
                    className={styles.formInput}
                  />
                </div>
              </div>
            </div>

            <div className={styles.formActions}>
              <div className={styles.formActionsLeft}>
                <button
                  type="button"
                  onClick={() => setShowDrafts(!showDrafts)}
                  className={styles.draftsBtn}
                  disabled={drafts.length === 0}
                >
                  📄 임시저장 ({drafts.length})
                </button>
                
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className={styles.saveDraftBtn}
                  disabled={isDraftSaving || (!formData.title && !formData.content)}
                >
                  {isDraftSaving ? '저장 중...' : '💾 임시저장'}
                </button>
              </div>
              
              <div className={styles.formActionsRight}>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="migrate-btn"
                  style={{ background: '#6b7280' }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading || !editorLoaded}
                  className="migrate-btn"
                  style={{ 
                    background: loading || !editorLoaded ? '#9ca3af' : '#10b981',
                    marginLeft: '12px'
                  }}
                >
                  {loading ? '저장 중...' : !editorLoaded ? '에디터 로딩 중...' : '글 저장하기'}
                </button>
              </div>
            </div>
          </form>

          {/* 임시저장 목록 모달 */}
          {showDrafts && (
            <div className={styles.draftsModal}>
              <div className={styles.draftsModalContent}>
                <div className={styles.draftsModalHeader}>
                  <h3>임시저장 목록</h3>
                  <button
                    type="button"
                    className={styles.closeModalBtn}
                    onClick={() => setShowDrafts(false)}
                  >
                    ✕
                  </button>
                </div>
                {MemoizedDraftsList}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </>
  );
} 