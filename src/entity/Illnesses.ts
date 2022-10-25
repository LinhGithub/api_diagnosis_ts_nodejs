import { Entity, ObjectIdColumn, ObjectID, Column } from "typeorm";

@Entity()
export class Illnesses {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column({ default: "only" })
  rule: string;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;
}
