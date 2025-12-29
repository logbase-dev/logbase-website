import { NextApiRequest, NextApiResponse } from 'next';
import { adminBucket } from '@/lib/firebase-admin';

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

    console.log(`[PREVIEW] 미리보기 요청 시작: ${filename}`);
    console.log(`[PREVIEW] Admin Bucket 확인:`, adminBucket ? '초기화됨' : '초기화 안됨');

    // Cloud Storage에서 파일 가져오기
    const storagePath = `newsletters/${filename}.html`;
    const file = adminBucket.file(storagePath);
    
    console.log(`[PREVIEW] Cloud Storage에서 파일 요청: ${storagePath}`);

    try {
      // 파일 존재 여부 확인
      console.log(`[PREVIEW] 파일 존재 여부 확인 중...`);
      const [exists] = await file.exists();
      
      console.log(`[PREVIEW] 파일 존재 여부: ${exists}`);
      
      if (!exists) {
        console.log(`[PREVIEW] 파일이 존재하지 않음: ${storagePath}`);
        return res.status(404).json({
          success: false,
          message: '뉴스레터 파일을 찾을 수 없습니다.',
          path: storagePath
        });
      }

      // 파일 내용 다운로드
      console.log(`[PREVIEW] 파일 다운로드 시작...`);
      const [content] = await file.download();
      console.log(`[PREVIEW] 파일 다운로드 성공: ${content.length} bytes`);

      // HTML 응답으로 전송
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.send(content);

    } catch (downloadError) {
      console.error('[PREVIEW] 파일 다운로드 실패:', downloadError);
      console.error('[PREVIEW] 에러 상세:', {
        message: downloadError instanceof Error ? downloadError.message : 'Unknown error',
        stack: downloadError instanceof Error ? downloadError.stack : undefined,
        storagePath
      });
      return res.status(500).json({
        success: false,
        message: '뉴스레터 파일을 불러올 수 없습니다.',
        error: downloadError instanceof Error ? downloadError.message : '알 수 없는 오류'
      });
    }

  } catch (error) {
    console.error('[PREVIEW] API 오류:', error);
    return res.status(500).json({
      success: false, 
      message: '뉴스레터 미리보기에 실패했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
} 