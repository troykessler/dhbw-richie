import { Column, Entity, ObjectID, ObjectIdColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class User {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  email: string;

  @Column()
  isAdmin: boolean;

  @Column()
  isReviewer: boolean;

  @Column()
  familyName: string;

  @Column()
  givenName: string;

  @Column()
  picture: string;

  @Column()
  googleId: number;

  @Column()
  created: number;
}
