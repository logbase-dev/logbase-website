'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import { RSSItem } from '@/types/rss';
import dynamic from 'next/dynamic';
import styles from '../write.module.css';
import type { Editor as ToastUIEditor } from '@toast-ui/react-editor';

const EditorWithRef = dynamic(() => import('../EditorWithRef'), { ssr: false });

interface BlogFormData {
  title: string;
  description: string;
  content: string;
  link: string;
  blogName: string;
  feedType: 'logbase' | 'competitor' | 'noncompetitor' | string;
  keywords: string[];
  author: string;
}

export default function EditArticlePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { guid } = router.query;

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [loading, setLoading] = useState(true); // 페이지 시작 시 로딩 상태
  const [pageError, setPageError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');

  // 1. 기존 글 데이터 불러오기
  useEffect(() => {
    console.log('✏️[EDIT PAGE] 1. 데이터 로딩 useEffect 시작.', { guid, user: !!user });
    if (!guid || !user) {
      console.log('✏️[EDIT PAGE] guid 또는 user 정보가 없어 API 호출을 중단합니다.');
      if (!guid) setLoading(false); // guid가 없으면 로딩을 바로 중단
      return;
    }

    const fetchArticle = async () => {
      setLoading(true); // 데이터 fetch 시작 시 로딩
      setPageError(null);
      console.log(`✏️[EDIT PAGE] 1a. API 호출 시작: /api/blog/${guid}`);
      try {
        const response = await fetch(`/api/blog/${guid}`);
        console.log('✏️[EDIT PAGE] 1b. API 응답 상태:', response.status);
        if (!response.ok) throw new Error('글을 불러오는데 실패했습니다.');

        const result = await response.json();
        console.log('✏️[EDIT PAGE] 1c. API 응답 데이터:', result);
        if (result.success) {
          const article: RSSItem = result.data;
          setFormData({
            title: article.title || '',
            description: article.description || '',
            content: article.content || '',
            link: article.link || '',
            blogName: article.blogName || 'Logbase Blog',
            feedType: (article.feedType as string) || 'logbase',
            keywords: Array.isArray(article.categories) ? article.categories : (Array.isArray(article.matchedKeywords) ? article.matchedKeywords : []),
            author: article.author || user.email || '',
          });
          console.log('✏️[EDIT PAGE] 1d. formData 상태 업데이트 완료.');
        } else {
          setPageError(result.error || '글 정보를 찾을 수 없습니다.');
          console.error('✏️[EDIT PAGE] 1e. API에서 success: false를 반환했습니다.', result.error);
        }
      } catch (err: unknown) {
        setPageError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        console.error('✏️[EDIT PAGE] 1f. API 호출 중 예외 발생:', err);
      } finally {
        setLoading(false);
        console.log('✏️[EDIT PAGE] 1g. 데이터 로딩 프로세스 종료.');
      }
    };
    fetchArticle();
  }, [guid, user]); // user 객체 전체를 의존성으로 사용

  // 2. 에디터가 로드되면, 로드된 폼 데이터의 content를 에디터에 설정
  useEffect(() => {
    console.log('✏️[EDIT PAGE] 2. 에디터 내용 설정 useEffect 시작.', { editorLoaded, hasContent: !!formData.content, loading });
    // 에디터가 로드되고, 폼 데이터에 내용이 있으며, 로딩이 끝났을 때
    if (editorLoaded && formData.content && !loading) {
      if (editorInstance && editorInstance.getMarkdown() !== formData.content) { // 상태에 저장된 인스턴스 사용
        editorInstance.setMarkdown(formData.content);
        console.log('✏️[EDIT PAGE] 2a. 에디터에 기존 글 내용을 설정했습니다.');
      }
    }
  }, [editorLoaded, formData.content, loading, editorInstance]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = () => {
    if (editorInstance) { // 상태에 저장된 인스턴스 사용
      setFormData((prev) => ({ ...prev, content: editorInstance.getMarkdown() }));
    }
  };

  const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const keyword = keywordInput.trim();
      if (keyword && !formData.keywords.includes(keyword)) {
        setFormData((prev) => ({ ...prev, keywords: [...prev.keywords, keyword] }));
        setKeywordInput('');
      }
    }
  };

  const handleRemoveKeyword = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index),
    }));
  };

  // 3. 글 수정 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPageError(null);
    setSuccess(null);

    const currentContent = editorInstance?.getMarkdown() || ''; // 상태에 저장된 인스턴스 사용

    if (!formData.title.trim()) {
      setPageError('제목을 입력해주세요.');
      setLoading(false);
      return;
    }
    if (!currentContent.trim()) {
      setPageError('내용을 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
      // 본문에서 HTML 태그 제거 후 200자 추출하여 description 생성
      const htmlContent = editorInstance?.getHTML().replace(/<[^>]*>/g, '').trim() || '';
      const description = htmlContent.length > 200 
        ? htmlContent.substring(0, 200) + '...' 
        : htmlContent;

      const response = await fetch(`/api/blog/${guid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          content: currentContent,
          description: description,
          matchedKeywords: formData.keywords,
          categories: formData.keywords,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('글이 성공적으로 수정되었습니다.');
        // 즉시 상세 페이지로 이동
        router.push(`/blog/${result.guid || guid}`);
      } else {
        throw new Error(result.error || '글 수정에 실패했습니다.');
      }
    } catch (err: unknown) {
      setPageError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const MemoizedKeywordTags = useMemo(() => {
    return formData.keywords.map((keyword: string, index: number) => (
      <span key={index} className={styles.keywordTag}>
        {keyword}
        <button type="button" onClick={() => handleRemoveKeyword(index)} className={styles.removeKeywordBtn}>
          ✕
        </button>
      </span>
    ));
  }, [formData.keywords]);

  // 로딩 중이거나, 폼 데이터가 아직 로드되지 않았을 때
  if (!user) {
    return (
      <div className="rss-feed-container">
        <h1>접근 권한 없음</h1>
        <p>글을 수정하려면 로그인이 필요합니다.</p>
      </div>
    );
  }

  console.log('✏️[EDIT PAGE] 3. 렌더링 직전 상태:', { loading, pageError, success, formDataTitle: formData.title });
  return (
    <>
      <Head>
        <title>블로그 글 수정 - Logbase</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="stylesheet" href="https://uicdn.toast.com/editor/latest/toastui-editor.min.css" />
      </Head>
      <div className="rss-feed-container">
        <div className="rss-header">
          <h1>블로그 글 수정</h1>
          <p style={{ textAlign: 'center', margin: '10px 0', color: '#666' }}>
            기존 블로그 글의 내용을 수정합니다.
          </p>
        </div>
        <div className="rss-content">
          {loading && (
            <div className={styles.editorLoading}>
              <p>글 정보를 불러오는 중...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.blogForm}>
            {pageError && <div className={styles.errorMessage}>{pageError}</div>}
            {success && <div className={styles.successMessage}>{success}</div>}

            <div className={styles.formSection}>
              <div className={styles.editorHeader}><h3>기본 정보</h3></div>
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
            </div>

            <div className={styles.formSection}>
              <div className={styles.editorHeader}><h3>내용 작성</h3></div>
              <div className={styles.formGroup}>
                <label>내용 *</label>
                <div className={styles.editorContainer}>
                  <EditorWithRef
                    height="500px"
                    initialEditType="wysiwyg"
                    previewStyle="vertical"
                    initialValue={formData.content || ''}
                    onLoad={(instance: ToastUIEditor) => {
                      setEditorInstance(instance);
                      console.log('✏️[EDIT PAGE] Editor 로드 완료!');
                      setEditorLoaded(true);
                    }}
                    onChange={handleEditorChange}
                  />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.editorHeader}><h3>추가 설정</h3></div>
              <div className={styles.formGroup}>
                <label htmlFor="keywords">키워드</label>
                <div className={styles.keywordInputContainer}>
                  <input
                    type="text"
                    id="keywords"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={handleAddKeyword}
                    placeholder="키워드를 입력하고 Enter 또는 쉼표를 누르세요"
                    className={`${styles.formInput} ${styles.keywordInput}`}
                  />
                  {MemoizedKeywordTags}
                </div>
              </div>
            </div>

            <div className={styles.formActions}>
              <div className={styles.formActionsLeft}>
                {/* 수정 페이지에서는 임시저장 기능 제외 */}
              </div>
              <div className={styles.formActionsRight}>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="migrate-btn"
                  style={{ background: '#6b7280' }}
                  disabled={loading}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading || !editorLoaded}
                  className="migrate-btn"
                  style={{
                    background: loading || !editorLoaded ? '#9ca3af' : '#10b981',
                    marginLeft: '12px',
                  }}
                >
                  {loading ? '수정 중...' : !editorLoaded ? '에디터 로딩 중...' : '수정하기'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <style jsx global>{`
        .toastui-editor-defaultUI, .toastui-editor-ww-container {
          border: 1px solid #e5e7eb !important;
        }
        .toastui-editor-defaultUI-toolbar {
          border-bottom: 1px solid #e5e7eb !important;
        }
      `}</style>
    </>
  );
}