import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface GalleryAttributes {
  id: number;
  image: string;
  thumbnail?: string;
  titleRu?: string;
  titleIt?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface GalleryCreationAttributes
  extends Optional<GalleryAttributes, 'id' | 'thumbnail' | 'titleRu' | 'titleIt' | 'sortOrder' | 'isActive'> {}

class Gallery extends Model<GalleryAttributes, GalleryCreationAttributes> {
  declare id: number;
  declare image: string;
  declare thumbnail: string | null;
  declare titleRu: string | null;
  declare titleIt: string | null;
  declare sortOrder: number;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Gallery.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: 'Full-size image path',
    },
    thumbnail: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Thumbnail image path (auto-generated)',
    },
    titleRu: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    titleIt: {
      type: DataTypes.STRING(200),
      allowNull: true,
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
    tableName: 'gallery',
    modelName: 'Gallery',
    indexes: [{ fields: ['sort_order'] }, { fields: ['is_active'] }],
  }
);

export default Gallery;
