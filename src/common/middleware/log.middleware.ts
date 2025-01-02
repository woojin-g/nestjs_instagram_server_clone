import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction } from "express";

@Injectable()
export class LogMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestTime = new Date();
    console.log(`[REQ] Log from LogMiddleware ${req.method} ${req.url} (${requestTime.toLocaleString('kr')})`);
    next();
  }
}