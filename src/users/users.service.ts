import { ForbiddenException, Injectable } from '@nestjs/common';
import { compare, genSalt, hash } from 'bcrypt';
import { UpdateQuery } from 'mongoose';
import { RegisterUserDto } from './dto/register-user.dto';
import { User } from './user.entity';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {

    constructor(private readonly usersRepository: UsersRepository){}

    deleteUser(){
        return this.usersRepository.findOneAndDelete({ username: 'Ali' })
    }

    findUserByEmail(email: string){
        console.log('he')
        return this.usersRepository.findOne({ email })
    }

    findUserById(id: string){
        return this.usersRepository.findOne({ _id: id })
    }

    async saveUser(userInfo: RegisterUserDto){
        const { password, hashedRefreshToken, ...savedUser } = await this.usersRepository.create({
            ...userInfo,
            hashedRefreshToken: '',
            emailIsConfirmed: false,
            imagePath: ''
        }, {})
        return savedUser
    }

    async updateUserImage(email: string, filePath: string){
        const { password, hashedRefreshToken, ...updatedUser } = await this.usersRepository.findOneAndUpdate({ email }, { imagePath: filePath })
        return updatedUser
    }

    async updateUser(id: string,  userInfo: UpdateQuery<User>){
        const { password, hashedRefreshToken, ...updatedUser } = await this.usersRepository.findOneAndUpdate({ _id: id}, userInfo)
        return updatedUser
    }

    async hashValue(data: string){
        const salt = await genSalt(10)
        return hash(data, salt)
    }

    async compareDataWithEncrypted(dataToCheck: string, encryptedData: string) {
        const isMatched = await compare(dataToCheck, encryptedData)
        return isMatched
    }

    async saveRefreshTokenToDatabase(refreshToken: string, userEmail: string){
        const hashedRefreshToken = await this.hashValue(refreshToken)
        console.log('this is your hashed refresh token', hashedRefreshToken)
        await this.usersRepository.findOneAndUpdate({ email: userEmail }, { hashedRefreshToken })
    }

    async getUserIfRefreshTokenMatches(refreshToken: string, userEmail: string){
        const user = await this.findUserByEmail(userEmail)
        const isRefreshTokenMatched = await this.compareDataWithEncrypted(refreshToken, user.hashedRefreshToken)
        const { password, hashedRefreshToken, ...safeUser } = user
        if(isRefreshTokenMatched) return safeUser
        throw new ForbiddenException('refresh token didn\'t matched')
    }

    removeRefreshTokenFromDatabase(email: string){
        return this.usersRepository.findOneAndUpdate({ email }, {
            hashedRefreshToken: ""
        })
    }

    async confirmUserEmail(userEmail: string){
        const user = await this.findUserByEmail(userEmail)
        if(user.emailIsConfirmed) throw new ForbiddenException('user email is already confirmed')
        return this.usersRepository.findOneAndUpdate({ email: userEmail }, { emailIsConfirmed: true })
    }
}
