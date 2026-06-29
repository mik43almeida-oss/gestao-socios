require('dotenv').config();
require('express-async-errors');

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const membersRoutes = require('./routes/members');
const paymentsRoutes = require('./routes/payments');
const invoicesRoutes = require('./routes/invoices');

const app = express();

// ==================== MIDDLEWARE DE SEGURANÇA ====================
app.use(helmet());

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Demasiadas requisições. Tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// ==================== MIDDLEWARE DE PARSING ====================
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// ==================== VIEW ENGINE ====================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ==================== ARQUIVOS ESTÁTICOS ====================
app.use(express.static(path.join(__dirname, 'public')));

// ==================== CONEXÃO AO MONGODB ====================
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('✅ MongoDB conectado com sucesso');
})
.catch(err => {
  logger.error('❌ Erro na conexão MongoDB:', err);
  process.exit(1);
});

// ==================== ROTAS ====================
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.use('/api/auth', authRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/invoices', invoicesRoutes);

// ==================== DASHBOARD ====================
app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

// ==================== ROTA 404 ====================
app.use((req, res) => {
  res.status(404).render('404', { 
    message: 'Página não encontrada' 
  });
});

// ==================== MIDDLEWARE DE TRATAMENTO DE ERROS ====================
app.use(errorHandler);

// ==================== INICIAR SERVIDOR ====================
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Servidor rodando em http://localhost:${PORT}`);
  logger.info(`📊 Ambiente: ${process.env.NODE_ENV}`);
});

// ==================== TRATAMENTO DE ERROS NÃO CAPTURADOS ====================
process.on('unhandledRejection', (err) => {
  logger.error('❌ Erro não tratado:', err);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  logger.info('📴 SIGTERM recebido. Encerrando o servidor...');
  server.close(() => {
    logger.info('✅ Servidor encerrado');
    process.exit(0);
  });
});

module.exports = app;
