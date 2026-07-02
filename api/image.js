// api/image.js
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // 允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { type, format } = req.query;

  // 参数校验
  const validTypes = ['pc', 'phone', 'general'];
  const validFormats = ['dataurl', 'url'];
  if (!type || !validTypes.includes(type)) {
    return res.status(400).send('❌ 参数 type 必须是 pc / phone / general');
  }
  if (!format || !validFormats.includes(format)) {
    return res.status(400).send('❌ 参数 format 必须是 dataurl / url');
  }

  // 根据 type 决定读取哪个文件夹
  let folder;
  if (type === 'pc') {
    folder = 'ppic';
  } else if (type === 'phone') {
    folder = 'mpic';
  } else {
    // general：随机从 pc 或 phone 中选
    const folders = ['ppic', 'mpic'];
    folder = folders[Math.floor(Math.random() * folders.length)];
  }

  const publicDir = path.join(process.cwd(), 'public');
  const imageDir = path.join(publicDir, folder);

  // 读取文件夹
  let files;
  try {
    files = fs.readdirSync(imageDir);
  } catch (_) {
    return res.status(500).send('❌ 图片目录不存在，请检查 public/' + folder);
  }

  // 只保留图片文件
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.avif'];
  const imageFiles = files.filter(f => {
    const ext = path.extname(f).toLowerCase();
    return imageExtensions.includes(ext);
  });

  if (imageFiles.length === 0) {
    return res.status(404).send('❌ 该目录下没有图片文件');
  }

  // 随机选一张
  const randomFile = imageFiles[Math.floor(Math.random() * imageFiles.length)];
  const filePath = path.join(imageDir, randomFile);

  if (format === 'url') {
    // 返回可直接访问的 URL
    const url = `/${folder}/${randomFile}`;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.send(url);
  } else {
    // 返回 dataURL（base64 编码）
    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = getMimeType(path.extname(randomFile));
    const base64 = fileBuffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64}`;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.send(dataUrl);
  }
}

function getMimeType(ext) {
  const map = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
    '.avif': 'image/avif',
  };
  return map[ext.toLowerCase()] || 'application/octet-stream';
}
