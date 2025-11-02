import { Injectable } from '@nestjs/common';
import { Ctx, Start, Update, On, Hears } from 'nestjs-telegraf';
import { Markup } from 'telegraf';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { UserSession } from './bot.schema';

@Update()
@Injectable()
export class BotService {
  private sessions = new Map<number, UserSession>();

  constructor(@InjectBot() private readonly bot: Telegraf) {}//

  
  @Start()
  async onStart(@Ctx() ctx) {
    const chatId = ctx.chat.id;
    this.sessions.delete(chatId);

    await ctx.reply(
      ' Assalomu alaykum Matematik testga xush kelibsiz.\nDarajani tanlang:',
      Markup.keyboard([
        [' Oson', ' Sal qiyin'],
        [' Qiyin', ' Juda qiyin'],
      ])
        .resize()
        .oneTime(),
    );
  }

  @Hears([' Oson', ' Sal qiyin', ' Qiyin', ' Juda qiyin'])
  async onLevelSelect(@Ctx() ctx) {
    const levelText = ctx.message.text;
    const chatId = ctx.chat.id;

    
    const levelMap = {
      ' Oson': 'easy',
      ' Sal qiyin': 'medium',
      ' Qiyin': 'hard',
      ' Juda qiyin': 'expert',
    };
    const level = levelMap[levelText] || 'easy';

    this.sessions.set(chatId, {
      level,
      score: 0,
      currentQuestion: 0,
      totalQuestions: 10,
    });

    await ctx.reply(`Siz "${levelText}" darajani tanladingiz.`);
    await this.askQuestion(ctx);
  }

  
  private generateQuestion(level: string) {
    const operators = ['+', '-', '*', '/'];
    const op = operators[Math.floor(Math.random() * operators.length)];

    let a = 0;
    let b = 0;

    switch (level) {
      case 'easy':
        a = Math.floor(Math.random() * 10);
        b = Math.floor(Math.random() * 10);
        break;
      case 'medium':
        a = Math.floor(Math.random() * 50);
        b = Math.floor(Math.random() * 50);
        break;
      case 'hard':
        a = Math.floor(Math.random() * 100);
        b = Math.floor(Math.random() * 100);
        break;
      case 'expert':
        a = Math.floor(Math.random() * 200);
        b = Math.floor(Math.random() * 200);
        break;
    }

    let answer = 0;
    switch (op) {
      case '+':
        answer = a + b;
        break;
      case '-':
        answer = a - b;
        break;
      case '*':
        answer = a * b;
        break;
      case '/':
        answer = parseFloat((a / (b || 1)).toFixed(2));
        break;
    }

    const options = [
      answer,
      answer + Math.floor(Math.random() * 5) + 1,
      answer - Math.floor(Math.random() * 5) - 1,
    ]
      .map((x) => Math.round(x * 100) / 100)
      .sort(() => Math.random() - 0.5);

    return { question: `${a} ${op} ${b} = ?`, answer, options };
  }

  private async askQuestion(ctx) {
    const chatId = ctx.chat.id;
    const session = this.sessions.get(chatId);
    if (!session) return;

    
    if (session.currentQuestion >= session.totalQuestions) {
      await ctx.reply(
        ` Test tugadi!\n To‘g‘ri javoblar soni: ${session.score} / ${session.totalQuestions}`,
        Markup.keyboard([
          [' Savol darajasiga qaytish'],
          [' Yana ishlash'],
        ]).resize(),
      );
      return;
    }

    const q = this.generateQuestion(session.level);
    session.currentQuestion++;
    session.currentAnswer = q.answer;

    await ctx.reply(
      ` Savol ${session.currentQuestion}/${session.totalQuestions}\n${q.question}`,
      Markup.keyboard([
        q.options.map((o) => o.toString()),
        [' Savol darajasiga qaytish'],
      ]).resize(),
    );
  }

  
  @Hears('🔙 Savol darajasiga qaytish')
  async backToLevel(@Ctx() ctx) {
    await this.onStart(ctx);
  }


  @Hears('Yana ishlash')
  async restart(@Ctx() ctx) {
    this.sessions.delete(ctx.chat.id);
    await this.onStart(ctx);
  }

  
  @On('text')
  async onAnswer(@Ctx() ctx) {
    const chatId = ctx.chat.id;
    const session = this.sessions.get(chatId);
    if (!session) return;

    const userAnswer = Number(ctx.message.text);
    if (isNaN(userAnswer)) return;

    if (userAnswer === session.currentAnswer) {
      session.score++;
      await ctx.reply(' To‘g‘ri!');
    } else {
      await ctx.reply(` Noto‘g‘ri. To‘g‘ri javob: ${session.currentAnswer}`);
    }

    await this.askQuestion(ctx);
  }
}