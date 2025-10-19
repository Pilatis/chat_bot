import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Middlewares globais
app.use(cors({
  origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging (opcional)
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas da API
app.use('/api', routes);

// Rota raiz
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Botatende API - SaaS de Chatbot para WhatsApp',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      company: '/api/company',
      chatbot: '/api/chatbot',
      messages: '/api/messages',
      analytics: '/api/analytics'
    }
  });
});

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

// Middleware para rotas não encontradas
app.use('/', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    path: req.originalUrl
  });
});

export default app;
