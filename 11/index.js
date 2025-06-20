const { Command } = require('commander');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const fs = require('fs').promises;
const path = require('path');
const { getAudioDurationInSeconds } = require('get-audio-duration');

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const program = new Command();

program
  .version('1.0.0')
  .description('A console application to transcribe, summarize, and analyze audio files.')
  .argument('<audioFilePath>', 'Path to the audio file.')
  .action(async (audioFilePath) => {
    try {
      console.log(`Processing audio file: ${audioFilePath}`);

      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not set in the .env file.');
      }

      const absoluteAudioPath = path.resolve(audioFilePath);
      const audioFileName = path.basename(absoluteAudioPath, path.extname(absoluteAudioPath));

      // 1. Transcription
      console.log('Transcribing audio...');
      const transcription = await transcribeAudio(absoluteAudioPath);
      const transcriptionOutputPath = path.join(__dirname, `${audioFileName}_transcription.md`);
      await fs.writeFile(transcriptionOutputPath, transcription);
      console.log(`Transcription saved to ${transcriptionOutputPath}`);

      // 2. Analysis
      console.log('Analyzing transcript...');
      const wordCount = transcription.split(/\s+/).length;
      const audioDuration = await getAudioDurationInSeconds(absoluteAudioPath);
      const speakingSpeed = Math.round(wordCount / (audioDuration / 60));

      const analysis = await analyzeTopics(transcription);
      analysis.word_count = wordCount;
      analysis.speaking_speed_wpm = speakingSpeed;

      const analysisOutputPath = path.join(__dirname, `${audioFileName}_analysis.json`);
      await fs.writeFile(analysisOutputPath, JSON.stringify(analysis, null, 2));
      console.log(`Analysis saved to ${analysisOutputPath}`);

      // 3. Summarization
      console.log('Summarizing transcript...');
      const summary = await summarizeText(transcription);
      const summaryOutputPath = path.join(__dirname, `${audioFileName}_summary.md`);
      await fs.writeFile(summaryOutputPath, summary);
      console.log(`Summary saved to ${summaryOutputPath}`);

      // 4. Output to console
      console.log('\n--- Summary ---');
      console.log(summary);
      console.log('\n--- Analysis ---');
      console.log(JSON.stringify(analysis, null, 2));

      console.log('\nProcessing complete.');
    } catch (error) {
      console.error('An error occurred:', error.message);
      if (error.response) {
        console.error(error.response.data);
      }
    }
  });

async function transcribeAudio(filePath) {
  const fileStream = require('fs').createReadStream(filePath);
  const response = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file: fileStream,
  });
  return response.text;
}

async function summarizeText(text) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that summarizes text. Provide a concise summary of the following transcript.',
      },
      {
        role: 'user',
        content: text,
      },
    ],
  });
  return response.choices[0].message.content;
}

async function analyzeTopics(text) {
    const response = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
            {
                role: 'system',
                content: `You are an expert analyst. Analyze the following transcript and identify the most frequently mentioned topics. Return a JSON object with a single key "frequently_mentioned_topics", which is an array of objects. Each object should have a "topic" name and its "mentions" count. List at least the top 3 topics, or more if they are prominent.

Example response format:
{
  "frequently_mentioned_topics": [
    { "topic": "Customer Onboarding", "mentions": 6 },
    { "topic": "Q4 Roadmap", "mentions": 4 }
  ]
}`
            },
            {
                role: 'user',
                content: text,
            }
        ],
        response_format: { type: 'json_object' },
    });
    return JSON.parse(response.choices[0].message.content);
}

program.parse(process.argv); 