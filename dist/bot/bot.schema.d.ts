export interface UserSession {
    level: string;
    score: number;
    currentQuestion: number;
    totalQuestions: number;
    currentAnswer?: number;
}
