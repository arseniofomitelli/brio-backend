import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface WorkingHours {
  open: string;  // "10:00"
  close: string; // "22:00"
  closed?: boolean;
}

interface WorkingSchedule {
  monday: WorkingHours;
  tuesday: WorkingHours;
  wednesday: WorkingHours;
  thursday: WorkingHours;
  friday: WorkingHours;
  saturday: WorkingHours;
  sunday: WorkingHours;
}

interface ContactAttributes {
  id: number;
  restaurantName: string;
  taglineRu?: string;
  taglineIt?: string;
  phone: string;
  phoneExtra?: string;
  email: string;
  address: string;
  addressRu?: string;
  city: string;
  mapUrl?: string;
  latitude?: number;
  longitude?: number;
  instagramUrl?: string;
  facebookUrl?: string;
  telegramUrl?: string;
  whatsappUrl?: string;
  workingHours?: WorkingSchedule;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ContactCreationAttributes extends Optional<ContactAttributes, 'id'> {}

class Contact extends Model<ContactAttributes, ContactCreationAttributes> {
  declare id: number;
  declare restaurantName: string;
  declare taglineRu: string | null;
  declare taglineIt: string | null;
  declare phone: string;
  declare phoneExtra: string | null;
  declare email: string;
  declare address: string;
  declare addressRu: string | null;
  declare city: string;
  declare mapUrl: string | null;
  declare latitude: number | null;
  declare longitude: number | null;
  declare instagramUrl: string | null;
  declare facebookUrl: string | null;
  declare telegramUrl: string | null;
  declare whatsappUrl: string | null;
  declare workingHours: WorkingSchedule | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Contact.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    restaurantName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      defaultValue: 'Brio',
    },
    taglineRu: {
      type: DataTypes.STRING(300),
      allowNull: true,
    },
    taglineIt: {
      type: DataTypes.STRING(300),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    phoneExtra: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { isEmail: true },
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: 'Address in Italian',
    },
    addressRu: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Address in Russian',
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    mapUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Google Maps embed URL',
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    instagramUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    facebookUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    telegramUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    whatsappUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    workingHours: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'contacts',
    modelName: 'Contact',
  }
);

export default Contact;
