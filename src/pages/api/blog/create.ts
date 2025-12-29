import { NextApiRequest, NextApiResponse } from 'next';
import { FieldValue } from 'firebase-admin/firestore';
import { RSSItem } from '@/types/rss';
import { adminDb, adminBucket } from '@/lib/firebase-admin';

// 이미지 업로드 함수
async function uploadImageToStorage(imageData: string, fileName: string): Promise<string> {
  try {
    const bucket = adminBucket;
    
    // Base64 데이터에서 실제 이미지 데이터 추출 및 MIME 타입 파싱
    const mimeMatch = imageData.match(/^data:image\/([a-z]+);base64,/);
    const imageType = mimeMatch ? mimeMatch[1] : 'jpeg';
    const normalizedType = imageType === 'jpg' ? 'jpeg' : imageType;
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // 파일 경로 생성
    const filePath = `blog-images/${Date.now()}-${fileName}`;
    const file = bucket.file(filePath);
    
    // 파일 업로드
    await file.save(buffer, {
      metadata: {
        contentType: `image/${normalizedType}`,
        cacheControl: 'public, max-age=31536000',
      },
    });
    
    // 공개 URL 생성 (에뮬레이터/프로덕션 분기)
    let publicUrl: string;
    const emulatorHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST;
    if (emulatorHost) {
      // Storage Emulator URL 형식
      const bucketName = bucket.name || 'logbase-blog-83db6.appspot.com';
      publicUrl = `http://${emulatorHost}/v0/b/${bucketName}/o/${encodeURIComponent(filePath)}?alt=media`;
      } else {
        // 프로덕션 환경에서는 Firebase Storage 공개 URL 형식 사용
        // Storage Rules에서 blog-images/** 경로는 allow read: if true로 설정됨
        const encodedPath = encodeURIComponent(filePath).replace(/%2F/g, '%2F');
        publicUrl = `https://firebasestorage.googleapis.com/v0/b/logbase-blog-83db6.firebasestorage.app/o/${encodedPath}?alt=media`;
        console.log('Firebase Storage 공개 URL 사용 (Rules 기반):', publicUrl);
      }
    
    console.log('이미지 업로드 완료:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('이미지 업로드 실패:', error);
    throw new Error('이미지 업로드에 실패했습니다.');
  }
}

// 마크다운에서 이미지 URL 추출 및 처리
async function processImagesInContent(content: string): Promise<string> {
  try {
    // Base64 이미지 패턴 찾기
    const base64ImageRegex = /!\[.*?\]\(data:image\/[a-z]+;base64,[^)]+\)/g;
    const matches = content.match(base64ImageRegex);
    
    if (!matches) {
      return content; // 이미지가 없으면 원본 반환
    }
    
    let processedContent = content;
    
    for (const match of matches) {
      try {
        // 이미지 정보 추출
        const altTextMatch = match.match(/!\[(.*?)\]/);
        const base64Match = match.match(/data:image\/([a-z]+);base64,([^)]+)/);
        
        if (altTextMatch && base64Match) {
          const altText = altTextMatch[1];
          const imageType = base64Match[1];
          const base64Data = base64Match[2];
          
          // 파일명 생성 (기존 확장자 제거 후 추가)
          const rawAlt = altText || 'image';
          const baseName = rawAlt.replace(/\.[a-zA-Z0-9]+$/, '');
          const normalizedType = imageType === 'jpg' ? 'jpeg' : imageType;
          const fileName = `${baseName}.${normalizedType}`;
          
          // Storage에 업로드
          const publicUrl = await uploadImageToStorage(
            `data:image/${imageType};base64,${base64Data}`,
            fileName
          );
          
          // 마크다운에서 URL 교체
          const newImageMarkdown = `![${altText}](${publicUrl})`;
          processedContent = processedContent.replace(match, newImageMarkdown);
          
          console.log('이미지 처리 완료:', fileName, '->', publicUrl);
        }
      } catch (error) {
        console.error('개별 이미지 처리 실패:', error);
        // 개별 이미지 실패 시 Base64 데이터 제거하고 대체 텍스트로 교체
        const fileName = match.match(/!\[([^\]]*)\]/)?.[1] || '이미지';
        processedContent = processedContent.replace(match, `![이미지 업로드 실패: ${fileName}]`);
      }
    }
    
    return processedContent;
  } catch (error) {
    console.error('이미지 처리 중 오류:', error);
    return content; // 오류 시 원본 반환
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const blogItem: RSSItem = req.body;

    // 필수 필드 검증
    if (!blogItem.title || !blogItem.description || !blogItem.content) {
      return res.status(400).json({ error: '제목, 설명, 내용은 필수 항목입니다.' });
    }

    console.log('📝 블로그 글 저장 시작:', {
      title: blogItem.title,
      description: blogItem.description.substring(0, 100) + '...',
      contentLength: blogItem.content.length
    });

    // 이미지 처리 (Base64 이미지를 Storage에 업로드)
    let processedContent = blogItem.content;
    if (blogItem.content.includes('data:image/')) {
      console.log('🖼️ 이미지 처리 시작...');
      processedContent = await processImagesInContent(blogItem.content);
      console.log('✅ 이미지 처리 완료');
    }

    // Firestore에 저장
    const collectionRef = adminDb.collection('rss_items');
    const docRef = collectionRef.doc(); // 먼저 문서 참조를 생성하여 ID를 가져옵니다.

    await docRef.set({
      ...blogItem,
      guid: docRef.id, // 생성된 문서 ID를 guid 필드에 저장합니다.
      content: processedContent, // 처리된 내용으로 저장
      createdAt: FieldValue.serverTimestamp(),
      createdBy: 'manual', // 수동 작성 표시
      source: 'blog-write-page' // 작성 경로 표시
    });

    // 기존 add 방식 대신 set을 사용합니다.
    // const docRef = await db.collection('rss_items').add({ ... });

    console.log('✅ 블로그 글 저장 완료:', docRef.id);

    res.status(200).json({
      success: true,
      id: docRef.id,
      message: '블로그 글이 성공적으로 저장되었습니다.',
      imageProcessed: processedContent !== blogItem.content
    });

  } catch (error) {
    console.error('❌ 블로그 글 저장 오류:', error);
    const err = error as unknown as { name?: string; code?: string; message?: string; stack?: string };
    // 보안상 비밀 값은 직접 노출하지 않고 존재 여부만 전달
    const diagnostics = { 
      env: {
        FIREBASE_ADMIN_PROJECT_ID: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
        FIREBASE_ADMIN_PRIVATE_KEY_ID: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
        FIREBASE_ADMIN_PRIVATE_KEY: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
        FIREBASE_ADMIN_CLIENT_EMAIL: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        FIREBASE_ADMIN_CLIENT_ID: !!process.env.FIREBASE_ADMIN_CLIENT_ID,
      },
      errorName: err?.name,
      errorCode: err?.code,
      errorMessage: err?.message,
      errorStack: typeof err?.stack === 'string' ? String(err.stack).split('\n').slice(0, 5) : undefined,
    };

    res.status(500).json({
      error: '블로그 글 저장에 실패했습니다.',
      details: diagnostics
    });
  }
}
