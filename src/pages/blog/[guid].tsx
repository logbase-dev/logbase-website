/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { RSSItem } from '@/types/rss';
import { adminDb } from '@/lib/firebase-admin';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { SITE_TITLE } from '@/consts';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import styles from './[guid].module.css';

interface BlogDetailProps {
  item: RSSItem | null;
  error?: string;
}

const BlogDetailPage: NextPage<BlogDetailProps> = ({ item, error }) => {
  const router = useRouter();
  const { user } = useAuth(); // 로그인 사용자 정보 가져오기

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  if (error || !item) {
    return (
      <div className="rss-feed-container">
        <div className="rss-header">
          <h1>오류</h1>
          <p>{error || '게시물을 찾을 수 없습니다.'}</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // content 정리 함수 - HTML 태그를 마크다운으로 변환
  const cleanContent = (content: string) => {
    if (!content) return '';
    
    // <br> 태그를 마크다운 줄바꿈으로 변환 (두 개의 줄바꿈 사용)
    let cleaned = content.replace(/<br\s*\/?>/gi, '\n\n');
    
    // 다른 HTML 태그 제거 (img 태그는 제외)
    cleaned = cleaned.replace(/<(?!img)[^>]*>/gi, '');
    
    // 연속된 줄바꿈을 정리 (3개 이상의 연속 줄바꿈을 2개로 제한)
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    return cleaned;
  };

  return (
    <>
      <Head>
        <title>{`${item.title} - ${SITE_TITLE}`}</title>
        <meta name="description" content={item.description} />
        <meta property="og:title" content={item.title} />
        <meta property="og:description" content={item.description} />
        <meta property="og:type" content="article" />
      </Head>
      <div className={styles.container}>
        <article className={styles.article}>
          <header className={styles.header}>
            <h1 className={styles.title}>{item.title}</h1>
            <div className={styles.meta}>
              <span className={styles.author}>{item.author || 'Logbase'}</span>
              <span className={styles.separator}>·</span>
              <time dateTime={item.isoDate} className={styles.date}>
                {formatDate(item.isoDate)}
              </time>
            </div>
            {item.categories && item.categories.length > 0 && (
              <div className={styles.tags}>
                {item.categories.map((tag) => (
                  <span key={tag} className={styles.tag}>#{tag}</span>
                ))}
              </div>
            )}
          </header>

          <div className={styles.content}>
            <div className={styles.markdownContent}>
              {item.content && (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    img: ({ src, alt, ...props }: any) => {
                      // Base64 이미지 처리
                      if (src && src.startsWith('data:image/')) {
                        return (
                          <img
                            src={src}
                            alt={alt || ''}
                            style={{ 
                              maxWidth: '100%', 
                              height: 'auto',
                              borderRadius: '8px',
                              margin: '16px 0'
                            }}
                            {...props}
                          />
                        );
                      }
                      
                      // Firebase Storage signed URL 또는 일반 URL 이미지
                      return (
                        <img
                          src={src}
                          alt={alt || ''}
                          style={{ 
                            maxWidth: '100%', 
                            height: 'auto',
                            borderRadius: '8px',
                            margin: '16px 0'
                          }}
                          onError={(e) => {
                            console.error('이미지 로드 실패:', src);
                            // 이미지 로드 실패 시 대체 처리
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            // 대체 텍스트 표시
                            const fallback = document.createElement('div');
                            fallback.style.cssText = `
                              padding: 20px;
                              background: #f5f5f5;
                              border: 1px dashed #ccc;
                              border-radius: 8px;
                              text-align: center;
                              color: #666;
                              margin: 16px 0;
                            `;
                            fallback.textContent = `이미지를 불러올 수 없습니다: ${alt || '이미지'}`;
                            target.parentNode?.insertBefore(fallback, target);
                          }}
                          {...props}
                        />
                      );
                    },
                    p: ({ children, ...props }: any) => (
                      <p style={{ marginBottom: '16px', lineHeight: '1.6' }} {...props}>
                        {children}
                      </p>
                    ),
                    h1: ({ children, ...props }: any) => (
                      <h1 style={{ fontSize: '2rem', marginBottom: '20px', marginTop: '32px' }} {...props}>
                        {children}
                      </h1>
                    ),
                    h2: ({ children, ...props }: any) => (
                      <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', marginTop: '24px' }} {...props}>
                        {children}
                      </h2>
                    ),
                    h3: ({ children, ...props }: any) => (
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', marginTop: '20px' }} {...props}>
                        {children}
                      </h3>
                    ),
                    blockquote: ({ children, ...props }: any) => (
                      <blockquote style={{ 
                        borderLeft: '4px solid #e5e7eb', 
                        paddingLeft: '16px', 
                        margin: '16px 0',
                        fontStyle: 'italic',
                        color: '#6b7280'
                      }} {...props}>
                        {children}
                      </blockquote>
                    ),
                    ul: ({ children, ...props }: any) => (
                      <ul style={{ marginBottom: '16px', paddingLeft: '20px' }} {...props}>
                        {children}
                      </ul>
                    ),
                    ol: ({ children, ...props }: any) => (
                      <ol style={{ marginBottom: '16px', paddingLeft: '20px' }} {...props}>
                        {children}
                      </ol>
                    ),
                    li: ({ children, ...props }: any) => (
                      <li style={{ marginBottom: '8px' }} {...props}>
                        {children}
                      </li>
                    ),
                    code: ({ children, ...props }: any) => (
                      <code style={{ 
                        backgroundColor: '#f3f4f6', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        fontSize: '0.9em'
                      }} {...props}>
                        {children}
                      </code>
                    ),
                    pre: ({ children, ...props }: any) => (
                      <pre style={{ 
                        backgroundColor: '#f3f4f6', 
                        padding: '16px', 
                        borderRadius: '8px',
                        overflow: 'auto',
                        marginBottom: '16px'
                      }} {...props}>
                        {children}
                      </pre>
                    ),
                  }}
                >
                  {cleanContent(item.content)}
                </ReactMarkdown>
              )}
            </div>
          </div>
        </article>

        <div className={styles.actions}>
          <Link href="/rss-feed" className={styles.backButton}>
            ← 목록으로 돌아가기
          </Link> &nbsp;&nbsp;&nbsp;&nbsp;
          {user && item && (
            <>
              <Link href={`/blog/edit/${item.guid}`} className={styles.backButton}>
                ✏️ 수정하기
              </Link> &nbsp;&nbsp;&nbsp;&nbsp;
              <button 
                onClick={async () => {
                  if (confirm('정말로 이 글을 삭제하시겠습니까?')) {
                    try {
                      const response = await fetch('/api/rss-migrate/delete', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ guid: item.guid }),
                      });
                      
                      const result = await response.json();
                      
                      if (result.success) {
                        alert('글이 삭제되었습니다.');
                        router.push('/rss-feed');
                      } else {
                        alert('글 삭제에 실패했습니다: ' + result.message);
                      }
                    } catch (error) {
                      console.error('글 삭제 오류:', error);
                      alert('글 삭제 중 오류가 발생했습니다.');
                    }
                  }
                }}
                className={styles.backButton}
                style={{ 
                  background: '#dc2626', 
                  color: 'white', 
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                🗑️ 삭제하기
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { guid } = context.params as { guid: string };

  try {
    console.log(`[Blog Detail] GUID 검색 시작: ${guid}`);
    
    // 모든 환경에서 API를 통해 이미지 URL 처리 (로컬 및 프로덕션)
    console.log(`[Blog Detail] API 호출로 이미지 URL 처리`);
    
    const protocol = context.req.headers['x-forwarded-proto'] || 'http';
    const host = context.req.headers.host;
    const apiUrl = `${protocol}://${host}/api/blog/${guid}`;
    console.log(`[Blog Detail] API 호출: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    const result = await response.json();
    
    if (result.success) {
      console.log(`[Blog Detail] API 응답 성공:`, {
        title: result.data.title,
        blogName: result.data.blogName,
        guid: result.data.guid
      });
      
      return {
        props: {
          item: result.data,
        },
      };
    } else {
      console.log(`[Blog Detail] API 응답 실패:`, result.error);
      return {
        props: {
          item: null,
          error: result.error || '게시물을 찾을 수 없습니다.',
        },
      };
    }
  } catch (apiError) {
    console.error(`[Blog Detail] API 호출 오류:`, apiError);
    
    // API 호출 실패 시 폴백으로 직접 Firestore 접근
    let docSnapshot = null;
    let docRef = null;

    // 1. 직접 doc() 호출로 시도
    try {
      docRef = adminDb.collection('rss_items').doc(guid);
      docSnapshot = await docRef.get();
      console.log(`[Blog Detail] 직접 doc() 호출 결과: ${docSnapshot.exists ? '존재함' : '존재하지 않음'}`);
    } catch (error) {
      console.log(`[Blog Detail] 직접 doc() 호출 실패:`, error);
    }

    // 2. 직접 호출이 실패했거나 문서가 존재하지 않는 경우, where 쿼리로 시도
    if (!docSnapshot || !docSnapshot.exists) {
      console.log(`[Blog Detail] where 쿼리로 재시도`);
      try {
        const querySnapshot = await adminDb.collection('rss_items')
          .where('guid', '==', guid)
          .limit(1)
          .get();
        
        if (!querySnapshot.empty) {
          docSnapshot = querySnapshot.docs[0];
          console.log(`[Blog Detail] where 쿼리로 문서 발견: ${docSnapshot.id}`);
        } else {
          console.log(`[Blog Detail] where 쿼리로도 문서를 찾을 수 없음`);
        }
      } catch (error) {
        console.log(`[Blog Detail] where 쿼리 실패:`, error);
      }
    }

    // 3. 여전히 문서를 찾지 못한 경우, 자체 작성 블로그의 경우 guid 필드에서 검색
    if (!docSnapshot || !docSnapshot.exists) {
      console.log(`[Blog Detail] 자체 작성 블로그 검색 시도 (logbase- 접두사)`);
      try {
        const querySnapshot = await adminDb.collection('rss_items')
          .where('guid', '==', guid)
          .where('blogName', '==', 'Logbase')
          .limit(1)
          .get();
        
        if (!querySnapshot.empty) {
          docSnapshot = querySnapshot.docs[0];
          console.log(`[Blog Detail] 자체 작성 블로그 발견: ${docSnapshot.id}`);
        }
      } catch (error) {
        console.log(`[Blog Detail] 자체 작성 블로그 검색 실패:`, error);
      }
    }

    if (!docSnapshot || !docSnapshot.exists) {
      console.log(`[Blog Detail] 모든 방법으로 검색했지만 문서를 찾을 수 없음`);
      return { notFound: true };
    }

    const data = docSnapshot.data();

    // 'data'가 undefined인지 확인
    if (!data) {
      console.log(`[Blog Detail] 문서 데이터가 없음`);
      return { notFound: true };
    }
    
    console.log(`[Blog Detail] 문서 데이터 로드 성공:`, {
      title: data.title,
      blogName: data.blogName,
      guid: data.guid
    });
    
    // Firestore의 Timestamp 객체를 직렬화 가능한 문자열로 변환
    const item = JSON.parse(JSON.stringify({
      ...data,
      id: docSnapshot.id,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || null,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt || null,
      // guid 필드는 이미 data에 포함되어 있으므로 별도 추가 필요 없음
    }));

    return { props: { item } };
  }
};

export default BlogDetailPage;