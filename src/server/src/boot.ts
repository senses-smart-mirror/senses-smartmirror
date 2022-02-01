import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import ip from 'ip';
import path from 'path';
import fileUpload from 'express-fileupload';
import socketIo from 'socket.io';
import gradient from 'gradient-string';
import figlet from 'figlet';


// global listeners
import listeners from './lib/listeners';

// custom helpers
import Logger from './lib/helpers/logger';
import { corsConfig, PORT } from './lib/constants/config';

// classes
import SmartMirror from './lib/classes/SmartMirror';
import initiateRoutes from './routes';

class Boot {
  // TODO: type these 5?
  app!: Application;
  server: any;
  io: any;
  SmartMirror: any;

  constructor() { }

  run(): void {
    console.log('\n\n');

    const introMsg = gradient('#27B5E2', '#63E227').multiline(figlet.textSync(`Senses - Smart Mirror`));
    Logger.intro(introMsg, '\n\n');

    Logger.log('[Senses] - Booting up...');

    Logger.log(`[Senses] - Configuration files path set to: \n "${global.CONFIG_PATH}"`);

    this.app = express();

    // setup global configuration
    this.setupConfig();

    // create server instance
    this.setupServer();

    // setup static folders for express
    this.setupStatics();

    // enable files upload for express
    this.setupFileUpload();

    // setup sockets
    this.setupSocketIo();

    // setup routs
    this.setupRoutes();
  }

  /**
   *  setup Express configuration
   *
   * @returns void
  */
  private setupConfig(): void {
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(cors(corsConfig));
    this.app.use(bodyParser.json());
    this.app.use(methodOverride('X-HTTP-Method-Override'));
    this.app.use(helmet({ contentSecurityPolicy: false }));
  }

  /**
   *  setup the Node - Express server
   *
   * @returns void
  */
  private setupServer(): void {
    this.server = this.app.listen(PORT, () => {
      Logger.log(`[Senses] - Now running on: ${ip.address()}:${PORT}`);
    });

    this.server.on("error", (e: any) => {
      if (e.code == "EADDRINUSE") {
        Logger.error('[App] - Address in use, retrying...');
        setTimeout(() => {
          this.server.close();
          // TODO: auto reconnect or try different port. Needs to work with socket aswell.
          this.server = this.app.listen(parseInt(PORT), () => {
            Logger.warning(`[App] - Now running on: ${ip.address()}:${parseInt(PORT)}`);
          });
        }, 5000);
      }
    });

    // close full process on abort
    process.on("SIGINT", () => {
      this.server.close(() => {
        process.exit(0);
      });
    });
    process.on("SIGTERM", () => {
      this.server.close(() => {
        process.exit(0);
      });
    });
  }

  /**
   *  configure statics
   *
   * @returns void
  */
  private setupStatics(): void {
    this.app.use(express.static(path.resolve(__dirname, "../widgets"), { maxAge: "365d" }));
    this.app.use(express.static(__dirname + "/public", { maxAge: '5000', etag: false }));
  }

  /**
   *  setup file upload configuration
   *
   * @returns void
  */
  private setupFileUpload(): void {
    this.app.use(fileUpload({ createParentPath: true }));
  }

  /**
   *  initiate socket
   *
   * @returns void
  */
  private setupSocketIo(): void {
    this.io = require("socket.io")(this.server, {
      allowEIO3: true,
      cors: {
        origin: true,
        credentials: true
      },
    });

    // Initiate Smart Mirror class
    this.SmartMirror = new SmartMirror(this.app, this.io);

    // On connection callback
    this.io.on("connection", (socket: socketIo.Socket) => {
      Logger.log('[App] - New socket opened, id:', socket.id);

      this.SmartMirror.addListenersToNewSocket(socket);
      this.SmartMirror.storeSocketConnection(socket);

      for (let listener in listeners) {
        const fn: Function = listeners[listener];
        socket.on(listener, fn(this.SmartMirror));
      }

      socket.on("disconnect", (data: Object) => {
        Logger.log('[App] - Socket disconnected, id:', socket.id);
        this.SmartMirror.removeSocketConnection(socket.id);
      });
    });
  }

  /**
   *  setup all routes
   *
   * @returns void
  */
  setupRoutes(): void {
    this.app.use(initiateRoutes(this.SmartMirror));
  }
}

export default Boot;
