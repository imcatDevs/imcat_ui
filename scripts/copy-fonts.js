/**
 * Font Copy Script
 * src/fonts → dist/fonts 폰트 파일 복사
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, '../src/fonts');
const targetDir = path.join(__dirname, '../dist/fonts');

// dist/fonts 디렉토리 생성
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log('✅ Created dist/fonts directory');
}

// 폰트 파일 복사
try {
  const files = fs.readdirSync(sourceDir);
  
  // README.md 제외하고 폰트 파일만 복사
  const fontFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.ttf', '.woff', '.woff2', '.otf', '.eot'].includes(ext);
  });
  
  let copiedCount = 0;
  
  fontFiles.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`  📄 Copied: ${file}`);
    copiedCount++;
  });
  
  console.log(`\n✅ Successfully copied ${copiedCount} font files to dist/fonts/`);
  
} catch (error) {
  console.error('❌ Error copying fonts:', error.message);
  process.exit(1);
}
