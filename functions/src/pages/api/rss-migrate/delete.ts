import { NextApiRequest, NextApiResponse } from 'next';
// import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
// import { db } from '@/lib/firebase';
import { adminDb, adminBucket } from '@/lib/firebase-admin';
import { RSSItem } from '@/types/rss';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔍 Delete API 호출됨:', { method: req.method, body: req.body });
  
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { guid } = req.body;
    console.log('📝 받은 GUID:', guid, typeof guid);

    if (!guid || typeof guid !== 'string') {
      console.log('❌ GUID가 없거나 잘못된 형식:', guid);
      return res.status(400).json({
        success: false,
        message: 'GUID는 필수 항목이며 문자열이어야 합니다.'
      });
    }

    // GUID 정제: 빈 문자열이나 공백만 있는 경우 체크
    const trimmedGuid = guid.trim();
    if (!trimmedGuid) {
      console.log('❌ GUID가 빈 문자열입니다.');
      return res.status(400).json({
        success: false,
        message: 'GUID는 빈 문자열일 수 없습니다.'
      });
    }

    // GUID 유효성 검사는 생략 (URL과 Firestore ID 모두 허용)
    // Base64 인코딩을 통해 Firestore 호환 문서 ID 생성

    console.log(`🗑️ RSS 아이템 삭제 요청 시작: ${trimmedGuid}`);

    // 1. RSS에서 가져온 글을 위해 guid를 인코딩하여 시도
    const encodedGuid = Buffer.from(trimmedGuid).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    console.log(`🔍 인코딩된 GUID: ${encodedGuid}`);
    
    let docRef = adminDb.collection('rss_items').doc(encodedGuid);
    let doc = await docRef.get();

    // 2. 인코딩된 guid로 문서를 찾지 못한 경우, 원본 guid로 다시 시도 (수동 작성 글) - URL 형태가 아닌 경우에만
    if (!doc.exists && !trimmedGuid.includes('/')) {
      console.log(`- 인코딩된 GUID(${encodedGuid})로 문서를 찾지 못했습니다. 원본 GUID로 재시도합니다.`);
      docRef = adminDb.collection('rss_items').doc(trimmedGuid);
      doc = await docRef.get();
    } else if (!doc.exists) {
      console.log(`- 인코딩된 GUID(${encodedGuid})로 문서를 찾지 못했습니다. URL 형태 GUID는 직접 doc() 호출을 건너뜁니다.`);
    }

    if (!doc.exists) {
      console.log(`- 원본 GUID(${trimmedGuid})로도 문서를 찾을 수 없습니다.`);
      
      // 3. 모든 문서를 조회하여 guid 필드로 검색 (마지막 시도)
      console.log('- 전체 문서 조회로 guid 필드 검색 시도...');
      const snapshot = await adminDb.collection('rss_items')
        .where('guid', '==', trimmedGuid)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        console.log(`❌ guid 필드로도 문서를 찾을 수 없습니다: ${trimmedGuid}`);
        return res.status(404).json({
          success: false,
          message: '해당 RSS 아이템을 찾을 수 없습니다.'
        });
      }
      
      // guid 필드로 찾은 문서 삭제
      const foundDoc = snapshot.docs[0];
      console.log(`✅ guid 필드로 문서 발견: ${foundDoc.id}`);
      
      // Storage 이미지 삭제 로직 추가 (자체 작성 글에만 적용)
      const data = foundDoc.data() as RSSItem;
      const content = data.content || '';
      
      // 자체 작성 글인지 확인 (blogName이 'Logbase'인 경우)
      const isSelfWritten = data.blogName === 'Logbase';
      
      if (content && isSelfWritten) {
        const bucket = adminBucket;
        
        // 이미지 URL 패턴들 추출
        const imageUrlPatterns = [
          // Storage Emulator URL
          /!\[.*?\]\((http:\/\/127\.0\.0\.1:9199\/v0\/b\/[^)]+blog-images[^)]+)\)/g,
          // 기존 프로덕션 URL (storage.googleapis.com)
          /!\[.*?\]\((https:\/\/storage\.googleapis\.com\/[^)]+blog-images[^)]+)\)/g,
          // 새로운 Firebase Storage URL (firebasestorage.googleapis.com)
          /!\[.*?\]\((https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^)]+blog-images[^)]+)\)/g,
        ];
        
        const imageUrls: string[] = [];
        
        // 각 패턴으로 이미지 URL 추출
        imageUrlPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            matches.forEach(match => {
              const urlMatch = match.match(/!\[.*?\]\(([^)]+)\)/);
              if (urlMatch) {
                imageUrls.push(urlMatch[1]);
              }
            });
          }
        });
        
        // Storage에서 이미지 파일들 삭제
        for (const imageUrl of imageUrls) {
          try {
            let filePath = '';
            
            // URL에서 파일 경로 추출
            if (imageUrl.includes('blog-images%2F')) {
              // 새로운 Firebase Storage URL 형식: firebasestorage.googleapis.com/v0/b/bucket/o/blog-images%2Ffile?alt=media
              const urlParts = imageUrl.split('blog-images%2F');
              if (urlParts.length > 1) {
                const encodedFilePath = urlParts[1].split('?')[0];
                filePath = `blog-images/${decodeURIComponent(encodedFilePath)}`;
              }
            } else if (imageUrl.includes('blog-images/')) {
              // 기존 URL 형식: storage.googleapis.com/bucket/blog-images/file
              const urlParts = imageUrl.split('blog-images/');
              if (urlParts.length > 1) {
                const encodedFilePath = urlParts[1].split('?')[0];
                filePath = `blog-images/${encodedFilePath}`;
              }
            }
            
            if (filePath) {
              const file = bucket.file(filePath);
              const [exists] = await file.exists();
              
              if (exists) {
                await file.delete();
                console.log('✅ Storage 이미지 삭제 완료:', filePath);
              } else {
                console.log('⚠️ Storage 파일이 존재하지 않음:', filePath);
              }
            }
          } catch (error) {
            console.error('❌ Storage 이미지 삭제 실패:', imageUrl, error);
          }
        }
        
        console.log(`📝 삭제할 이미지 URL 개수: ${imageUrls.length}`);
      } else if (!isSelfWritten) {
        console.log('📝 자동 수집 글 - Storage 이미지 삭제 건너뛰기');
      }
      
      await foundDoc.ref.delete();
      console.log(`✅ RSS 아이템 삭제 완료: ${foundDoc.id}`);
      
      return res.status(200).json({
        success: true,
        message: 'RSS 아이템과 관련 이미지가 삭제되었습니다.'
      });
    }

    // Storage 이미지 삭제 로직 추가 (자체 작성 글에만 적용)
    const data = doc.data() as RSSItem;
    const content = data.content || '';
    
    // 자체 작성 글인지 확인 (blogName이 'Logbase'인 경우)
    const isSelfWritten = data.blogName === 'Logbase';
    
    if (content && isSelfWritten) {
      const bucket = adminBucket;
      
      // 이미지 URL 패턴들 추출
      const imageUrlPatterns = [
        // Storage Emulator URL
        /!\[.*?\]\((http:\/\/127\.0\.0\.1:9199\/v0\/b\/[^)]+blog-images[^)]+)\)/g,
        // 기존 프로덕션 URL (storage.googleapis.com)
        /!\[.*?\]\((https:\/\/storage\.googleapis\.com\/[^)]+blog-images[^)]+)\)/g,
        // 새로운 Firebase Storage URL (firebasestorage.googleapis.com)
        /!\[.*?\]\((https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^)]+blog-images[^)]+)\)/g,
      ];
      
      const imageUrls: string[] = [];
      
      // 각 패턴으로 이미지 URL 추출
      imageUrlPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          matches.forEach(match => {
            const urlMatch = match.match(/!\[.*?\]\(([^)]+)\)/);
            if (urlMatch) {
              imageUrls.push(urlMatch[1]);
            }
          });
        }
      });
      
      // Storage에서 이미지 파일들 삭제
      for (const imageUrl of imageUrls) {
        try {
          let filePath = '';
          
          // URL에서 파일 경로 추출
          if (imageUrl.includes('blog-images%2F')) {
            // 새로운 Firebase Storage URL 형식: firebasestorage.googleapis.com/v0/b/bucket/o/blog-images%2Ffile?alt=media
            const urlParts = imageUrl.split('blog-images%2F');
            if (urlParts.length > 1) {
              const encodedFilePath = urlParts[1].split('?')[0];
              filePath = `blog-images/${decodeURIComponent(encodedFilePath)}`;
            }
          } else if (imageUrl.includes('blog-images/')) {
            // 기존 URL 형식: storage.googleapis.com/bucket/blog-images/file
            const urlParts = imageUrl.split('blog-images/');
            if (urlParts.length > 1) {
              const encodedFilePath = urlParts[1].split('?')[0];
              filePath = `blog-images/${encodedFilePath}`;
            }
          }
          
          if (filePath) {
            const file = bucket.file(filePath);
            const [exists] = await file.exists();
            
            if (exists) {
              await file.delete();
              console.log('✅ Storage 이미지 삭제 완료:', filePath);
            } else {
              console.log('⚠️ Storage 파일이 존재하지 않음:', filePath);
            }
          }
        } catch (error) {
          console.error('❌ Storage 이미지 삭제 실패:', imageUrl, error);
        }
      }
      
      console.log(`📝 삭제할 이미지 URL 개수: ${imageUrls.length}`);
    } else if (!isSelfWritten) {
      console.log('📝 자동 수집 글 - Storage 이미지 삭제 건너뛰기');
    }

    await docRef.delete();

    console.log(`✅ RSS 아이템 삭제 완료: ${docRef.id}`);

    return res.status(200).json({
      success: true,
      message: 'RSS 아이템과 관련 이미지가 삭제되었습니다.'
    });

  } catch (error) {
    console.error('❌ RSS 아이템 삭제 오류:', error);
    console.error('❌ 오류 스택:', error instanceof Error ? error.stack : error);
    return res.status(500).json({
      success: false,
      message: 'RSS 아이템 삭제 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
} 