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

/**
 * 환경에 따라 Firebase Storage 또는 로컬 파일 시스템에서 뉴스레터 목록을 로드합니다.
 * @returns {Promise<NewsletterMeta[]>} 뉴스레터 메타데이터 배열
 */
async function loadNewsletters(): Promise<NewsletterMeta[]> {
  let jsonContent: string;
  const isFirebaseFunctions = process.env.FIREBASE_CONFIG || process.env.FUNCTION_TARGET;

  if (isFirebaseFunctions) {
    // Firebase 서버에서는 Cloud Storage에서 뉴스레터 목록 가져오기
    console.log('[NEWSLETTER-GET] Firebase Functions 환경에서 Cloud Storage 사용');
    const file = adminBucket.file('newsletters/newsletters.json');
    const [exists] = await file.exists();
    
    if (!exists) {
      console.log('[NEWSLETTER-GET] Cloud Storage에 newsletters.json 파일이 없습니다.');
      throw new Error('Newsletter list not found');
    }
    
    const [content] = await file.download();
    jsonContent = content.toString('utf-8');
    console.log(`[NEWSLETTER-GET] Cloud Storage에서 뉴스레터 로드 완료`);

  } else {
    // 로컬 환경에서는 로컬 파일 사용
    console.log('[NEWSLETTER-GET] 로컬 환경에서 로컬 파일 사용');
    const newslettersDir = path.resolve(process.cwd(), 'public/newsletters');
    const newslettersJsonPath = path.join(newslettersDir, 'newsletters.json');
    
    jsonContent = await fs.readFile(newslettersJsonPath, 'utf-8');
    console.log(`[NEWSLETTER-GET] 로컬 파일에서 뉴스레터 로드 완료`);
  }

  const newsletters = JSON.parse(jsonContent);
  if (!Array.isArray(newsletters)) {
    return [];
  }
  return newsletters;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { filename } = req.query;

    if (!filename || typeof filename !== 'string') {
      return res.status(400).json({
        success: false, 
        message: '파일명이 필요합니다.'
      });
    }

    const newsletters = await loadNewsletters();
    console.log(`[NEWSLETTER-GET] 총 ${newsletters.length}개의 뉴스레터 로드됨`);

    // 해당 filename의 뉴스레터 찾기
    const newsletter = newsletters.find((item: NewsletterMeta) => item.filename === filename);

    if (!newsletter) {
      console.log(`[NEWSLETTER-GET] 뉴스레터를 찾을 수 없음: ${filename}`);
      return res.status(404).json({
        success: false, 
        message: '뉴스레터를 찾을 수 없습니다.'
      });
    }

    console.log(`[NEWSLETTER-GET] 뉴스레터 찾음: ${filename}`);
    return res.status(200).json({
      success: true,
      newsletter: newsletter
    });

  } catch (error) {
    console.error('[NEWSLETTER-GET] 뉴스레터 조회 중 오류:', error);
    // loadNewsletters에서 던진 '파일 없음' 에러 처리
    if (error instanceof Error && error.message === 'Newsletter list not found') {
      return res.status(404).json({
        success: false, message: '뉴스레터 목록을 찾을 수 없습니다.'
      });
    }
    return res.status(500).json({
      success: false, 
      message: '뉴스레터 조회에 실패했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
} 