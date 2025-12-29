import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';
import { adminDb, adminBucket } from '@/lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({
        success: false, 
        message: '파일명이 필요합니다.'
      });
    }

    const newslettersJsonPath = path.resolve(process.cwd(), 'public/newsletters/newsletters.json');
    const htmlFilePath = path.resolve(process.cwd(), `public/newsletters/${filename}.html`);

    // HTML 파일 존재 여부 확인
    let htmlExists = false;
    try {
      await fs.access(htmlFilePath);
      htmlExists = true;
    } catch {
      htmlExists = false;
    }

    // newsletters.json에서 해당 항목 존재 여부 확인
    let newslettersArr = [];
    let itemExistsInJson = false;
    
    // Firebase Functions 환경인지 확인
    const isFirebaseFunctions = process.env.FIREBASE_CONFIG || process.env.FUNCTION_TARGET;

    if (isFirebaseFunctions) {
      // Firebase 서버에서는 Cloud Storage에서 뉴스레터 목록 가져오기
      console.log('[NEWSLETTER-DELETE] Firebase Functions 환경에서 Cloud Storage 사용');
      
      try {
        // Cloud Storage에서 newsletters.json 파일 읽기
        const file = adminBucket.file('newsletters/newsletters.json');
        const [exists] = await file.exists();
        
        if (exists) {
          const [content] = await file.download();
          const jsonContent = content.toString('utf-8');
          newslettersArr = JSON.parse(jsonContent);
          if (!Array.isArray(newslettersArr)) newslettersArr = [];
          itemExistsInJson = newslettersArr.some((item: any) => item.filename === filename);
          console.log(`[NEWSLETTER-DELETE] Cloud Storage에서 ${newslettersArr.length}개 뉴스레터 로드`);
        } else {
          console.log('[NEWSLETTER-DELETE] Cloud Storage에 newsletters.json 파일이 없습니다.');
          newslettersArr = [];
          itemExistsInJson = false;
        }
      } catch (error) {
        console.error('[NEWSLETTER-DELETE] Cloud Storage 읽기 실패:', error);
        newslettersArr = [];
        itemExistsInJson = false;
      }
    } else {
      // 로컬 환경에서는 로컬 파일 사용
      console.log('[NEWSLETTER-DELETE] 로컬 환경에서 로컬 파일 사용');
      try {
        const jsonContent = await fs.readFile(newslettersJsonPath, 'utf-8');
        newslettersArr = JSON.parse(jsonContent);
        if (!Array.isArray(newslettersArr)) newslettersArr = [];
        itemExistsInJson = newslettersArr.some((item: any) => item.filename === filename);
        console.log(`[NEWSLETTER-DELETE] 로컬 파일에서 ${newslettersArr.length}개 뉴스레터 로드`);
      } catch {
        newslettersArr = [];
        itemExistsInJson = false;
      }
    }

    const deletedItems = [];
    const errors = [];

    try {
      // 1. HTML 파일이 있으면 삭제
      if (htmlExists) {
        await fs.unlink(htmlFilePath);
        console.log(`[DELETE] HTML 파일 삭제됨: ${htmlFilePath}`);
        deletedItems.push('HTML 파일');
      }

      // 2. JSON에 항목이 있으면 삭제
      if (itemExistsInJson) {
        const filteredArr = newslettersArr.filter((item: any) => item.filename !== filename);
        
        // Firebase Functions 환경인지 확인
        const isFirebaseFunctions = process.env.FIREBASE_CONFIG || process.env.FUNCTION_TARGET;

        if (isFirebaseFunctions) {
          // Firebase 서버에서는 Cloud Storage에 저장
          console.log('[NEWSLETTER-DELETE] Firebase Functions 환경에서 Cloud Storage 사용');
          try {            const jsonFile = adminBucket.file('newsletters/newsletters.json');
            await jsonFile.save(JSON.stringify(filteredArr, null, 2), {
              metadata: { contentType: 'application/json' }
            });
            console.log('[NEWSLETTER-DELETE] Cloud Storage newsletters.json 업데이트 완료');
          } catch (storageError) {
            console.error('[NEWSLETTER-DELETE] Cloud Storage 업데이트 실패:', storageError);
            errors.push('Cloud Storage JSON 업데이트 실패');
          }
        } else {
          // 로컬 환경에서는 로컬 파일 사용
          console.log('[NEWSLETTER-DELETE] 로컬 환경에서 로컬 파일 사용');
          await fs.writeFile(newslettersJsonPath, JSON.stringify(filteredArr, null, 2), 'utf-8');
          console.log('[NEWSLETTER-DELETE] 로컬 newsletters.json 업데이트 완료');
        }
        
        deletedItems.push('목록 항목');
      }

      // 3. Cloud Storage에서도 삭제 시도 (있는 경우)
      const storagePath = `newsletters/${filename}.html`;
      const file = adminBucket.file(storagePath);
      
      try {
        const [exists] = await file.exists();
        if (exists) {
          await file.delete();
          console.log(`[DELETE] Cloud Storage 파일 삭제됨: ${storagePath}`);
          deletedItems.push('Cloud Storage 파일');
        }
      } catch (storageError) {
        console.error('[DELETE] Cloud Storage 파일 삭제 실패:', storageError);
        errors.push('Cloud Storage 파일 삭제 실패');
      }

      // 삭제 결과 메시지 생성
      let message: string;
      if (deletedItems.length > 0) {
        message = `'${filename}' 뉴스레터 삭제 완료 (${deletedItems.join(', ')})`;
      } else {
        message = `'${filename}' 뉴스레터가 이미 존재하지 않습니다.`;
      }
      
      if (errors.length > 0) {
        message += ` - 경고: ${errors.join(', ')}`;
      }

      return res.status(200).json({
        success: true,
        message: message,
        details: {
          htmlDeleted: deletedItems.includes('HTML 파일'),
          jsonDeleted: deletedItems.includes('목록 항목'),
          storageDeleted: deletedItems.includes('Cloud Storage 파일'),
          errors: errors
        }
      });

    } catch (error) {
      console.error('[DELETE] 삭제 중 오류:', error);
      return res.status(500).json({
        success: false, 
        message: '뉴스레터 삭제 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }

  } catch (error) {
    console.error('뉴스레터 삭제 중 오류:', error);
    return res.status(500).json({
      success: false, 
      message: '뉴스레터 삭제에 실패했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
} 