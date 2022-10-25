import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Illnesses } from "./entity/Illnesses";
import { Rules } from "./entity/Rules";

export const AppDataSource = new DataSource({
  type: "mongodb",
  database: "test",
  synchronize: true,
  logging: false,
  entities: [User, Illnesses, Rules],
  migrations: [],
  subscribers: [],
  useUnifiedTopology: true,
});
