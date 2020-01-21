import * as express from 'express';
import { Application } from 'express';
import { authToken, SignOptions, Secret } from 'auth-token-express';

class App {
  public app: Application;
  public port: number;

  constructor(appInit: { port: number; middleWares: any; controllers: any }) {
    this.app = express();
    this.port = appInit.port;

    this.middlewares(appInit.middleWares);
    this.routes(appInit.controllers);
    this.initilizeAuthToken();
  }

  private middlewares(middleWares: { forEach: (arg0: (middleWare: any) => void) => void }) {
    middleWares.forEach(middleWare => {
      this.app.use(middleWare);
    });
  }

  private routes(controllers: { forEach: (arg0: (controller: any) => void) => void }) {
    controllers.forEach(controller => {
      this.app.use('/', controller.router);
    });
  }

  private initilizeAuthToken() {
    const keys: Secret[] = ['secret_key_for_access', 'secret_key_for_refresh'];
    const options: SignOptions[] = [{ expiresIn: '5m' }, { expiresIn: '2d' }];
    authToken.initilize(keys, options);
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on the http://localhost:${this.port}`);
    });
  }
}

export default App;
