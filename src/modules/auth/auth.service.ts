import { BadGatewayException, BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from './schema/user.schema';
import * as bcrypt from 'bcrypt'
import { Model } from 'mongoose';
import { User } from './schema/user.schema';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, LoginUserDto, UpdateProfileDto, ChangePasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private jwtService: JwtService 
    ) {}

    async createUser(createUserDto: CreateUserDto) {
        const { name, age, email, password } = createUserDto
        const isAlreadyUser = await this.userModel.findOne({ email })
        if (isAlreadyUser) {
            throw new ConflictException('user already exist')
        }
        const newPassword = await bcrypt.hash(password, 10)
        const user = await this.userModel.create({ name, age, email, password: newPassword })
        return {
            message: 'user created successfully',
            user
        }
    }

    async loginUser(loginUserDto: LoginUserDto) {
        const { email, password } = loginUserDto;

        // 1. User find karna email se
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // 2. Password verify karna
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // 3. JWT Token generate karna
        const payload = { 
            sub: user._id, 
            email: user.email,
            name: user.name 
        };
        const access_token = this.jwtService.sign(payload);

        // 4. Success response (password hide kar ke)
        const { password: userPassword, ...userWithoutPassword } = user.toObject();

        return {
            message: 'Login successful',
            access_token, // JWT token return karna
            expires_in: '24h',
            user: userWithoutPassword
        };
    }

async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    // Check if updateProfileDto is empty or undefined
    if (!updateProfileDto || Object.keys(updateProfileDto).length === 0) {
        throw new BadRequestException('No fields provided to update');
    }

    const { email } = updateProfileDto;

    // Agar email update kar rahe hain to check karo duplicate to nahi
    if (email) {
        const existingUser = await this.userModel.findOne({ 
            email, 
            _id: { $ne: userId }
        });
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }
    }

    // Profile update karo
    const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        { $set: updateProfileDto },
        { new: true }
    );

    if (!updatedUser) {
        throw new UnauthorizedException('User not found');
    }

    const { password, ...userWithoutPassword } = updatedUser.toObject();

    return {
        message: 'Profile updated successfully',
        user: userWithoutPassword
    };
}


async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    // User find karo
    const user = await this.userModel.findById(userId);
    if (!user) {
        throw new UnauthorizedException('User not found');
    }

    // Current password verify karo
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
    }

    // New password hash karo
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Password update karo
    await this.userModel.findByIdAndUpdate(userId, {
        password: hashedNewPassword
    });

    return {
        message: 'Password changed successfully'
    };
}

// auth.service.ts mein add karo
async updateProfileImage(userId: string, imageUrl: string) {
    const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        { profileImage: imageUrl },
        { new: true }
    );

    if (!updatedUser) {
        throw new UnauthorizedException('User not found');
    }

    const { password, ...userWithoutPassword } = updatedUser.toObject();
    return userWithoutPassword;
}


}
