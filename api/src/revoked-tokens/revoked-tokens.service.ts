import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import RevokedToken from './revoked-tokens.entity';
import { FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class RevokedTokensService {
  constructor(
    @InjectRepository(RevokedToken)
    private revokedTokensRepo: Repository<RevokedToken>,
  ) {}

  async saveRevokedToken(token: RevokedToken) {
    return await this.revokedTokensRepo.save(token);
  }

  createRevokedToken(info: Partial<RevokedToken>) {
    return this.revokedTokensRepo.create(info);
  }

  async findOne(query: FindOneOptions<RevokedToken>) {
    return await this.revokedTokensRepo.findOne(query);
  }
}
