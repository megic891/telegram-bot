"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const telegraf_1 = require("telegraf");
const nestjs_telegraf_2 = require("nestjs-telegraf");
const telegraf_2 = require("telegraf");
let BotService = class BotService {
    bot;
    sessions = new Map();
    constructor(bot) {
        this.bot = bot;
    }
    async onStart(ctx) {
        const chatId = ctx.chat.id;
        this.sessions.delete(chatId);
        await ctx.reply(' Assalomu alaykum Matematik testga xush kelibsiz.\nDarajani tanlang:', telegraf_1.Markup.keyboard([
            [' Oson', ' Sal qiyin'],
            [' Qiyin', ' Juda qiyin'],
        ])
            .resize()
            .oneTime());
    }
    async onLevelSelect(ctx) {
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
    generateQuestion(level) {
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
    async askQuestion(ctx) {
        const chatId = ctx.chat.id;
        const session = this.sessions.get(chatId);
        if (!session)
            return;
        if (session.currentQuestion >= session.totalQuestions) {
            await ctx.reply(` Test tugadi!\n To‘g‘ri javoblar soni: ${session.score} / ${session.totalQuestions}`, telegraf_1.Markup.keyboard([
                [' Savol darajasiga qaytish'],
                [' Yana ishlash'],
            ]).resize());
            return;
        }
        const q = this.generateQuestion(session.level);
        session.currentQuestion++;
        session.currentAnswer = q.answer;
        await ctx.reply(` Savol ${session.currentQuestion}/${session.totalQuestions}\n${q.question}`, telegraf_1.Markup.keyboard([
            q.options.map((o) => o.toString()),
            [' Savol darajasiga qaytish'],
        ]).resize());
    }
    async backToLevel(ctx) {
        await this.onStart(ctx);
    }
    async restart(ctx) {
        this.sessions.delete(ctx.chat.id);
        await this.onStart(ctx);
    }
    async onAnswer(ctx) {
        const chatId = ctx.chat.id;
        const session = this.sessions.get(chatId);
        if (!session)
            return;
        const userAnswer = Number(ctx.message.text);
        if (isNaN(userAnswer))
            return;
        if (userAnswer === session.currentAnswer) {
            session.score++;
            await ctx.reply(' To‘g‘ri!');
        }
        else {
            await ctx.reply(` Noto‘g‘ri. To‘g‘ri javob: ${session.currentAnswer}`);
        }
        await this.askQuestion(ctx);
    }
};
exports.BotService = BotService;
__decorate([
    (0, nestjs_telegraf_1.Start)(),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "onStart", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)([' Oson', ' Sal qiyin', ' Qiyin', ' Juda qiyin']),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "onLevelSelect", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('🔙 Savol darajasiga qaytish'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "backToLevel", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)('Yana ishlash'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "restart", null);
__decorate([
    (0, nestjs_telegraf_1.On)('text'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BotService.prototype, "onAnswer", null);
exports.BotService = BotService = __decorate([
    (0, nestjs_telegraf_1.Update)(),
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_telegraf_2.InjectBot)()),
    __metadata("design:paramtypes", [telegraf_2.Telegraf])
], BotService);
//# sourceMappingURL=bot.service.js.map