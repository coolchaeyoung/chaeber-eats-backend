import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as jwt from "jsonwebtoken";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";
import { JwtService } from "src/jwt/jwt.service";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";
import { Verification } from "./entities/verification.entity";
import { VerifyEmailInput, VerifyEmailOutput } from "./dtos/verify-email.dto";
import { UserProfileOutput } from "./dtos/user-profile.dto";

@Injectable()
export class UsersService {
    constructor (
        @InjectRepository(User) private readonly users: Repository<User>,
        @InjectRepository(Verification) private readonly verifications: Repository<Verification>,
        private readonly config: ConfigService,
        private readonly jwtService: JwtService
    ) {}

    async createAccount({
            email,
            password,
            role
        }: CreateAccountInput):Promise <CreateAccountOutput> {
        try {
            const exist = await this.users.findOne({ email });
            if(exist) {
                return { ok: false, error: 'There is a user with that email already' };
            }
            const user = await this.users.save(this.users.create({ email, password, role }));
            await this.verifications.save(this.verifications.create({ user }));
            return{ ok: true };
        } catch(e) {
            console.log(e);
            return { ok: false, error: "Couldn't create a account"};
        }
    }

    async login({ email, password }: LoginInput): Promise <LoginOutput> {
        try {
            const user = await this.users.findOne(
                { email },
                { select: ["id", "password"]}
            );
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

    async findById(id: number): Promise<UserProfileOutput> {
        try {
            const user = await this.users.findOne({id});
            if(user) {
                return { ok: true };
            };
            throw Error();
        } catch(e) {
            return { ok: false, error: 'User not found.'};
        }
    }

    async editProfile(userId: number, { email, password }: EditProfileInput): Promise<EditProfileOutput> {
        try {
            const user = await this.users.findOne(userId);
            if(email) {
                user.email = email;
                user.verified = false;
                await this.verifications.save(this.verifications.create({ user }));
            }
            if (password) {
                user.password = password;
            }
            await this.users.save(user);
            return { ok: true };
        } catch(e) {
            return { ok: false, error: 'Could not update profile.'}
        }
    }

    async verifyEmail(code: string): Promise<VerifyEmailOutput> {
        try {
            const verifycation = await this.verifications.findOne(
                { code }, 
                { relations: ["user"] }
            );
            if (verifycation) {
                verifycation.user.verified = true;
                await this.users.save(verifycation.user);
                await this.verifications.delete(verifycation.id);
                return { ok: true };
            }
            throw Error();
        } catch(error) {
            return { ok: false, error }
        }
    }
}