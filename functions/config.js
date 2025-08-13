const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const path = require('path');

// .env 파일 로드 (현재 디렉토리 기준)
require('dotenv').config({ path: path.join(__dirname, '.env') });

// 환경 설정 클래스
class Config {
  constructor() {
    // 로컬 개발 환경 감지 (FUNCTIONS_EMULATOR가 설정되어 있거나 NODE_ENV가 development인 경우)
    this.isProduction = !process.env.FUNCTIONS_EMULATOR && process.env.NODE_ENV === 'production';
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'logbase-blog-83db6';
    this.secretManagerClient = null;
    
    // Secret Manager 클라이언트 초기화 (프로덕션에서만)
    if (this.isProduction) {
      this.secretManagerClient = new SecretManagerServiceClient();
    }
  }

  // Slack Webhook URL 가져오기
  async getSlackWebhookUrl(type = 'monitoring') {
    // 로컬 개발 환경에서는 .env 파일에서 가져오기
    if (!this.isProduction) {
      switch (type) {
        case 'inquiry':
          return process.env.SLACK_WEBHOOK_INQUIRY;
        case 'newsletter':
          return process.env.SLACK_WEBHOOK_NEWSLETTER;
        case 'monitoring':
        default:
          return process.env.SLACK_WEBHOOK_MONITORING;
      }
    }

    // 프로덕션 환경에서는 Secret Manager에서 가져오기
    try {
      const secretName = this.getSecretName(type);
      const name = `projects/${this.projectId}/secrets/${secretName}/versions/latest`;
      
      const [version] = await this.secretManagerClient.accessSecretVersion({ name });
      return version.payload.data.toString();
    } catch (error) {
      console.error(`❌ Secret Manager에서 ${type} webhook URL 가져오기 실패:`, error);
      
      // Secret Manager 실패 시 하드코딩된 URL로 폴백
      return this.getFallbackWebhookUrl(type);
    }
  }

  // Secret 이름 가져오기
  getSecretName(type) {
    switch (type) {
      case 'inquiry':
        return process.env.SECRET_NAME_INQUIRY || 'slack-webhook-inquiry';
      case 'newsletter':
        return process.env.SECRET_NAME_NEWSLETTER || 'slack-webhook-newsletter';
      case 'monitoring':
      default:
        return process.env.SECRET_NAME_MONITORING || 'slack-webhook-monitoring';
    }
  }

  // 폴백용 환경변수 URL (Secret Manager 실패 시)
  getFallbackWebhookUrl(type) {
    switch (type) {
      case 'inquiry':
        return process.env.SLACK_WEBHOOK_INQUIRY || '';
      case 'newsletter':
        return process.env.SLACK_WEBHOOK_NEWSLETTER || '';
      case 'monitoring':
      default:
        return process.env.SLACK_WEBHOOK_MONITORING || '';
    }
  }

  // 환경 정보 출력
  logEnvironment() {
    console.log('🔧 환경 설정 정보:');
    console.log(`• 환경: ${this.isProduction ? '프로덕션' : '로컬 개발'}`);
    console.log(`• 프로젝트 ID: ${this.projectId}`);
    console.log(`• Secret Manager 사용: ${this.isProduction ? '예' : '아니오'}`);
  }
}

module.exports = new Config(); 