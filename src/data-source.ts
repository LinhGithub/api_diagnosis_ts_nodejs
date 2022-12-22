import "reflect-metadata";
import { DataSource } from "typeorm";
import { Accounts } from "./entity/Accounts";
import { Illnesses } from "./entity/Illnesses";
import { Rules } from "./entity/Rules";

export const AppDataSource = new DataSource({
  type: "mongodb",
  database: "test",
  synchronize: true,
  logging: false,
  entities: [Accounts, Illnesses, Rules],
  migrations: [],
  subscribers: [],
  useUnifiedTopology: true,
});
