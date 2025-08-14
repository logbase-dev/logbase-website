const Parser = require('rss-parser');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, query, where, getDocs } = require('firebase/firestore');

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyBxGgOeJ83_iQhXvERtX34XtMR2eVLpVEo",
  authDomain: "logbase-blog-83db6.firebaseapp.com",
  projectId: "logbase-blog-83db6",
  storageBucket: "logbase-blog-83db6.appspot.com",
  messagingSenderId: "938632982963",
  appId: "1:938632982963:web:2c8c8c8c8c8c8c8c8c8c8c8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const parser = new Parser({
  customFields: {
    item: [
      ['dc:creator', 'creator'],
      ['content:encoded', 'content'],
      ['content:encodedSnippet', 'contentSnippet']
    ]
  }
});

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
    const rssCollection = collection(db, 'rss_items');
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
        // 기존 Firestore 구조와 동일하게 맞춤
        const docData = {
          // RSS에서 가져온 필드들
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          guid: item.guid || item.link, // guid가 없으면 link 사용
          isoDate: item.isoDate,
          
          // 고정값들
          blogName: 'Indicative',
          feedType: 'competitor',
          
          // 설명 (content:encodedSnippet 또는 contentSnippet 사용)
          description: item['content:encodedSnippet'] || item.contentSnippet || 
                      (item['content:encoded'] ? item['content:encoded'].replace(/<[^>]*>/g, '').substring(0, 500) : ''),
          
          // 빈 객체들 (기존 구조와 동일)
          matchedKeywords: {},
          
          // 날짜 필드들
          collectedDate: new Date().toISOString().slice(0, 10).replace(/-/g, ''), // YYYYMMDD 형식
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await addDoc(collection(db, 'rss_items'), docData);
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
  console.log('\n🎉 Indicative 크롤링 완료!');
  process.exit(0);
}); 