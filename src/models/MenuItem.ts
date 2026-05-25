import { DataTypes, Model, Optional, Association } from 'sequelize';
import { sequelize } from '../config/database';

interface MenuItemAttributes {
  id: number;
  categoryId: number;
  nameRu: string;
  nameIt: string;
  descriptionRu?: string;
  descriptionIt?: string;
  price: number;
  weight?: number;
  calories?: number;
  image?: string;
  allergens?: string[];
  tags?: string[];
  isAvailable: boolean;
  isSpecial: boolean;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MenuItemCreationAttributes
  extends Optional<
    MenuItemAttributes,
    | 'id'
    | 'descriptionRu'
    | 'descriptionIt'
    | 'weight'
    | 'calories'
    | 'image'
    | 'allergens'
    | 'tags'
    | 'isAvailable'
    | 'isSpecial'
    | 'sortOrder'
  > {}

class MenuItem extends Model<MenuItemAttributes, MenuItemCreationAttributes> {
  declare id: number;
  declare categoryId: number;
  declare nameRu: string;
  declare nameIt: string;
  declare descriptionRu: string | null;
  declare descriptionIt: string | null;
  declare price: number;
  declare weight: number | null;
  declare calories: number | null;
  declare image: string | null;
  declare allergens: string[] | null;
  declare tags: string[] | null;
  declare isAvailable: boolean;
  declare isSpecial: boolean;
  declare sortOrder: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static associations: {
    category: Association<MenuItem, import('./Category').default>;
  };
}

MenuItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'categories', key: 'id' },
    },
    nameRu: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Dish name in Russian',
    },
    nameIt: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Dish name in Italian',
    },
    descriptionRu: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    descriptionIt: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    weight: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Weight in grams',
    },
    calories: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Calories per serving',
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    allergens: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
      comment: 'List of allergens',
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
      comment: 'Tags: vegetarian, vegan, spicy, gluten-free, etc.',
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isSpecial: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Featured / special offer item',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'menu_items',
    modelName: 'MenuItem',
    indexes: [
      { fields: ['category_id'] },
      { fields: ['is_available'] },
      { fields: ['is_special'] },
      { fields: ['sort_order'] },
    ],
  }
);

export default MenuItem;
