export interface StartupInfo {
    team: string;
    idea: string;
    prototype: string;
    plan: string;
    relationships: string;
}

export interface FormatInputRequest {
    clientAnswer: string;
}

export interface FormatInputResponse {
    original: string;
    formatted: StartupInfo;
}

export interface PointScore {
    team: number;
    idea: number;
    prototype: number;
    plan: number;
    relationships: number;
    totalScore: number;
}

export interface PointResponse {
    Team: number;
    Idea: number;
    Prototype: number;
    Plan: number;
    Relationships: number;
    TotalScore: number;
}

export interface GeminiRequest {
    prompt: string;
    startupInfo?: StartupInfo;
}

export interface GeminiResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}
