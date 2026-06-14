const token = '8989749727:AAH3HltPausXbOT-g-sHixgcIKLCeopD_8A';
const chatId = '7178498367';

const message = `<b>🚨🚨🚨 CRITICAL NEWS ALERT</b>

📰 <b><a href="http://localhost:3000">ระบบแจ้งเตือน Telegram เชื่อมต่อสำเร็จ! ⚡</a></b>
<b>Source:</b> PixelTrade System
<b>Severity Score:</b> 10/10
<b>Market Sentiment:</b> 🟢 Bullish 🐂

📝 <b>บทวิเคราะห์ (Summary):</b>
การเชื่อมต่อระบบแจ้งเตือนผ่าน Telegram Bot ทำงานได้อย่างถูกต้องและพร้อมใช้งานสำหรับการเฝ้าระวังข่าวสารระดับ Critical แล้ว!

⚡ <b>Immediate Impact:</b>
ระบบจะเริ่มส่งสัญญาณทันทีเมื่อตรวจพบข่าวที่มีความรุนแรงสูง

⏳ <b>Long-Term Outlook:</b>
ช่วยให้คุณไม่พลาดความเคลื่อนไหวสำคัญของตลาดหุ้น US และทองคำ

🏷️ <b>Keywords:</b> #Telegram, #Connection, #System, #Test`;

async function testTelegram() {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }),
    });

    const data = await response.json();
    if (response.ok && data.ok) {
      console.log('Successfully sent test signal to Telegram!');
    } else {
      console.error('Telegram API error:', data);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testTelegram();
