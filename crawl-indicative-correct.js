const Parser = require('rss-parser');
const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Firebase Admin SDK 초기화
const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  // .env 파일의 private_key에 포함된 \n을 실제 줄바꿈으로 변경
  privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

const parser = new Parser({
  customFields: {
    item: [
      ['dc:creator', 'creator'],
      ['content:encoded', 'content'],
      ['content:encodedSnippet', 'contentSnippet']
    ]
  }
});

/**
 * Maps an RSS item from the parser to the Firestore document structure.
 * @param {object} item - The item from the RSS feed.
 * @returns {object} The data object ready for Firestore.
 */
function mapItemToDocData(item) {
  const description = item['content:encodedSnippet'] || item.contentSnippet || 
                      (item['content:encoded'] ? item['content:encoded'].replace(/<[^>]*>/g, '').substring(0, 500) : '');

  return {
    // RSS fields
    title: item.title || 'No Title',
    link: item.link,
    pubDate: item.pubDate,
    guid: item.guid || item.link, // Use link as a fallback for guid
    isoDate: item.isoDate,
    description: description,

    // Static fields
    blogName: 'Indicative',
    feedType: 'competitor',
    matchedKeywords: [], // Use an empty array for consistency with other types

    // Timestamps
    collectedDate: new Date().toISOString().slice(0, 10).replace(/-/g, ''), // YYYYMMDD
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

async function crawlIndicativeCorrect() {
  try {
    console.log('🔍 Indicative 글 크롤링 시작 (기존 구조 맞춤)...\n');
    
    const baseUrl = 'https://www.indicative.com/resources/product-analytics/feed/';
    const allItems = [];
    
    // 1. 모든 페이지의 RSS 피드 수집
    console.log('1️⃣ RSS 피드 수집...');
    for (let page = 1; page <= 10; page++) { // Max 10 pages
      const url = page === 1 ? baseUrl : `${baseUrl}?paged=${page}`;
      
      try {
        const feed = await parser.parseURL(url);
        console.log(`📄 페이지 ${page}: ${feed.items.length}개 글`);
        
        // 중복 제거 (제목 기준)
        feed.items.forEach(item => {
          const existingIndex = allItems.findIndex(existing => existing.title === item.title);
          if (existingIndex === -1) {
            allItems.push(item);
          }
        });
        
        // 더 이상 글이 없으면 중단
        if (feed.items.length === 0) {
          console.log(`📄 페이지 ${page}에 더 이상 글이 없음. 중단.`);
          break;
        }
        
        // 페이지 간 딜레이
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`❌ 페이지 ${page} 수집 실패: ${error.message}`);
        break;
      }
    }
    
    console.log(`📊 총 수집된 글: ${allItems.length}개`);
    
    // 2. 기존 Firestore 데이터 중복 체크
    console.log('\n2️⃣ 중복 체크...');
    const rssCollection = db.collection('rss_items');
    const existingQuery = query(rssCollection, where('blogName', '==', 'Indicative'));
    const existingSnapshot = await getDocs(existingQuery);
    
    const existingTitles = new Set();
    existingSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.title) {
        existingTitles.add(data.title);
      }
    });
    
    console.log(`📊 기존 Indicative 글: ${existingTitles.size}개`);
    
    // 3. 새로운 글만 필터링
    const newItems = allItems.filter(item => !existingTitles.has(item.title));
    console.log(`📊 새로운 글: ${newItems.length}개`);
    
    if (newItems.length === 0) {
      console.log('✅ 새로운 글이 없습니다.');
      return;
    }
    
    // 4. Firestore에 저장 (기존 구조와 동일하게)
    console.log('\n3️⃣ Firestore에 저장...');
    let savedCount = 0;
    
    for (const item of newItems) {
      try {
        const docData = mapItemToDocData(item);
        
        await db.collection('rss_items').add(docData);
        savedCount++;
        console.log(`✅ 저장됨: ${item.title}`);
        
        // 저장 간 딜레이
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ 저장 실패: ${item.title} - ${error.message}`);
      }
    }
    
    console.log(`\n🎯 저장 완료: ${savedCount}개 글 저장됨`);
    
  } catch (error) {
    console.error('❌ 크롤링 실패:', error.message);
  }
}

crawlIndicativeCorrect().then(() => {
  console.log('\n🎉 Indicative 크롤링 스크립트 실행 완료!');
}).catch(error => {
  console.error('💥 스크립트 실행 중 치명적인 오류 발생:', error);
}).finally(() => {
  // Firestore 연결을 정상적으로 종료
  db.terminate().then(() => console.log('Firestore 연결이 종료되었습니다.'));
});