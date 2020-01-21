import App from './app';

import * as bodyParser from 'body-parser';
import loggerMiddleware from './middleware/logger';
const device = require('express-device');

import AuthController from './controllers/auth.controller';
// import HomeController from './controllers/home/home.controller'

const app = new App({
  port: 5000,
  controllers: [new AuthController()],
  middleWares: [bodyParser.json(), bodyParser.urlencoded({ extended: true }), loggerMiddleware, device.capture()],
});

app.listen();
