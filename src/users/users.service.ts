import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as jwt from "jsonwebtoken";
import { CreateAccountInput } from "./dtos/create-account.dto";
import { LoginInput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";
import { JwtService } from "src/jwt/jwt.service";
import { EditProfileInput } from "./dtos/edit-profile.dto";

@Injectable()
export class UsersService {
    constructor (
        @InjectRepository(User) private readonly users: Repository<User>,
        private readonly config: ConfigService,
        private readonly jwtService: JwtService
    ) {}

    async createAccount({
            email,
            password,
            role
        }: CreateAccountInput):Promise <{ok: boolean, error?:string}> {
        try {
            const exist = await this.users.findOne({ email });
            if(exist) {
                return { ok: false, error: 'There is a user with that email already' };
            }
            await this.users.save(this.users.create({ email, password, role }));
            return{ ok: true };
        } catch(e) {
            console.log(e);
            return { ok: false, error: "Couldn't create a account"};
        }
    }

    async login({
        email,
        password,
    }: LoginInput):Promise <{ok: boolean, error?:string, token?: string}> {
        try {
            const user = await this.users.findOne({ email });
            if(!user) {
                return { 
                    ok: false,
                    error: 'User not found'
                }
            }
            const passwordCorrect = await (await user).comparePassword(password);
            if(!passwordCorrect) {
                return {
                    ok: false,
                    error: 'Wrong password' 
                };
            }
            const token = this.jwtService.sign(user.id);
            return {
                ok: true,
                token
            }
        } catch(error) {
            return {
                ok: false,
                error
            }
        }
    }

    async findById(id: number): Promise<User> {
        return await this.users.findOne({id});
    }

    async editProfile(userId: number, { email, password }: EditProfileInput): Promise<User> {
        const user = await this.users.findOne(userId);
        if(email) {
            user.email = email;
        }
        if (password) {
            user.password = password;
        }
        return this.users.save(user);
    }
}