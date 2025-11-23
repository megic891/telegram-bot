
import OpenAI from "openai";
import fs from "fs";
import os from "os";
import path from "path";

const client = new OpenAI({
  apiKey: process.env.OPENAI_KEY!,
});

// === Matndan AI javobi ===
export async function askAI(prompt: string): Promise<string> {
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini", 
    messages: [{ role: "user", content: prompt }],
  });

  return res.choices[0].message.content || "Javob topilmadi.";
}

// === Ovozdan matnga ===
export async function speechToText(buffer: Buffer): Promise<string> {
  // write buffer to a temporary file and pass a read stream to the SDK
  const tmpDir = os.tmpdir();
  const tmpPath = path.join(tmpDir, `voice-${Date.now()}.tmp`);
  await fs.promises.writeFile(tmpPath, buffer);

  try {
    const stream = fs.createReadStream(tmpPath);
    const res = await client.audio.transcriptions.create({
      file: stream,
      model: "gpt-4o-mini-tts",
    });

    return res.text;
  } finally {
    // best-effort cleanup
    fs.promises.unlink(tmpPath).catch(() => {});
  }
}

// === Matndan ovoz ===
export async function textToSpeech(text: string): Promise<Buffer> {
  const res = await client.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: "alloy",
    input: text,
  });

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}