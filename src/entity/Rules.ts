import { Entity, ObjectIdColumn, ObjectID, Column } from "typeorm";

@Entity()
export class Rules {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  illnesses_id: string;

  @Column()
  symptoms: Array<string>;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;
}
