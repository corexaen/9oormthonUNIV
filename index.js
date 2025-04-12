const fs = require('fs');
const crypto = require('crypto');
const https = require('https');
const express = require('express');
const path = require('path');
const { json } = require('stream/consumers');
const app = express();
const port = 443;
const certs = {
  key: fs.readFileSync('./privkey.key'),
  cert: fs.readFileSync('./fullchain.crt'),
};
let count = 0;

function generateSecureId() {
  count++;
  const randomBytes = crypto.randomBytes(8);
  const countBuffer = Buffer.alloc(4);
  countBuffer.writeUInt32BE(count);

  return Buffer.concat([randomBytes, countBuffer]).toString('hex');
}
app.disable('x-powered-by');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.get('/', (req, res) => {
  res.send('<!DOCTYPE html>\n<html>\n<head><title>corexaen</title></head>\n<body>corexae</body>\n</html>');
});
let memos = [];
app.get('/memo',(req,res) => {
  let result = '<!DOCTYPE html>\n<html>\n<head><title>corexaen</title></head>\n<body>';
  memos.forEach((node) => {
    result += node.id;
    result += "|";
    result += node.memo;
    result += "<br>";
  });
  result += '</body>\n</html>';
  res.send(result);
});
app.post('/memo',(req,res) => {
  const {memo} = req.body;
  const node = {
    id: generateSecureId(),
    memo:memo,
  };
  memos.push(node);
  res.send(JSON.stringify(node));
  console.log("memo:",memo);
});
app.post('/memo/:id',(req,res) => {
  const inid = req.params.id;
  const index = memos.findIndex(m => m.id === inid);
  if(index === -1) {
    return res.status(404).json({ error: '메모를 찾을 수 없습니다.' });
  }
  const {memo} = req.body;
  memos[index].memo = memo;
  res.send(JSON.stringify(memos[index]));
  console.log("memo:",memo);
});
app.delete('/memo/:id', (req, res) => {
  const id = req.params.id;
  const newMemos = memos.filter(m => m.id !== id);

  if (newMemos.length === memos.length) {
    return res.status(404).json({ error: '메모를 찾을 수 없습니다.' });
  }

  memos = newMemos;
  res.status(204).send(); // No Content
});
https.createServer(certs,app).listen(port, () => {
  console.log(`HTTPS server running at https://localhost:${port}`);
});
process.on('exit', (code) => {
  console.log(`asdfasdaaf: ${code}`);
});
process.on('SIGINT', () => {
  console.log('Ctrl + C 감지! 서버를 정상 종료합니다');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('📌 Dockerstop!!');
  process.exit(0);
});