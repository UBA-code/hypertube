import { User } from 'src/users/users.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export default class RevokedToken {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ unique: true })
  token: string;

  @Column()
  type: 'accessToken' | 'foget-password-token';

  @Column()
  expiredAt: Date;

  @ManyToOne(() => User, (user) => user.revokedTokens)
  user: User;
}
