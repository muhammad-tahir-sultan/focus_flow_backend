import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Roadmap, RoadmapDocument } from './schemas/roadmap.schema';

@Injectable()
export class RoadmapSeedingService implements OnModuleInit {
    constructor(@InjectModel(Roadmap.name) private roadmapModel: Model<RoadmapDocument>) { }

    async onModuleInit() {
        const count = await this.roadmapModel.countDocuments().exec();
        if (count === 0) {
            await this.seed();
        }
    }

    async seed() {
        const roadmaps = [
            {
                title: 'Full-Stack MERN Development',
                description: 'Master the complete MERN stack (MongoDB, Express, React, Node.js) to build production-ready web applications from scratch.',
                category: 'Full-Stack',
                difficulty: 'Intermediate',
                weeklyMilestones: [
                    'Week 1: Node.js fundamentals and Express server setup',
                    'Week 2: MongoDB schema design and Mongoose integration',
                    'Week 3: React components and state management',
                    'Week 4: REST API development and authentication',
                    'Week 5: Frontend-backend integration',
                    'Week 6: Deployment and production optimization'
                ],
                resources: [
                    'https://www.mongodb.com/docs/',
                    'https://expressjs.com/en/guide/routing.html',
                    'https://react.dev/',
                    'https://nodejs.org/en/docs/'
                ],
                isActive: true
            },
            {
                title: 'Advanced React Patterns',
                description: 'Deep dive into advanced React patterns including custom hooks, context optimization, and performance tuning.',
                category: 'Frontend',
                difficulty: 'Advanced',
                weeklyMilestones: [
                    'Week 1: Custom hooks and composition patterns',
                    'Week 2: Context API and state management strategies',
                    'Week 3: Performance optimization with React.memo and useMemo',
                    'Week 4: Code splitting and lazy loading',
                    'Week 5: Advanced TypeScript with React',
                    'Week 6: Testing strategies and best practices'
                ],
                resources: [
                    'https://react.dev/learn',
                    'https://kentcdodds.com/blog',
                    'https://www.patterns.dev/'
                ],
                isActive: true
            },
            {
                title: 'NestJS Backend Architecture',
                description: 'Build scalable, maintainable backend systems using NestJS with TypeScript, focusing on clean architecture and best practices.',
                category: 'Backend',
                difficulty: 'Advanced',
                weeklyMilestones: [
                    'Week 1: NestJS fundamentals and dependency injection',
                    'Week 2: Database integration with TypeORM/Mongoose',
                    'Week 3: Authentication and authorization (JWT, Guards)',
                    'Week 4: Advanced validation and error handling',
                    'Week 5: Microservices and message queues',
                    'Week 6: Testing, logging, and monitoring'
                ],
                resources: [
                    'https://docs.nestjs.com/',
                    'https://www.typescriptlang.org/docs/',
                    'https://github.com/nestjs/nest'
                ],
                isActive: true
            },
            {
                title: 'Docker & Kubernetes Essentials',
                description: 'Learn containerization and orchestration to deploy and manage applications at scale.',
                category: 'DevOps',
                difficulty: 'Intermediate',
                weeklyMilestones: [
                    'Week 1: Docker fundamentals and Dockerfile creation',
                    'Week 2: Docker Compose for multi-container apps',
                    'Week 3: Kubernetes architecture and core concepts',
                    'Week 4: Deployments, Services, and ConfigMaps',
                    'Week 5: Persistent storage and StatefulSets',
                    'Week 6: Monitoring, logging, and scaling strategies'
                ],
                resources: [
                    'https://docs.docker.com/',
                    'https://kubernetes.io/docs/',
                    'https://www.cncf.io/'
                ],
                isActive: true
            },
            {
                title: 'System Design for Interviews',
                description: 'Master system design principles and patterns commonly asked in senior engineering interviews.',
                category: 'System Design',
                difficulty: 'Advanced',
                weeklyMilestones: [
                    'Week 1: Scalability fundamentals and load balancing',
                    'Week 2: Database design and sharding strategies',
                    'Week 3: Caching layers and CDN architecture',
                    'Week 4: Message queues and event-driven systems',
                    'Week 5: Microservices vs monoliths',
                    'Week 6: Case studies (Twitter, Netflix, Uber)'
                ],
                resources: [
                    'https://github.com/donnemartin/system-design-primer',
                    'https://www.educative.io/courses/grokking-the-system-design-interview',
                    'https://bytebytego.com/'
                ],
                isActive: true
            },
            {
                title: 'TypeScript Mastery',
                description: 'Go beyond the basics to master advanced TypeScript features for building type-safe, scalable applications.',
                category: 'Frontend',
                difficulty: 'Intermediate',
                weeklyMilestones: [
                    'Week 1: Advanced types (union, intersection, mapped types)',
                    'Week 2: Generics and conditional types',
                    'Week 3: Utility types and type guards',
                    'Week 4: Decorators and metadata reflection',
                    'Week 5: TypeScript with React and Node.js',
                    'Week 6: tsconfig optimization and tooling'
                ],
                resources: [
                    'https://www.typescriptlang.org/docs/',
                    'https://www.totaltypescript.com/',
                    'https://github.com/type-challenges/type-challenges'
                ],
                isActive: true
            },
            {
                title: 'CI/CD Pipeline Automation',
                description: 'Automate your deployment workflow with modern CI/CD tools and practices.',
                category: 'DevOps',
                difficulty: 'Intermediate',
                weeklyMilestones: [
                    'Week 1: Git workflows and branching strategies',
                    'Week 2: GitHub Actions fundamentals',
                    'Week 3: Automated testing in CI pipelines',
                    'Week 4: Docker image building and registry management',
                    'Week 5: Deployment strategies (blue-green, canary)',
                    'Week 6: Monitoring and rollback automation'
                ],
                resources: [
                    'https://docs.github.com/en/actions',
                    'https://www.jenkins.io/doc/',
                    'https://circleci.com/docs/'
                ],
                isActive: true
            },
            {
                title: 'GraphQL API Development',
                description: 'Build efficient, flexible APIs using GraphQL with Apollo Server and client-side integration.',
                category: 'Backend',
                difficulty: 'Intermediate',
                weeklyMilestones: [
                    'Week 1: GraphQL fundamentals and schema design',
                    'Week 2: Apollo Server setup and resolvers',
                    'Week 3: DataLoaders and N+1 problem solutions',
                    'Week 4: Authentication and authorization',
                    'Week 5: Subscriptions and real-time updates',
                    'Week 6: Performance optimization and caching'
                ],
                resources: [
                    'https://graphql.org/learn/',
                    'https://www.apollographql.com/docs/',
                    'https://www.howtographql.com/'
                ],
                isActive: true
            }
        ];

        await this.roadmapModel.insertMany(roadmaps);
        console.log(`Seeded ${roadmaps.length} Technology Roadmaps`);
    }
}
