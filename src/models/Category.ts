import { DataTypes, Model, Optional, Association } from 'sequelize';
import { sequelize } from '../config/database';
import MenuItem from './MenuItem';

interface CategoryAttributes {
  id: number;
  nameRu: string;
  nameIt: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CategoryCreationAttributes
  extends Optional<CategoryAttributes, 'id' | 'description' | 'image' | 'sortOrder' | 'isActive'> {}

class Category extends Model<CategoryAttributes, CategoryCreationAttributes> {
  declare id: number;
  declare nameRu: string;
  declare nameIt: string;
  declare slug: string;
  declare description: string | null;
  declare image: string | null;
  declare sortOrder: number;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare menuItems?: MenuItem[];

  static associations: {
    menuItems: Association<Category, MenuItem>;
  };
}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nameRu: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Category name in Russian',
    },
    nameIt: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Category name in Italian',
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: 'URL-friendly identifier',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Image file path',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'categories',
    modelName: 'Category',
    indexes: [{ fields: ['slug'] }, { fields: ['sort_order'] }, { fields: ['is_active'] }],
  }
);

export default Category;
