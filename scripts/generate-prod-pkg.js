const fs = require('fs');
const path = require('path');

// 核心原则：原子性 - 此脚本只负责一件事情：为生产环境生成一个干净的 package.json。
// 它是一个独立的、可重用的构建工具。

// 定义源 package.json 的路径
const sourcePkgPath = path.resolve(__dirname, '..', 'apps', 'backend', 'package.json');
// 定义目标目录和目标 package.json 的路径
const destDir = path.resolve(__dirname, '..', 'dist', 'backend');
const destPkgPath = path.resolve(destDir, 'package.json');

console.log(`[Builder] Reading source package.json from: ${sourcePkgPath}`);

// 读取源 package.json 文件内容
const sourcePkg = JSON.parse(fs.readFileSync(sourcePkgPath, 'utf-8'));

// 创建一个只包含生产所需信息的新 package.json 对象
// 这是核心的转换逻辑，剥离了所有开发时才需要的信息。
const prodPkg = {
  name: sourcePkg.name,
  version: sourcePkg.version,
  private: sourcePkg.private,
  // 关键修正：在 dist/backend 目录中，主入口文件就是 server.js
  main: 'server.js',
  // 只包含生产环境依赖
  dependencies: sourcePkg.dependencies,
};

console.log('[Builder] Ensuring destination directory exists...');
// 确保目标目录存在，如果不存在则递归创建
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

console.log(`[Builder] Writing production package.json to: ${destPkgPath}`);
// 将新的 package.json 对象格式化后写入目标文件
fs.writeFileSync(destPkgPath, JSON.stringify(prodPkg, null, 2));

console.log(`✅ Production package.json for backend has been successfully generated.`);
