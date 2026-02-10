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
                    content: 'You are an expert business consultant and technical architect. Your job is to analyze client requirements and generate a structured proposal and an invoice draft.',
                },
                {
                    role: 'user',
                    content: `Analyze the following client requirement and provide:
1. A brief summary of the project.
2. A detailed proposal (objectives, scope, timeline, deliverables).
3. An itemized invoice draft (description of services, estimated hours, rate, and total).

Requirement: ${requirement}`,
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
