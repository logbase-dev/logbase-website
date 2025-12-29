import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { adminDb, adminBucket } from '@/lib/firebase-admin';
import { generateUnsubscribeUrl } from '@/lib/newsletter-utils';

// 런타임 환경 감지를 위한 설정
console.log('[CONFIG] 런타임 환경 감지 시작...');
console.log('[CONFIG] FIREBASE_CONFIG:', process.env.FIREBASE_CONFIG ? '존재함' : '없음');
console.log('[CONFIG] FUNCTION_TARGET:', process.env.FUNCTION_TARGET || '없음');
console.log('[CONFIG] FIREBASE_FUNCTION_URL:', process.env.FIREBASE_FUNCTION_URL || '없음');
console.log('[CONFIG] VERCEL_URL:', process.env.VERCEL_URL || '없음');

interface NewsletterData {
  title: string;
  content: string;
  url: string;
  sentDate: string;
  recipients: Array<{
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
  }>;
}

interface NewsletterMeta {
  title: string;
  content: string;
  url: string;
  sentDate: string;
  htmlFilePath: string;
  recipients: Array<{
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
  }>;
  filename?: string; // Added for newsletters.json
}

interface RssItem {
  link: string;
  title: string;
  creator: string;
  pubDate: string;
  news_letter_sent_date?: string;
}

