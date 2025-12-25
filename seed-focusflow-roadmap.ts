import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import roadmapData from "./focusflow-performance-engineer-roadmap.json";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || "focusflow";

if (!MONGO_URI) {
    throw new Error("❌ MONGO_URI is not defined in environment variables");
}

// Interface for the source JSON structure
interface RoadmapWeek {
    week: number | string;
    title: string;
    tasks: string[];
    outcome: string;
}

interface RoadmapPhase {
    phase: number;
    title: string;
    duration: string;
    theme?: string;
    weeks: RoadmapWeek[];
}

interface SourceRoadmap {
    title: string;
    description: string;
    type: string;
    status: string;
    phases: RoadmapPhase[];
}

const sourceData = roadmapData as SourceRoadmap;

function generateMarkdownContent(phases: RoadmapPhase[]): string {
    let markdown = `# ${sourceData.title}\n\n`;
    markdown += `> ${sourceData.description}\n\n`;

    phases.forEach(phase => {
        markdown += `## Phase ${phase.phase}: ${phase.title}\n`;
        if (phase.theme) markdown += `**Theme:** ${phase.theme}\n`;
        markdown += `**Duration:** ${phase.duration}\n\n`;

        phase.weeks.forEach(week => {
            markdown += `### Week ${week.week}: ${week.title}\n`;
            markdown += `**Outcome:** ${week.outcome}\n\n`;
            markdown += `**Key Tasks:**\n`;
            week.tasks.forEach(task => {
                markdown += `- ${task}\n`;
            });
            markdown += `\n`;
        });
        markdown += `---\n\n`;
    });

    return markdown;
}

function generateMilestones(phases: RoadmapPhase[]): string[] {
    const milestones: string[] = [];
    phases.forEach(phase => {
        phase.weeks.forEach(week => {
            milestones.push(`Phase ${phase.phase} - Week ${week.week}: ${week.title}`);
        });
    });
    return milestones;
}

async function seedRoadmap() {
    const client = new MongoClient(MONGO_URI!);

    try {
        await client.connect();
        console.log("✅ MongoDB connected");

        const db = client.db(DB_NAME);
        const collection = db.collection("roadmaps");

        // Transform data to match Schema
        const content = generateMarkdownContent(sourceData.phases);
        const weeklyMilestones = generateMilestones(sourceData.phases);

        const transformedRoadmap = {
            title: sourceData.title,
            description: sourceData.description,
            content: content,
            weeklyMilestones: weeklyMilestones,
            category: "Backend", // Inferred from content
            difficulty: "Advanced",
            isActive: true,
            resources: [], // Source doesn't have specific resources list
            createdAt: new Date(),
            updatedAt: new Date()
        };

        console.log("✨ Inserting new transformed roadmap...");
        await collection.insertOne(transformedRoadmap);

        console.log("🚀 FocusFlow Roadmap seeded successfully with Rich Content!");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
    } finally {
        await client.close();
    }
}

seedRoadmap();
