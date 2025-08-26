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
    const { filename } = req.query;

    if (!filename || typeof filename !== 'string') {
      return res.status(400).json({
        success: false, 
        message: '파일명이 필요합니다.'
      });
    }

    let newslettersArr = [];

    // Firebase Functions 환경인지 확인
    const isFirebaseFunctions = process.env.FIREBASE_CONFIG || process.env.FUNCTION_TARGET;

    if (isFirebaseFunctions) {
      // Firebase 서버에서는 Cloud Storage에서 뉴스레터 목록 가져오기
      console.log('[NEWSLETTER-GET] Firebase Functions 환경에서 Cloud Storage 사용');
      
      try {
        // Cloud Storage에서 newsletters.json 파일 읽기
        const file = adminBucket.file('newsletters/newsletters.json');
        const [exists] = await file.exists();
        
        if (exists) {
          const [content] = await file.download();
          const jsonContent = content.toString('utf-8');
          newslettersArr = JSON.parse(jsonContent);
          if (!Array.isArray(newslettersArr)) newslettersArr = [];
          console.log(`[NEWSLETTER-GET] Cloud Storage에서 ${newslettersArr.length}개 뉴스레터 로드`);
        } else {
          console.log('[NEWSLETTER-GET] Cloud Storage에 newsletters.json 파일이 없습니다.');
          return res.status(404).json({
            success: false, 
            message: '뉴스레터 목록을 찾을 수 없습니다.'
          });
        }
      } catch (error) {
        console.error('[NEWSLETTER-GET] Cloud Storage 읽기 실패:', error);
        return res.status(404).json({
          success: false, 
          message: '뉴스레터 목록을 찾을 수 없습니다.'
        });
      }
    } else {
      // 로컬 환경에서는 로컬 파일 사용
      console.log('[NEWSLETTER-GET] 로컬 환경에서 로컬 파일 사용');
      const newslettersDir = path.resolve(process.cwd(), 'public/newsletters');
      const newslettersJsonPath = path.join(newslettersDir, 'newsletters.json');
      
      try {
        const jsonContent = await fs.readFile(newslettersJsonPath, 'utf-8');
        newslettersArr = JSON.parse(jsonContent);
        if (!Array.isArray(newslettersArr)) newslettersArr = [];
        console.log(`[NEWSLETTER-GET] 로컬 파일에서 ${newslettersArr.length}개 뉴스레터 로드`);
      } catch (error) {
        console.error('[NEWSLETTER-GET] 로컬 파일 읽기 실패:', error);
        return res.status(404).json({
          success: false, 
          message: '뉴스레터 목록을 찾을 수 없습니다.'
        });
      }
    }

    // 해당 filename의 뉴스레터 찾기
    const newsletter = newslettersArr.find((item: NewsletterMeta) => item.filename === filename);

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
    console.error('뉴스레터 조회 중 오류:', error);
    return res.status(500).json({
      success: false, 
      message: '뉴스레터 조회에 실패했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
} 