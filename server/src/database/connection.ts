import knex from 'knex';
import path from 'path';

const connection = knex ({
  client: 'sqlite3',
  connection: {
    filename: path.resolve(__dirname, 'database.sqlite') // Acessa caminhos dos arquivos
  },
  useNullAsDefault: true,
});

export default connection;

// Migrations (Knex) = Histórico do banco de dados
