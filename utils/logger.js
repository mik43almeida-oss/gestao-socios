const fs = require('fs');
const path = require('path');

// Criar diretório de logs se não existir
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'app.log');

const logger = {
  info: (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] INFO: ${message}\n`;
    console.log(`ℹ️  ${message}`);
    fs.appendFileSync(logFile, logMessage);
  },

  error: (message, error = '') => {
    const timestamp = new Date().toISOString();
    const errorDetails = error instanceof Error ? error.stack : error;
    const logMessage = `[${timestamp}] ERROR: ${message}\n${errorDetails}\n`;
    console.error(`❌ ${message}`, error);
    fs.appendFileSync(logFile, logMessage);
  },

  warn: (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] WARN: ${message}\n`;
    console.warn(`⚠️  ${message}`);
    fs.appendFileSync(logFile, logMessage);
  },

  debug: (message) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] DEBUG: ${message}\n`;
      console.log(`🐛 ${message}`);
      fs.appendFileSync(logFile, logMessage);
    }
  }
};

module.exports = logger;
