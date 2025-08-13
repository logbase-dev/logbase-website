const config = require('./config');

async function compareUrls() {
  console.log('=== URL 비교 ===\n');
  
  try {
    // .env에서 가져온 URL들
    const envInquiry = process.env.SLACK_WEBHOOK_INQUIRY;
    const envNewsletter = process.env.SLACK_WEBHOOK_NEWSLETTER;
    const envMonitoring = process.env.SLACK_WEBHOOK_MONITORING;
    
    // Secret Manager에서 가져온 URL들
    const secretInquiry = await config.getSlackWebhookUrl('inquiry');
    const secretNewsletter = await config.getSlackWebhookUrl('newsletter');
    const secretMonitoring = await config.getSlackWebhookUrl('monitoring');
    
    console.log('🔍 INQUIRY:');
    console.log('  .env:', envInquiry);
    console.log('  Secret Manager:', secretInquiry);
    console.log('  일치:', envInquiry === secretInquiry ? '✅' : '❌');
    console.log('');
    
    console.log('📧 NEWSLETTER:');
    console.log('  .env:', envNewsletter);
    console.log('  Secret Manager:', secretNewsletter);
    console.log('  일치:', envNewsletter === secretNewsletter ? '✅' : '❌');
    console.log('');
    
    console.log('📊 MONITORING:');
    console.log('  .env:', envMonitoring);
    console.log('  Secret Manager:', secretMonitoring);
    console.log('  일치:', envMonitoring === secretMonitoring ? '✅' : '❌');
    console.log('');
    
    // 전체 일치 여부
    const allMatch = envInquiry === secretInquiry && 
                    envNewsletter === secretNewsletter && 
                    envMonitoring === secretMonitoring;
    
    console.log('🎯 전체 일치:', allMatch ? '✅ 모든 URL이 일치합니다!' : '❌ 일부 URL이 다릅니다.');
    
  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
  }
}

compareUrls(); 