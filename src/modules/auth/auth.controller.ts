
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto, UpdateProfileDto, ChangePasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { 
  Body, Controller, Post, HttpCode, HttpStatus, Get, UseGuards, 
  Request, Put, UseInterceptors, UploadedFile, 
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { multerConfig } from 'src/config/multer.config';


@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('register')
    async createUser(@Body() createUserDto: CreateUserDto) {
        return this.authService.createUser(createUserDto)
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async loginUser(@Body() loginUserDto: LoginUserDto) {
        return this.authService.loginUser(loginUserDto)
    }

    // Protected Route - JWT Token Required
    @Get('profile')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Request() req) {
        return {
            message: 'Profile fetched successfully',
            user: req.user
        };
    }


   @Post('upload-profile-image')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('profileImage',multerConfig))
    async uploadProfileImage(
        @Request() req,
        @UploadedFile() file: Express.Multer.File
    ) {
        console.log('File uploaded')
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }
        console.log(file);
        // File path generate karna
        const imageUrl = `/uploads/profiles/${file.filename}`;
        
        // Database mein image URL save karna
        const updatedUser = await this.authService.updateProfileImage(req.user._id, imageUrl);
        
        return {
            message: 'Profile image uploaded successfully',
            imageUrl: imageUrl,
            user: updatedUser
        };
    }

    // Profile Update API (existing ko modify karna)
    @Put('profile')
    @UseGuards(JwtAuthGuard)
    async updateProfile(
        @Request() req,
        @Body() updateProfileDto: UpdateProfileDto
    ) {
        return this.authService.updateProfile(req.user._id, updateProfileDto);
    }

    // Change Password API
    @Post('change-password')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async changePassword(
        @Request() req,
        
        @Body() changePasswordDto: ChangePasswordDto
    ) {
        return this.authService.changePassword(req.user._id, changePasswordDto);
    }
}


