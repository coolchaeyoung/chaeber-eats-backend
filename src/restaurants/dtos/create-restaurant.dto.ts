import { ArgsType, Field, InputType, OmitType } from "@nestjs/graphql";
import { IsBoolean, IsString } from "class-validator";
import { Restaurant } from "../entities/restaurants.entity";

@InputType()
export class CreateRestaurantDto extends OmitType(Restaurant, ["id"], InputType) {}