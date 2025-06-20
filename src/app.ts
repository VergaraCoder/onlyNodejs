import express, { Express, Request, Response } from 'express';
import router from './api/router.ts';
import { join } from 'node:path';
import { dbConnection } from './config/db/db.config.ts';
import { ErrorMiddleware } from './api/middlewares/error.middleware.ts';
import { runSeeders } from 'typeorm-extension';
import { SeederPriceMode } from './config/db/seeders/priceMode.seeder.ts';
import swaggerUi from 'swagger-ui-express';
import swaggerSpect from './swagger.ts';
import { createServer } from 'http';
import { DefaultEventsMap, Server } from 'socket.io';
import { SocketsRoutes } from './api/routes.socket.ts';
import cors from 'cors';

const server: Express = express();

const server2 = createServer(server);
console.log('rere');


const io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> =
  new Server(server2, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

let objectSocket;
let EventName: string;

const StartServer = async () => {
  try {
    server.use(
      cors({ origin: 'http://localhost:5173', methods: ['GET', 'POST'], credentials:true }),
    );
    SocketsRoutes(io);
    await dbConnection.initialize();
    await runSeeders(dbConnection, {
      seeds: [SeederPriceMode],
    });
    server.use(express.json());
    server.use(express.urlencoded({ extended: false }));

    server.use('/api', router);

    server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpect));

    server.use(ErrorMiddleware);
    server2.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  } catch (err: any) {
    console.log(err);
  }
};
export { objectSocket, EventName };
StartServer();
