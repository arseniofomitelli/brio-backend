import { DataTypes, Model, Optional } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database';
import { UserRole } from '../types';

interface UserAttributes {
  id: number;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'isActive' | 'lastLoginAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> {
  declare id: number;
  declare email: string;
  declare password: string;
  declare name: string;
  declare role: UserRole;
  declare isActive: boolean;
  declare lastLoginAt: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  toJSON() {
    const values = super.toJSON() as UserAttributes;
    const { password, ...rest } = values;
    return rest;
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.MANAGER,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'User',
    hooks: {
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(user.password, 12);
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
  }
);

export default User;
