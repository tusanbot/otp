let smsBuffer = []; // حافظه موقت در RAM

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { from, body, timestamp } = req.body;
    smsBuffer.unshift({ from, body, timestamp });

    // محدودیت برای جلوگیری از پر شدن RAM
    if (smsBuffer.length > 100) smsBuffer.pop();

    return res.status(200).json({ success: true });
  }

  if (req.method === 'GET') {
    // برای نمایش در پنل همکار
    return res.status(200).json(smsBuffer);
  }

  res.status(405).end(); // Method Not Allowed
}
