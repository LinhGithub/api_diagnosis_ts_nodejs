import { Entity, ObjectIdColumn, ObjectID, Column } from "typeorm";

@Entity()
export class Accounts {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  role: string;

  @Column()
  refreshToken: string;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;
}
