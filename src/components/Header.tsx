'use client';

import Link from 'next/link';
import { SITE_TITLE } from '@/consts';
import { useState } from 'react';
import InquiryForm from './InquiryForm';
import NewsletterModal from './NewsletterModal';
import LoginModal from './LoginModal';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user, loading, logout } = useAuth();
  const [showInquiry, setShowInquiry] = useState(false);
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };



  const handleLogout = async () => {
    try {
      await logout();
      alert('로그아웃되었습니다.');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃에 실패했습니다.');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // RSS 피드 페이지로 검색 쿼리와 함께 이동
      window.location.href = `/rss-feed?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleRssClick = async () => {
    let isCollecting = false;
    let completeTimeout: ReturnType<typeof setTimeout> | null = null;

    if (isCollecting) {
      console.log('이미 수집 중입니다.');
      return;
    }
    isCollecting = true;

    try {
      // 로딩 화면 표시
      const loadingScreen = document.getElementById('globalLoadingScreen');
      const progressBar = document.getElementById('globalProgressBar');
      const statusMessage = document.getElementById('globalStatusMessage');
      const progressText = document.getElementById('globalProgressText');
      const completeMessage = document.getElementById('globalCompleteMessage');
      const completeText = document.getElementById('globalCompleteText');
      const completeBtn = document.getElementById('globalCompleteBtn');

      if (!loadingScreen || !progressBar || !statusMessage || !progressText || !completeMessage || !completeText || !completeBtn) {
        console.error('필요한 DOM 요소를 찾을 수 없습니다.');
        isCollecting = false;
        return;
      }

      console.log('로딩 화면 표시 시작');
      loadingScreen.style.display = 'flex';
      completeMessage.style.display = 'none';

      // 진행률 애니메이션
      let progress = 0;
      const progressInterval = setInterval(() => {
        if (progress < 90) {
          progress += Math.random() * 10;
          progressBar.style.width = progress + '%';
          progressText.textContent = Math.round(progress) + '%';
        }
      }, 500);

      // 상태 메시지 애니메이션
      const statusMessages = [
        'RSS 피드 목록 확인 중...',
        '네트워크 연결 확인 중...',
        '기존 데이터 확인 중...',
        '데이터 수집 시작...',
        '경쟁사 피드 처리 중...',
        '비경쟁사 피드 처리 중...',
        '키워드 필터링 적용 중...',
        '날짜 필터링 적용 중...',
        'Firestore 저장 중...',
        '완료 처리 중...'
      ];

      let statusIndex = 0;
      const statusInterval = setInterval(() => {
        if (statusIndex < statusMessages.length) {
          statusMessage.textContent = statusMessages[statusIndex];
          statusIndex++;
        }
      }, 1000);

      const closeProgressAndGo = () => {
        loadingScreen.style.display = 'none';
        window.location.href = '/rss-feed';
        isCollecting = false;
      };

      // 기존 데이터 확인
      console.log('기존 데이터 확인 시작');
      statusMessage.textContent = '기존 데이터 확인 중...';
      const check = await fetch('/api/rss-check-today');
      const { exists } = await check.json();
      
      if (exists) {
        if (!confirm('오늘 수집한 데이터가 있습니다. 오늘 수집한 데이터를 삭제하고 다시 수집하시겠습니까?')) {
          clearInterval(progressInterval);
          clearInterval(statusInterval);
          loadingScreen.style.display = 'none';
          isCollecting = false;
          return;
        }
        statusMessage.textContent = '기존 데이터 삭제 중...';
        await fetch('/api/rss-delete-today', { method: 'POST' });
      }

      // RSS 데이터 수집 실행
      statusMessage.textContent = 'RSS 피드 수집 중...';
      const response = await fetch('/api/rss-collect', {
        method: 'POST'
      });
      
      const result = await response.json();
      console.log('수집 완료:', result);
      
      clearInterval(progressInterval);
      clearInterval(statusInterval);
      progressBar.style.width = '100%';
      progressText.textContent = '100%';
      statusMessage.textContent = '수집 완료!';
      
      // 완료 메시지 및 확인 버튼 표시
      completeText.textContent = result.message;
      completeMessage.style.display = 'block';
      
      // 3초 후 자동 닫힘
      if (completeTimeout) clearTimeout(completeTimeout);
      completeTimeout = setTimeout(() => {
        closeProgressAndGo();
      }, 3000);
      
      // 확인 버튼 클릭 시 즉시 닫힘
      completeBtn.onclick = () => {
        if (completeTimeout) clearTimeout(completeTimeout);
        closeProgressAndGo();
      };

    } catch (error) {
      console.error('RSS 수집 중 오류:', error);
      
      // 에러 메시지 표시
      const completeText = document.getElementById('globalCompleteText');
      const completeBtn = document.getElementById('globalCompleteBtn');
      const completeMessage = document.getElementById('globalCompleteMessage');
      
      if (completeText) completeText.textContent = `오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`;
      if (completeMessage) completeMessage.style.display = 'block';
      
      if (completeBtn) {
        completeBtn.onclick = () => {
          const loadingScreen = document.getElementById('globalLoadingScreen');
          if (loadingScreen) loadingScreen.style.display = 'none';
        };
      }
    } finally {
      isCollecting = false;
    }
  };

  return (
    <>

      <header id="header" data-controller="search" data-search-url-value="tv_search_inspiration" data-search-selected-type-value="inspiration">
        <div className="inner">

          <div className="c-header-main">

            <div className="header-main" data-search-target="headerMain">
              <div className="header-main__overlay " data-search-target="overlay" data-action="click->search#close"></div>
              <div className="header-main__container">

                <div className="header-main__hamburger" onClick={toggleMobileMenu} data-clarity-tag="header-mobile-menu-toggle">
                  <svg className="ico-svg" viewBox="0 0 20 20" width="16">
                    <path d="M2 4h16M2 10h16M2 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                	<Link href="/" className="header-main__logo" aria-label="logbase" data-clarity-tag="header-logo-click">
                  {/* 회사 로고 
                  <svg width="30" height="16" viewBox="0 0 30 16"><path d="m18.4 0-2.803 10.855L12.951 0H9.34L6.693 10.855 3.892 0H0l5.012 15.812h3.425l2.708-10.228 2.709 10.228h3.425L22.29 0h-3.892ZM24.77 13.365c0 1.506 1.12 2.635 2.615 2.635C28.879 16 30 14.87 30 13.365c0-1.506-1.12-2.636-2.615-2.636s-2.615 1.13-2.615 2.636Z"></path></svg>
                  회사 로고 */}
                  <span style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    fontFamily: 'Inter, sans-serif',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.5px',
                    textTransform: 'uppercase',
                    position: 'relative',
                    display: 'inline-block'
                  }}>
                    LOGBASE
                </span>
						</Link>

                <nav className="nav-header-main" data-search-target="navHeaderMain">
                  <ul className="nav-header-main__list">
                    <li className="nav-header-main__item">
                      <Link className="nav-header-main__link" href="/" data-clarity-tag="header-navigation-home">HOME</Link>
                    </li>
                    <li className="nav-header-main__item">
                      <Link className="nav-header-main__link" href="/rss-feed" data-clarity-tag="header-navigation-data-insights">DATA INSIGHTS</Link>
                    </li>
                    <li className="nav-header-main__item">
                      {/* <Link className="nav-header-main__link" href="/newsletter" data-clarity-tag="header-navigation-newsletter">NEWS LETTER</Link> */}
                      <p className="nav-header-main__link" data-clarity-tag="header-navigation-newsletter">NEWS LETTER</p>
                    </li>
                  </ul>
                </nav>

                <div className="header-main__search">
                  <form onSubmit={handleSearch} className="search-form">
                    <div className="search-form__field">
                      <button type="submit" className="search-form__button" aria-label="Search" data-clarity-tag="header-search-submit">
                        <svg className="ico-svg" viewBox="0 0 20 20" width="14">
                          <use xlinkHref="/"></use>
                        </svg>
                      </button>
                      <input 
                        type="text" 
                        placeholder="RSS 피드 검색..." 
                        className="search-form__input" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        data-clarity-tag="header-search-input"
                      />
                    </div>
                  </form>
                </div>

                <div className="header-main__right">
                  <div className="header-main__user">
                    {loading ? (
                      <>
                        <strong className="header-main__link hidden-sm">Loading...</strong>
                        <span className="header-main__ico">
                          <svg className="ico-svg" viewBox="0 0 20 20" width="20">
                            <use xlinkHref="/"></use>
                          </svg>
                        </span>
                      </>
                    ) : user ? (
                      <>
                        <strong className="header-main__link hidden-sm" onClick={handleLogout} data-clarity-tag="header-user-logout-text">
                          Log out ({user.email})
                        </strong>
                        <span className="header-main__ico" onClick={handleLogout} data-clarity-tag="header-user-logout-icon">
                          <svg className="ico-svg" viewBox="0 0 20 20" width="20">
                            <use xlinkHref="/"></use>
                          </svg>
                        </span>
                      </>
                    ) : (
                      <>
                        <strong className="header-main__link hidden-sm" onClick={() => setShowLogin(true)} data-clarity-tag="header-user-login-text">Log in</strong>
                        <span className="header-main__ico" onClick={() => setShowLogin(true)} data-clarity-tag="header-user-login-icon">
                          <svg className="ico-svg" viewBox="0 0 20 20" width="20">
                            <use xlinkHref="/"></use>
                          </svg>
                        </span>
                      </>
                    )}
                    <div id="g_id_onload" data-client_id="67367874134-drekvs51ripc1p92r1hpcntjk1jfmqka.apps.googleusercontent.com" data-login_uri="https://www.awwwards.com/login-google-one-tap" data-_destination="/pro">
                    </div>
                  </div>

                  <div className="header-main__bts">
                    <a href="#" className="button button--small--rounded" onClick={() => setShowNewsletter(true)} data-clarity-tag="header-newsletter-signup-button">뉴스레터 신청</a>
                    <a href="#" className="button button--small--outline--rounded" onClick={() => setShowInquiry(true)} data-clarity-tag="header-inquiry-button">문의하기</a>
                    {user && (
                      <a href="#" className="button button--small--rounded" onClick={() => handleRssClick()} data-clarity-tag="header-rss-collect-button">RSS 수집</a>
                    )}
                  </div>
                  
                </div>

              </div>
            </div>

          </div>

        </div>
      </header>

      {/* 모바일 메뉴 */}
      {isMenuOpen && (
        <div className="mobile-menu-overlay" onClick={toggleMobileMenu}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <span className="mobile-menu-title">메뉴</span>
              <button className="mobile-menu-close" onClick={toggleMobileMenu}>
                <svg viewBox="0 0 20 20" width="20">
                  <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <nav className="mobile-menu-nav">
              <ul className="mobile-menu-list">
                <li className="mobile-menu-item">
                  <Link href="/" className="mobile-menu-link" data-clarity-tag="mobile-navigation-home">HOME</Link>
                </li>
                <li className="mobile-menu-item">
                  <Link href="/rss-feed" className="mobile-menu-link" data-clarity-tag="mobile-navigation-data-insights">DATA INSIGHTS</Link>
                </li>
                <li className="mobile-menu-item">
                  <Link href="/newsletter" className="mobile-menu-link" data-clarity-tag="mobile-navigation-newsletter">NEWS LETTER</Link>
                </li>
              </ul>
            </nav>
            <div className="mobile-menu-actions">
              <button className="mobile-menu-button" onClick={() => { setShowNewsletter(true); toggleMobileMenu(); }} data-clarity-tag="mobile-newsletter-signup-button">
                뉴스레터 신청
              </button>
              <button className="mobile-menu-button" onClick={() => { setShowInquiry(true); toggleMobileMenu(); }} data-clarity-tag="mobile-inquiry-button">
                문의하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 전역 로딩 화면 (RSS 수집 시에만 표시) */}
      <div id="globalLoadingScreen" className="global-loading-screen">
        <div className="loading-content">
          <div className="loading-title">📡 RSS 피드 수집 중...</div>
          <div className="loading-description">데이터를 수집하고 있습니다. 잠시만 기다려주세요.</div>
          {/* 프로그레스 바 */}
          <div className="progress-container">
            <div id="globalProgressBar" className="progress-bar"></div>
          </div>
          {/* 상태 메시지 */}
          <div id="globalStatusMessage" className="status-message">
            초기화 중...
          </div>
          {/* 진행률 */}
          <div id="globalProgressText" className="progress-text">
            0%
          </div>
          {/* 수집 완료 메시지 및 확인 버튼 (동적으로 표시) */}
          <div id="globalCompleteMessage" className="complete-message">
            <div id="globalCompleteText" className="complete-text"></div>
            <button id="globalCompleteBtn" className="complete-btn">확인</button>
          </div>
        </div>
      </div>

      {/* ESC 키 이벤트 리스너 */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            let isCollecting = false;
            
            // ESC 키로 로딩 화면 닫기 (긴급 시)
            document.addEventListener('keydown', function(event) {
              if (event.key === 'Escape' && isCollecting) {
                const loadingScreen = document.getElementById('globalLoadingScreen');
                if (loadingScreen) {
                  loadingScreen.style.display = 'none';
                  isCollecting = false;
                }
              }
            });
          `
        }}
      />

      {/* 모달 컴포넌트들 */}
      <NewsletterModal 
        show={showNewsletter} 
        onClose={() => setShowNewsletter(false)} 
      />
      
      <InquiryForm 
        show={showInquiry} 
        onClose={() => setShowInquiry(false)} 
      />
      
      <LoginModal 
        show={showLogin} 
        onClose={() => setShowLogin(false)} 
      />
    </>
  );
} 