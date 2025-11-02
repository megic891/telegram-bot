import { Telegraf } from 'telegraf';
export declare class BotService {
    private readonly bot;
    private sessions;
    constructor(bot: Telegraf);
    onStart(ctx: any): Promise<void>;
    onLevelSelect(ctx: any): Promise<void>;
    private generateQuestion;
    private askQuestion;
    backToLevel(ctx: any): Promise<void>;
    restart(ctx: any): Promise<void>;
    onAnswer(ctx: any): Promise<void>;
}
