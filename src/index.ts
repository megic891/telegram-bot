
import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import fs from "fs";
import { askAI, textToSpeech } from "./ai";
import { downloadOga } from "./audio";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN!);

// === Start ===
bot.start((ctx) =>
  ctx.reply("Assalomu alaykum! Savol bering, kod yozdiring yoki ovoz yuboring.")
);

// === Matn uchun AI ===
bot.on("text", async (ctx) => {
  const userText = ctx.message.text;
  const answer = await askAI(userText);
  await ctx.reply(answer);
});

// === Voice rejim ===
bot.on("voice", async (ctx) => {
  // speech-to-text is not exported from ./ai; inform user and ask for text instead
  await ctx.reply("Kechirasiz, hozircha ovozli xabarlar qayta ishlanmaydi — iltimos, matn yuboring.");
});

// === Botni ishga tushirish ===
bot.launch();
console.log("Bot ishga tushdi…");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));