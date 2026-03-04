import type { Connect, ViteDevServer, Plugin } from 'vite';
import { analyzeJobWithAI, chatWithAI, checkRateLimit } from '../src/services/openai-server';

export function apiMiddleware(): Plugin {
  return {
    name: 'api-middleware',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api/ai/analyze', async (req: Connect.IncomingMessage, res: any, next: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        // CORS check
        const origin = req.headers.origin;
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
          'http://localhost:8080',
          'http://localhost:3000',
          'https://permitpath.app'
        ];
        
        if (origin && !allowedOrigins.includes(origin)) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Origin not allowed' }));
          return;
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-Id');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        // Rate limiting
        const userId = req.headers['x-user-id'] as string || 'anonymous';
        if (!checkRateLimit(userId, 10, 60000)) {
          res.statusCode = 429;
          res.end(JSON.stringify({ error: 'Rate limit exceeded. Try again in a minute.' }));
          return;
        }

        // Parse body
        let body = '';
        req.on('data', (chunk: any) => body += chunk);
        req.on('end', async () => {
          try {
            const request = JSON.parse(body);
            
            // Validate required fields
            if (!request.jobType || !request.jurisdiction || !request.address) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Missing required fields: jobType, jurisdiction, address' }));
              return;
            }

            const result = await analyzeJobWithAI(request);
            res.statusCode = 200;
            res.end(JSON.stringify(result));
          } catch (error) {
            console.error('AI analyze error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ 
              error: 'Failed to analyze job',
              fallback: true,
              requirements: getFallbackRequirements(request.jobType)
            }));
          }
        });
      });

      server.middlewares.use('/api/ai/chat', async (req: Connect.IncomingMessage, res: any, next: any) => {
        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-Id');
          res.end();
          return;
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.send(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        // CORS
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');

        // Rate limiting
        const userId = req.headers['x-user-id'] as string || 'anonymous';
        if (!checkRateLimit(userId, 15, 60000)) {
          res.statusCode = 429;
          res.end(JSON.stringify({ 
            message: { role: 'assistant', content: 'Rate limit exceeded. Try again in a minute.' },
            fallback: true 
          }));
          return;
        }

        let body = '';
        req.on('data', (chunk: any) => body += chunk);
        req.on('end', async () => {
          try {
            const { messages, jobContext } = JSON.parse(body);
            
            if (!Array.isArray(messages) || messages.length === 0) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Messages array required' }));
              return;
            }

            const result = await chatWithAI(messages, jobContext);
            res.statusCode = 200;
            res.end(JSON.stringify({ message: result }));
          } catch (error) {
            console.error('Chat error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({
              message: { 
                role: 'assistant', 
                content: 'I\'m having trouble connecting. Please try again later or call (727) 464-3888 for assistance.' 
              },
              fallback: true
            }));
          }
        });
      });
    }
  };
}

function getFallbackRequirements(jobType: string) {
  return [
    {
      id: `req-fallback-1`,
      jobId: '',
      category: 'document',
      title: 'Permit Application',
      description: 'Completed permit application form',
      isRequired: true,
      confidence: 1.0,
      status: 'pending',
      actionType: 'Fill out and upload',
      sourceUrl: 'https://pinellas.gov/topic/building-development/permits/',
      minimumCriteria: 'Signed form with full property address',
      whoCanHelp: 'County permit desk',
      plainLanguageWhy: 'This starts your permit review.',
      acceptedFormats: ['PDF'],
      allowsMultipleUploads: false,
      goodUploadExample: 'Signed permit form PDF'
    },
    {
      id: `req-fallback-2`,
      jobId: '',
      category: 'license',
      title: 'Contractor License',
      description: 'Valid Florida contractor license',
      isRequired: true,
      confidence: 1.0,
      status: 'pending',
      actionType: 'Upload proof',
      sourceUrl: 'https://www.myfloridalicense.com/',
      minimumCriteria: 'Active license with matching business name',
      whoCanHelp: 'Florida DBPR support',
      plainLanguageWhy: 'County checks licensed workers for permit jobs.',
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      allowsMultipleUploads: false,
      goodUploadExample: 'License image showing expiration date'
    },
    {
      id: `req-fallback-3`,
      jobId: '',
      category: 'insurance',
      title: 'Insurance Certificate',
      description: 'General liability insurance certificate',
      isRequired: true,
      confidence: 1.0,
      status: 'pending',
      actionType: 'Request from insurer and upload',
      minimumCriteria: 'Coverage dates include permit period',
      whoCanHelp: 'Insurance agent',
      plainLanguageWhy: 'County wants active coverage during work.',
      acceptedFormats: ['PDF'],
      allowsMultipleUploads: true,
      goodUploadExample: 'Certificate with policy dates and limits'
    }
  ];
}
