import Link from 'next/link';
import Head from 'next/head';
import { SITE_TITLE } from '@/consts';
import { useState, useEffect } from 'react';
import InquiryForm from '@/components/InquiryForm';
import NewsletterModal from '@/components/NewsletterModal';

export default function HomePage() {
  const [billingType, setBillingType] = useState<'monthly' | 'yearly'>('yearly');
  const [showInquiry, setShowInquiry] = useState(false);
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  
  const videos = [
    '/images/Logbase_main_mov_01.mp4',
    '/images/Logbase_main_mov_02.mp4'
  ];

    const handleAccordionHover = (index: number) => {
        setActiveAccordion(index);
    };

      const handleAccordionLeave = () => {
    setActiveAccordion(null);
  };

  const handleVideoEnded = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
  };

  // URL 파라미터 감지하여 문의하기 모달 자동 열기
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const modal = urlParams.get('modal');
    const hash = window.location.hash;

    if (modal === 'inquiry' || hash === '#inquiry') {
        // 페이지 로딩 후 약간의 지연을 두고 모달 열기
        setTimeout(() => {
            setShowInquiry(true);
            // URL에서 파라미터 제거 (선택사항)
            if (modal === 'inquiry') {
                const newUrl = window.location.pathname + window.location.hash;
                window.history.replaceState({}, document.title, newUrl);
            }
        }, 1000);
    }
  }, []);

    return (
    <>
    <Head>
      <title>{SITE_TITLE}</title>
      <meta name="description" content="The ultimate platform for RSS feed collection and newsletter management" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/images/favicon.svg" />
    </Head>

    <section id="content">

      {/* 메인 블럭 start */}
      <div className="anchor-section" id="intro">
        {/* main 문구, 이미지, Professional Plans 텍스트 블럭 start */}
        <div className="block">
          <div className="inner">

            {/* main 문구 */}
            <div className="c-heading text-center">
              <div className="c-heading__top">
                {/* <h2 className="text-default">Business</h2> */}
              </div>
              <div className="c-heading__middle">
                <h3 className="heading-5">
                  <br />
                  데이터로 세상을 이해하는 사람들, <br />행동데이터의 미래를 여는 Logbase와 왜 함께해야 하는지 지금 확인해보세요.
                </h3>
              </div>
            </div>
            <br /> <br /> <br /> <br />
            {/* main 이미지
            <div className="text-center">
              <img src="/images/main-bg-1.png" alt="" />
            </div>
            */}
            <div className="box-feature box-feature--s2--dark is-double">
              <div className="box-feature__info">
                <h3 className="heading-5 box-feature__title" style={{ color: 'white' }}>행동과 데이터, 그리고 성장을 한 곳에 - Logbase와 나만의 가치를 드러내고 새로운 협업을 경험하세요.</h3>
                <p>
                  기록은 곧 성장, 무엇부터 해야 할지 모르겠다면 짧은 소통만으로 방향을 잡을 수 있습니다.<br /><br />
                  행동데이터로 고객을 더 깊이 이해하고, 성과로 증명하며 성장의 방향을 설정할 수 있습니다.<br /><br />
                  ILOG로 시작하는 데이터 여정, 고객의 성과와 가치를 모두를 연결합니다.<br /><br />
                </p>
                <p><a onClick={() => setShowNewsletter(true)} className="button button--large--outline--white--rounded" data-clarity-tag="main-newsletter-signup-button">뉴스레터 신청</a> 
                &nbsp;&nbsp;&nbsp;<a onClick={() => setShowInquiry(true)} className="button button--large--outline--white--rounded" data-clarity-tag="main-inquiry-button">문의하기</a></p>
              </div>
              <div className="box-feature__photo">
                {/* 메인 비디오 */}
                <video
                    src={videos[currentVideoIndex]}
                    autoPlay
                    muted
                    playsInline
                    onEnded={handleVideoEnded}
                    className="rounded-xl shadow-lg object-cover object-top"
                />
              </div>
            </div>
          </div>
        </div>
        {/* main 문구, 이미지, Professional Plans 텍스트 블럭 end */}
      </div>
      {/* 메인 블럭 end */}

      {/* Feature start */}
      <div className="anchor-section" id="features">
          <div className="block">
              <div className="inner">

                <div className="c-heading text-center">
                  <div className="c-heading__top">
                    <h2 className="text-default">Feature</h2>
                  </div>

                  <div className="c-heading__bottom">
                    <div className="c-heading__long-desc">
                      <h3 className="heading-7">데이터에 강한 조직을 만드는 가장 빠른 투자, 측정할 수 있어야 성장합니다.</h3>
                      <p className="feature-description-text">- 정확한 측정을 위해서는 시스템 기반의 로그 프로세스가 필수입니다.</p>
                      <p className="feature-description-text">- 로그는 정확도, 개발 효율, 운영 편의성 없이는 지속적으로 유지하기 어렵습니다.</p>
                      <p className="feature-description-text">- ILOG는 고객 이해와 인사이트 발굴, 실험이 반복되는 로그의 여정 속에서, 짧은 시간과 노력만으로 고품질 로그를 확보합니다.</p>
                    </div>
                  </div>
                </div>

                {/* 피처 내용 */}
                <div className="grid-features" id="member-features">

                  <div className="box-feature box-feature--s1--right">
                    <video
                      src="/images/ILOG_DEMO_DEFINITION_CROPED.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="rounded-xl shadow-lg object-cover object-top"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  </div>

                  <div className="box-feature box-feature--s1--right">
                    <div className="l-1cols">
                      <div className="l-1cols__col">

                        <div className="accordion-features">
                          <div className={`accordion-item ${activeAccordion === 0 ? 'active' : ''}`}>
                            <div className="accordion-header" onMouseEnter={() => handleAccordionHover(0)} onMouseLeave={handleAccordionLeave} data-clarity-tag="main-feature-accordion-web-ui">
                              <span className="accordion-title">모든 플랫폼 로그를 한눈에, 실시간 Web UI</span>
                              <span className="accordion-icon">+</span>
                            </div>
                            <div className="accordion-content">
                              <p>Android, iOS, Web 모든 화면과 기능을 <strong>웹 브라우저에서 동일한 UI로 확인 및 테스트</strong></p>
                              <p><strong>단말 없이도 로그 확인과 검증 가능</strong> — 모바일 기기 없이도 실시간 로그 확인</p>
                            </div>
                          </div>

                            <div className={`accordion-item ${activeAccordion === 1 ? 'active' : ''}`}>
                              <div className="accordion-header" onMouseEnter={() => handleAccordionHover(1)} onMouseLeave={handleAccordionLeave} data-clarity-tag="main-feature-accordion-real-time-log">
                                <span className="accordion-title">실시간 로그 수집 & 자동 검증</span>
                                <span className="accordion-icon">+</span>
                              </div>
                              <div className="accordion-content">
                                <p>사용자 행동 로그를 <strong>실시간 수집하고 자동으로 검증 결과까지 제공</strong></p>
                                <p><strong>로그 확인만으로 QA 작업까지 한 번에</strong> — 로그 품질 검토를 위한 별도 작업 불필요</p>
                              </div>
                            </div>

                            <div className={`accordion-item ${activeAccordion === 2 ? 'active' : ''}`}>
                              <div className="accordion-header" onMouseEnter={() => handleAccordionHover(2)} onMouseLeave={handleAccordionLeave} data-clarity-tag="main-feature-accordion-llm-events">
                                <span className="accordion-title">LLM 기반 이벤트 구조 자동 정의</span>
                                <span className="accordion-icon">+</span>
                              </div>
                              <div className="accordion-content">
                                <p>AI가 <strong>page_id, action_id, 속성 구조를 자동 분석하고 최적 taxonomy를 제안</strong></p>
                                <p>사용자는 제안을 <strong>선택 또는 수정</strong>만 하면 되고, LLM은 계속해서 학습하며 개선한 결과를 제공</p>
                                <p>속성 정보는 <strong>선택형 리스트</strong>로 제공되어 클릭만으로 정의 가능 (신규 속성은 별도 개발)</p>
                              </div>
                            </div>

                            <div className={`accordion-item ${activeAccordion === 3 ? 'active' : ''}`}>
                              <div className="accordion-header" onMouseEnter={() => handleAccordionHover(3)} onMouseLeave={handleAccordionLeave} data-clarity-tag="main-feature-accordion-autobot">
                                <span className="accordion-title">배포 전 AutoBot으로 서비스 전체 자동 검사</span>
                                <span className="accordion-icon">+</span>
                              </div>
                              <div className="accordion-content">
                                <p><strong>가상의 Bot이 실제 사용자 환경을 시뮬레이션하며 전 영역을 검사</strong></p>
                                <p><strong>배포 전 에러·누락된 로그를 자동 탐지</strong>하고, 상세 리포트 제공</p>
                                <p>QA 리소스를 최소화하고 <strong>출시 전 품질 문제를 선제적으로 해결</strong></p>
                              </div>
                            </div>

                            <div className={`accordion-item ${activeAccordion === 4 ? 'active' : ''}`}>
                              <div className="accordion-header" onMouseEnter={() => handleAccordionHover(4)} onMouseLeave={handleAccordionLeave} data-clarity-tag="main-feature-accordion-single-line">
                                <span className="accordion-title">로그 개발, 단 한 줄로 끝</span>
                                <span className="accordion-icon">+</span>
                              </div>
                              <div className="accordion-content">
                                <p><strong>페이지 진입/클릭마다 API 하나 추가</strong>면 로그 개발 완료</p>
                                <p>API에는 <strong>Log ID 하나만 추가</strong>하면 끝 — 복잡한 로그 개발 과정을 제거하여 최대한 간소화</p>
                                <p><strong>개발 부담을 90% 이상 절감</strong>, 초기 세팅만으로 유지보수 필요 없음</p>
                              </div>
                            </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
          </div>
      </div>
      {/* Feature end */}

      {/* Background start */}
      <div className="anchor-section" id="background">
        <div className="block">
            <div className="inner">
                <div className="c-heading text-center">
                    <div className="c-heading__top">
                        <h2 className="text-default">Background</h2>
                    </div>

                    <div className="c-heading__bottom">
                        <div className="c-heading__long-desc">
                            <h3 className="heading-7">현재까지 대부분의 기업은 행동데이터 수집을 수작업이나 부분적인 자동화에 의존해왔습니다.
                            그렇다면 왜 이러한 비효율이 여전히 반복되고 있을까요?</h3>
                            <p className="feature-description-text">- 개발 요구는 끊임없이 증가하지만, 로그 개발은 반복적이고 까다로운 작업으로 여겨져 개발자들이 기피하는 영역이 되었습니다.</p>
                            <p className="feature-description-text">- 특히 여러 개발자가 함께 작업할 경우, 로그 누락·오류·불일치 문제가 빈번하게 발생하며, 서비스 개선 시마다 데이터 품질에까지 영향을 미치는 악순환이 반복됩니다.</p>
                            <p className="feature-description-text">- 결국 문제 해결에는 더 많은 시간과 리소스가 들게 되고, 기업은 다음 배포 일정에 쫓겨 또다시 같은 실수를 반복하는 데이터 운영의 챗바퀴로부터 벗어나지 못하고 있습니다.</p>
                        </div>
                    </div>
                </div>
                <div className="grid-features" id="member-features">

                    <div className="box-feature box-feature--s1--right">
                        <div className="l-1cols">
                            <div className="l-1cols__col">               
                                <div className="accordion-features">
                                    <div className={`accordion-item ${activeAccordion === 5 ? 'active' : ''}`}>
                                        <div className="accordion-header" onMouseEnter={() => handleAccordionHover(5)} onMouseLeave={handleAccordionLeave} data-clarity-tag="main-background-accordion-log-development">
                                            <span className="accordion-title">로그 개발은 피할 수 없는 현실</span>
                                            <span className="accordion-icon">+</span>
                                        </div>
                                        <div className="accordion-content">
                                            <p>로그없이는 고객의 선호도와 행동을 <strong>맥락과 함게 이해</strong>할 수 없습니다.</p>
                                            <p>기능 구현 후 반드시 로그 개발과 검증이 따라오기 때문에, 이제는 <strong>기능과 로그 둘 다 필수</strong>입니다.</p>
                                            <p>데이터 개발은 더 이상 미룰 수 없는 <strong>기업 운영의 핵심 과제</strong>가 되었습니다.</p>
                                        </div>
                                    </div>

                                    <div className={`accordion-item ${activeAccordion === 6 ? 'active' : ''}`}>
                                        <div className="accordion-header" onMouseEnter={() => handleAccordionHover(6)} onMouseLeave={handleAccordionLeave} data-clarity-tag="main-background-accordion-simple-solution">
                                            <span className="accordion-title">단순 솔루션으로 해결되지 않는 문제</span>
                                            <span className="accordion-icon">+</span>
                                        </div>
                                        <div className="accordion-content">
                                                <p>로그 수집을 효율적이고 정확하게 하려면 <strong>프로세스, 시스템, 검증 체계</strong>가 함께 필요합니다.</p>
                                                <p>외부 솔루션 하나만으로는 기업의 로그 문제를 근본적으로 해결할 수 없습니다.</p>
                                                <p>업무 프로세스와 조직문화에 로그운영이 녹아들어야 진정한 변화가 가능합니다.</p>
                                        </div>
                                    </div>

                                    <div className={`accordion-item ${activeAccordion === 7 ? 'active' : ''}`}>
                                        <div className="accordion-header" onMouseEnter={() => handleAccordionHover(7)} onMouseLeave={handleAccordionLeave} data-clarity-tag="main-background-accordion-data-perspective">
                                            <span className="accordion-title">조직의 데이터 관점부터 점검하기 </span>
                                            <span className="accordion-icon">+</span>
                                        </div>
                                        <div className="accordion-content">
                                            <p>첫 번째 과제는 우리 조직이 데이터를 어떻게 바라보는지를 알아야 합니다.</p>
                                            <p>데이터를 자산으로 바라본다면, 다음은 <strong>생성–검증–모니터링의 효율성</strong>을 확보하는 일입니다.</p>
                                            <p>수작업 방식으로는 Agile 환경을 따라갈 수 없으므로, 결국에는 시스템 기반 접근으로 전환합니다.</p>
                                        </div>
                                    </div>

                                    <div className={`accordion-item ${activeAccordion === 8 ? 'active' : ''}`}>
                                        <div className="accordion-header" onMouseEnter={() => handleAccordionHover(8)} onMouseLeave={handleAccordionLeave} data-clarity-tag="main-background-accordion-ilog-change">
                                            <span className="accordion-title">ILOG가 제안하는 변화</span>
                                            <span className="accordion-icon">+</span>
                                        </div>
                                        <div className="accordion-content">
                                            <p>ILOG는 AI 기반 행동데이터 시스템을 통해 <strong>로그 프로세스 전반의 혁신</strong>을 지원합니다.</p>
                                            <p>단순 자동화가 아니라, 기업의 데이터 관점과 운영 문화를 바꾸는 데 집중합니다.</p>
                                            <p>이를 통해 로그는 비용이 아닌, <strong>성장을 견인하는 투자</strong>로 자리잡을 수 있습니다.</p>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="box-feature box-feature--s1--right">
                        <img src="/images/bg-background_04.png" alt="Background" />
                    </div>

                </div>

            </div>
        </div>
      </div>
      {/* Background end */}

      {/* Differentiator start */}
      <div className="anchor-section" id="differentiator">
          <div className="block">
              <div className="inner">
                  <div className="c-heading text-center">
                      <div className="c-heading__top">
                          <h2 className="text-default">Differentiator</h2>
                      </div>

                      <div className="c-heading__bottom">
                          <div className="c-heading__long-desc">
                              <h3 className="heading-7">로그베이스의 행동데이터는 ILOG 솔루션으로 기업의 변화를 시작합니다.</h3>
                              <p className="feature-description-text">- 수많은 대기업 플랫폼 서비스(11번가, Btv, 요기요 등) 로그 운영과 개발의 시행착오 속에서 얻은 현장 중심의 해법을 ILOG에 녹여냈습니다.</p>
                              <p className="feature-description-text">- 복잡하고 반복적인 로그 작업을 자동화하고, 데이터 활용의 수준을 한 단계 끌어올립니다.</p>
                              <p className="feature-description-text">- 이제 로그는 더 이상 부담이 아니라, 성장을 가속화하는 차별화된 무기가 됩니다.</p>
                          </div>
                      </div>
                  </div>


                  <div className="grid-features" id="member-features">
                      <div className="box-feature box-feature--s1--right">
                          <img src="/images/bg-differentiator.png" alt="Background" />
                      </div>

                      <div className="box-feature box-feature--s1--right">
                          <div className="l-1cols">
                              <div className="l-1cols__col">
                                  
                                  <div className="accordion-features">
                                      <div className={`accordion-item ${activeAccordion === 9 ? 'active' : ''}`}>
                                          <div className="accordion-header" onMouseEnter={() => handleAccordionHover(9)} onMouseLeave={handleAccordionLeave} data-clarity-tag="main-differentiator-accordion-enterprise-experience">
                                              <span className="accordion-title">대규모 서비스 경험에서 검증된 노하우</span>
                                              <span className="accordion-icon">+</span>
                                          </div>
                                          <div className="accordion-content">
                                              <p>대기업 플랫폼 서비스의 복잡한 로그 운영을 직접 경험하며, <strong>실전에서 검증된 프로세스와 체계</strong>를 확보했습니다.</p>
                                              <p>단순 솔루션이 아닌, 실제 서비스 현장에서 바로 적용 가능한 운영 최적화 방안을 제공합니다.</p>
                                          </div>
                                      </div>

                                      <div className={`accordion-item ${activeAccordion === 10 ? 'active' : ''}`}>
                                          <div className="accordion-header" onMouseEnter={() => handleAccordionHover(10)} onMouseLeave={handleAccordionLeave} data-clarity-tag="main-differentiator-accordion-development-balance">
                                              <span className="accordion-title">개발과 로그의 균형을 아는 솔루션</span>
                                              <span className="accordion-icon">+</span>
                                          </div>
                                          <div className="accordion-content">
                                                  <p>개발 조직은 항상 ‘기능 우선 vs 로그 품질’ 사이에서 갈등합니다.</p>
                                                  <p>Logbase는 <strong>개발부서의 언어와 데이터부서의 요구를 동시에 충족시키기 위한 솔루션</strong>으로, 이 균형을 맞추는 방법을 명확하게 제공합니다.</p>
                                                  <p>결과적으로 기능 개발과 로그 개발이 <strong>서로 발목을 잡지 않고 함께 조화롭게 최적화</strong>됩니다.</p>
                                          </div>
                                      </div>

                                      <div className={`accordion-item ${activeAccordion === 11 ? 'active' : ''}`}>
                                          <div className="accordion-header" onMouseEnter={() => handleAccordionHover(11)} onMouseLeave={handleAccordionLeave} data-clarity-tag="main-differentiator-accordion-culture-change">
                                              <span className="accordion-title">단순 자동화가 아닌, 운영 문화의 변화</span>
                                              <span className="accordion-icon">+</span>
                                          </div>
                                          <div className="accordion-content">
                                              <p>ILOG는 로그 자동화를 넘어, <strong>조직의 데이터 관점과 운영 문화 자체를 변화</strong>시킵니다.</p>
                                              <p>시스템 기반 운영, 역할과 책임(R&R) 정립, 검증과 모니터링 체계까지 포함한 엔드투엔드 접근 방식을 제공합니다.</p>
                                              <p>이를 통해 로그는 더 이상 번거로운 과제가 아니라, <strong>지속 가능한 경쟁력의 기반</strong>이 됩니다.</p>
                                          </div>
                                      </div>

                                  </div>
                              </div>
                          </div>
                      </div>

                  </div>

              </div>
          </div>
      </div>
      {/* Differentiator end */}


      {/* Our mission image start */}
      <div className="anchor-section" id="ourMission">
          <div className="block">
              <div className="inner">
                  <div className="c-heading text-center">
                      <div className="c-heading__top">
                          <h2 className="text-default">Our mission</h2>
                      </div>

                      <div className="c-heading__bottom">
                          <div className="c-heading__long-desc">
                          <h3 className="heading-7">Logbase는 모든 기업이 행동데이터(로그)를 생성부터 활용까지 손쉽게 운영할 수 있도록 돕습니다.</h3>
                          <p className="feature-description-text">솔루션 제공에 그치지 않고, <strong>로그 문제를 진단하고 최적화하는 컨설팅</strong>을 통해 단기간에 실행 가능한 개선안을 제시합니다.</p>
                          <p className="feature-description-text">기업이 주어진 상황, 즉 로그의 유실문제 해결, 검증도구만 도입하기, 인프라/SaaS 도입없이 로그 프로세스만 정립하기 등 고객에게 필요한 상황에 맞추어 해결방안을 제시해드립니다. </p>
                          <p className="feature-description-text">빠르지 않더라도 천천히 저희와 함께 걷는것 만으로 원하는 데이터를 전략적으로 손쉽게 얻을 수 있습니다.</p>
                          <br /> <br /> <br /> <br />
                          </div>
                      </div>
                  </div>

                  <div className="grid-features">

                      <div className="box-feature box-feature--s2-low is-double" style={{ backgroundColor: '#000a17' }}>
                          <div className="box-feature__info">
                              <h3 className="heading-5 box-feature__title" style={{ color: 'white' }}>지금 시작하세요. 당신의 행동데이터 전문성을 함께 올릴 기회입니다.</h3>
                              <p><a onClick={() => setShowNewsletter(true)} className="button button--large--outline--white--rounded" data-clarity-tag="mission-newsletter-signup-button">뉴스레터 신청</a>
                              &nbsp;&nbsp;&nbsp;<a onClick={() => setShowInquiry(true)} className="button button--large--outline--white--rounded" data-clarity-tag="mission-inquiry-button">문의하기</a></p>
                          </div>
                          <div className="box-feature__photo">
                              <img src="/images/bg-ai.png" alt="" />
                          </div>
                      </div>

                  </div>

              </div>
          </div>
      </div>
      {/* Our mission image end */}

      {/* About Us image start */}
      <div className="anchor-section" id="aboutUs">
          <div className="block">
              <div className="inner">
                  <div className="c-heading text-center">
                      <div className="c-heading__top">
                          <h2 className="text-default">About Us</h2>
                      </div>

                      <div className="c-heading__middle">
                          <h3 className="heading-1"></h3>
                      </div>
                      {/*
              <div className="c-heading__bottom">
                  <div className="c-heading__long-desc">
                  {/*<h3 className="heading-7">로그베이스의 행동데이터는 ILOG 솔루션으로 기업의 변화를 시작합니다.</h3>
                  <p>로그베이스는 모든 기업이 행동데이터(로그)를 생성부터 활용까지의 단계를 손쉽게 운영하는데 도움을 제공합니다.<br />
                  이를 위해 솔루션의 제공뿐만 아니라 로그문제를 해결하는 컨설팅을 통해 로그 최적화를 단기간에 수립할 수 있습니다. </p>
                  <p>행동데이터는 아직 음지에서 양지로 나오지 않은 영역인데요.<br />
                  음지에서 어렵게 일하지 마시고, 저희와 함께 문제를 인식하고 명확하게 정의해서 해결 방안을 찾으시기 바랍니다. 그 길을 저희가 함께 하겠습니다.</p>
                  </div>
              </div>
              */}
                  </div>
                  <div className="grid-features" style={{ display: 'flex', justifyContent: 'center' }}>
                      {/* 기존 세로 타임라인 (주석처리) */}
                      {/* <div className="company-timeline">
                  <div className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                          <div className="timeline-year">~2019</div>
                          <div className="timeline-title">11번가 로그TF</div>
                          <div className="timeline-description">행동데이터 분석 및 로그 시스템 구축</div>
                      </div>
                  </div>
                  
                  <div className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                          <div className="timeline-year">~2022</div>
                          <div className="timeline-title">SK브로드밴드 행동데이터 파트리더</div>
                          <div className="timeline-description">행동데이터 팀 리더십 및 전략 수립</div>
                      </div>
                  </div>
                  
                  <div className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                          <div className="timeline-year">~2024</div>
                          <div className="timeline-title">(주) 위대한 상상(요기요) 로그팀 리더</div>
                          <div className="timeline-description">요기요 플랫폼 로그 시스템 운영 및 분석</div>
                      </div>
                  </div>
                  
                  <div className="timeline-item">
                      <div className="timeline-dot active"></div>
                      <div className="timeline-content">
                          <div className="timeline-year">2024~</div>
                          <div className="timeline-title">(주)로그베이스 법인 설립</div>
                          <div className="timeline-description">행동데이터 전문 법인 운영 중</div>
                      </div>
                  </div>
                  
                  <div className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                          <div className="timeline-year">2025년 상반기</div>
                          <div className="timeline-title">GS리테일 컨설팅</div>
                          <div className="timeline-description">행동데이터 분석 및 시스템 구축 컨설팅</div>
                      </div>
                  </div>
              </div> */}

                      {/* 새로운 가로 타임라인 */}
                      <div className="company-timeline-horizontal">
                          <div className="timeline-row">
                              <div className="timeline-card">
                                  <div className="timeline-year">~2019년</div>
                                  <div className="timeline-title">11번가 로그TF</div>
                                  <div className="timeline-description">행동데이터 분석 및 로그 시스템 구축</div>
                              </div>

                              <div className="timeline-card">
                                  <div className="timeline-year">~2022년</div>
                                  <div className="timeline-title">SK브로드밴드 행동데이터 파트리더</div>
                                  <div className="timeline-description">행동데이터 팀 리더십 및 전략 수립</div>
                              </div>

                              <div className="timeline-card">
                                  <div className="timeline-year">~2024년</div>
                                  <div className="timeline-title">(주) 위대한 상상(요기요) 로그팀 리더</div>
                                  <div className="timeline-description">요기요 플랫폼 로그 시스템 운영 및 분석</div>
                              </div>

                              <div className="timeline-card">
                                  <div className="timeline-year">2024년~</div>
                                  <div className="timeline-title">(주)로그베이스 법인 설립</div>
                                  <div className="timeline-description">행동데이터 전문 법인 운영 중</div>
                              </div>

                              <div className="timeline-card">
                                  <div className="timeline-year">2025년~</div>
                                  <div className="timeline-title">GS리테일 컨설팅</div>
                                  <div className="timeline-description">행동데이터 프로세스 수립/실행</div>
                                  <div className="timeline-description">플랫폼BU의 AWS lake 사전컨설팅</div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      {/* About Us image end */}


      {/* 메뉴 블럭 start */}
      <div className="menu-float js-menufloat-show is-visible">
          <div className="inner">
              <div className="menu-float__inner">

                  <div className="menu-float__wrapper">
                      {/* 메뉴 블럭 start logo */}
                      <div className="menu-float__bottom">
                          <div className="menu-float__layout menu-float__layout--secondary">
                              <div className="menu-float__content">
                                  <div className="menu-float__progress">
                                      <div className="menu-float__bar js-menu-progress"></div>
                                  </div>
                                  <ul className="menu-float__nav">
                                      <li><a className="menu-float__item js-menu-anchor" href="#features" data-clarity-tag="main-navigation-features">Features</a></li>
                                      <li><a className="menu-float__item js-menu-anchor" href="#background" data-clarity-tag="main-navigation-background">Background</a></li>
                                      <li><a className="menu-float__item js-menu-anchor" href="#differentiator" data-clarity-tag="main-navigation-differentiator">Differentiator</a></li>
                                      <li><a className="menu-float__item js-menu-anchor" href="#ourMission" data-clarity-tag="main-navigation-our-mission">Our Mission</a></li>
                                      <li><a className="menu-float__item js-menu-anchor" href="#aboutUs" data-clarity-tag="main-navigation-about-us">About Us</a></li>
                                  </ul>
                              </div>
                          </div>
                      </div>
                      {/* 메뉴 블럭 end logo */}
                  </div>

              </div>
          </div>
      </div>
      {/* 메뉴 블럭 end */}

    </section>

    {/* 문의하기 모달 */}
    <InquiryForm
      show={showInquiry}
      onClose={() => setShowInquiry(false)}
    />

    {/* 뉴스레터 신청 모달 */}
    <NewsletterModal
      show={showNewsletter}
      onClose={() => setShowNewsletter(false)}
    />

    </>
  );
} 