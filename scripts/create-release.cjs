/**
 * 릴리즈 배포용 ZIP 파일 생성 스크립트
 * 
 * 사용법: npm run release
 * 출력: release/imcatui-{version}.zip
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// 패키지 정보 읽기
const packageJson = require('../package.json');
const version = packageJson.version;

// 경로 설정
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const releaseDir = path.join(rootDir, 'release');
const zipName = `imcatui-${version}.zip`;
const zipPath = path.join(releaseDir, zipName);

// release 폴더 생성
if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true });
  console.log('📁 Created release directory');
}

// 기존 zip 파일 삭제
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
  console.log(`🗑️  Removed existing ${zipName}`);
}

// ZIP 파일 생성
const output = fs.createWriteStream(zipPath);
const archive = archiver('zip', {
  zlib: { level: 9 } // 최대 압축
});

output.on('close', () => {
  const sizeKB = (archive.pointer() / 1024).toFixed(1);
  const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
  
  console.log('');
  console.log('✅ Release ZIP created successfully!');
  console.log('');
  console.log(`📦 File: ${zipName}`);
  console.log(`📍 Path: ${zipPath}`);
  console.log(`📊 Size: ${sizeKB} KB (${sizeMB} MB)`);
  console.log('');
  console.log('📋 Contents:');
  console.log('   └── imcatui/');
  console.log('       ├── imcat-ui.min.js');
  console.log('       ├── imcat-ui.js');
  console.log('       ├── imcat-ui.css');
  console.log('       ├── fonts/');
  console.log('       ├── modules/');
  console.log('       ├── README.md');
  console.log('       └── LICENSE');
  console.log('');
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// dist 폴더 내용을 imcatui/ 폴더 안에 추가
archive.directory(distDir, 'imcatui');

// README.md 추가
const readmePath = path.join(rootDir, 'README.md');
if (fs.existsSync(readmePath)) {
  archive.file(readmePath, { name: 'imcatui/README.md' });
}

// LICENSE 추가
const licensePath = path.join(rootDir, 'LICENSE');
if (fs.existsSync(licensePath)) {
  archive.file(licensePath, { name: 'imcatui/LICENSE' });
}

// ZIP 마무리
archive.finalize();

console.log('');
console.log(`🚀 Creating release: ${zipName}`);
console.log('');
