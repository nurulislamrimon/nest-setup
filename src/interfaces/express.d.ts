// src/types/express.d.ts (or any path you choose, but make sure it's included in tsconfig.json)
import { JwtPayload } from '../path/to/jwt-payload'; // Adjust the path to where you define your JwtPayload

declare module 'express' {
  export interface Request {
    user?: JwtPayload;
  }
}
