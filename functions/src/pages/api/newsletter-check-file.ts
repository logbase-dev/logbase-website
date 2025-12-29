import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

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

    // 파일 경로 확인
    const newslettersDir = path.resolve(process.cwd(), 'public/newsletters');
    const filePath = path.join(newslettersDir, `${filename}.html`);
    
    console.log(`[FILE CHECK] 확인할 파일 경로: ${filePath}`);
    console.log(`[FILE CHECK] 현재 작업 디렉토리: ${process.cwd()}`);

    try {
      // 파일 존재 여부 확인
      const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
      console.log(`[FILE CHECK] 파일 존재 여부: ${fileExists}`);

      if (fileExists) {
        // 파일 정보 가져오기
        const fileStats = await fs.stat(filePath);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        
        return res.status(200).json({
          success: true,
          fileExists: true,
          filePath: filePath,
          fileSize: fileStats.size,
          fileContentLength: fileContent.length,
          fileStats: {
            size: fileStats.size,
            created: fileStats.birthtime,
            modified: fileStats.mtime
          }
        });
      } else {
        // 디렉토리 내용 확인
        try {
          const dirContents = await fs.readdir(newslettersDir);
          console.log(`[FILE CHECK] 디렉토리 내용: ${dirContents.join(', ')}`);
          
          return res.status(404).json({
            success: false,
            fileExists: false,
            filePath: filePath,
            directoryContents: dirContents,
            message: '파일이 존재하지 않습니다.'
          });
        } catch (dirError) {
          return res.status(404).json({
            success: false,
            fileExists: false,
            filePath: filePath,
            directoryError: dirError instanceof Error ? dirError.message : '알 수 없는 오류',
            message: '디렉토리 접근 오류'
          });
        }
      }

    } catch (fileError) {
      console.error('[FILE CHECK] 파일 확인 중 오류:', fileError);
      return res.status(500).json({
        success: false,
        fileExists: false,
        filePath: filePath,
        error: fileError instanceof Error ? fileError.message : '알 수 없는 오류',
        message: '파일 확인 중 오류가 발생했습니다.'
      });
    }

  } catch (error) {
    console.error('[FILE CHECK] API 오류:', error);
    return res.status(500).json({
      success: false, 
      message: '파일 확인에 실패했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
} 