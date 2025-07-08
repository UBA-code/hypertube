import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ default: 'https://www.pngmart.com/files/23/Profile-PNG-Photo.png' })
  avatar: string;
  @Column()
  email: string;
  @Column()
  userName: string;
  @Column()
  lastName: string;
  @Column()
  firstName: string;
  @Column()
  password: string;
}
