import User from './User';
import Category from './Category';
import MenuItem from './MenuItem';
import Gallery from './Gallery';
import Contact from './Contact';

// Associations
Category.hasMany(MenuItem, {
  foreignKey: 'categoryId',
  as: 'menuItems',
  onDelete: 'RESTRICT',
});

MenuItem.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category',
});

export { User, Category, MenuItem, Gallery, Contact };
