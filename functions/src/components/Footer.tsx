'use client';

import React, { useState } from 'react';
import InquiryForm from './InquiryForm';
import NewsletterModal from './NewsletterModal';

export default function Footer() {
  const [showInquiry, setShowInquiry] = useState(false);
  const [showNewsletter, setShowNewsletter] = useState(false);
  const today = new Date();
  
  return (
    <>
      <footer id="footer">
          <div className="inner">
              <div className="footer__top__right">
                  <div className="footer__wrapper" style={{ 
                      width: '100%', 
                      display: 'flex', 
                      justifyContent: 'flex-end',
                      alignItems: 'center'
                  }}>
                      <div className="footer__bts" style={{ 
                          display: 'flex', 
                          gap: '10px',
                          justifyContent: 'flex-end'
                      }}>
                          <a 
                              href="#" 
                              className="button button--small--rounded" 
                              onClick={(e) => {
                                  e.preventDefault();
                                  setShowNewsletter(true);
                              }} 
                              style={{ 
                                  color: 'white',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease'
                              }}
                              onMouseEnter={(e) => {
                                  e.currentTarget.style.color = '#667eea';
                              }}
                              onMouseLeave={(e) => {
                                  e.currentTarget.style.color = 'white';
                              }}
                          >
                              뉴스레터 신청
                          </a>
                          <a 
                              href="#" 
                              className="button button--small--outline--rounded" 
                              onClick={(e) => {
                                  e.preventDefault();
                                  setShowInquiry(true);
                              }}
                              style={{ 
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease'
                              }}
                              onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'black';
                                  e.currentTarget.style.color = '#667eea';
                                  e.currentTarget.style.borderColor = 'black';
                              }}
                              onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '';
                                  e.currentTarget.style.color = '';
                                  e.currentTarget.style.borderColor = '';
                              }}
                          >
                              문의하기
                          </a>
                      </div>
                  </div>
              </div>
              <div className="footer__bottom">
                  <div className="footer__left">
                      <ul className="footer__nav">
                          <li><a rel="nofollow" href="https://www.awwwards.com/cookies-policy/">Cookies Policy</a></li>
                          <li><a rel="nofollow" href="https://www.awwwards.com/terms/">Legal Terms</a></li>
                          <li><a rel="nofollow" href="https://www.awwwards.com/privacy-policy/">Privacy Policy</a></li>
                      </ul>
                  </div>
                  <div className="footer__right">
                      <ul className="footer__nav">
                          <li><strong>Connect:</strong></li>
                          <li><a href="https://www.instagram.com/awwwards">Instagram</a></li>
                          <li><a href="https://www.linkedin.com/company/awwwards">LinkedIn</a></li>
                          <li><a href="https://twitter.com/awwwards">Twitter</a></li>
                          <li><a href="https://www.facebook.com/awwwards">Facebook</a></li>
                          <li><a href="https://www.youtube.com/awwwardstv">YouTube</a></li>
                          <li><a href="https://www.tiktok.com/@awwwards.com">TikTok</a></li>
                          <li><a href="https://www.pinterest.es/awwwards/">Pinterest</a></li>
                      </ul>
                  </div>
              </div>
          </div>
      </footer>
      
      {/* 모달 컴포넌트들 */}
      <NewsletterModal 
        show={showNewsletter} 
        onClose={() => setShowNewsletter(false)} 
      />
      
      <InquiryForm 
        show={showInquiry} 
        onClose={() => setShowInquiry(false)} 
      />
    </>
  );
} 