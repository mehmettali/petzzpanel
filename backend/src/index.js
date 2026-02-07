import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import { initDatabase } from './db/database.js';
import productsRouter from './routes/products.js';
import analyticsRouter from './routes/analytics.js';
import qualityRouter from './routes/quality.js';
import syncRouter from './routes/sync.js';
import purchasingRouter from './routes/purchasing.js';
import detectiveRouter from './routes/detective.js';
import storefrontRouter from './routes/storefront.js';
import datacenterRouter from './routes/datacenter.js';
import categoryRouter from './routes/category.js';
import datasourcesRouter from './routes/datasources.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging with timing
app.use((req, res, next) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = duration > 1000 ? '⚠️ SLOW' : '✓';
    console.log(`${timestamp} ${logLevel} ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });

  next();
});

// Routes
app.use('/api/products', productsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/quality', qualityRouter);
app.use('/api/sync', syncRouter);
app.use('/api/purchasing', purchasingRouter);
app.use('/api/detective', detectiveRouter);
app.use('/api/storefront', storefrontRouter);
app.use('/api/datacenter', datacenterRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/datasources', datasourcesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error('   Path:', req.path);
  console.error('   Stack:', err.stack?.split('\n').slice(0, 3).join('\n'));

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Initialize database and start server
async function start() {
  try {
    await initDatabase();
    console.log('Database initialized');

    app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════════════╗
║           Petzz Panel Backend Server                         ║
╠══════════════════════════════════════════════════════════════╣
║  Server running at: http://localhost:${PORT}                    ║
║                                                              ║
║  Endpoints:                                                  ║
║    /api/products      - Product operations                   ║
║    /api/analytics     - Analytics & reports                  ║
║    /api/quality       - Data quality checks                  ║
║    /api/sync          - Data synchronization                 ║
║    /api/purchasing    - Purchasing & inventory               ║
║    /api/storefront    - Storefront (ikas) integration        ║
║    /api/datacenter    - Data Center (kalite & görevler)      ║
║    /api/categories    - Google Taxonomy & kategoriler        ║
║                                                              ║
║  Press Ctrl+C to stop                                        ║
╚══════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

export default app;
