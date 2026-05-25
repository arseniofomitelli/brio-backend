import { Sequelize } from 'sequelize';
import { config } from './config';
import { logger } from '../utils/logger';

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  username: config.db.user,
  password: config.db.password,
  logging: config.env === 'development' ? (msg) => logger.debug(msg) : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    underscored: true,
    timestamps: true,
  },
});

export const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('PostgreSQL connection established successfully');
    await sequelize.sync({ alter: config.env === 'development' });
    logger.info('Database synchronized');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};
