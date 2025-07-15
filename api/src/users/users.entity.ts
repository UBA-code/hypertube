import RevokedToken from 'src/revoked-tokens/revoked-tokens.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ default: 'https://www.pngmart.com/files/23/Profile-PNG-Photo.png' })
  avatar: string;
  @Column()
  email: string;
  @Column({ unique: true })
  userName: string;
  @Column()
  lastName: string;
  @Column()
  firstName: string;
  @Column()
  password: string;
  @Column()
  authType: 'local' | '42' | 'google' | 'github';
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
  @OneToMany(() => RevokedToken, (token) => token.user, { cascade: true })
  revokedTokens: RevokedToken[];
}
