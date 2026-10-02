import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';

const app = express();
const isProd = process.env.NODE_ENV === 'production';

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:4173'];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS: origem não permitida'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

app.use((_, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use('/api', routes);

app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.use((_, res) => res.status(404).json({ erro: 'Rota não encontrada' }));

app.use((err, _req, res, _next) => {
  if (isProd) {
    console.error('[Erro global]', err.message);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
  console.error(err);
  res.status(500).json({ erro: err.message });
});

export default app;
