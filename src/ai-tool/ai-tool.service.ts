import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiToolService {
    private openai: OpenAI;

    constructor(private configService: ConfigService) {
        this.openai = new OpenAI({
            apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        });
    }

    async processClientRequirement(requirement: string) {
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert business consultant. Analyze requirements and return a JSON object with the following structure: { "projectName": string, "summary": string, "clientName": string, "companyName": string, "companyRole": string, "proposal": { "objectives": string[], "scope": string[], "timeline": string, "deliverables": string[] }, "invoice": { "invoiceNumber": string, "date": string, "items": Array<{ "description": string, "hours": number, "rate": number, "total": number }>, "grandTotal": number }, "notes": string }. Return ONLY JSON.',
                },
                {
                    role: 'user',
                    content: `Client Requirement: ${requirement}`,
                },
            ],
            response_format: { type: 'json_object' },
        });

        const content = response.choices[0].message.content;
        if (!content) {
            throw new Error('No response from AI');
        }
        return JSON.parse(content);
    }

    async generateProposal(data: any) {
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert proposal writer. Generate a professional, premium-looking proposal in Markdown format.',
                },
                {
                    role: 'user',
                    content: `Generate a detailed professional proposal based on these details: ${JSON.stringify(data)}`,
                },
            ],
        });

        return { proposal: response.choices[0].message.content };
    }

    async generateInvoice(data: any) {
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert accountant. Generate a professional invoice in Markdown table format.',
                },
                {
                    role: 'user',
                    content: `Generate an itemized invoice based on these details: ${JSON.stringify(data)}`,
                },
            ],
        });

        return { invoice: response.choices[0].message.content };
    }
}
