const { syncDatabase } = require('../models');

// Script para migrar/criar banco de dados
const migrate = async () => {
  try {
    console.log('🔄 Iniciando migração do banco de dados...');
    await syncDatabase();
    console.log('✅ Migração concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
};

migrate();
