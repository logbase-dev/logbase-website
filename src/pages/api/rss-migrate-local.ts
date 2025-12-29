import { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { RSSItem } from '@/types/rss';

// Firebase Admin SDK 초기화
if (!getApps().length) {
  try {
    // initializeApp({
    //   credential: cert({
    //     projectId: process.env.FIREBASE_PROJECT_ID,
    //     // clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    //     // privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    //   }),
    // });

    // 로컬 에뮬레이터: credential 없이 projectId만으로 초기화
    initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'logbase-website',
    });

  } catch (error) {
    console.error('Firebase Admin SDK 초기화 오류:', error);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const { blogName, pageSize = '10', feedType, searchText = '', page = '1' } = req.query;
      const pageSizeNum = parseInt(pageSize as string);
      const pageNum = parseInt(page as string);
      const searchTextLower = (searchText as string).toLowerCase();

      const db = getFirestore();
      let items: RSSItem[] = [];
      let totalCount = 0;
      let filteredCount = 0;

      console.log(' 쿼리 조건:', {
        blogName,
        feedType,
        searchText,
        page,
        pageSize
      });

      // 전체 데이터를 가져와서 메모리에서 필터링 및 페이지네이션 처리
      const rssCollection = db.collection('rss_items');
      const snapshot = await rssCollection.orderBy('isoDate', 'desc').get();
      
      totalCount = snapshot.size;
      console.log(' 전체 데이터 수:', totalCount);

      // 데이터 변환 및 필터링
      const allItems: RSSItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const item: RSSItem = {
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          content: data.content || '',
          link: data.link || '',
          pubDate: data.pubDate || '',
          isoDate: data.isoDate || '',
          blogName: data.blogName || '',
          feedType: data.feedType || 'noncompetitor',
          categories: data.categories || [],
          matchedKeywords: data.matchedKeywords || [],
          author: data.author || '',
          guid: data.guid || '',
          imageUrl: data.imageUrl || '',
          newsletterDate: data.newsletterDate || '',
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || '',
        };
        allItems.push(item);
      });

      // 필터링 적용
      let filteredItems = allItems;

      if (blogName && blogName !== 'all') {
        filteredItems = filteredItems.filter(item => item.blogName === blogName);
      }

      if (feedType && feedType !== 'all') {
        filteredItems = filteredItems.filter(item => item.feedType === feedType);
      }

      if (searchTextLower) {
        filteredItems = filteredItems.filter(item => 
          item.title.toLowerCase().includes(searchTextLower) ||
          item.description.toLowerCase().includes(searchTextLower) ||
          item.content.toLowerCase().includes(searchTextLower)
        );
      }

      filteredCount = filteredItems.length;

      // 페이지네이션 적용
      const startIdx = (pageNum - 1) * pageSizeNum;
      const endIdx = startIdx + pageSizeNum;
      items = filteredItems.slice(startIdx, endIdx);

      console.log(' 페이지네이션:', {
        page: pageNum,
        pageSize: pageSizeNum,
        startIdx,
        endIdx,
        resultCount: items.length,
        filteredCount
      });

      res.status(200).json({
        success: true,
        data: items,
        totalCount,
        filteredCount,
        page: pageNum,
        pageSize: pageSizeNum,
        totalPages: Math.ceil(filteredCount / pageSizeNum)
      });

    } catch (error) {
      console.error('RSS 데이터 조회 에러:', error);
      res.status(500).json({ 
        success: false, 
        error: 'RSS 데이터 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
