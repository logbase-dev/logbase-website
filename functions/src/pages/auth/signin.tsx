'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { SITE_TITLE } from '@/consts';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // 회원가입
        await createUserWithEmailAndPassword(auth, email, password);
        alert('회원가입이 완료되었습니다!');
      } else {
        // 로그인
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/blog/write');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 
        (isSignUp ? '회원가입에 실패했습니다.' : '로그인에 실패했습니다.');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Google 로그인 기능 (현재 비활성화)
  // const handleGoogleSignIn = async () => {
  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const provider = new GoogleAuthProvider();
  //     await signInWithPopup(auth, provider);
  //     router.push('/blog/write');
  //   } catch (error: unknown) {
  //     const errorMessage = error instanceof Error ? error.message : 'Google 로그인에 실패했습니다.';
  //     setError(errorMessage);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <>
      <Head>
        <title>로그인 - {SITE_TITLE}</title>
        <meta name="description" content="Logbase에 로그인하세요" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <div className="rss-feed-container">
        <div className="rss-header">
          <h1>{isSignUp ? '회원가입' : '로그인'}</h1>
          <p style={{ textAlign: 'center', margin: '10px 0', color: '#666' }}>
            Logbase 블로그 작성에 {isSignUp ? '회원가입' : '로그인'}하세요.
          </p>
        </div>
        
        <div className="rss-content" style={{ maxWidth: '400px', margin: '0 auto' }}>
          {error && (
            <div style={{
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '4px',
              padding: '12px',
              marginBottom: '20px',
              color: '#c33'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleEmailAuth} style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                이메일
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="password" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="migrate-btn"
              style={{
                width: '100%',
                background: loading ? '#9ca3af' : '#3b82f6',
                marginBottom: '12px'
              }}
            >
              {loading ? (isSignUp ? '회원가입 중...' : '로그인 중...') : 
               (isSignUp ? '이메일로 회원가입' : '이메일로 로그인')}
            </button>
          </form>

          {/* <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <span style={{ color: '#666' }}>또는</span>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="migrate-btn"
            style={{
              width: '100%',
              background: loading ? '#9ca3af' : '#db4437',
              marginBottom: '20px'
            }}
          >
            {loading ? '로그인 중...' : 'Google로 로그인'}
          </button> */}

          {/* <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="migrate-btn"
              style={{ 
                background: '#10b981',
                marginRight: '10px',
                padding: '8px 16px',
                fontSize: '14px'
              }}
            >
              {isSignUp ? '로그인으로 전환' : '회원가입으로 전환'}
            </button>
          </div> */}

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => router.back()}
              className="migrate-btn"
              style={{ background: '#6b7280' }}
            >
              뒤로 가기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
