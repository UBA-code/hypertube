import { Module } from '@nestjs/common';
import { RevokedTokensController } from './revoked-tokens.controller';
import { RevokedTokensService } from './revoked-tokens.service';
import RevokedToken from './revoked-tokens.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  exports: [RevokedTokensService],
  imports: [TypeOrmModule.forFeature([RevokedToken])],
  controllers: [RevokedTokensController],
  providers: [RevokedTokensService],
})
export class RevokedTokensModule {}
