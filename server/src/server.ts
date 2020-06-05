import express, { response, request, json } from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';
import { errors } from 'celebrate';


const app = express();

app.use(cors());

// Faz o express entender dados em JSON 
app.use(express.json());
app.use(routes);

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.use(errors());

app.listen(3333);


// Rota: Endereço completo da requisição
// Recurso: Qual entidade estamos acessando do sistema

// GET: Buscar uma ou mais informações do back-end
// POST: Criar uma nova informação no back-end
// PUT: Atualizar uma informação existente no back-end
// DELETE: Remover uma informação do back-end

// POST http://localhost:3333/users = Criar um usuário
// GET http://localhost:3333/users = Listar usuários
// GET http://localhost:3333/users/5 = Buscar dados do usuário com ID 5

// Request Param: Paramêtros que vem na própria rota que identificam recursos
// Query Param: Paramêtros que vem na própria rota geralmente opcionais para filtros, paginação...
// Request Body: Paramêtros para criação/atualização de informações

// SELECT * FROM users WHERE name = 'Willy'   => SQL
// knex('users').where('name','Willy').select('*')   => with Knex.js
