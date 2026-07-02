// api/image.js
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { type, format } = req.query;

  const validTypes = ['pc', 'phone', 'general'];
  const validFormats = ['dataurl', 'url'];
  if (!type || !validTypes.includes(type)) {
    return res.status(400).send('参数 type 必须是 pc / phone / general');
  }
  if (!format || !validFormats.includes(format)) {
    return res.status(400).send('参数 format 必须是 dataurl / url');
  }

  let folder;
  if (type === 'pc') {
    folder = 'ppic';
  } else if (type === 'phone') {
    folder = 'mpic';
  } else {
    const folders = ['ppic', 'mpic'];
    folder = folders[Math.floor(Math.random() * folders.length)];
  }

  const imageDir = path.join(process.cwd(), folder);

  let files;
  try {
    files = fs.readdirSync(imageDir);
  } catch (_) {
    return res.status(500).send(`图片目录不存在: ${folder}`);
  }

  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.avif'];
  const imageFiles = files.filter(f =>
    imageExtensions.includes(path.extname(f).toLowerCase())
  );

  if (imageFiles.length === 0) {
    return res.status(404).send(`目录 ${folder} 中没有图片文件`);
  }

  const randomFile = imageFiles[Math.floor(Math.random() * imageFiles.length)];

  if (format === 'url') {
    const absoluteUrl = `https://img.344977.xyz/${folder}/${randomFile}`;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.send(absoluteUrl);
  } else {
    const filePath = path.join(imageDir, randomFile);
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
