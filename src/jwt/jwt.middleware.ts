import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { JwtService } from "./jwt.service";

@Injectable()
export class jwtMiddleWare implements NestMiddleware{
    constructor(private readonly jwtService: JwtService) {}
    use(req: Request, res: Response, next: NextFunction) {
        if('x-jwt' in req.headers){
            const token = req.headers['x-jwt'];
            const decode = this.jwtService.verify(token.toString());
        }
        next();
    }
}