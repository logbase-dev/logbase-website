import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';
import { adminBucket } from '@/lib/firebase-admin';

interface NewsletterMeta {
  title: string;
  content: string;
  url: string;
  sentDate: string;
  htmlFilePath: string;
  publicUrl: string;
  filename: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    let newsletters: NewsletterMeta[] = [];

    // Firebase Functions 환경인지 확인
    const isFirebaseFunctions = process.env.FIREBASE_CONFIG || process.env.FUNCTION_TARGET;

    if (isFirebaseFunctions) {
      // Firebase 서버에서는 Cloud Storage에서 뉴스레터 목록 가져오기
      console.log('[NEWSLETTER-LIST] Firebase Functions 환경에서 Cloud Storage 사용');
      
      try {
        // Cloud Storage에서 newsletters.json 파일 읽기
        const file = adminBucket.file('newsletters/newsletters.json');
        const [exists] = await file.exists();
        
        if (exists) {
          const [content] = await file.download();
          const jsonContent = content.toString('utf-8');
          newsletters = JSON.parse(jsonContent);
          if (!Array.isArray(newsletters)) newsletters = [];
          console.log(`[NEWSLETTER-LIST] Cloud Storage에서 ${newsletters.length}개 뉴스레터 로드`);
        } else {
          console.log('[NEWSLETTER-LIST] Cloud Storage에 newsletters.json 파일이 없습니다.');
          newsletters = [];
        }
      } catch (error) {
        console.error('[NEWSLETTER-LIST] Cloud Storage 읽기 실패:', error);
        newsletters = [];
      }
    } else {
      // 로컬 환경에서는 로컬 파일 사용
      console.log('[NEWSLETTER-LIST] 로컬 환경에서 로컬 파일 사용');
      const newslettersJsonPath = path.resolve(process.cwd(), 'public/newsletters/newsletters.json');
      
      try {
        const jsonContent = await fs.readFile(newslettersJsonPath, 'utf-8');
        newsletters = JSON.parse(jsonContent);
        if (!Array.isArray(newsletters)) newsletters = [];
        console.log(`[NEWSLETTER-LIST] 로컬 파일에서 ${newsletters.length}개 뉴스레터 로드`);
      } catch (error) {
        console.error('[NEWSLETTER-LIST] 로컬 파일 읽기 실패:', error);
        newsletters = [];
      }
    }

    // 발송일 기준으로 내림차순 정렬 (최신순)
    newsletters.sort((a, b) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime());

    console.log(`뉴스레터 목록 조회: ${newsletters.length}개`);

    return res.status(200).json({
      success: true,
      newsletters: newsletters
    });

  } catch (error) {
    console.error('뉴스레터 목록을 가져오는 중 오류:', error);
    return res.status(500).json({
      success: false, 
      message: '뉴스레터 목록을 가져오는데 실패했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
} 