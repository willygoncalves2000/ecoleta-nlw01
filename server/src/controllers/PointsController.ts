import { Request, Response } from 'express';
import knex from '../database//connection';


class PointsController {
  async create (request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items
    } = request.body;
  
    // Usa-se "trx" no lugar de "knex" para que,
    // caso uma query dê erro, a outra também não seja executada
    // EX.: Caso no array de item haja um id que nao exista, a segunda query não
    // será executada, portanto o Ponto de Coleta não será inserido no banco de 
    // dados (primeira query)
    const trx = await knex.transaction();
  
    const point = {
      image: request.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf
    };

    // Insere um novo ponto de coleta no banco de dados
    const insertedIds = await trx('points').insert(point);
  
    //  Armazena o id do ponto que foi adicionado
    const point_id = insertedIds[0];
  
    // Percorre o array com os itens que este ponto coleta
    // e retorna o ID do Item e o ID do Ponto de Coleta
    const pointItems = items
      .split(',')
      .map((item: string) => Number(item.trim()))
      .map((item_id: number) => {
      return {
        item_id,
        point_id,
      };
    })
  
    // Insere o ID do Item e o ID do Ponto de Coleta na tabela
    // point_items, relacionado os items que esse ponto coleta
    await trx('point_items').insert(pointItems);

    await trx.commit();
  
    return response.json({
      id: point_id,
      ...point,
    });
  }

  async index (request: Request, response: Response) {
    const { city, uf, items} = request.query;

    // 
    const parsedItems = String(items)
      .split(',')
      .map(item => Number(item.trim()));

    const points = await knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*');

    const serializedPoints = points.map(point => {
        return {
          ...point, 
          image_url: `http://192.168.0.109:3333/uploads/${point.image}`,
        };
      });

    return response.json(serializedPoints);
  }

  async show (request: Request, response: Response) {
    const id = request.params.id;

    const point = await knex('points').where('id', id).first();

    if (!point) {
      return response.status(400).json({ message: 'Point not found'});
    } 

    const serializedPoint =  {
        ...point, 
        image_url: `http://192.168.0.109:3333/uploads/${point.image}`,
    };

    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id)
      .select('items.title');
    
      return response.json({point: serializedPoint, items});
  }
}

export default PointsController;