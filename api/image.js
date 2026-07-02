// api/image.js
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

  // 固定文件列表（根据实际图片命名）
  const pcFiles = ['p1.webp', 'p2.webp'];
  const phoneFiles = ['m1.webp', 'm2.webp', 'm3.webp', 'm4.webp', 'm5.webp'];

  const allEntries = [
    ...pcFiles.map(f => ({ folder: 'ppic', file: f })),
    ...phoneFiles.map(f => ({ folder: 'mpic', file: f })),
  ];

  let availableEntries;
  if (type === 'pc') {
    availableEntries = allEntries.filter(e => e.folder === 'ppic');
  } else if (type === 'phone') {
    availableEntries = allEntries.filter(e => e.folder === 'mpic');
  } else { // general
    availableEntries = allEntries;
  }

  if (availableEntries.length === 0) {
    return res.status(404).send('没有可用的图片');
  }

  const entry = availableEntries[Math.floor(Math.random() * availableEntries.length)];
  const imageUrl = `https://img.344977.xyz/${entry.folder}/${entry.file}`;

  return await handleResponse(format, imageUrl, res);
}

async function handleResponse(format, imageUrl, res) {
  if (format === 'url') {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.send(imageUrl);
  } else { // dataurl
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const contentType = response.headers.get('content-type') || 'image/webp';
      const dataUrl = `data:${contentType};base64,${base64}`;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(dataUrl);
    } catch (err) {
      return res.status(500).send(`获取图片失败: ${err.message}`);
    }
  }
}
