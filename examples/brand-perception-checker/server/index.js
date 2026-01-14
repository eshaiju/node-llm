import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { auditBrand, getAuditStream } from './llm/agent.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST']
}));
app.use(express.json());

/**
 * Audit Endpoint
 * Primary entry point for brand perception diagnostics.
 */
app.post('/analyze', async (req, res) => {
  const { brandName } = req.body;
  if (!brandName) {
    return res.status(400).json({ error: 'SYSTEM_ERROR: brandName is required' });
  }

  try {
    const report = await auditBrand(brandName);
    res.json(report);
  } catch (error) {
    console.error('[Controller] AUDIT_FAILURE:', error);
    res.status(500).json({ error: 'INTERNAL_SYSTEM_FAILURE during audit trace' });
  }
});

/**
 * Live Narrative Endpoint (Optional for dashboard)
 */
app.get('/stream', async (req, res) => {
  const { brandName } = req.query;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = getAuditStream(brandName);
    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    }
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
  }
  res.end();
});

app.get('/health', (req, res) => res.json({ status: 'operational' }));

app.listen(port, () => {
  console.log(`[System] Multi-Provider Auditor running on port ${port}`);
});
