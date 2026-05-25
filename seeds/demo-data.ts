/**
 * Demo seed: creates admin user + full Italian cafe menu
 * Run: npx ts-node seeds/demo-data.ts
 */
import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../src/config/database';
import { User, Category, MenuItem, Contact } from '../src/models';
import { UserRole } from '../src/types';
import '../src/models/index'; // load associations

async function seed() {
  await connectDB();

  console.log('🌱 Seeding database...');

  // ─── Admin user ────────────────────────────────────────────────────────────
  const [admin] = await User.findOrCreate({
    where: { email: 'admin@brio-cafe.ru' },
    defaults: {
      email: 'admin@brio-cafe.ru',
      password: 'admin123',
      name: 'Администратор',
      role: UserRole.ADMIN,
    },
  });
  console.log(`✅ Admin user: admin@brio-cafe.ru / admin123`);

  // ─── Contacts ──────────────────────────────────────────────────────────────
  await Contact.findOrCreate({
    where: { id: 1 },
    defaults: {
      restaurantName: 'Brio',
      taglineRu: 'Итальянское кафе',
      taglineIt: 'Caffè italiano',
      phone: '+7 (495) 123-45-67',
      email: 'info@brio-cafe.ru',
      address: 'ул. Тверская, 12, Москва',
      addressRu: 'ул. Тверская, 12, Москва',
      city: 'Москва',
      instagramUrl: 'https://instagram.com/brio_cafe',
      telegramUrl: 'https://t.me/brio_cafe',
      workingHours: {
        monday:    { open: '10:00', close: '22:00' },
        tuesday:   { open: '10:00', close: '22:00' },
        wednesday: { open: '10:00', close: '22:00' },
        thursday:  { open: '10:00', close: '22:00' },
        friday:    { open: '10:00', close: '23:00' },
        saturday:  { open: '11:00', close: '23:00' },
        sunday:    { open: '11:00', close: '21:00' },
      },
    },
  });
  console.log('✅ Contacts created');

  // ─── Menu Categories ───────────────────────────────────────────────────────
  const categoryData = [
    { nameRu: 'Закуски',        nameIt: 'Antipasti',   slug: 'antipasti',   sortOrder: 1 },
    { nameRu: 'Первые блюда',   nameIt: 'Primi Piatti',slug: 'primi',       sortOrder: 2 },
    { nameRu: 'Вторые блюда',   nameIt: 'Secondi',     slug: 'secondi',     sortOrder: 3 },
    { nameRu: 'Паста',          nameIt: 'Pasta',       slug: 'pasta',       sortOrder: 4 },
    { nameRu: 'Пицца',          nameIt: 'Pizza',       slug: 'pizza',       sortOrder: 5 },
    { nameRu: 'Десерты',        nameIt: 'Dolci',       slug: 'dolci',       sortOrder: 6 },
    { nameRu: 'Напитки',        nameIt: 'Bevande',     slug: 'bevande',     sortOrder: 7 },
    { nameRu: 'Кофе',           nameIt: 'Caffè',       slug: 'caffe',       sortOrder: 8 },
  ];

  const categories: Record<string, Category> = {};
  for (const data of categoryData) {
    const [cat] = await Category.findOrCreate({ where: { slug: data.slug }, defaults: data });
    categories[data.slug] = cat;
  }
  console.log('✅ Categories created');

  // ─── Menu Items ────────────────────────────────────────────────────────────
  const items = [
    // Antipasti
    { slug: 'antipasti', nameRu: 'Брускетта с томатами', nameIt: 'Bruschetta al pomodoro', descriptionRu: 'Хрустящий хлеб, томаты черри, базилик, оливковое масло', price: 320, weight: 120, tags: ['vegetarian'], isSpecial: false },
    { slug: 'antipasti', nameRu: 'Карпаччо из говядины', nameIt: 'Carpaccio di manzo', descriptionRu: 'Тонко нарезанная говядина с руколой, пармезаном и лимонным дрессингом', price: 890, weight: 150, allergens: ['gluten', 'dairy'], isSpecial: true },
    { slug: 'antipasti', nameRu: 'Буррата с томатами', nameIt: 'Burrata con pomodori', descriptionRu: 'Нежная буррата, томаты, базилик, оливковое масло extra virgin', price: 750, weight: 200, tags: ['vegetarian'], allergens: ['dairy'] },
    { slug: 'antipasti', nameRu: 'Тальере итальяно', nameIt: 'Tagliere italiano', descriptionRu: 'Ассорти из итальянских мясных деликатесов: прошутто, салями, мортаделла', price: 1200, weight: 250 },

    // Primi Piatti
    { slug: 'primi', nameRu: 'Суп минестроне', nameIt: 'Minestrone', descriptionRu: 'Традиционный итальянский овощной суп с пастой', price: 380, weight: 300, tags: ['vegetarian'], isSpecial: false },
    { slug: 'primi', nameRu: 'Риболлита', nameIt: 'Ribollita', descriptionRu: 'Тосканский хлебный суп с белой фасолью и капустой кале', price: 420, weight: 320, tags: ['vegetarian'] },

    // Secondi
    { slug: 'secondi', nameRu: 'Филе лосося гриль', nameIt: 'Salmone alla griglia', descriptionRu: 'Стейк лосося с лимонным маслом, каперсами и руколой', price: 1350, weight: 200, allergens: ['fish'], isSpecial: true },
    { slug: 'secondi', nameRu: 'Куриный роллатини', nameIt: 'Rotolini di pollo', descriptionRu: 'Куриное филе с начинкой из шпината и рикотты в томатном соусе', price: 890, weight: 250, allergens: ['dairy'] },
    { slug: 'secondi', nameRu: 'Оссобуко', nameIt: 'Ossobuco alla milanese', descriptionRu: 'Телячья голяшка тушёная по-миланки с гремолатой, подаётся с ризотто', price: 1650, weight: 350, isSpecial: true },

    // Pasta
    { slug: 'pasta', nameRu: 'Спагетти карбонара', nameIt: 'Spaghetti alla carbonara', descriptionRu: 'Классическая карбонара: гуанчале, яйцо, пекорино, черный перец', price: 620, weight: 250, allergens: ['gluten', 'eggs', 'dairy'], isSpecial: true },
    { slug: 'pasta', nameRu: 'Тальятелле болоньезе', nameIt: 'Tagliatelle al ragù bolognese', descriptionRu: 'Свежая паста тальятелле с настоящим рагу болоньезе', price: 680, weight: 280, allergens: ['gluten', 'eggs'] },
    { slug: 'pasta', nameRu: 'Пенне аррабьята', nameIt: 'Penne all\'arrabbiata', descriptionRu: 'Острый томатный соус с чесноком и пеперончино', price: 520, weight: 250, tags: ['vegetarian', 'spicy'], allergens: ['gluten'] },
    { slug: 'pasta', nameRu: 'Ризотто с грибами', nameIt: 'Risotto ai funghi porcini', descriptionRu: 'Сливочное ризотто с белыми грибами и трюфельным маслом', price: 750, weight: 280, tags: ['vegetarian'], allergens: ['dairy'] },
    { slug: 'pasta', nameRu: 'Равиоли с рикоттой', nameIt: 'Ravioli di ricotta e spinaci', descriptionRu: 'Домашние равиоли с начинкой из рикотты и шпината, соус сливочно-шалфейный', price: 720, weight: 250, tags: ['vegetarian'], allergens: ['gluten', 'eggs', 'dairy'] },

    // Pizza
    { slug: 'pizza', nameRu: 'Маргарита', nameIt: 'Pizza Margherita', descriptionRu: 'Томатный соус, моцарелла фиор ди латте, базилик', price: 580, weight: 400, tags: ['vegetarian'], allergens: ['gluten', 'dairy'] },
    { slug: 'pizza', nameRu: 'Дьябола', nameIt: 'Pizza Diavola', descriptionRu: 'Томатный соус, моцарелла, острая салями, перепелончино', price: 720, weight: 430, tags: ['spicy'], allergens: ['gluten', 'dairy'], isSpecial: true },
    { slug: 'pizza', nameRu: 'Четыре сезона', nameIt: 'Pizza Quattro Stagioni', descriptionRu: 'Томатный соус, моцарелла, грибы, ветчина, артишоки, оливки', price: 780, weight: 450, allergens: ['gluten', 'dairy'] },
    { slug: 'pizza', nameRu: 'Тартуфо', nameIt: 'Pizza al Tartufo', descriptionRu: 'Белый соус, моцарелла, трюфельное масло, руккола, пармезан', price: 950, weight: 400, tags: ['vegetarian'], allergens: ['gluten', 'dairy'], isSpecial: true },

    // Dolci
    { slug: 'dolci', nameRu: 'Тирамису', nameIt: 'Tiramisù', descriptionRu: 'Классический тирамису с маскарпоне, савоярди и эспрессо', price: 420, weight: 150, tags: ['vegetarian'], allergens: ['gluten', 'eggs', 'dairy'], isSpecial: true },
    { slug: 'dolci', nameRu: 'Панна котта', nameIt: 'Panna cotta', descriptionRu: 'Нежная панна котта с соусом из ягод', price: 380, weight: 150, tags: ['vegetarian', 'gluten-free'], allergens: ['dairy'] },
    { slug: 'dolci', nameRu: 'Канноли сицилийские', nameIt: 'Cannoli siciliani', descriptionRu: 'Хрустящие трубочки с кремом из рикотты и шоколадной крошкой', price: 350, weight: 120, tags: ['vegetarian'], allergens: ['gluten', 'dairy'] },

    // Bevande
    { slug: 'bevande', nameRu: 'Лимонад Лимончелло', nameIt: 'Limonata', descriptionRu: 'Домашний лимонад на основе сицилийских лимонов', price: 280, weight: 400, tags: ['vegetarian', 'vegan', 'gluten-free'] },
    { slug: 'bevande', nameRu: 'Апероль Шприц', nameIt: 'Aperol Spritz', descriptionRu: 'Просекко, Апероль, содовая', price: 520, weight: 200 },
    { slug: 'bevande', nameRu: 'Вино Кьянти (бокал)', nameIt: 'Chianti Classico (calice)', descriptionRu: 'Тосканское вино DOCG', price: 450, weight: 150 },
    { slug: 'bevande', nameRu: 'Вода Acqua Panna', nameIt: 'Acqua Panna', descriptionRu: 'Негазированная минеральная вода', price: 180, weight: 500, tags: ['vegan', 'gluten-free'] },

    // Caffè
    { slug: 'caffe', nameRu: 'Эспрессо', nameIt: 'Espresso', price: 150, weight: 30, tags: ['vegan', 'gluten-free'] },
    { slug: 'caffe', nameRu: 'Капучино', nameIt: 'Cappuccino', descriptionRu: 'Двойной эспрессо с вспененным молоком', price: 220, weight: 180, allergens: ['dairy'] },
    { slug: 'caffe', nameRu: 'Латте', nameIt: 'Caffè Latte', price: 240, weight: 250, allergens: ['dairy'] },
    { slug: 'caffe', nameRu: 'Американо', nameIt: 'Americano', price: 170, weight: 200, tags: ['vegan', 'gluten-free'] },
  ];

  let itemCount = 0;
  for (const item of items) {
    const { slug, ...data } = item;
    const category = categories[slug];
    if (!category) continue;

    await MenuItem.findOrCreate({
      where: { nameIt: data.nameIt, categoryId: category.id },
      defaults: { ...data, categoryId: category.id },
    });
    itemCount++;
  }

  console.log(`✅ ${itemCount} menu items created`);
  console.log('\n🎉 Demo seed complete!');
  console.log('📍 Admin: admin@brio-cafe.ru / admin123');

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
