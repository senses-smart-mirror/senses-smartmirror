import { CorsOptions } from 'cors';
import * as ip from 'ip';

// default port
export const PORT = '7011';

// cors whitelist configuration
const whitelist = ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', `http://${ip.address()}:${PORT}`];

export const corsConfig:CorsOptions = {
  origin: whitelist
}
