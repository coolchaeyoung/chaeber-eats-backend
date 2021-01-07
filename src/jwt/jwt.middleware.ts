import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { UsersService } from "src/users/users.service";
import { JwtService } from "./jwt.service";

@Injectable()
export class jwtMiddleWare implements NestMiddleware{
    constructor(private readonly jwtService: JwtService,
                private readonly userService: UsersService) {}
    async use(req: Request, res: Response, next: NextFunction) {
        if ('x-jwt' in req.headers) {
            const token = req.headers['x-jwt'];
            try {
                const decode = this.jwtService.verify(token.toString());
                if (typeof decode === 'object' && decode.hasOwnProperty('id')) {
                    const user = await this.userService.findById(decode['id']);
                    req['user'] = user;
                }
            } catch (error) {
                console.log(error);
            }
        }
        next();
    }
}