// Helper to sanitize filenames
function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_.-]/g, '-');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { title, content, url, sentDate, recipients }: NewsletterData = req.body;

    console.log('--- Newsletter Generation Start ---');
    console.log('[DATA RECEIVED] Request Body:', { title, content, sentDate, url, recipientsCount: recipients?.length });

    if (!title?.trim() || !content?.trim() || !sentDate) {
      return res.status(400).json({
        success: false, 
        message: '제목, 내용, 발송일은 필수 항목입니다.'
      });
    }

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({
        success: false, 
        message: '수신자를 한 명 이상 선택해주세요.'
      });
    }

    // 1. Read the template file
    const templatePath = path.resolve(process.cwd(), 'public/news_letter_template.html');
    let templateContent;
    try {
      templateContent = await fs.readFile(templatePath, 'utf-8');
      console.log('[TEMPLATE] Successfully loaded template file');
    } catch (e) {
      console.error("Template file not found:", templatePath);
      return res.status(500).json({
        success: false, 
        message: '템플릿 파일을 찾을 수 없습니다.'
      });
    }

    // 2. Replace placeholders
    const formattedDate = new Date(sentDate).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    templateContent = templateContent.replace(/{{title}}/g, title);
    templateContent = templateContent.replace(/{{sent_date}}/g, formattedDate);
    templateContent = templateContent.replace(/{{content}}/g, content.replace(/\n/g, '<br>'));
    
    // 구독 취소 URL은 MailerLite personalization에서 처리하므로 그대로 남겨둠
    // templateContent = templateContent.replace(/{{UNSUBSCRIBE_URL}}/g, unsubscribeUrl);

    // --- Start URL Crawling Logic ---
    let insightSectionHtml = '';
    if (url) {
      console.log('\n--- URL Crawling Section Start ---');
      console.log(`[CRAWL_URL] Attempting to crawl: ${url}`);
      try {
        // Added a 5-second timeout and a browser-like User-Agent to prevent being blocked
        const { data: pageHtml } = await axios.get(url, {
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        const $ = cheerio.load(pageHtml);

        const imageUrl = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content') || '';
        const pageTitle = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
        const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';

        console.log(`[CRAWL_RESULT] Title: "${pageTitle}"`);
        console.log(`[CRAWL_RESULT] Description: "${description ? description.substring(0, 200) + '...' : ''}"`);
        console.log(`[CRAWL_RESULT] Image URL: "${imageUrl}"`);

        if (pageTitle) {
          insightSectionHtml = `
      <!-- URL 인사이트 영역 시작 -->
      <tr>
        <td style="padding: 20px; background-color: #f8fafc; border-radius: 6px; margin: 20px 0;">
          <h3 style="font-size: 18px; color: #111; margin-bottom: 16px;">LOGBASE INSIGHT</h3>
          <div style="display: flex; align-items: flex-start; gap: 16px;">
            ${imageUrl ? `<img src="${imageUrl}" alt="Insight Image" style="width: 200px; min-width: 120px; border-radius: 4px; object-fit: cover; display: block;" />` : ''}
            <div style="flex: 1;">
              <h4 style="margin-top: 0; margin-bottom: 6px; color: #111;">${pageTitle}</h4>
              <p style="margin: 0; font-size: 14px; color: #444;">${description}</p>
            </div>
          </div>
        </td>
      </tr>
      <!-- URL 인사이트 영역 끝 -->`;
          console.log('[CRAWL_SUCCESS] URL insight section was generated with crawled data.');
        } else {
          console.log('[CRAWL_SKIP] No title found, so insight section will be empty.');
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error('[CRAWL_ERROR] Failed to crawl URL:', errorMessage);
      }
      console.log('--- URL Crawling Section End ---');
    } else {
      console.log('\n[CRAWL_SKIP] No URL provided, skipping crawl section.');
    }
    templateContent = templateContent.replace('{{URL_INSIGHT_SECTION}}', insightSectionHtml);
    // --- End URL Crawling Logic ---

    // --- New Logic to Inject RSS items from Firestore ---
    let blogListHtml = '';
    console.log(`\n[RSS SCAN] Fetching RSS items from Firestore for date: ${sentDate}`);

    try {
      // Firestore에서 해당 발송일의 RSS 아이템들을 가져오기
      const rssCollection = collection(db, 'rss_items');
      const q = query(
        rssCollection,
        where('news_letter_sent_date', '==', sentDate)
      );
      
      const querySnapshot = await getDocs(q);
      const matchingItems = querySnapshot.docs.map(doc => doc.data());
      
      console.log(`[RSS SCAN] Found ${matchingItems.length} matching RSS items in Firestore.`);

      for (const item of matchingItems) {
        const itemDate = new Date(item.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const author = item.author || item.creator || 'Unknown';
        blogListHtml += `<li><a href="${item.link}" style="color:#0041C4; text-decoration:none;" target="_blank"><strong>${item.title}</strong></a><br>${author} — ${itemDate}</li>`;
        console.log(`    [MATCH FOUND!] Title: ${item.title}, Author: ${author}`);
      }
    } catch (e) {
      console.error("[ERROR] Error during Firestore RSS processing:", e);
      blogListHtml = '<li>Error loading blog posts from database.</li>';
    }

    if (!blogListHtml) {
      blogListHtml = '<li>No articles found for this date.</li>';
    }

    console.log('\n[HTML GENERATED] Final Blog List HTML:', blogListHtml);
    templateContent = templateContent.replace('{{BEHAVIORAL_DATA_UPDATES}}', blogListHtml);
    // --- End of New Logic ---

    // 3. Create a safe filename
    const filename = `newsletter_${sentDate}_${Date.now()}.html`;

    // 4. Cloud Storage에 파일 업로드
    const storagePath = `newsletters/${filename}`;
    const file = adminBucket.file(storagePath);
    
    console.log(`[STORAGE] Cloud Storage 업로드 시작: ${storagePath}`);
    console.log(`[STORAGE] 파일 크기: ${templateContent.length} bytes`);
    
    // 미리보기 URL 생성 (API 경로 사용)
    let baseUrl = 'https://logbase.kr'; // 기본값
    
    // 런타임에 실제 배포 URL 감지
    if (process.env.FIREBASE_CONFIG || process.env.FUNCTION_TARGET) {
      // Firebase Functions 환경
      const functionUrl = process.env.FIREBASE_FUNCTION_URL || process.env.VERCEL_URL;
      
      if (functionUrl && functionUrl.includes('logbase.kr')) {
        baseUrl = 'https://logbase.kr';
      } else if (functionUrl && functionUrl.includes('localhost')) {
        baseUrl = 'http://localhost:3000';
      } else {
        // 기본값 사용
        baseUrl = 'https://logbase.kr';
      }
      
      console.log(`[CONFIG] Firebase Functions 환경 - 감지된 URL: ${functionUrl}, 사용할 baseUrl: ${baseUrl}`);
    } else {
      // 로컬 환경
      baseUrl = 'http://localhost:3000';
      console.log(`[CONFIG] 로컬 환경 - baseUrl: ${baseUrl}`);
    }
    
    const previewUrl = `${baseUrl}/api/newsletter-preview/${filename.replace('.html', '')}`;
    
    try {
      // HTML 파일을 Cloud Storage에 업로드
      await file.save(templateContent, {
        metadata: {
          contentType: 'text/html',
          cacheControl: 'public, max-age=3600'
        }
      });
      console.log(`[SUCCESS] HTML file uploaded to Cloud Storage: ${storagePath}`);
      console.log(`[SUCCESS] Preview URL generated: ${previewUrl}`);
      
    } catch (uploadError) {
      console.error('[ERROR] Cloud Storage 업로드 실패:', uploadError);
      console.error('[ERROR] 에러 상세:', {
        message: uploadError instanceof Error ? uploadError.message : 'Unknown error',
        stack: uploadError instanceof Error ? uploadError.stack : undefined,
        storagePath,
        fileSize: templateContent.length
      });
      return res.status(500).json({
        success: false,
        message: '뉴스레터 파일 업로드에 실패했습니다.',
        error: uploadError instanceof Error ? uploadError.message : '알 수 없는 오류'
      });
    }

    // 5. newsletters.json 파일 업데이트
    const newslettersJsonPath = path.resolve(process.cwd(), 'public/newsletters/newsletters.json');
    const metadata = {
      title: title,
      content: content,
      url: url || '',
      sentDate: sentDate,
      htmlFilePath: storagePath,
      publicUrl: previewUrl,
      recipients: recipients,
      filename: filename.replace('.html', '')
    };
    
    try {
      // Firebase Functions 환경인지 확인
      const isFirebaseFunctions = process.env.FIREBASE_CONFIG || process.env.FUNCTION_TARGET;

      if (isFirebaseFunctions) {
        // Firebase 서버에서는 Cloud Storage에 newsletters.json 업데이트
        console.log('[NEWSLETTER-CREATE] Firebase Functions 환경에서 Cloud Storage 사용');
        
        try {
          // Cloud Storage에서 기존 newsletters.json 읽기
          const jsonFile = adminBucket.file('newsletters/newsletters.json');
          console.log('[NEWSLETTER-CREATE] Cloud Storage 파일 객체 생성 완료');
          
          let newslettersArr = [];
          
          const [exists] = await jsonFile.exists();
          console.log(`[NEWSLETTER-CREATE] 기존 newsletters.json 존재 여부: ${exists}`);
          
          if (exists) {
            console.log('[NEWSLETTER-CREATE] 기존 파일 다운로드 시작...');
            const [content] = await jsonFile.download();
            const jsonContent = content.toString('utf-8');
            newslettersArr = JSON.parse(jsonContent);
            if (!Array.isArray(newslettersArr)) newslettersArr = [];
            console.log(`[NEWSLETTER-CREATE] 기존 뉴스레터 ${newslettersArr.length}개 로드`);
          } else {
            console.log('[NEWSLETTER-CREATE] 기존 파일이 없어서 새로 생성');
          }
          
          // 새 뉴스레터 추가
          newslettersArr.push(metadata);
          console.log(`[NEWSLETTER-CREATE] 새 뉴스레터 추가 완료. 총 ${newslettersArr.length}개`);
          
          // Cloud Storage에 저장
          console.log('[NEWSLETTER-CREATE] Cloud Storage에 저장 시작...');
          const jsonData = JSON.stringify(newslettersArr, null, 2);
          console.log(`[NEWSLETTER-CREATE] 저장할 데이터 크기: ${jsonData.length} bytes`);
          
          await jsonFile.save(jsonData, {
            metadata: {
              contentType: 'application/json',
            }
          });
          console.log(`[NEWSLETTER-CREATE] Cloud Storage newsletters.json 업데이트 완료`);
        } catch (storageError) {
          console.error('[NEWSLETTER-CREATE] Cloud Storage 업데이트 실패:', storageError);
          console.error('[NEWSLETTER-CREATE] 에러 상세:', {
            message: storageError instanceof Error ? storageError.message : 'Unknown error',
            stack: storageError instanceof Error ? storageError.stack : undefined
          });
        }
      } else {
        // 로컬 환경에서는 로컬 파일 업데이트
        console.log('[NEWSLETTER-CREATE] 로컬 환경에서 로컬 파일 사용');
        
        // 기존 newsletters.json 파일 읽기
        let newslettersArr = [];
        try {
          const jsonContent = await fs.readFile(newslettersJsonPath, 'utf-8');
          newslettersArr = JSON.parse(jsonContent);
          if (!Array.isArray(newslettersArr)) newslettersArr = [];
        } catch {
          newslettersArr = [];
        }
        
        // 새 뉴스레터 추가
        newslettersArr.push(metadata);
        
        // 파일에 저장
        await fs.writeFile(newslettersJsonPath, JSON.stringify(newslettersArr, null, 2), 'utf-8');
        console.log(`[NEWSLETTER-CREATE] 로컬 newsletters.json 업데이트 완료`);
      }
    } catch (jsonError) {
      console.error('[NEWSLETTER-CREATE] newsletters.json 업데이트 실패:', jsonError);
      // JSON 업데이트 실패해도 파일은 업로드되었으므로 성공으로 처리
    }

    console.log('--- Newsletter Generation End ---\n');

    return res.status(200).json({
      success: true,
      message: '뉴스레터가 성공적으로 생성되었습니다!',
      data: {
        filename: filename.replace('.html', ''),
        title: title,
        htmlUrl: url,
        storagePath: storagePath
      }
    });

  } catch (error) {
    console.error('--- Newsletter Generation Failed ---');
    console.error('[FATAL ERROR]', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return res.status(500).json({
      success: false, 
      message: '뉴스레터 생성에 실패했습니다.',
      error: errorMessage
    });
  }
} 