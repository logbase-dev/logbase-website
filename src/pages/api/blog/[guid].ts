import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb, adminBucket } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { RSSItem } from '@/types/rss';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { guid } = req.query as { guid: string };

  if (!guid) {
    return res.status(400).json({ success: false, error: 'GUID is required' });
  }

  switch (req.method) {
    // GET 요청: 특정 guid의 글 정보 조회
    case 'GET':
      try {
        const docRef = adminDb.collection('rss_items').doc(guid);
        const docSnapshot = await docRef.get();

        if (!docSnapshot.exists) {
          return res.status(404).json({ success: false, error: 'Article not found' });
        }

        const data = docSnapshot.data() as RSSItem;

        // 이미지 URL 갱신 (Firebase Storage signed URL 재생성)
        let processedContent = data.content || '';
        if (data.content) {
          console.log('🔍 원본 content:', data.content);
          
          // 로컬 환경에서는 원본 content 그대로 사용 (URL 처리 건너뛰기)
          if (process.env.FIREBASE_STORAGE_EMULATOR_HOST) {
            console.log('✅ 로컬 환경 - 원본 content 그대로 사용 (URL 처리 건너뛰기)');
            processedContent = data.content;
          } else {
            // 프로덕션 환경에서만 이미지 URL 처리
            try {
              const bucket = adminBucket;
              const buildPublicUrl = (filePath: string) => {
                // Firebase Storage 공개 URL 형식 사용 - 실제 버킷 이름 확인 필요
                const encodedPath = encodeURIComponent(filePath).replace(/%2F/g, '%2F');
                return `https://firebasestorage.googleapis.com/v0/b/logbase-blog-83db6.firebasestorage.app/o/${encodedPath}?alt=media`;
              };
        
              // 1. Storage Emulator URL을 환경에 맞는 URL로 변환
              const emulatorUrlRegex = /!\[.*?\]\((http:\/\/127\.0\.0\.1:9199\/v0\/b\/[^)]+blog-images[^)]+)\)/g;
              const emulatorUrlMatches = data.content.match(emulatorUrlRegex);
              
              console.log('🔍 Emulator URL 매칭 결과:', emulatorUrlMatches);
              
              if (emulatorUrlMatches) {
                for (const match of emulatorUrlMatches) {
                  const urlMatch = match.match(/!\[(.*?)\]\((http:\/\/127\.0\.0\.1:9199\/v0\/b\/[^)]+blog-images[^)]+)\)/);
                  if (urlMatch) {
                    const altText = urlMatch[1];
                    const oldUrl = urlMatch[2];
                    
                    console.log('🔍 Emulator URL 처리:', { altText, oldUrl });
                    
                    // URL에서 파일 경로 추출 (blog-images%2F 또는 blog-images/ 모두 처리)
                    let filePath = '';
                    if (oldUrl.includes('blog-images%2F')) {
                      const urlParts = oldUrl.split('blog-images%2F');
                      if (urlParts.length > 1) {
                        const encodedFilePath = urlParts[1].split('?')[0];
                        filePath = `blog-images/${decodeURIComponent(encodedFilePath)}`;
                      }
                    } else if (oldUrl.includes('blog-images/')) {
                      const urlParts = oldUrl.split('blog-images/');
                      if (urlParts.length > 1) {
                        const encodedFilePath = urlParts[1].split('?')[0];
                        filePath = `blog-images/${encodedFilePath}`;
                      }
                    }
                    
                    console.log('🔍 추출된 filePath:', filePath);
                    
                    if (filePath) {
                      // 파일 존재 검증 및 한글/공백 파일명 안전 탐색
                      try {
                        const [exists] = await bucket.file(filePath).exists();
                        let resolvedPath = filePath;
                        if (!exists) {
                          const files = await bucket.getFiles({ prefix: 'blog-images/' });
                          const baseName = (filePath.split('/').pop() || '');
                          const decodedBase = decodeURIComponent(baseName);
                          for (const f of files[0]) {
                            const nameOnly = f.name.split('/').pop() || '';
                            if (nameOnly === baseName || nameOnly === decodedBase || nameOnly.endsWith(decodedBase)) {
                              resolvedPath = f.name;
                              break;
                            }
                          }
                        }

                        const publicUrl = buildPublicUrl(resolvedPath);
                        const newImageMarkdown = `![${altText}](${publicUrl})`;
                        processedContent = processedContent?.replace(match, newImageMarkdown) || processedContent;
                        console.log('✅ 이미지 URL 갱신:', resolvedPath, '->', publicUrl);
                      } catch (e) {
                        console.warn('파일 존재 확인 실패, 원본 경로 사용:', filePath, e);
                        const publicUrl = buildPublicUrl(filePath);
                        const newImageMarkdown = `![${altText}](${publicUrl})`;
                        processedContent = processedContent?.replace(match, newImageMarkdown) || processedContent;
                      }
                    }
                  }
                }
              }
              
              // 2. 기존 signed URL 패턴 처리
              const signedUrlRegex = /!\[.*?\]\((https:\/\/[^)]+blog-images\/[^)]+)\)/g;
              const signedUrlMatches = data.content.match(signedUrlRegex);
              
              if (signedUrlMatches) {
                for (const match of signedUrlMatches) {
                  const urlMatch = match.match(/!\[(.*?)\]\((https:\/\/[^)]+blog-images\/[^)]+)\)/);
                  if (urlMatch) {
                    const altText = urlMatch[1];
                    const oldUrl = urlMatch[2];
                    
                    // URL에서 파일 경로 추출
                    const urlParts = oldUrl.split('blog-images/');
                    if (urlParts.length > 1) {
                      const filePath = `blog-images/${urlParts[1].split('?')[0]}`;
                      const publicUrl = buildPublicUrl(filePath);
                      const newImageMarkdown = `![${altText}](${publicUrl})`;
                      processedContent = processedContent?.replace(match, newImageMarkdown) || processedContent;
                      
                      console.log('이미지 URL 갱신 (공개 URL):', filePath, '->', publicUrl);
                    }
                  }
                }
              }
              
              // 3. 파일명만 있는 패턴 처리 (예: 0_8IPyOnDddVO5s3MB.webp)
              const filenameRegex = /!\[.*?\]\(([^)]+\.(jpg|jpeg|png|gif|webp|svg))\)/g;
              const filenameMatches = data.content.match(filenameRegex);
              
              console.log('🔍 파일명 패턴 매칭 결과:', filenameMatches);

              if (filenameMatches) {
                for (const match of filenameMatches) {
                  const urlMatch = match.match(/!\[(.*?)\]\(([^)]+\.(jpg|jpeg|png|gif|webp|svg))\)/);
                  if (urlMatch) {
                    const altText = urlMatch[1];
                    const filename = urlMatch[2];

                    // 파일명이 blog-images/로 시작하지 않으면 추가
                    const filePath = filename.startsWith('blog-images/') ? filename : `blog-images/${filename}`;
                    
                    try {
                      // 파일 존재 확인 (타임스탬프가 있는 실제 파일명으로 검색)
                      const files = await bucket.getFiles({ prefix: 'blog-images/' });
                      let actualFilePath = filePath;
                      let fileExists = false;

                      // 타임스탬프가 없는 파일명으로 시작하는 파일 찾기
                      const baseFileName = filename.replace(/^blog-images\//, '');
                      console.log('🔍 검색할 기본 파일명:', baseFileName);
                      console.log('🔍 Storage에 있는 파일들:', files[0].map(f => f.name));
                      
                      for (const file of files[0]) {
                        const fileName = file.name.split('/').pop() || '';
                        console.log('🔍 비교 중:', fileName, 'endsWith', baseFileName, '?', fileName.endsWith(baseFileName));
                        if (fileName.endsWith(baseFileName)) {
                          actualFilePath = file.name;
                          fileExists = true;
                          console.log('✅ 파일 찾음:', actualFilePath);
                          break;
                        }
                      }

                      if (fileExists) {
                        const publicUrl = buildPublicUrl(actualFilePath);
                        const newImageMarkdown = `![${altText}](${publicUrl})`;
                        processedContent = processedContent?.replace(match, newImageMarkdown) || processedContent;

                        console.log('이미지 URL 갱신 (파일명):', actualFilePath, '->', publicUrl);
                      } else {
                        console.warn('파일이 존재하지 않음:', filePath);
                      }
                    } catch (error) {
                      console.error('이미지 URL 갱신 실패:', filePath, error);
                    }
                  }
                }
              }
              
              // 4. Base64 이미지는 그대로 유지
              // Base64 이미지는 이미 올바른 형식이므로 처리하지 않음
              
            } catch (error) {
              console.error('이미지 URL 처리 중 오류:', error);
            }
          }
        }

        // Firestore Timestamp 객체를 직렬화 가능한 문자열로 변환
        const item = JSON.parse(JSON.stringify({
          ...data,
          content: processedContent, // 갱신된 이미지 URL이 포함된 content
          id: docSnapshot.id,
          // createdAt, updatedAt 필드가 Timestamp 객체일 경우를 대비
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          createdAt: (data as any).createdAt?.toDate ? (data as any).createdAt.toDate().toISOString() : (data as any).createdAt,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          updatedAt: (data as any).updatedAt?.toDate ? (data as any).updatedAt.toDate().toISOString() : (data as any).updatedAt,
        }));

        return res.status(200).json({ success: true, data: item });
      } catch (error) {
        console.error(`Error fetching article (guid: ${guid}):`, error);
        return res.status(500).json({ success: false, error: 'Failed to fetch article' });
      }

    // PUT 요청: 특정 guid의 글 정보 수정
    case 'PUT':
      try {
        const docRef = adminDb.collection('rss_items').doc(guid);
        const docSnapshot = await docRef.get();

        if (!docSnapshot.exists) {
          return res.status(404).json({ success: false, error: 'Article not found for update' });
        }

        const updatedData = {
          ...req.body,
          updatedAt: FieldValue.serverTimestamp(),
        };

        // content 필드가 비어있으면 업데이트에서 제외하지 않도록 명시적으로 처리
        if (req.body.content === undefined) {
            delete updatedData.content;
        }

        await docRef.update(updatedData);

        return res.status(200).json({ success: true, guid: guid });
      } catch (error) {
        console.error(`Error updating article (guid: ${guid}):`, error);
        return res.status(500).json({ success: false, error: 'Failed to update article' });
      }


    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}