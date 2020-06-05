import express from 'express';
import { celebrate, Joi } from 'celebrate';

import multer from 'multer';
import multerConfig from './config/multer';

import PointsController from './controllers/PointsController';
import ItemsController from './controllers/ItemsController';


// index -> listar um conjunto
// show -> listar um específico
// crete
// update
// delete
const routes = express.Router();
const upload = multer(multerConfig);


const pointsController = new PointsController();
const itemsController = new ItemsController();

// Lista todos os items da tabela "Items"
routes.get('/items', itemsController.index);

// Cria os Pontos de Coleta na tabela "Points"
routes.post(
  '/points', 
  upload.single('image'), 
  // celebrate faz validação
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().required().email(),
      whatsapp: Joi.number().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      city: Joi.string().required(),
      uf: Joi.string().required().max(2),
      items: Joi.string().required(),
    })
  }, {
    abortEarly: false
  }),
  pointsController.create);

routes.get('/points', pointsController.index);

routes.get('/points/:id', pointsController.show);

export default routes;