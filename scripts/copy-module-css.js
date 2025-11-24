/**
 * Module CSS Copy Script
 * src/modules/[module]/[module].scss -> dist/modules/[module]/[module].css
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modulesDir = path.join(__dirname, '../src/modules');
const distModulesDir = path.join(__dirname, '../dist/modules');

async function copyModuleCSS() {
  try {
    // dist/modules 디렉토리 생성
    if (!fs.existsSync(distModulesDir)) {
      fs.mkdirSync(distModulesDir, { recursive: true });
    }

    // src/modules 하위 디렉토리 탐색
    const modules = fs.readdirSync(modulesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    console.log(`Found ${modules.length} modules: ${modules.join(', ')}`);

    for (const moduleName of modules) {
      const srcModuleDir = path.join(modulesDir, moduleName);
      const distModuleDir = path.join(distModulesDir, moduleName);

      // dist/modules/[moduleName] 디렉토리 생성
      if (!fs.existsSync(distModuleDir)) {
        fs.mkdirSync(distModuleDir, { recursive: true });
      }

      // SCSS 파일 찾기
      const scssFile = path.join(srcModuleDir, `${moduleName}.scss`);
      
      if (fs.existsSync(scssFile)) {
        // CSS로 컴파일
        const cssFile = path.join(distModuleDir, `${moduleName}.css`);
        
        console.log(`  📦 Compiling ${moduleName}.scss → ${moduleName}.css`);
        
        try {
          await execAsync(`sass ${scssFile} ${cssFile} --style compressed --no-source-map`);
          console.log(`  ✅ Compiled: ${moduleName}.css`);
        } catch (error) {
          console.error(`  ❌ Failed to compile ${moduleName}.scss:`, error.message);
        }
      } else {
        console.log(`  ⏩ No SCSS file for ${moduleName}`);
      }
    }

    console.log(`\n✅ Module CSS compilation completed!`);

  } catch (error) {
    console.error('❌ Error copying module CSS:', error.message);
    process.exit(1);
  }
}

copyModuleCSS();
