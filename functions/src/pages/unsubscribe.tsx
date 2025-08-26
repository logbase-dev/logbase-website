'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { SITE_TITLE } from '@/consts';

/**
 * 뉴스레터 구독 취소 페이지
 * 
 * 기능:
 * - URL 파라미터로 전달된 이메일과 토큰을 통해 구독자 정보 확인
 * - 구독 취소 및 재구독 기능 제공
 * - 구독자 정보 표시
 */
export default function UnsubscribePage() {
  const router = useRouter();
  
  // 상태 관리
  const [email, setEmail] = useState('');           // 구독자 이메일
  const [token, setToken] = useState('');           // 구독 취소 토큰
  const [loading, setLoading] = useState(false);    // 로딩 상태
  const [success, setSuccess] = useState(false);    // 구독 취소 성공 상태
  const [error, setError] = useState('');           // 에러 메시지
  const [subscriberInfo, setSubscriberInfo] = useState<any>(null); // 구독자 정보

  /**
   * 컴포넌트 마운트 시 URL 파라미터에서 이메일과 토큰 추출
   * 구독자 정보 확인 API 호출
   */
  useEffect(() => {
    if (router.isReady) {
      const { email: emailParam, token: tokenParam } = router.query;
      if (emailParam && tokenParam) {
        setEmail(emailParam as string);
        setToken(tokenParam as string);
        // 구독자 정보 확인
        checkSubscriberInfo(emailParam as string, tokenParam as string);
      }
    }
  }, [router.isReady, router.query]);

  /**
   * 구독자 정보 확인 API 호출
   * @param email - 구독자 이메일
   * @param token - 구독 취소 토큰
   */
  const checkSubscriberInfo = async (email: string, token: string) => {
    try {
      console.log('🔍 구독자 정보 확인 중:', { email, token });
      
      // 구독자 정보 조회 API 호출
      const response = await fetch(`/api/newsletter-subscriber-info?email=${encodeURIComponent(email)}&token=${token}`);
      console.log('📡 API 응답 상태:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📡 API 응답 데이터:', result);
      
      if (result.success) {
        setSubscriberInfo(result.data);
      } else {
        setError(result.error || '유효하지 않은 구독 취소 링크입니다.');
      }
    } catch (err: any) {
      console.error('❌ 구독자 정보 확인 실패:', err);
      setError('구독자 정보를 확인할 수 없습니다: ' + (err.message || '알 수 없는 오류'));
    }
  };

  /**
   * 구독 취소 처리
   * 구독자 상태를 'inactive'로 변경
   */
  const handleUnsubscribe = async () => {
    if (!email || !token) {
      setError('필수 정보가 누락되었습니다.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 구독 취소 API 호출
      const response = await fetch('/api/newsletter-subscriber-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          token,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || '구독 취소에 실패했습니다.');
      }
    } catch (err) {
      setError('구독 취소 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 재구독 처리
   * 구독자 상태를 'active'로 변경
   */
  const handleResubscribe = async () => {
    if (!email || !token) {
      setError('필수 정보가 누락되었습니다.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 재구독 API 호출
      const response = await fetch('/api/newsletter-subscriber-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          token,
          status: 'active',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(false);
        setSubscriberInfo({ ...subscriberInfo, status: 'active' });
      } else {
        setError(result.error || '재구독에 실패했습니다.');
      }
    } catch (err) {
      setError('재구독 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 페이지 메타데이터 */}
      <Head>
        <title>{`뉴스레터 구독 취소 - ${SITE_TITLE}`}</title>
        <meta name="description" content="로그베이스 뉴스레터 구독 취소" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/favicon.svg" />
      </Head>

      {/* 메인 컨테이너 */}
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(var(--gray-gradient)) no-repeat',
        backgroundSize: '100% 600px',
        padding: '2rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* 카드 컨테이너 */}
        <div style={{
          maxWidth: '500px',
          width: '100%',
          background: 'white',
          borderRadius: '15px',
          padding: '3rem 2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          {/* 페이지 헤더 */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#1a202c',
              marginBottom: '1rem'
            }}>
              뉴스레터 구독 관리
            </h1>
            <p style={{
              fontSize: '1rem',
              color: '#4a5568',
              lineHeight: '1.6'
            }}>
              로그베이스 뉴스레터 구독을 관리하세요
            </p>
          </div>

          {/* 구독자 정보 표시 영역 */}
          {subscriberInfo && (
            <div style={{
              background: '#f7fafc',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '2rem',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#2d3748',
                marginBottom: '1rem'
              }}>
                구독자 정보
              </h3>
              <div style={{
                textAlign: 'left',
                fontSize: '0.9rem',
                color: '#4a5568',
                lineHeight: '1.6'
              }}>
                <p><strong>이메일:</strong> {subscriberInfo.email}</p>
                <p><strong>이름:</strong> {subscriberInfo.name || '미입력'}</p>
                <p><strong>소속:</strong> {subscriberInfo.organization || '미입력'}</p>
                <p><strong>구독 상태:</strong> 
                  <span style={{
                    color: subscriberInfo.status === 'active' ? '#38a169' : '#e53e3e',
                    fontWeight: '600'
                  }}>
                    {subscriberInfo.status === 'active' ? '구독 중' : '구독 취소됨'}
                  </span>
                </p>
                <p><strong>구독 시작일:</strong> {new Date(subscriberInfo.createdAt).toLocaleDateString('ko-KR')}</p>
              </div>
            </div>
          )}

          {/* 에러 메시지 표시 */}
          {error && (
            <div style={{
              background: '#fed7d7',
              color: '#c53030',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          {/* 성공 메시지 표시 */}
          {success && (
            <div style={{
              background: '#c6f6d5',
              color: '#2f855a',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}>
              뉴스레터 구독이 성공적으로 취소되었습니다.
            </div>
          )}

          {/* 액션 버튼 영역 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* 구독 중인 경우: 구독 취소 버튼 표시 */}
            {subscriberInfo && subscriberInfo.status === 'active' ? (
              <button
                onClick={handleUnsubscribe}
                disabled={loading}
                style={{
                  background: '#e53e3e',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? '처리 중...' : '구독 취소하기'}
              </button>
            ) : 
            /* 구독 취소된 경우: 재구독 버튼 표시 */
            subscriberInfo && subscriberInfo.status === 'inactive' ? (
              <button
                onClick={handleResubscribe}
                disabled={loading}
                style={{
                  background: '#38a169',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? '처리 중...' : '다시 구독하기'}
              </button>
            ) : null}

            {/* 홈으로 돌아가기 버튼 */}
            <a
              href="/"
              style={{
                background: '#4a5568',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                textDecoration: 'none',
                textAlign: 'center'
              }}
            >
              홈으로 돌아가기
            </a>
          </div>

          {/* 안내 메시지 */}
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#f7fafc',
            borderRadius: '8px',
            fontSize: '0.9rem',
            color: '#4a5568',
            lineHeight: '1.6'
          }}>
            <p style={{ margin: 0 }}>
              <strong>안내:</strong> 구독을 취소하시면 더 이상 뉴스레터를 받으실 수 없습니다. 
              언제든지 다시 구독하실 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 