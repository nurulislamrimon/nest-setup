import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { envConfig } from './env.config';
import { DataSource } from 'typeorm';

export const localDBConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  url: envConfig.local_db_url,
  //   host: 'localhost',
  //   port: 3306,
  //   username: 'root',
  //   password: envConfig.db_password,
  //   database: 'central_support_nest',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
};

const prodDBConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  url: envConfig.prod_db_url,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,
};

const dbConfig =
  envConfig.environment === 'production' ? prodDBConfig : localDBConfig;

export const dataSource = new DataSource({
  ...dbConfig,
  type: 'mysql',
});
