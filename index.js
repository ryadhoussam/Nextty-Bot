const TelegramBot = require('node-telegram-bot-api');
const ytdl = require('ytdl-core');
const token = 'YOUR TOKEN HERE';
const fs = require('fs')
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, 'Welcome! Send me a YouTube video link to download.');

  bot.on('message', async (msg) => {
  
    const chatId = msg.chat.id;
    const videoUrl = msg.text;
  
    if (ytdl.validateURL(videoUrl)) {
  
      try {
        // Get video information
        const info = await ytdl.getInfo(videoUrl);
        // Download the video to a file
        const videoInfo = await ytdl.getBasicInfo(videoUrl);
        const videoTitle = videoInfo.videoDetails.title.replace(/[^\w\s]/gi, ''); // Clean title for filename
        const videoPath = `./${videoTitle}.mp4`;
  
        ytdl(videoUrl)
          .pipe(fs.createWriteStream(videoPath))
          .on('finish', () => {
            // Send the video file to the user
            bot.sendVideo(chatId, videoPath, { caption: `Title: ${info.videoDetails.title}` })
              .then(() => {
                // Delete the video file after sending
                fs.unlinkSync(videoPath);
              })
              .catch((err) => {
                console.error('Error sending video:', err);
              });
          });
        } catch (error) {
        bot.sendMessage(chatId, error);
      }
    }
    
  });
});


