// 프로덕션 환경 시뮬레이션
process.env.NODE_ENV = 'production';

const config = require('./config');

async function testProductionAccess() {
  console.log('=== 프로덕션 환경 Secret Manager 접근 테스트 ===\n');
  
  try {
    // 환경 정보 출력
    config.logEnvironment();
    console.log('');
    
    // 각 Secret 접근 테스트
    const types = ['inquiry', 'newsletter', 'monitoring'];
    
    for (const type of types) {
      try {
        const url = await config.getSlackWebhookUrl(type);
        console.log(`✅ ${type.toUpperCase()}: ${url ? '성공' : '실패'}`);
        if (url) {
          console.log(`   URL: ${url.substring(0, 50)}...`);
        }
      } catch (error) {
        console.log(`❌ ${type.toUpperCase()}: ${error.message}`);
      }
      console.log('');
    }
    
    console.log('🎯 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 전체 테스트 실패:', error.message);
  }
}

testProductionAccess(); 