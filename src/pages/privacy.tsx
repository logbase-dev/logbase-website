import Head from 'next/head';
import Link from 'next/link';
import { SITE_TITLE } from '@/consts';

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>{`개인정보처리방침 - ${SITE_TITLE}`}</title>
        <meta name="description" content="로그베이스 개인정보처리방침" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/favicon.svg" />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(var(--gray-gradient)) no-repeat',
        backgroundSize: '100% 600px',
        padding: '2rem 1rem'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '15px',
          padding: '3rem 2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e2e8f0'
        }}>
          {/* 헤더 */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#1a202c',
              marginBottom: '1rem',
              letterSpacing: '-1px'
            }}>
              개인정보처리방침
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#4a5568',
              lineHeight: '1.6',
              marginBottom: '1rem'
            }}>
              로그베이스는 개인정보보호법에 따라 수집하는 개인정보의 항목, 개인정보의 수집 및 이용목적, 
              개인정보의 보유 및 이용기간, 개인정보의 파기절차 및 방법에 관한 사항을 규정합니다.
            </p>
            <p style={{
              fontSize: '0.9rem',
              color: '#718096',
              fontStyle: 'italic'
            }}>
              최종 업데이트: 2025년 3월 1일
            </p>
          </div>

          {/* 섹션들 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* 1. 수집하는 개인정보 */}
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
              transition: 'box-shadow 0.2s ease-in-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem',
                  boxShadow: '0 4px 12px rgba(72, 187, 120, 0.3)'
                }}>
                  <span style={{ color: 'white', fontSize: '1.5rem' }}>🌱</span>
                </div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#2d3748',
                  margin: 0
                }}>
                  수집하는 개인정보
                </h2>
              </div>
              <p style={{
                fontSize: '1.2rem',
                color: '#4a5568',
                lineHeight: '1.6',
                margin: 0
              }}>
                로그베이스는 뉴스레터 서비스를 위해 다음과 같은 개인정보를 수집합니다.
              </p>
              <ul style={{
                marginTop: '1rem',
                paddingLeft: '1.5rem',
                fontSize: '1.1rem',
                color: '#4a5568',
                lineHeight: '1.6',
                listStyle: 'none'
              }}>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                  <span style={{ position: 'absolute', left: '0', color: '#4a5568' }}>•</span>
                  성함
                </li>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                  <span style={{ position: 'absolute', left: '0', color: '#4a5568' }}>•</span>
                  소속
                </li>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                  <span style={{ position: 'absolute', left: '0', color: '#4a5568' }}>•</span>
                  이메일 주소
                </li>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                  <span style={{ position: 'absolute', left: '0', color: '#4a5568' }}>•</span>
                  휴대폰 번호
                </li>
              </ul>
            </div>

            {/* 2. 개인정보의 수집 및 이용 목적 */}
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
              transition: 'box-shadow 0.2s ease-in-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem',
                  boxShadow: '0 4px 12px rgba(66, 153, 225, 0.3)'
                }}>
                  <span style={{ color: 'white', fontSize: '1.5rem' }}>📄</span>
                </div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#2d3748',
                  margin: 0
                }}>
                  개인정보의 수집 및 이용 목적
                </h2>
              </div>
              <p style={{
                fontSize: '1.2rem',
                color: '#4a5568',
                lineHeight: '1.6',
                marginBottom: '1rem'
              }}>
                로그베이스는 다음과 같은 목적으로 개인정보를 이용합니다.
              </p>
              <ul style={{
                paddingLeft: '1.5rem',
                fontSize: '1.1rem',
                color: '#4a5568',
                lineHeight: '1.6',
                listStyle: 'none'
              }}>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                  <span style={{ position: 'absolute', left: '0', color: '#4a5568' }}>•</span>
                  AI 뉴스 다이제스트 뉴스레터 발송
                </li>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                  <span style={{ position: 'absolute', left: '0', color: '#4a5568' }}>•</span>
                  서비스 관련 공지 및 중요 정보 안내
                </li>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                  <span style={{ position: 'absolute', left: '0', color: '#4a5568' }}>•</span>
                  개인화된 서비스 제공
                </li>
              </ul>
            </div>

            {/* 3. 개인정보의 보유 및 이용 기간 */}
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
              transition: 'box-shadow 0.2s ease-in-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem',
                  boxShadow: '0 4px 12px rgba(237, 137, 54, 0.3)'
                }}>
                  <span style={{ color: 'white', fontSize: '1.5rem' }}>⏰</span>
                </div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#2d3748',
                  margin: 0
                }}>
                  개인정보의 보유 및 이용 기간
                </h2>
              </div>
              <p style={{
                fontSize: '1.1rem',
                color: '#4a5568',
                lineHeight: '1.6',
                marginBottom: '1rem'
              }}>
                수집한 개인정보는 서비스 제공 목적 달성을 위해 필요한 기간 동안 보유 및 이용됩니다.<br/>
                다음의 경우 해당 개인정보를 파기합니다.
              </p>
              <ul style={{
                marginTop: '1rem',
                paddingLeft: '1.5rem',
                fontSize: '1.1rem',
                color: '#4a5568',
                lineHeight: '1.6',
                listStyle: 'none'
              }}>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                  <span style={{ position: 'absolute', left: '0', color: '#4a5568' }}>•</span>
                  이용자의 뉴스레터 구독 해지 요청 시
                </li>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                  <span style={{ position: 'absolute', left: '0', color: '#4a5568' }}>•</span>
                  이용자의 개인정보 삭제 요청 시
                </li>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                  <span style={{ position: 'absolute', left: '0', color: '#4a5568' }}>•</span>
                  서비스 종료 시
                </li>
              </ul>
            </div>

            {/* 4. 개인정보의 보호조치 */}
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
              transition: 'box-shadow 0.2s ease-in-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem',
                  boxShadow: '0 4px 12px rgba(245, 101, 101, 0.3)'
                }}>
                  <span style={{ color: 'white', fontSize: '1.5rem' }}>🛡️</span>
                </div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#2d3748',
                  margin: 0
                }}>
                  개인정보의 보호조치
                </h2>
              </div>
              <p style={{
                fontSize: '1.1rem',
                color: '#4a5568',
                lineHeight: '1.6',
                marginBottom: '1rem'
              }}>
                로그베이스는 이용자의 개인정보를 보호하기 위해 다음과 같은 조치를 취하고 있습니다.
              </p>
              <ul style={{
                paddingLeft: '1.5rem',
                fontSize: '1.1rem',
                color: '#4a5568',
                lineHeight: '1.6',
                listStyle: 'none'
              }}>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                  <span style={{ position: 'absolute', left: '0', color: '#4a5568' }}>•</span>
                  SSL 암호화 통신
                </li>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                  <span style={{ position: 'absolute', left: '0', color: '#4a5568' }}>•</span>
                  접근 제어 및 권한 관리
                </li>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                  <span style={{ position: 'absolute', left: '0', color: '#4a5568' }}>•</span>
                  정기적인 보안 업데이트 및 취약점 점검
                </li>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                  <span style={{ position: 'absolute', left: '0', color: '#4a5568' }}>•</span>
                  개인정보 처리 시스템 접근 기록 관리
                </li>
              </ul>
            </div>

            {/* 5. 개인정보의 제3자 제공 */}
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
              transition: 'box-shadow 0.2s ease-in-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #9f7aea 0%, #805ad5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem',
                  boxShadow: '0 4px 12px rgba(159, 122, 234, 0.3)'
                }}>
                  <span style={{ color: 'white', fontSize: '1.5rem' }}>🌐</span>
                </div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#2d3748',
                  margin: 0
                }}>
                  개인정보의 제3자 제공
                </h2>
              </div>
              <p style={{
                fontSize: '1.1rem',
                color: '#4a5568',
                lineHeight: '1.6',
                marginBottom: '1rem'
              }}>
                로그베이스는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.<br/>
                다만, 다음의 경우에는 예외로 합니다:
              </p>
              <ul style={{
                marginTop: '1rem',
                paddingLeft: '1.5rem',
                fontSize: '1.1rem',
                color: '#4a5568',
                lineHeight: '1.6',
                listStyle: 'none'
              }}>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                  <span style={{ position: 'absolute', left: '0', color: '#4a5568' }}>•</span>
                  법령에 의해 요구되는 경우
                </li>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                  <span style={{ position: 'absolute', left: '0', color: '#4a5568' }}>•</span>
                  이용자의 사전 동의가 있는 경우
                </li>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                  <span style={{ position: 'absolute', left: '0', color: '#4a5568' }}>•</span>
                  서비스 제공을 위해 위탁업체(뉴스레터 발송 서비스 등)에 제공하는 경우
                </li>
              </ul>
            </div>

            {/* 6. 이용자의 권리 */}
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
              transition: 'box-shadow 0.2s ease-in-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem',
                  boxShadow: '0 4px 12px rgba(56, 178, 172, 0.3)'
                }}>
                  <span style={{ color: 'white', fontSize: '1.5rem' }}>👤</span>
                </div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#2d3748',
                  margin: 0
                }}>
                  이용자의 권리
                </h2>
              </div>
              <p style={{
                fontSize: '1.1rem',
                color: '#4a5568',
                lineHeight: '1.6',
                marginBottom: '1rem'
              }}>
                이용자는 개인정보에 대해 다음과 같은 권리를 가집니다.
              </p>
              <ul style={{
                paddingLeft: '1.5rem',
                fontSize: '1.1rem',
                color: '#4a5568',
                lineHeight: '1.6',
                marginBottom: '1rem',
                listStyle: 'none'
              }}>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#4a5568' }}>•</span>
                  개인정보 열람 요구
                </li>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#4a5568' }}>•</span>
                  개인정보 정정·삭제 요구
                </li>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#4a5568' }}>•</span>
                  개인정보 처리정지 요구
                </li>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#4a5568' }}>•</span>
                  개인정보의 이용 및 제공에 대한 동의 철회
                </li>
              </ul>
              <p style={{
                fontSize: '1.1rem',
                color: '#4a5568',
                lineHeight: '1.6',
                margin: 0
              }}>
                위 권리를 행사하려면 <strong>info@logbase.kr</strong>로 이메일을 보내주세요.
              </p>
            </div>

            {/* 7. 개인정보 관리 책임자 */}
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
              transition: 'box-shadow 0.2s ease-in-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ed64a6 0%, #d53f8c 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem',
                  boxShadow: '0 4px 12px rgba(237, 100, 166, 0.3)'
                }}>
                  <span style={{ color: 'white', fontSize: '1.5rem' }}>💬</span>
                </div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#2d3748',
                  margin: 0
                }}>
                  개인정보 관리 책임자
                </h2>
              </div>
              <div style={{
                fontSize: '1.1rem',
                color: '#4a5568',
                lineHeight: '1.6'
              }}>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>이름:</strong> 황해수
                </p>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>직책:</strong> 최고 기술 관리자
                </p>
                <p style={{ margin: 0 }}>
                  <strong>이메일:</strong> info@logbase.kr
                </p>
              </div>
            </div>

            {/* 8. 개인정보처리방침 변경 */}
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
              transition: 'box-shadow 0.2s ease-in-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem',
                  boxShadow: '0 4px 12px rgba(246, 173, 85, 0.3)'
                }}>
                  <span style={{ color: 'white', fontSize: '1.5rem' }}>📝</span>
                </div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#2d3748',
                  margin: 0
                }}>
                  개인정보처리방침 변경
                </h2>
              </div>
              <p style={{
                fontSize: '1.1rem',
                color: '#4a5568',
                lineHeight: '1.6',
                margin: 0
              }}>
                이 개인정보처리방침은 법령 및 방침에 따라 변경될 수 있으며, 
                변경 시에는 웹사이트 또는 이메일을 통해 공지합니다.
              </p>
            </div>

            {/* 9. 개인정보 관련 문의 */}
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
              transition: 'box-shadow 0.2s ease-in-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #68d391 0%, #48bb78 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem',
                  boxShadow: '0 4px 12px rgba(104, 211, 145, 0.3)'
                }}>
                  <span style={{ color: 'white', fontSize: '1.5rem' }}>✉️</span>
                </div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#2d3748',
                  margin: 0
                }}>
                  개인정보 관련 문의
                </h2>
              </div>
              <p style={{
                fontSize: '1.1rem',
                color: '#4a5568',
                lineHeight: '1.6',
                marginBottom: '1rem'
              }}>
                개인정보 보호에 관한 문의사항이 있으시면 언제든지 연락주세요.
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1.1rem',
                color: '#4a5568'
              }}>
                <span>✉️</span>
                <a 
                  href="mailto:info@logbase.kr"
                  style={{
                    color: '#4299e1',
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}
                  data-clarity-tag="privacy-contact-email"
                >
                  info@logbase.kr
                </a>
              </div>
            </div>

          </div>

          {/* 푸터 */}
          <div style={{
            marginTop: '3rem',
            paddingTop: '2rem',
            borderTop: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              marginBottom: '1rem'
            }}>
              <Link href="/" style={{
                color: '#4299e1',
                textDecoration: 'none',
                fontSize: '1rem'
              }}
              data-clarity-tag="privacy-back-to-home"
              >
                홈
              </Link>
              <span style={{ color: '#cbd5e0' }}>|</span>
              <span style={{
                color: '#4a5568',
                fontSize: '1rem'
              }}>
                개인정보처리방침
              </span>
            </div>
            <p style={{
              fontSize: '0.9rem',
              color: '#718096',
              margin: 0
            }}>
              © 2025 로그베이스. All rights reserved.
            </p>
          </div>

        </div>
      </div>
    </>
  );
} 