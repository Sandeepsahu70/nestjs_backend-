import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserDocument = User & Document;

@Schema({timestamps: true})
export class User{
    @Prop({required: true})
    email:string;

    @Prop({required: true})
    password:string;

    @Prop({required: true})
    name:string;

    @Prop({required: true})
    age:number;

    @Prop({required: false}) // Optional field
    profileImage?: string; 
    // Image URL/path store karenge
     @Prop()
    phoneNumber?: string;

    @Prop()
    address?: string;

}

const UserSchema = SchemaFactory.createForClass(User);
export { UserSchema };