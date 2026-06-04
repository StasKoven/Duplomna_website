const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User.model');
const Category = require('../models/Category.model');
const Product = require('../models/Product.model');
const Review = require('../models/Review.model');
const Coupon = require('../models/Coupon.model');
const Order = require('../models/Order.model');

// ── Допоміжна функція: дата в минулому ──
const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const seedDatabase = async () => {
  try {
    console.log('🔄 Підключення до MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Підключено до MongoDB');

    // ── Очистка бази даних ──
    console.log('🗑️  Очищення існуючих даних...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Review.deleteMany({});
    await Coupon.deleteMany({});
    await Order.deleteMany({});

    try {
      await mongoose.connection.collection('categories').dropIndexes();
      await mongoose.connection.collection('products').dropIndexes();
    } catch (e) {
      // Індекси можуть ще не існувати
    }
    console.log('✅ Дані очищено');

    // ═══════════════════════════════════════════════════════════════
    // 1. КОРИСТУВАЧІ
    // ═══════════════════════════════════════════════════════════════
    console.log('👤 Створення адміністратора...');
    const admin = await User.create({
      firstName: 'Станіслав',
      lastName: 'Бабенко',
      email: process.env.ADMIN_EMAIL || 'admin@electronics.com',
      password: process.env.ADMIN_PASSWORD || 'Admin123!@#',
      role: 'admin',
      isActive: true,
      emailVerified: true,
      phone: '+380501234567',
      address: [{
        label: 'Офіс',
        street: 'вул. Хрещатик, 22',
        city: 'Київ',
        state: 'Київська область',
        zipCode: '01001',
        country: 'Україна',
        isDefault: true
      }],
      createdAt: daysAgo(365),
      updatedAt: daysAgo(2)
    });
    console.log('✅ Адміністратор створений');

    console.log('👥 Створення користувачів...');
    const users = await Promise.all([
      // Користувач 1 — зареєстрований 8 місяців тому
      User.create({
        firstName: 'Олександр',
        lastName: 'Петренко',
        email: 'o.petrenko@gmail.com',
        password: 'User123!@#',
        role: 'user',
        isActive: true,
        emailVerified: true,
        phone: '+380671234567',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        address: [{
          label: 'Дім',
          street: 'вул. Тараса Шевченка, 25, кв. 14',
          city: 'Львів',
          state: 'Львівська область',
          zipCode: '79000',
          country: 'Україна',
          isDefault: true
        }],
        createdAt: daysAgo(240),
        updatedAt: daysAgo(5)
      }),
      // Користувач 2 — зареєстрований 6 місяців тому
      User.create({
        firstName: 'Марія',
        lastName: 'Коваленко',
        email: 'maria.kovalenko@ukr.net',
        password: 'Maria123!@#',
        role: 'user',
        isActive: true,
        emailVerified: true,
        phone: '+380931234567',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        address: [{
          label: 'Дім',
          street: 'пр. Науки, 45, кв. 78',
          city: 'Харків',
          state: 'Харківська область',
          zipCode: '61166',
          country: 'Україна',
          isDefault: true
        }],
        createdAt: daysAgo(180),
        updatedAt: daysAgo(12)
      }),
      // Користувач 3 — зареєстрований 5 місяців тому
      User.create({
        firstName: 'Андрій',
        lastName: 'Шевченко',
        email: 'andrii.shevchenko@gmail.com',
        password: 'Andrii123!@#',
        role: 'user',
        isActive: true,
        emailVerified: true,
        phone: '+380502223344',
        avatar: 'https://randomuser.me/api/portraits/men/65.jpg',
        address: [
          {
            label: 'Дім',
            street: 'вул. Лесі Українки, 10, кв. 3',
            city: 'Київ',
            state: 'Київська область',
            zipCode: '01133',
            country: 'Україна',
            isDefault: true
          },
          {
            label: 'Робота',
            street: 'вул. Антоновича, 172',
            city: 'Київ',
            state: 'Київська область',
            zipCode: '03150',
            country: 'Україна',
            isDefault: false
          }
        ],
        createdAt: daysAgo(150),
        updatedAt: daysAgo(3)
      }),
      // Користувач 4 — зареєстрований 4 місяці тому
      User.create({
        firstName: 'Ірина',
        lastName: 'Бондаренко',
        email: 'iryna.bondarenko@outlook.com',
        password: 'Iryna123!@#',
        role: 'user',
        isActive: true,
        emailVerified: true,
        phone: '+380673334455',
        avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
        address: [{
          label: 'Дім',
          street: 'вул. Дерибасівська, 18, кв. 5',
          city: 'Одеса',
          state: 'Одеська область',
          zipCode: '65026',
          country: 'Україна',
          isDefault: true
        }],
        createdAt: daysAgo(120),
        updatedAt: daysAgo(8)
      }),
      // Користувач 5 — зареєстрований 3 місяці тому
      User.create({
        firstName: 'Дмитро',
        lastName: 'Мельник',
        email: 'dmytro.melnyk@gmail.com',
        password: 'Dmytro123!@#',
        role: 'user',
        isActive: true,
        emailVerified: true,
        phone: '+380934445566',
        avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
        address: [{
          label: 'Дім',
          street: 'пр. Дмитра Яворницького, 67, кв. 32',
          city: 'Дніпро',
          state: 'Дніпропетровська область',
          zipCode: '49000',
          country: 'Україна',
          isDefault: true
        }],
        createdAt: daysAgo(90),
        updatedAt: daysAgo(15)
      }),
      // Користувач 6 — зареєстрований 2 місяці тому
      User.create({
        firstName: 'Наталія',
        lastName: 'Ткаченко',
        email: 'natalia.tkachenko@ukr.net',
        password: 'Natalia123!@#',
        role: 'user',
        isActive: true,
        emailVerified: true,
        phone: '+380505556677',
        avatar: 'https://randomuser.me/api/portraits/women/52.jpg',
        address: [{
          label: 'Дім',
          street: 'вул. Соборна, 112, кв. 8',
          city: 'Вінниця',
          state: 'Вінницька область',
          zipCode: '21000',
          country: 'Україна',
          isDefault: true
        }],
        createdAt: daysAgo(60),
        updatedAt: daysAgo(1)
      }),
      // Користувач 7 — зареєстрований 1 місяць тому
      User.create({
        firstName: 'Максим',
        lastName: 'Кравченко',
        email: 'max.kravchenko@gmail.com',
        password: 'Maksym123!@#',
        role: 'user',
        isActive: true,
        emailVerified: true,
        phone: '+380676667788',
        avatar: 'https://randomuser.me/api/portraits/men/78.jpg',
        address: [{
          label: 'Дім',
          street: 'вул. Університетська, 34, кв. 19',
          city: 'Запоріжжя',
          state: 'Запорізька область',
          zipCode: '69000',
          country: 'Україна',
          isDefault: true
        }],
        createdAt: daysAgo(30),
        updatedAt: daysAgo(4)
      }),
      // Користувач 8 — зареєстрований 2 тижні тому, email не підтверджений
      User.create({
        firstName: 'Олена',
        lastName: 'Савченко',
        email: 'olena.savchenko@gmail.com',
        password: 'Olena123!@#',
        role: 'user',
        isActive: true,
        emailVerified: false,
        phone: '+380937778899',
        address: [{
          label: 'Дім',
          street: 'вул. Набережна, 5, кв. 42',
          city: 'Полтава',
          state: 'Полтавська область',
          zipCode: '36000',
          country: 'Україна',
          isDefault: true
        }],
        createdAt: daysAgo(14),
        updatedAt: daysAgo(14)
      }),
      // Користувач 9 — зареєстрований 5 днів тому
      User.create({
        firstName: 'Віталій',
        lastName: 'Олійник',
        email: 'v.oliinyk@ukr.net',
        password: 'Vitalii123!@#',
        role: 'user',
        isActive: true,
        emailVerified: true,
        phone: '+380508889900',
        address: [{
          label: 'Дім',
          street: 'пр. Перемоги, 89, кв. 15',
          city: 'Івано-Франківськ',
          state: 'Івано-Франківська область',
          zipCode: '76000',
          country: 'Україна',
          isDefault: true
        }],
        createdAt: daysAgo(5),
        updatedAt: daysAgo(5)
      }),
      // Користувач 10 — деактивований
      User.create({
        firstName: 'Сергій',
        lastName: 'Лисенко',
        email: 'serhii.lysenko@gmail.com',
        password: 'Serhii123!@#',
        role: 'user',
        isActive: false,
        emailVerified: true,
        phone: '+380679990011',
        createdAt: daysAgo(200),
        updatedAt: daysAgo(45)
      }),
      // Користувач 11 — фотограф зі Рівного
      User.create({
        firstName: 'Юлія',
        lastName: 'Гончаренко',
        email: 'yulia.goncharenko@gmail.com',
        password: 'Yulia123!@#',
        role: 'user',
        isActive: true,
        emailVerified: true,
        phone: '+380501112233',
        avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
        address: [{
          label: 'Дім',
          street: 'вул. Чорновола, 15, кв. 7',
          city: 'Рівне',
          state: 'Рівненська область',
          zipCode: '33000',
          country: 'Україна',
          isDefault: true
        }],
        createdAt: daysAgo(170),
        updatedAt: daysAgo(7)
      }),
      // Користувач 12 — геймер з Тернополя
      User.create({
        firstName: 'Павло',
        lastName: 'Романюк',
        email: 'pavlo.romaniuk@gmail.com',
        password: 'Pavlo123!@#',
        role: 'user',
        isActive: true,
        emailVerified: true,
        phone: '+380672223344',
        avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
        address: [{
          label: 'Дім',
          street: 'вул. Руська, 44, кв. 10',
          city: 'Тернопіль',
          state: 'Тернопільська область',
          zipCode: '46000',
          country: 'Україна',
          isDefault: true
        }],
        createdAt: daysAgo(100),
        updatedAt: daysAgo(2)
      }),
      // Користувач 13 — IT-спеціаліст з Ужгорода
      User.create({
        firstName: 'Тарас',
        lastName: 'Федорчук',
        email: 'taras.fedorchuk@ukr.net',
        password: 'Taras123!@#',
        role: 'user',
        isActive: true,
        emailVerified: true,
        phone: '+380933344556',
        avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
        address: [{
          label: 'Дім',
          street: 'пл. Театральна, 8, кв. 22',
          city: 'Ужгород',
          state: 'Закарпатська область',
          zipCode: '88000',
          country: 'Україна',
          isDefault: true
        }],
        createdAt: daysAgo(75),
        updatedAt: daysAgo(10)
      }),
      // Користувач 14 — студентка з Луцька
      User.create({
        firstName: 'Анна',
        lastName: 'Кузьменко',
        email: 'anna.kuzmenko@gmail.com',
        password: 'Anna123!@#',
        role: 'user',
        isActive: true,
        emailVerified: true,
        phone: '+380504455667',
        avatar: 'https://randomuser.me/api/portraits/women/25.jpg',
        address: [{
          label: 'Дім',
          street: 'вул. Кривий Вал, 30, кв. 4',
          city: 'Луцьк',
          state: 'Волинська область',
          zipCode: '43000',
          country: 'Україна',
          isDefault: true
        }],
        createdAt: daysAgo(40),
        updatedAt: daysAgo(6)
      }),
      // Користувач 15 — менеджер з Чернігова
      User.create({
        firstName: 'Роман',
        lastName: 'Зінченко',
        email: 'roman.zinchenko@outlook.com',
        password: 'Roman123!@#',
        role: 'user',
        isActive: true,
        emailVerified: true,
        phone: '+380675566778',
        avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
        address: [{
          label: 'Дім',
          street: 'пр. Миру, 52, кв. 16',
          city: 'Чернігів',
          state: 'Чернігівська область',
          zipCode: '14000',
          country: 'Україна',
          isDefault: true
        }],
        createdAt: daysAgo(20),
        updatedAt: daysAgo(3)
      })
    ]);
    console.log(`✅ Створено ${users.length} користувачів`);

    // ═══════════════════════════════════════════════════════════════
    // 2. КАТЕГОРІЇ
    // ═══════════════════════════════════════════════════════════════
    console.log('📁 Створення категорій...');
    const categoryData = [
      {
        name: 'Смартфони',
        slug: 'smartphones',
        description: 'Смартфони провідних брендів: Apple, Samsung, Xiaomi, Google та інші. Флагмани, середній клас та бюджетні моделі.',
        order: 1,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop'
      },
      {
        name: 'Ноутбуки',
        slug: 'laptops',
        description: 'Ноутбуки для роботи, навчання, дизайну та ігор. MacBook, ультрабуки, ігрові та бізнес-ноутбуки.',
        order: 2,
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop'
      },
      {
        name: 'Планшети',
        slug: 'tablets',
        description: 'Планшети Apple iPad, Samsung Galaxy Tab та інші для розваг, навчання та професійної роботи.',
        order: 3,
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop'
      },
      {
        name: 'Навушники',
        slug: 'headphones',
        description: 'Бездротові та дротові навушники: повнорозмірні, вкладиші, TWS. Преміум якість звуку та шумоподавлення.',
        order: 4,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'
      },
      {
        name: 'Смарт-годинники',
        slug: 'smartwatches',
        description: 'Розумні годинники та фітнес-браслети: Apple Watch, Samsung Galaxy Watch, Garmin для спорту та повсякдення.',
        order: 5,
        image: 'https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=400&h=400&fit=crop'
      },
      {
        name: 'Аксесуари',
        slug: 'accessories',
        description: 'Чохли, зарядні пристрої, павербанки, кабелі, тримачі, захисне скло та інші аксесуари для техніки.',
        order: 6,
        image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=400&fit=crop'
      },
      {
        name: 'Ігрові консолі',
        slug: 'gaming-consoles',
        description: 'PlayStation, Xbox, Nintendo Switch та аксесуари для геймінгу. Ігрові консолі для всієї родини.',
        order: 7,
        image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop'
      },
      {
        name: 'ТВ та Монітори',
        slug: 'tv-monitors',
        description: 'Телевізори, монітори для роботи та ігор. OLED, QLED, 4K та ультраширокі панелі.',
        order: 8,
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop'
      },
      {
        name: 'Фотоапарати',
        slug: 'cameras',
        description: 'Цифрові дзеркальні та безрзеркальні фотоапарати, об\'єктиви та відеокамери для професіоналів та аматорів.',
        order: 9,
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop'
      },
      {
        name: 'Розумний дім',
        slug: 'smart-home',
        description: 'Розумні колонки, лампи, камери безпеки, термостати та інші пристрої для автоматизації дому.',
        order: 10,
        image: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=400&h=400&fit=crop'
      }
    ];

    const categories = [];
    for (const catData of categoryData) {
      const category = await Category.create(catData);
      categories.push(category);
    }
    console.log(`✅ Створено ${categories.length} категорій`);

    // ═══════════════════════════════════════════════════════════════
    // 3. ТОВАРИ
    // ═══════════════════════════════════════════════════════════════
    console.log('📦 Створення товарів...');

    const productData = [
      // ─────────────────────────────────────────────────────────────
      // СМАРТФОНИ (categories[0])
      // ─────────────────────────────────────────────────────────────
      {
        name: 'iPhone 15 Pro Max 256GB',
        description: 'iPhone 15 Pro Max — флагманський смартфон Apple з титановим корпусом та чіпом A17 Pro. Оснащений 6.7-дюймовим Super Retina XDR дисплеєм з технологією ProMotion 120 Гц та Always-On Display. Основна камера 48 Мп з підтримкою запису ProRes відео. USB Type-C забезпечує швидку передачу даних. Action Button дозволяє налаштувати швидкий доступ до улюблених функцій. Ceramic Shield захищає дисплей від пошкоджень.',
        shortDescription: 'Титановий флагман Apple з чіпом A17 Pro та камерою 48 Мп',
        price: 52999,
        comparePrice: 56999,
        category: categories[0]._id,
        brand: 'Apple',
        sku: 'APL-IP15PM-256-NAT',
        stock: 45,
        lowStockThreshold: 5,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/About_iPhone_15_Pro_Max_Natural_Titanium.jpg/960px-About_iPhone_15_Pro_Max_Natural_Titanium.jpg', alt: 'iPhone 15 Pro Max 256GB', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '6.7" Super Retina XDR OLED, 2796×1290, 120 Гц ProMotion' },
          { name: 'Процесор', value: 'Apple A17 Pro (3 нм), 6-ядерний CPU, 6-ядерний GPU' },
          { name: 'Оперативна пам\'ять', value: '8 ГБ' },
          { name: 'Накопичувач', value: '256 ГБ' },
          { name: 'Основна камера', value: '48 Мп (f/1.78) + 12 Мп ультраширокий + 12 Мп телефото 5x' },
          { name: 'Фронтальна камера', value: '12 Мп TrueDepth (f/1.9)' },
          { name: 'Акумулятор', value: '4422 мАг, до 29 годин відтворення відео' },
          { name: 'Зарядка', value: 'USB-C, бездротова MagSafe 15 Вт, Qi 7.5 Вт' },
          { name: 'Захист', value: 'IP68 (6 м, 30 хв), Ceramic Shield' },
          { name: 'ОС', value: 'iOS 17' },
          { name: 'Розміри', value: '159.9 × 76.7 × 8.25 мм' },
          { name: 'Вага', value: '221 г' }
        ],
        features: ['ProMotion 120 Гц', 'Always-On Display', 'Dynamic Island', 'Action Button', 'Ceramic Shield', '5G', 'USB 3 (до 10 Гбіт/с)', 'Satellite SOS', 'Face ID'],
        tags: ['флагман', 'apple', 'титан', 'хіт продажів'],
        warranty: '2 роки',
        weight: { value: 221, unit: 'g' },
        dimensions: { length: 15.99, width: 7.67, height: 0.83, unit: 'cm' },
        isFeatured: true,
        isOnSale: true,
        seoTitle: 'iPhone 15 Pro Max 256GB — купити в TechStore',
        seoDescription: 'iPhone 15 Pro Max з титановим корпусом, чіпом A17 Pro та камерою 48 Мп. Офіційна гарантія 2 роки.'
      },
      {
        name: 'iPhone 15 Pro 128GB',
        description: 'iPhone 15 Pro поєднує потужність чіпа A17 Pro з компактним розміром. Титановий корпус, основна камера 48 Мп з 3x оптичним зумом. Dynamic Island інтегрує сповіщення прямо у верхню частину екрана. Action Button замінює перемикач звуку та дозволяє налаштувати швидкий виклик камери, ліхтарика чи будь-якої іншої функції.',
        shortDescription: 'Компактний титановий флагман з A17 Pro',
        price: 46999,
        comparePrice: 49999,
        category: categories[0]._id,
        brand: 'Apple',
        sku: 'APL-IP15P-128-BLU',
        stock: 62,
        lowStockThreshold: 8,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Apple_iPhone_15_Pro.jpg/960px-Apple_iPhone_15_Pro.jpg', alt: 'iPhone 15 Pro 128GB', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '6.1" Super Retina XDR OLED, 2556×1179, 120 Гц ProMotion' },
          { name: 'Процесор', value: 'Apple A17 Pro (3 нм)' },
          { name: 'Оперативна пам\'ять', value: '8 ГБ' },
          { name: 'Накопичувач', value: '128 ГБ' },
          { name: 'Основна камера', value: '48 Мп + 12 Мп ультраширокий + 12 Мп телефото 3x' },
          { name: 'Фронтальна камера', value: '12 Мп TrueDepth' },
          { name: 'Акумулятор', value: '3274 мАг, до 23 годин відео' },
          { name: 'Захист', value: 'IP68, Ceramic Shield' },
          { name: 'ОС', value: 'iOS 17' },
          { name: 'Вага', value: '187 г' }
        ],
        features: ['ProMotion 120 Гц', 'Dynamic Island', 'Action Button', 'Titanium Design', '5G', 'Face ID'],
        tags: ['флагман', 'apple', 'компактний'],
        warranty: '2 роки',
        weight: { value: 187, unit: 'g' },
        isFeatured: true,
        isOnSale: true
      },
      {
        name: 'Samsung Galaxy S24 Ultra 256GB',
        description: 'Samsung Galaxy S24 Ultra — преміальний Android-флагман з вбудованим S Pen та Galaxy AI. Процесор Snapdragon 8 Gen 3 for Galaxy забезпечує найвищу продуктивність. Камера 200 Мп з оптичною стабілізацією створює детальні та яскраві фото. Galaxy AI допомагає з перекладом у реальному часі, редагуванням фотографій та підсумовуванням нотаток. Титанова рамка та Gorilla Armor захищають пристрій.',
        shortDescription: 'Преміум Android-флагман з S Pen, 200 Мп камерою та Galaxy AI',
        price: 49999,
        comparePrice: 54999,
        category: categories[0]._id,
        brand: 'Samsung',
        sku: 'SAM-GS24U-256-BLK',
        stock: 38,
        lowStockThreshold: 5,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Samsung_S24_Ultra_Phone.png/960px-Samsung_S24_Ultra_Phone.png', alt: 'Samsung Galaxy S24 Ultra 256GB', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '6.8" Dynamic AMOLED 2X, 3120×1440, 120 Гц LTPO' },
          { name: 'Процесор', value: 'Qualcomm Snapdragon 8 Gen 3 for Galaxy' },
          { name: 'Оперативна пам\'ять', value: '12 ГБ' },
          { name: 'Накопичувач', value: '256 ГБ' },
          { name: 'Основна камера', value: '200 Мп (f/1.7 OIS) + 12 Мп ультраширокий + 50 Мп телефото 5x + 10 Мп телефото 3x' },
          { name: 'Фронтальна камера', value: '12 Мп (f/2.2)' },
          { name: 'Акумулятор', value: '5000 мАг, швидка зарядка 45 Вт' },
          { name: 'Захист', value: 'IP68, Gorilla Armor' },
          { name: 'ОС', value: 'Android 14, One UI 6.1' },
          { name: 'Розміри', value: '162.3 × 79.0 × 8.6 мм' },
          { name: 'Вага', value: '232 г' }
        ],
        features: ['Galaxy AI', 'S Pen вбудований', 'Circle to Search', 'Live Translate', '120 Гц LTPO', '5G', 'Titanium Frame', 'DeX Mode'],
        tags: ['флагман', 'samsung', 'ai', 'хіт продажів', 's pen'],
        warranty: '2 роки',
        weight: { value: 232, unit: 'g' },
        dimensions: { length: 16.23, width: 7.9, height: 0.86, unit: 'cm' },
        isFeatured: true,
        isOnSale: true
      },
      {
        name: 'Samsung Galaxy S24 128GB',
        description: 'Samsung Galaxy S24 — компактний флагман з Galaxy AI у доступнішій ціновій категорії. 6.2-дюймовий Dynamic AMOLED 2X дисплей з частотою оновлення 120 Гц. Процесор Exynos 2400 забезпечує стабільну продуктивність. Усі AI-функції Galaxy доступні: переклад дзвінків, редагування фото та створення обкладинок.',
        shortDescription: 'Компактний флагман Samsung з Galaxy AI',
        price: 31999,
        category: categories[0]._id,
        brand: 'Samsung',
        sku: 'SAM-GS24-128-VIO',
        stock: 74,
        lowStockThreshold: 10,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Samsung_Galaxy_S24_%28webtekno%29_008.png/960px-Samsung_Galaxy_S24_%28webtekno%29_008.png', alt: 'Samsung Galaxy S24 128GB', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '6.2" Dynamic AMOLED 2X, 2340×1080, 120 Гц' },
          { name: 'Процесор', value: 'Samsung Exynos 2400' },
          { name: 'Оперативна пам\'ять', value: '8 ГБ' },
          { name: 'Накопичувач', value: '128 ГБ' },
          { name: 'Основна камера', value: '50 Мп + 12 Мп ультраширокий + 10 Мп телефото 3x' },
          { name: 'Акумулятор', value: '4000 мАг, швидка зарядка 25 Вт' },
          { name: 'Захист', value: 'IP68, Gorilla Armor' },
          { name: 'ОС', value: 'Android 14, One UI 6.1' },
          { name: 'Вага', value: '167 г' }
        ],
        features: ['Galaxy AI', 'Circle to Search', '120 Гц', '5G', 'IP68'],
        tags: ['флагман', 'samsung', 'ai', 'компактний'],
        warranty: '2 роки',
        weight: { value: 167, unit: 'g' },
        isFeatured: true
      },
      {
        name: 'Google Pixel 8 Pro 128GB',
        description: 'Google Pixel 8 Pro — смартфон з найкращим AI та обчислювальною фотографією від Google. Процесор Tensor G3 створений спеціально для задач штучного інтелекту: Magic Eraser видаляє сторонні об\'єкти з фото, Best Take дозволяє замінити вираз обличчя, Audio Magic Eraser прибирає фоновий шум з відео. 7 років оновлень операційної системи та безпеки.',
        shortDescription: 'Найкращий камерофон з AI від Google',
        price: 36999,
        category: categories[0]._id,
        brand: 'Google',
        sku: 'GOO-PX8P-128-BLU',
        stock: 28,
        lowStockThreshold: 5,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Google_Pixel_8_Pro_with_Google_Pixel_7_Pro.jpg/960px-Google_Pixel_8_Pro_with_Google_Pixel_7_Pro.jpg', alt: 'Google Pixel 8 Pro 128GB', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '6.7" LTPO OLED, 2992×1344, 120 Гц' },
          { name: 'Процесор', value: 'Google Tensor G3' },
          { name: 'Оперативна пам\'ять', value: '12 ГБ' },
          { name: 'Накопичувач', value: '128 ГБ' },
          { name: 'Основна камера', value: '50 Мп (f/1.68 OIS) + 48 Мп ультраширокий + 48 Мп телефото 5x' },
          { name: 'Фронтальна камера', value: '10.5 Мп' },
          { name: 'Акумулятор', value: '5050 мАг, швидка зарядка 30 Вт' },
          { name: 'Захист', value: 'IP68, Gorilla Victus 2' },
          { name: 'ОС', value: 'Android 14 (чистий)' },
          { name: 'Вага', value: '213 г' }
        ],
        features: ['Best Take', 'Magic Eraser', 'Audio Magic Eraser', 'Photo Unblur', '7 років оновлень', 'Titan M2 чіп безпеки'],
        tags: ['камерофон', 'google', 'ai', 'чистий android'],
        warranty: '2 роки',
        weight: { value: 213, unit: 'g' },
        isFeatured: true
      },
      {
        name: 'Xiaomi 14 Pro 256GB',
        description: 'Xiaomi 14 Pro — флагман з оптикою Leica Summilux та процесором Snapdragon 8 Gen 3. Камера 50 Мп зі світлосилою f/1.42 забезпечує неперевершену якість фото при слабкому освітленні. Швидка зарядка HyperCharge 120 Вт заряджає акумулятор 4880 мАг за 19 хвилин від 0 до 100%. 2K LTPO AMOLED дисплей з частотою до 120 Гц.',
        shortDescription: 'Флагман Xiaomi з оптикою Leica та зарядкою 120 Вт',
        price: 34999,
        comparePrice: 37999,
        category: categories[0]._id,
        brand: 'Xiaomi',
        sku: 'XIA-14P-256-BLK',
        stock: 33,
        lowStockThreshold: 5,
        images: [
          { url: 'https://placehold.co/800x800/0f172a/e2e8f0/png?text=Xiaomi%2014%20Pro%20256GB', alt: 'Xiaomi 14 Pro 256GB (зображення-заповнювач)', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '6.73" LTPO AMOLED, 3200×1440, 1-120 Гц' },
          { name: 'Процесор', value: 'Qualcomm Snapdragon 8 Gen 3' },
          { name: 'Оперативна пам\'ять', value: '12 ГБ LPDDR5X' },
          { name: 'Накопичувач', value: '256 ГБ UFS 4.0' },
          { name: 'Основна камера', value: '50 Мп Leica Summilux (f/1.42) + 50 Мп ультраширокий + 50 Мп телефото' },
          { name: 'Акумулятор', value: '4880 мАг, HyperCharge 120 Вт, бездротова 50 Вт' },
          { name: 'Захист', value: 'IP68' },
          { name: 'ОС', value: 'Android 14, HyperOS' },
          { name: 'Вага', value: '223 г' }
        ],
        features: ['Leica Summilux f/1.42', 'HyperCharge 120 Вт', '2K LTPO дисплей', '5G', 'NFC', 'Wi-Fi 7'],
        tags: ['leica', 'xiaomi', 'швидка зарядка'],
        warranty: '2 роки',
        weight: { value: 223, unit: 'g' },
        isOnSale: true
      },
      {
        name: 'OnePlus 12 256GB',
        description: 'OnePlus 12 — флагман-кілер з камерою Hasselblad 4-го покоління та найшвидшою зарядкою серед флагманів. 100 Вт SUPERVOOC зарядка заповнює акумулятор 5400 мАг за 26 хвилин. Snapdragon 8 Gen 3 з охолоджуючою камерою забезпечує стабільну продуктивність навіть у важких іграх.',
        shortDescription: 'Потужний флагман з камерою Hasselblad та зарядкою 100 Вт',
        price: 29999,
        category: categories[0]._id,
        brand: 'OnePlus',
        sku: 'OPL-12-256-GRN',
        stock: 22,
        lowStockThreshold: 5,
        images: [
          { url: 'https://placehold.co/800x800/0f172a/e2e8f0/png?text=OnePlus%2012%20256GB', alt: 'OnePlus 12 256GB (зображення-заповнювач)', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '6.82" LTPO AMOLED, 3168×1440, 120 Гц' },
          { name: 'Процесор', value: 'Qualcomm Snapdragon 8 Gen 3' },
          { name: 'Оперативна пам\'ять', value: '12 ГБ LPDDR5X' },
          { name: 'Накопичувач', value: '256 ГБ UFS 4.0' },
          { name: 'Основна камера', value: '50 Мп Sony LYT-808 + 64 Мп + 48 Мп перископ' },
          { name: 'Акумулятор', value: '5400 мАг, SUPERVOOC 100 Вт, бездротова 50 Вт' },
          { name: 'Захист', value: 'IP65' },
          { name: 'ОС', value: 'Android 14, OxygenOS 14' },
          { name: 'Вага', value: '220 г' }
        ],
        features: ['Hasselblad Camera', 'SUPERVOOC 100 Вт', 'Vapor Chamber Cooling', '5G', 'Dolby Vision'],
        tags: ['oneplus', 'hasselblad', 'швидка зарядка', 'для ігор'],
        warranty: '2 роки',
        weight: { value: 220, unit: 'g' }
      },
      {
        name: 'iPhone 15 128GB',
        description: 'iPhone 15 — базова модель нового покоління iPhone з Dynamic Island, камерою 48 Мп та USB Type-C. Чіп A16 Bionic забезпечує плавну роботу iOS 17. Скляний корпус із забарвленням по масі створює м\'які пастельні відтінки.',
        shortDescription: 'Стильний iPhone з Dynamic Island та камерою 48 Мп',
        price: 36999,
        category: categories[0]._id,
        brand: 'Apple',
        sku: 'APL-IP15-128-PNK',
        stock: 55,
        lowStockThreshold: 8,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Back_of_iPhone_15.jpg/960px-Back_of_iPhone_15.jpg', alt: 'iPhone 15 128GB', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '6.1" Super Retina XDR OLED, 2556×1179, 60 Гц' },
          { name: 'Процесор', value: 'Apple A16 Bionic' },
          { name: 'Оперативна пам\'ять', value: '6 ГБ' },
          { name: 'Накопичувач', value: '128 ГБ' },
          { name: 'Основна камера', value: '48 Мп (f/1.6) + 12 Мп ультраширокий' },
          { name: 'Акумулятор', value: '3349 мАг, до 20 годин відео' },
          { name: 'Захист', value: 'IP68, Ceramic Shield' },
          { name: 'ОС', value: 'iOS 17' },
          { name: 'Вага', value: '171 г' }
        ],
        features: ['Dynamic Island', 'Ceramic Shield', '5G', 'USB-C', 'Face ID', 'MagSafe'],
        tags: ['apple', 'dynamic island'],
        warranty: '2 роки',
        weight: { value: 171, unit: 'g' }
      },

      // ─────────────────────────────────────────────────────────────
      // НОУТБУКИ (categories[1])
      // ─────────────────────────────────────────────────────────────
      {
        name: 'MacBook Pro 16" M3 Pro',
        description: 'MacBook Pro 16 дюймів з чіпом Apple M3 Pro — це професійний ноутбук для розробників, дизайнерів та відеомонтажерів. 12-ядерний CPU та 18-ядерний GPU забезпечують блискавичну роботу з кодом, рендеринг 3D-сцен та монтаж 8K ProRes відео. Дисплей Liquid Retina XDR з яскравістю 1600 ніт (HDR) та технологією ProMotion 120 Гц. До 22 годин автономної роботи — найтриваліше серед ноутбуків Apple.',
        shortDescription: 'Професійний ноутбук Apple для творчих задач',
        price: 109999,
        comparePrice: 119999,
        category: categories[1]._id,
        brand: 'Apple',
        sku: 'APL-MBP16-M3P-512',
        stock: 18,
        lowStockThreshold: 3,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/M3_Macbook_Pro_14_inch_Space_Grey_model.jpg/960px-M3_Macbook_Pro_14_inch_Space_Grey_model.jpg', alt: 'MacBook Pro 16" M3 Pro', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '16.2" Liquid Retina XDR, 3456×2234, 120 Гц ProMotion' },
          { name: 'Процесор', value: 'Apple M3 Pro: 12-ядерний CPU, 18-ядерний GPU' },
          { name: 'Оперативна пам\'ять', value: '18 ГБ Unified Memory' },
          { name: 'Накопичувач', value: '512 ГБ SSD' },
          { name: 'Автономність', value: 'до 22 годин відтворення відео' },
          { name: 'Порти', value: '3× Thunderbolt 4, HDMI 2.1, SDXC, MagSafe 3, 3.5 мм' },
          { name: 'Вебкамера', value: '1080p FaceTime HD' },
          { name: 'Звук', value: '6-динамікова система з Spatial Audio' },
          { name: 'Розміри', value: '355.7 × 248.1 × 16.8 мм' },
          { name: 'Вага', value: '2.14 кг' }
        ],
        features: ['ProMotion 120 Гц', 'MagSafe 3', 'HDMI 2.1', 'Thunderbolt 4', 'Touch ID', 'Spatial Audio', '1600 ніт HDR'],
        tags: ['професійний', 'apple', 'для розробників', 'для дизайнерів'],
        warranty: '2 роки',
        weight: { value: 2140, unit: 'g' },
        isFeatured: true,
        isOnSale: true
      },
      {
        name: 'MacBook Air 15" M3',
        description: 'MacBook Air 15 — найтонший 15-дюймовий ноутбук у світі. Чіп Apple M3 з 8-ядерним CPU та 10-ядерним GPU працює абсолютно безшумно завдяки безвентиляторному дизайну. Великий Liquid Retina дисплей з широкою колірною гамою P3 ідеальний для перегляду контенту та продуктивної роботи. До 18 годин автономності на одному заряді.',
        shortDescription: 'Найтонший 15" ноутбук з безшумним чіпом M3',
        price: 56999,
        category: categories[1]._id,
        brand: 'Apple',
        sku: 'APL-MBA15-M3-256',
        stock: 35,
        lowStockThreshold: 5,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/MacBook_Air_%2815-inch%2C_M4%2C_Silver%29.jpg/960px-MacBook_Air_%2815-inch%2C_M4%2C_Silver%29.jpg', alt: 'MacBook Air 15" M3', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '15.3" Liquid Retina, 2880×1864, 500 ніт' },
          { name: 'Процесор', value: 'Apple M3: 8-ядерний CPU, 10-ядерний GPU' },
          { name: 'Оперативна пам\'ять', value: '8 ГБ Unified Memory' },
          { name: 'Накопичувач', value: '256 ГБ SSD' },
          { name: 'Автономність', value: 'до 18 годин' },
          { name: 'Порти', value: '2× Thunderbolt / USB 4, MagSafe, 3.5 мм' },
          { name: 'Вебкамера', value: '1080p FaceTime HD' },
          { name: 'Розміри', value: '340.4 × 237.6 × 11.5 мм' },
          { name: 'Вага', value: '1.51 кг' }
        ],
        features: ['Безвентиляторний дизайн', 'MagSafe', 'Touch ID', '1080p камера', 'Spatial Audio'],
        tags: ['apple', 'легкий', 'для навчання', 'безшумний'],
        warranty: '2 роки',
        weight: { value: 1510, unit: 'g' },
        isFeatured: true
      },
      {
        name: 'ASUS ROG Strix G16 (2024)',
        description: 'ASUS ROG Strix G16 — потужний ігровий ноутбук з процесором Intel Core i9-14900HX та відеокартою NVIDIA GeForce RTX 4070. 16-дюймовий QHD дисплей з частотою оновлення 240 Гц та часом відклику 3 мс забезпечує плавну та чітку графіку навіть у найвимогливіших іграх. Інтелектуальна система охолодження ROG Intelligent Cooling з рідким металом тримає температуру під контролем.',
        shortDescription: 'Ігровий ноутбук з RTX 4070 та дисплеєм 240 Гц',
        price: 72999,
        category: categories[1]._id,
        brand: 'ASUS',
        sku: 'ASU-ROGS-G16-RTX4070',
        stock: 14,
        lowStockThreshold: 3,
        images: [
          { url: 'https://placehold.co/800x800/0f172a/e2e8f0/png?text=ASUS%20ROG%20Strix%20G16%20(2024)', alt: 'ASUS ROG Strix G16 (2024) (зображення-заповнювач)', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '16" QHD (2560×1600), IPS, 240 Гц, 3 мс' },
          { name: 'Процесор', value: 'Intel Core i9-14900HX (24 ядра, до 5.8 ГГц)' },
          { name: 'Оперативна пам\'ять', value: '32 ГБ DDR5 5600 МГц' },
          { name: 'Накопичувач', value: '1 ТБ NVMe PCIe 4.0 SSD' },
          { name: 'Відеокарта', value: 'NVIDIA GeForce RTX 4070 8 ГБ GDDR6' },
          { name: 'Автономність', value: 'до 8 годин (90 Вт·год)' },
          { name: 'Розміри', value: '354 × 264 × 22.7-26.8 мм' },
          { name: 'Вага', value: '2.5 кг' }
        ],
        features: ['ROG Intelligent Cooling', 'Liquid Metal', 'Per-key RGB підсвітка', 'Dolby Atmos', 'MUX Switch', 'Thunderbolt 4'],
        tags: ['ігровий', 'asus', 'rtx 4070', 'для ігор'],
        warranty: '2 роки',
        weight: { value: 2500, unit: 'g' },
        isFeatured: true
      },
      {
        name: 'Lenovo ThinkPad X1 Carbon Gen 11',
        description: 'Lenovo ThinkPad X1 Carbon Gen 11 — ультралегкий бізнес-ноутбук вагою всього 1.12 кг. Сертифікований за військовим стандартом MIL-STD-810H для роботи в екстремальних умовах. 14-дюймовий 2.8K OLED дисплей забезпечує ідеальну передачу кольорів для професійної роботи з документами та зображеннями. Клавіатура ThinkPad — одна з найкращих серед ноутбуків.',
        shortDescription: 'Ультралегкий бізнес-ноутбук з OLED дисплеєм',
        price: 79999,
        category: categories[1]._id,
        brand: 'Lenovo',
        sku: 'LEN-TPX1C-G11-512',
        stock: 12,
        lowStockThreshold: 2,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Lenovo_ThinkPad_X1_Carbon_Ultrabook.jpg/960px-Lenovo_ThinkPad_X1_Carbon_Ultrabook.jpg', alt: 'Lenovo ThinkPad X1 Carbon Gen 11', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '14" 2.8K OLED (2880×1800), 400 ніт, 100% DCI-P3' },
          { name: 'Процесор', value: 'Intel Core i7-1365U (10 ядер, до 5.2 ГГц)' },
          { name: 'Оперативна пам\'ять', value: '16 ГБ LPDDR5' },
          { name: 'Накопичувач', value: '512 ГБ PCIe Gen 4 SSD' },
          { name: 'Автономність', value: 'до 15 годин' },
          { name: 'Порти', value: '2× Thunderbolt 4, 2× USB-A 3.2, HDMI 2.0b' },
          { name: 'Захист', value: 'MIL-STD-810H (12 методів)' },
          { name: 'Безпека', value: 'Сканер відбитка пальця, ІЧ-камера, dTPM 2.0' },
          { name: 'Вага', value: '1.12 кг' }
        ],
        features: ['MIL-STD-810H', 'ІЧ-камера', 'ThinkPad клавіатура', 'Сканер відбитка', '5G LTE (опція)', 'TrackPoint'],
        tags: ['бізнес', 'lenovo', 'легкий', 'oled'],
        warranty: '3 роки',
        weight: { value: 1120, unit: 'g' }
      },
      {
        name: 'HP Pavilion 15 (2024)',
        description: 'HP Pavilion 15 — збалансований ноутбук для щоденної роботи та навчання за доступною ціною. Intel Core i5-1335U та 8 ГБ оперативної пам\'яті забезпечують комфортну багатозадачність. 15.6-дюймовий Full HD IPS дисплей з антивідбликовим покриттям підходить для тривалого використання. Швидка зарядка HP Fast Charge заряджає батарею до 50% за 45 хвилин.',
        shortDescription: 'Збалансований ноутбук для навчання та роботи',
        price: 22999,
        comparePrice: 26999,
        category: categories[1]._id,
        brand: 'HP',
        sku: 'HP-PAV15-I5-512',
        stock: 48,
        lowStockThreshold: 8,
        images: [
          { url: 'https://placehold.co/800x800/0f172a/e2e8f0/png?text=HP%20Pavilion%2015%20(2024)', alt: 'HP Pavilion 15 (2024) (зображення-заповнювач)', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '15.6" Full HD IPS (1920×1080), 250 ніт, антивідблиск' },
          { name: 'Процесор', value: 'Intel Core i5-1335U (10 ядер, до 4.6 ГГц)' },
          { name: 'Оперативна пам\'ять', value: '8 ГБ DDR4 3200 МГц' },
          { name: 'Накопичувач', value: '512 ГБ PCIe NVMe SSD' },
          { name: 'Відеокарта', value: 'Intel Iris Xe Graphics' },
          { name: 'Автономність', value: 'до 8.5 годин' },
          { name: 'Порти', value: '1× USB-C, 2× USB-A, HDMI, SD-картрідер' },
          { name: 'Вага', value: '1.75 кг' }
        ],
        features: ['HP Fast Charge (50% за 45 хв)', 'Wi-Fi 6', 'Bluetooth 5.3', 'Підсвітка клавіатури', 'HP True Vision 720p'],
        tags: ['для навчання', 'hp', 'бюджетний', 'студентський'],
        warranty: '2 роки',
        weight: { value: 1750, unit: 'g' },
        isOnSale: true
      },
      {
        name: 'Dell XPS 15 (9530)',
        description: 'Dell XPS 15 з OLED дисплеєм 3.5K — ідеальний вибір для дизайнерів та контент-мейкерів. 100% покриття DCI-P3 та DisplayHDR 500 забезпечують найточнішу передачу кольорів. NVIDIA RTX 4060 прискорює роботу в Adobe Premiere Pro, DaVinci Resolve та Blender. InfinityEdge рамки створюють максимально занурюючий досвід.',
        shortDescription: 'Преміальний ноутбук з 3.5K OLED для творчості',
        price: 64999,
        comparePrice: 69999,
        category: categories[1]._id,
        brand: 'Dell',
        sku: 'DEL-XPS15-I7-512',
        stock: 16,
        lowStockThreshold: 3,
        images: [
          { url: 'https://placehold.co/800x800/0f172a/e2e8f0/png?text=Dell%20XPS%2015%20(9530)', alt: 'Dell XPS 15 (9530) (зображення-заповнювач)', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '15.6" 3.5K OLED (3456×2160), touch, 400 ніт, 100% DCI-P3' },
          { name: 'Процесор', value: 'Intel Core i7-13700H (14 ядер, до 5.0 ГГц)' },
          { name: 'Оперативна пам\'ять', value: '16 ГБ DDR5 4800 МГц' },
          { name: 'Накопичувач', value: '512 ГБ PCIe Gen 4 NVMe SSD' },
          { name: 'Відеокарта', value: 'NVIDIA GeForce RTX 4060 6 ГБ' },
          { name: 'Автономність', value: 'до 13 годин' },
          { name: 'Порти', value: '2× Thunderbolt 4, 1× USB-C 3.2, SD-картрідер' },
          { name: 'Вага', value: '1.86 кг' }
        ],
        features: ['InfinityEdge дисплей', 'Thunderbolt 4', 'Сканер відбитка', 'Windows Hello IR-камера', 'CNC-алюмінієвий корпус'],
        tags: ['для дизайнерів', 'dell', 'oled', 'rtx 4060', 'преміум'],
        warranty: '2 роки',
        weight: { value: 1860, unit: 'g' },
        isOnSale: true
      },

      // ─────────────────────────────────────────────────────────────
      // ПЛАНШЕТИ (categories[2])
      // ─────────────────────────────────────────────────────────────
      {
        name: 'iPad Pro 13" M4 256GB',
        description: 'iPad Pro 13 дюймів з чіпом Apple M4 — найтонший та найпотужніший iPad в історії. Революційний дисплей Ultra Retina XDR на основі OLED-панелі та технології tandem забезпечує яскравість до 1600 ніт. Чіп M4 з апаратним трасуванням променів відкриває нові можливості для 3D-дизайну, відеомонтажу та AR-додатків. Apple Pencil Pro з датчиком стискання та зворотним тактильним відгуком.',
        shortDescription: 'Найтонший iPad з чіпом M4 та OLED дисплеєм',
        price: 55999,
        comparePrice: 59999,
        category: categories[2]._id,
        brand: 'Apple',
        sku: 'APL-IPADP13-M4-256',
        stock: 20,
        lowStockThreshold: 3,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/About_iPad_Pro_13-inch_%28M4%29.jpg/960px-About_iPad_Pro_13-inch_%28M4%29.jpg', alt: 'iPad Pro 13" M4 256GB', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '13" Ultra Retina XDR OLED, 2752×2064, 120 Гц ProMotion' },
          { name: 'Процесор', value: 'Apple M4: 10-ядерний CPU, 10-ядерний GPU' },
          { name: 'Оперативна пам\'ять', value: '8 ГБ' },
          { name: 'Накопичувач', value: '256 ГБ' },
          { name: 'Камера', value: '12 Мп Wide + адаптивний True Tone flash' },
          { name: 'Фронтальна камера', value: '12 Мп TrueDepth з Center Stage (ландшафтна)' },
          { name: 'Автономність', value: 'до 10 годин' },
          { name: 'Порти', value: 'Thunderbolt / USB 4' },
          { name: 'Товщина', value: '5.1 мм' },
          { name: 'Вага', value: '579 г (Wi-Fi)' }
        ],
        features: ['Apple Pencil Pro', 'Magic Keyboard', 'Face ID', 'ProMotion 120 Гц', 'Thunderbolt', '5G (опція)', 'LiDAR Scanner'],
        tags: ['apple', 'професійний', 'oled', 'для художників'],
        warranty: '2 роки',
        weight: { value: 579, unit: 'g' },
        isFeatured: true,
        isOnSale: true
      },
      {
        name: 'iPad Air 11" M2 128GB',
        description: 'iPad Air з чіпом M2 — потужний та універсальний планшет для роботи та навчання. 11-дюймовий Liquid Retina дисплей з антивідбликовим покриттям та P3 кольоровою гамою. Підтримує Apple Pencil Pro та Magic Keyboard Folio. Wi-Fi 6E та опціональний 5G забезпечують швидке з\'єднання.',
        shortDescription: 'Потужний планшет з чіпом M2 для роботи та навчання',
        price: 27999,
        category: categories[2]._id,
        brand: 'Apple',
        sku: 'APL-IPADA11-M2-128',
        stock: 42,
        lowStockThreshold: 5,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/About_iPad_Air_11-inch_%28M2%29.jpg/960px-About_iPad_Air_11-inch_%28M2%29.jpg', alt: 'iPad Air 11" M2 128GB', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '11" Liquid Retina, 2360×1640, P3, 500 ніт' },
          { name: 'Процесор', value: 'Apple M2: 8-ядерний CPU, 10-ядерний GPU' },
          { name: 'Оперативна пам\'ять', value: '8 ГБ' },
          { name: 'Накопичувач', value: '128 ГБ' },
          { name: 'Камера', value: '12 Мп Wide' },
          { name: 'Фронтальна камера', value: '12 Мп з Center Stage (ландшафтна)' },
          { name: 'Автономність', value: 'до 10 годин' },
          { name: 'Порти', value: 'USB-C (до 10 Гбіт/с)' },
          { name: 'Вага', value: '462 г' }
        ],
        features: ['Apple Pencil Pro', 'Magic Keyboard Folio', 'Touch ID', 'Wi-Fi 6E', 'USB-C'],
        tags: ['apple', 'для навчання', 'планшет'],
        warranty: '2 роки',
        weight: { value: 462, unit: 'g' },
        isFeatured: true
      },
      {
        name: 'Samsung Galaxy Tab S9 Ultra 256GB',
        description: 'Samsung Galaxy Tab S9 Ultra — найбільший планшет Samsung з 14.6-дюймовим Dynamic AMOLED 2X дисплеєм. S Pen з мінімальною затримкою 2.8 мс входить у комплект. Snapdragon 8 Gen 2 for Galaxy забезпечує продуктивність рівня ноутбука. IP68 захист від води та пилу — унікальна особливість серед планшетів.',
        shortDescription: 'Великий планшет з 14.6" AMOLED і S Pen у комплекті',
        price: 44999,
        category: categories[2]._id,
        brand: 'Samsung',
        sku: 'SAM-TABS9U-256-GRY',
        stock: 15,
        lowStockThreshold: 3,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Samsung_Galaxy_Tab_S9.png/960px-Samsung_Galaxy_Tab_S9.png', alt: 'Samsung Galaxy Tab S9 Ultra 256GB', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '14.6" Dynamic AMOLED 2X, 2960×1848, 120 Гц' },
          { name: 'Процесор', value: 'Qualcomm Snapdragon 8 Gen 2 for Galaxy' },
          { name: 'Оперативна пам\'ять', value: '12 ГБ' },
          { name: 'Накопичувач', value: '256 ГБ (розширення до 1 ТБ microSD)' },
          { name: 'Камера', value: '13 Мп + 8 Мп ультраширокий' },
          { name: 'Фронтальна камера', value: '12 Мп + 12 Мп ультраширокий' },
          { name: 'Акумулятор', value: '11200 мАг, швидка зарядка 45 Вт' },
          { name: 'Захист', value: 'IP68' },
          { name: 'Вага', value: '732 г' }
        ],
        features: ['S Pen у комплекті', 'IP68', 'Samsung DeX', '120 Гц AMOLED', 'Quad Speakers AKG', 'Wi-Fi 6E'],
        tags: ['samsung', 'великий дисплей', 's pen', 'планшет'],
        warranty: '2 роки',
        weight: { value: 732, unit: 'g' }
      },

      // ─────────────────────────────────────────────────────────────
      // НАВУШНИКИ (categories[3])
      // ─────────────────────────────────────────────────────────────
      {
        name: 'Sony WH-1000XM5',
        description: 'Sony WH-1000XM5 — повнорозмірні бездротові навушники з найкращим шумоподавленням у галузі. Два процесори V1 та HD Noise Cancelling Processor QN1 аналізують оточуючий шум та адаптуються до оточення за мілісекунди. 30-мм драйвери з карбоновим волокном забезпечують чистий та деталізований звук. Multipoint Bluetooth — одночасне з\'єднання з двома пристроями.',
        shortDescription: 'Преміум навушники з найкращим шумоподавленням',
        price: 14999,
        comparePrice: 16999,
        category: categories[3]._id,
        brand: 'Sony',
        sku: 'SON-WH1000XM5-BLK',
        stock: 36,
        lowStockThreshold: 5,
        images: [
          { url: 'https://placehold.co/800x800/0f172a/e2e8f0/png?text=Sony%20WH-1000XM5', alt: 'Sony WH-1000XM5 (зображення-заповнювач)', isMain: true }
        ],
        specifications: [
          { name: 'Тип', value: 'Повнорозмірні бездротові (over-ear)' },
          { name: 'Драйвери', value: '30 мм, карбонове волокно' },
          { name: 'Шумоподавлення', value: 'Адаптивне ANC (8 мікрофонів)' },
          { name: 'Bluetooth', value: '5.2, кодеки LDAC / AAC / SBC' },
          { name: 'Автономність', value: 'до 30 годин з ANC' },
          { name: 'Швидка зарядка', value: '3 хвилини = 3 години відтворення' },
          { name: 'Вага', value: '250 г' },
          { name: 'Мікрофон', value: '4 мікрофони з AI Noise Reduction для дзвінків' }
        ],
        features: ['Speak-to-Chat', 'Adaptive Sound Control', 'Multipoint (2 пристрої)', 'LDAC Hi-Res Audio', 'DSEE Extreme', '360 Reality Audio', 'Touch-керування'],
        tags: ['шумоподавлення', 'sony', 'преміум', 'hi-res'],
        warranty: '2 роки',
        weight: { value: 250, unit: 'g' },
        isFeatured: true,
        isOnSale: true
      },
      {
        name: 'Apple AirPods Pro 2 (USB-C)',
        description: 'Apple AirPods Pro 2 з USB-C кейсом — TWS навушники з активним шумоподавленням та просторовим аудіо. Чіп Apple H2 забезпечує вдвічі краще шумоподавлення порівняно з першим поколінням. Adaptive Audio автоматично мікшує режим шумоподавлення та прозорості залежно від оточення. Conversation Awareness знижує гучність та підсилює голос співрозмовника.',
        shortDescription: 'TWS навушники Apple з чіпом H2 та адаптивним аудіо',
        price: 10999,
        category: categories[3]._id,
        brand: 'Apple',
        sku: 'APL-APP2-USBC',
        stock: 65,
        lowStockThreshold: 10,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/AirPods_Pro_%282nd_generation%29.jpg/960px-AirPods_Pro_%282nd_generation%29.jpg', alt: 'Apple AirPods Pro 2 (USB-C)', isMain: true }
        ],
        specifications: [
          { name: 'Тип', value: 'TWS (True Wireless Stereo)' },
          { name: 'Чіп', value: 'Apple H2' },
          { name: 'Шумоподавлення', value: 'Адаптивне ANC, Transparency, Adaptive Audio' },
          { name: 'Автономність', value: '6 годин ANC, до 30 годин з кейсом' },
          { name: 'Зарядка кейсу', value: 'USB-C, бездротова MagSafe / Qi, Apple Watch' },
          { name: 'Bluetooth', value: '5.3' },
          { name: 'Захист', value: 'IP54 (навушники та кейс)' },
          { name: 'Вага', value: '5.3 г (кожен навушник)' }
        ],
        features: ['Adaptive Audio', 'Conversation Awareness', 'Personalized Spatial Audio', 'MagSafe зарядка', 'Find My (U1 чіп у кейсі)', 'Touch & Swipe керування'],
        tags: ['tws', 'apple', 'airpods', 'шумоподавлення'],
        warranty: '2 роки',
        weight: { value: 50.8, unit: 'g' },
        isFeatured: true
      },
      {
        name: 'Samsung Galaxy Buds2 Pro',
        description: 'Samsung Galaxy Buds2 Pro — компактні TWS навушники з активним шумоподавленням та Hi-Fi звуком 24-bit. Двосмугова акустична система з вуфером та твітером забезпечує багатий та деталізований звук. Intelligent ANC з 3 рівнями шумоподавлення адаптується до оточення. 360 Audio з відстеженням положення голови створює просторовий звук у фільмах та іграх.',
        shortDescription: 'Компактні TWS з Hi-Fi 24-bit та шумоподавленням',
        price: 7499,
        comparePrice: 8999,
        category: categories[3]._id,
        brand: 'Samsung',
        sku: 'SAM-GB2P-GRY',
        stock: 44,
        lowStockThreshold: 8,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Samsung_Galaxy_Buds2_Pro_%28Graphite%29.jpg/960px-Samsung_Galaxy_Buds2_Pro_%28Graphite%29.jpg', alt: 'Samsung Galaxy Buds2 Pro', isMain: true }
        ],
        specifications: [
          { name: 'Тип', value: 'TWS (True Wireless Stereo)' },
          { name: 'Драйвери', value: '2-смугові: 10 мм вуфер + 5.3 мм твітер' },
          { name: 'Шумоподавлення', value: 'Intelligent ANC (3 рівні)' },
          { name: 'Кодеки', value: 'Samsung SSC HiFi (24-bit), AAC, SBC' },
          { name: 'Автономність', value: '5 годин ANC + 18 годин з кейсом' },
          { name: 'Зарядка', value: 'USB-C, бездротова Qi' },
          { name: 'Захист', value: 'IPX7 (навушники), IPX2 (кейс)' },
          { name: 'Вага', value: '5.5 г (кожен навушник)' }
        ],
        features: ['360 Audio', 'Voice Detect', 'Auto Switch (Samsung)', 'Samsung SmartThings Find', 'Hi-Res Audio 24-bit'],
        tags: ['tws', 'samsung', 'hi-fi', 'компактні'],
        warranty: '2 роки',
        weight: { value: 43.4, unit: 'g' },
        isOnSale: true
      },
      {
        name: 'JBL Tune 770NC',
        description: 'JBL Tune 770NC — доступні повнорозмірні бездротові навушники з активним шумоподавленням та легендарним звуком JBL Pure Bass. До 70 годин роботи без ANC — один із найкращих показників серед навушників. Adaptive ANC адаптується до оточуючого шуму. Складна конструкція та м\'які амбушюри забезпечують комфорт при тривалому носінні.',
        shortDescription: 'Доступні навушники з ANC та 70 годин автономності',
        price: 3499,
        comparePrice: 3999,
        category: categories[3]._id,
        brand: 'JBL',
        sku: 'JBL-T770NC-BLK',
        stock: 72,
        lowStockThreshold: 10,
        images: [
          { url: 'https://placehold.co/800x800/0f172a/e2e8f0/png?text=JBL%20Tune%20770NC', alt: 'JBL Tune 770NC (зображення-заповнювач)', isMain: true }
        ],
        specifications: [
          { name: 'Тип', value: 'Повнорозмірні бездротові (over-ear)' },
          { name: 'Драйвери', value: '40 мм' },
          { name: 'Шумоподавлення', value: 'Adaptive ANC' },
          { name: 'Bluetooth', value: '5.3, кодеки AAC / SBC' },
          { name: 'Автономність', value: 'до 44 годин з ANC, до 70 годин без ANC' },
          { name: 'Швидка зарядка', value: '5 хвилин = 3 години відтворення' },
          { name: 'Multipoint', value: 'Так (2 пристрої одночасно)' },
          { name: 'Вага', value: '223 г' }
        ],
        features: ['JBL Pure Bass', 'Adaptive ANC', 'Smart Ambient', 'Multipoint', 'JBL Headphones App', 'Складна конструкція'],
        tags: ['бюджетний', 'jbl', 'anc', 'довга батарея'],
        warranty: '1 рік',
        weight: { value: 223, unit: 'g' },
        isOnSale: true
      },

      // ─────────────────────────────────────────────────────────────
      // СМАРТ-ГОДИННИКИ (categories[4])
      // ─────────────────────────────────────────────────────────────
      {
        name: 'Apple Watch Series 9 45mm',
        description: 'Apple Watch Series 9 з чіпом S9 SiP — найпотужніший Apple Watch. Жест Double Tap дозволяє керувати годинником однією рукою, стискаючи великий та вказівний палець. Надяскравий Always-On Retina дисплей з піковою яскравістю 2000 ніт чудово читається на сонці. Датчики: кисень у крові, ЕКГ, температура зап\'ястя, прискорення до 256g (Crash Detection).',
        shortDescription: 'Смарт-годинник Apple з жестом Double Tap та датчиками здоров\'я',
        price: 18999,
        comparePrice: 20999,
        category: categories[4]._id,
        brand: 'Apple',
        sku: 'APL-AW9-45-GPS-MID',
        stock: 50,
        lowStockThreshold: 8,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Apple_Watch_Series_9_1_2023-11-14.jpg/960px-Apple_Watch_Series_9_1_2023-11-14.jpg', alt: 'Apple Watch Series 9 45mm', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '45 мм Always-On Retina LTPO OLED, 396×484, до 2000 ніт' },
          { name: 'Процесор', value: 'Apple S9 SiP (5.6 млрд транзисторів)' },
          { name: 'Накопичувач', value: '64 ГБ' },
          { name: 'Датчики', value: 'SpO2, ЕКГ, температура, акселерометр 256g, гіроскоп' },
          { name: 'Автономність', value: 'до 18 годин (36 годин у Low Power Mode)' },
          { name: 'Водонепроникність', value: 'WR50 (плавання)' },
          { name: 'Підключення', value: 'Wi-Fi, Bluetooth 5.3, NFC, UWB (U2)' },
          { name: 'Вага', value: '38.7 г (алюміній без ремінця)' }
        ],
        features: ['Double Tap', 'Blood Oxygen', 'ECG', 'Temperature Sensing', 'Crash Detection', 'Fall Detection', 'Apple Pay', 'watchOS 10'],
        tags: ['apple', 'здоров\'я', 'фітнес', 'новинка'],
        warranty: '2 роки',
        weight: { value: 38.7, unit: 'g' },
        isFeatured: true,
        isOnSale: true
      },
      {
        name: 'Samsung Galaxy Watch 6 Classic 47mm',
        description: 'Samsung Galaxy Watch 6 Classic — смарт-годинник з класичним фізичним безелем для зручного навігування інтерфейсом. BioActive Sensor відстежує пульс, SpO2, ЕКГ та аналізує склад тіла (BIA). Покращений датчик сну з аналізом хропіння та рекомендаціями Sleep Coaching. Працює з Wear OS від Google та One UI Watch 5.',
        shortDescription: 'Класичний смарт-годинник з обертовим безелем',
        price: 14999,
        category: categories[4]._id,
        brand: 'Samsung',
        sku: 'SAM-GW6C-47-BLK',
        stock: 34,
        lowStockThreshold: 5,
        images: [
          { url: 'https://placehold.co/800x800/0f172a/e2e8f0/png?text=Samsung%20Galaxy%20Watch%206%20Classic%2047mm', alt: 'Samsung Galaxy Watch 6 Classic 47mm (зображення-заповнювач)', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '1.47" Super AMOLED, 480×480, Always-On' },
          { name: 'Процесор', value: 'Samsung Exynos W930 (5 нм)' },
          { name: 'Оперативна пам\'ять', value: '2 ГБ' },
          { name: 'Накопичувач', value: '16 ГБ' },
          { name: 'Датчики', value: 'BioActive Sensor (BIA, ЕКГ, SpO2, пульс, температура шкіри)' },
          { name: 'Автономність', value: 'до 40 годин' },
          { name: 'Водонепроникність', value: '5ATM + IP68' },
          { name: 'ОС', value: 'Wear OS 4 + One UI Watch 5' },
          { name: 'Вага', value: '59 г (без ремінця)' }
        ],
        features: ['Rotating Bezel', 'BIA (склад тіла)', 'ЕКГ', 'Sleep Coaching', 'Google Maps', 'Google Pay'],
        tags: ['samsung', 'класичний', 'фітнес', 'wear os'],
        warranty: '2 роки',
        weight: { value: 59, unit: 'g' }
      },

      // ─────────────────────────────────────────────────────────────
      // АКСЕСУАРИ (categories[5])
      // ─────────────────────────────────────────────────────────────
      {
        name: 'Apple MagSafe Charger (15 Вт)',
        description: 'Бездротова зарядка Apple MagSafe з магнітним кріпленням для точного позиціонування iPhone. Забезпечує зарядку до 15 Вт для iPhone 12 і новіших. Сумісна з Qi-пристроями зі швидкістю до 7.5 Вт. Також заряджає AirPods з кейсом MagSafe. Кабель USB-C довжиною 1 метр.',
        shortDescription: 'Магнітна бездротова зарядка для iPhone',
        price: 1899,
        category: categories[5]._id,
        brand: 'Apple',
        sku: 'APL-MAGSAFE-1M',
        stock: 95,
        lowStockThreshold: 15,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/MagSafe_%28iPhone%29.png/960px-MagSafe_%28iPhone%29.png', alt: 'Apple MagSafe Charger (15 Вт)', isMain: true }
        ],
        specifications: [
          { name: 'Тип', value: 'Бездротова зарядка з магнітним кріпленням' },
          { name: 'Потужність', value: 'до 15 Вт (MagSafe), до 7.5 Вт (Qi)' },
          { name: 'Кабель', value: 'USB-C, 1 метр' },
          { name: 'Сумісність', value: 'iPhone 12+, AirPods Pro 2, AirPods 3' }
        ],
        features: ['Магнітне кріплення', 'Швидка бездротова зарядка', 'Qi сумісність', 'Кейс-сумісність'],
        tags: ['зарядка', 'apple', 'magsafe', 'бездротова'],
        warranty: '1 рік',
        weight: { value: 56, unit: 'g' }
      },
      {
        name: 'Anker PowerCore 26800mAh PD',
        description: 'Anker PowerCore 26800mAh — потужний павербанк з підтримкою Power Delivery 60 Вт для зарядки не тільки смартфонів, але й ноутбуків MacBook Air та iPad. Три USB-порти дозволяють заряджати кілька пристроїв одночасно. PowerIQ 3.0 автоматично визначає оптимальну швидкість зарядки для кожного пристрою.',
        shortDescription: 'Потужний павербанк для смартфонів та ноутбуків',
        price: 2499,
        comparePrice: 2899,
        category: categories[5]._id,
        brand: 'Anker',
        sku: 'ANK-PC26800-PD60',
        stock: 53,
        lowStockThreshold: 8,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/2023_Powerbank_Anker_Powercore_5000mAh.jpg/960px-2023_Powerbank_Anker_Powercore_5000mAh.jpg', alt: 'Anker PowerCore 26800mAh PD', isMain: true }
        ],
        specifications: [
          { name: 'Ємність', value: '26800 мАг (96.48 Вт·год)' },
          { name: 'Виходи', value: '1× USB-C PD (60 Вт) + 2× USB-A (PowerIQ 3.0)' },
          { name: 'Вхід', value: 'USB-C PD (60 Вт)' },
          { name: 'Зарядка MacBook Air', value: '~2.5 зарядки' },
          { name: 'Зарядка iPhone 15', value: '~6.5 зарядок' },
          { name: 'Розміри', value: '180 × 80 × 24 мм' },
          { name: 'Вага', value: '580 г' }
        ],
        features: ['PowerIQ 3.0', 'USB-C PD 60 Вт', 'Trickle Charge (для навушників)', 'MultiProtect (10 ступенів захисту)'],
        tags: ['павербанк', 'anker', 'usb-c pd', 'для подорожей'],
        warranty: '18 місяців',
        weight: { value: 580, unit: 'g' },
        isOnSale: true
      },
      {
        name: 'Logitech MX Master 3S',
        description: 'Logitech MX Master 3S — флагманська бездротова миша для продуктивності з тихими клацаннями та колесом MagSpeed. Сенсор 8000 DPI відстежує рух навіть на склі. Flow дозволяє плавно переміщувати курсор та файли між комп\'ютерами. Ергономічна форма підтримує руку під ідеальним кутом. До 70 днів роботи на одному заряді.',
        shortDescription: 'Флагманська ергономічна миша для продуктивності',
        price: 4499,
        comparePrice: 4999,
        category: categories[5]._id,
        brand: 'Logitech',
        sku: 'LOG-MXM3S-GRY',
        stock: 30,
        lowStockThreshold: 5,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Logitech_MX_Master_3S_HS01.jpg/960px-Logitech_MX_Master_3S_HS01.jpg', alt: 'Logitech MX Master 3S', isMain: true }
        ],
        specifications: [
          { name: 'Тип', value: 'Бездротова ергономічна миша' },
          { name: 'Сенсор', value: '8000 DPI (відстеження на склі)' },
          { name: 'Підключення', value: 'Bluetooth Low Energy + Logi Bolt (USB-A)' },
          { name: 'Автономність', value: 'до 70 днів (1 хвилина зарядки = 3 години роботи)' },
          { name: 'Зарядка', value: 'USB-C' },
          { name: 'Кнопки', value: '7 програмованих' },
          { name: 'Вага', value: '141 г' }
        ],
        features: ['Тихі клацання (90% тихіше)', 'MagSpeed колесо (1000 рядків/сек)', 'Flow (керування між ПК)', 'Logi Options+', 'App-Specific Settings'],
        tags: ['миша', 'logitech', 'продуктивність', 'ергономічна'],
        warranty: '2 роки',
        weight: { value: 141, unit: 'g' },
        isOnSale: true
      },
      {
        name: 'Samsung T7 Shield 1TB',
        description: 'Samsung T7 Shield — захищений портативний SSD зі швидкістю послідовного читання до 1050 МБ/с. Прогумований корпус відповідає стандарту IP65 та витримує падіння з висоти 3 метри. AES 256-bit апаратне шифрування захищає важливі дані. Компактні розміри дозволяють завжди мати швидкий накопичувач під рукою.',
        shortDescription: 'Захищений портативний SSD зі швидкістю 1050 МБ/с',
        price: 4299,
        category: categories[5]._id,
        brand: 'Samsung',
        sku: 'SAM-T7S-1TB-BLK',
        stock: 38,
        lowStockThreshold: 5,
        images: [
          { url: 'https://placehold.co/800x800/0f172a/e2e8f0/png?text=Samsung%20T7%20Shield%201TB', alt: 'Samsung T7 Shield 1TB (зображення-заповнювач)', isMain: true }
        ],
        specifications: [
          { name: 'Ємність', value: '1 ТБ' },
          { name: 'Швидкість читання', value: 'до 1050 МБ/с' },
          { name: 'Швидкість запису', value: 'до 1000 МБ/с' },
          { name: 'Інтерфейс', value: 'USB 3.2 Gen 2 (10 Гбіт/с)' },
          { name: 'Захист', value: 'IP65 (пил + вода), падіння з 3 м' },
          { name: 'Шифрування', value: 'AES 256-bit (апаратне)' },
          { name: 'Розміри', value: '88 × 59 × 13 мм' },
          { name: 'Вага', value: '98 г' }
        ],
        features: ['IP65', 'Падіння з 3 м', 'AES 256-bit', 'USB-C + USB-A кабелі', 'Сумісність з Mac, PC, Android, PS5, Xbox'],
        tags: ['ssd', 'samsung', 'захищений', 'портативний'],
        warranty: '3 роки',
        weight: { value: 98, unit: 'g' }
      },

      // ─────────────────────────────────────────────────────────────
      // ДОДАТКОВІ СМАРТФОНИ (categories[0])
      // ─────────────────────────────────────────────────────────────
      {
        name: 'Samsung Galaxy A55 5G 128GB',
        description: 'Samsung Galaxy A55 — найкращий смартфон середнього класу з флагманськими функціями. 6.6-дюймовий Super AMOLED дисплей з частотою 120 Гц та яскравістю 1000 ніт. Процесор Samsung Exynos 1480 забезпечує плавну роботу. Основна камера 50 Мп з OIS для різких фото. Захист IP67 рідкість для цінової категорії.',
        shortDescription: 'Кращий середній клас Samsung з AMOLED 120 Гц',
        price: 14999,
        comparePrice: 16999,
        category: categories[0]._id,
        brand: 'Samsung',
        sku: 'SAM-GA55-128-NVY',
        stock: 88,
        lowStockThreshold: 15,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Samsung_Galaxy_A55_5G_2024.jpg/960px-Samsung_Galaxy_A55_5G_2024.jpg', alt: 'Samsung Galaxy A55 5G 128GB', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '6.6" Super AMOLED, 2340×1080, 120 Гц' },
          { name: 'Процесор', value: 'Samsung Exynos 1480' },
          { name: 'Оперативна пам\'ять', value: '8 ГБ' },
          { name: 'Накопичувач', value: '128 ГБ (microSD до 1 ТБ)' },
          { name: 'Основна камера', value: '50 Мп (OIS) + 12 Мп ультраширокий + 5 Мп макро' },
          { name: 'Акумулятор', value: '5000 мАг, 25 Вт' },
          { name: 'Захист', value: 'IP67, Gorilla Glass Victus+' },
          { name: 'ОС', value: 'Android 14, One UI 6.1' },
          { name: 'Вага', value: '213 г' }
        ],
        features: ['120 Гц Super AMOLED', 'IP67', 'OIS', '5G', '4 роки оновлень'],
        tags: ['середній клас', 'samsung', 'ip67', 'хіт продажів'],
        warranty: '2 роки',
        weight: { value: 213, unit: 'g' },
        isOnSale: true
      },
      {
        name: 'Xiaomi Redmi Note 13 Pro 256GB',
        description: 'Xiaomi Redmi Note 13 Pro — смартфон із камерою 200 Мп за доступною ціною. Великий сенсор Samsung ISOCELL HP3 забезпечує неймовірну деталізацію та якість фото при будь-якому освітленні. AMOLED дисплей з частотою 120 Гц та піковою яскравістю 1800 ніт. Зарядка 67 Вт заряджає акумулятор 5100 мАг менш ніж за годину. IP54 захист від бризок.',
        shortDescription: 'Камера 200 Мп та AMOLED 120 Гц за доступною ціною',
        price: 11499,
        category: categories[0]._id,
        brand: 'Xiaomi',
        sku: 'XIA-RN13P-256-BLK',
        stock: 95,
        lowStockThreshold: 15,
        images: [
          { url: 'https://placehold.co/800x800/0f172a/e2e8f0/png?text=Xiaomi%20Redmi%20Note%2013%20Pro%20256GB', alt: 'Xiaomi Redmi Note 13 Pro 256GB (зображення-заповнювач)', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '6.67" AMOLED, 2400×1080, 120 Гц, 1800 ніт' },
          { name: 'Процесор', value: 'MediaTek Helio G99 Ultra' },
          { name: 'Оперативна пам\'ять', value: '8 ГБ' },
          { name: 'Накопичувач', value: '256 ГБ' },
          { name: 'Основна камера', value: '200 Мп Samsung HP3 (OIS) + 8 Мп ультраширокий + 2 Мп макро' },
          { name: 'Акумулятор', value: '5100 мАг, 67 Вт' },
          { name: 'Захист', value: 'IP54, Gorilla Glass 5' },
          { name: 'ОС', value: 'Android 13, MIUI 14' },
          { name: 'Вага', value: '187 г' }
        ],
        features: ['200 Мп камера', '67 Вт зарядка', '120 Гц AMOLED', 'NFC', 'IR-бластер'],
        tags: ['бюджетний', 'xiaomi', '200 мп', 'хіт продажів'],
        warranty: '1 рік',
        weight: { value: 187, unit: 'g' },
        isFeatured: true
      },
      {
        name: 'Nothing Phone (2) 256GB',
        description: 'Nothing Phone (2) — унікальний смартфон з прозорим дизайном та світлодіодним інтерфейсом Glyph. 900+ LED-ів на задній панелі створюють унікальні патерни сповіщень, індикатори зарядки та навіть працюють як заповнювальне світло для фото. Snapdragon 8+ Gen 1 забезпечує флагманську продуктивність. Nothing OS — чистий Android з мінімалістичними віджетами та монохромною темою.',
        shortDescription: 'Унікальний дизайн з Glyph Interface та чистим Android',
        price: 22999,
        category: categories[0]._id,
        brand: 'Nothing',
        sku: 'NTH-PH2-256-WHT',
        stock: 19,
        lowStockThreshold: 3,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Nothing_phone_%282%29_%28Booredatwork.com%29_001.png/960px-Nothing_phone_%282%29_%28Booredatwork.com%29_001.png', alt: 'Nothing Phone (2) 256GB', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '6.7" LTPO OLED, 2412×1080, 120 Гц' },
          { name: 'Процесор', value: 'Qualcomm Snapdragon 8+ Gen 1' },
          { name: 'Оперативна пам\'ять', value: '12 ГБ' },
          { name: 'Накопичувач', value: '256 ГБ' },
          { name: 'Основна камера', value: '50 Мп Sony IMX890 (OIS) + 50 Мп ультраширокий' },
          { name: 'Акумулятор', value: '4700 мАг, 45 Вт, бездротова 15 Вт' },
          { name: 'Захист', value: 'IP54' },
          { name: 'ОС', value: 'Android 14, Nothing OS 2.5' },
          { name: 'Вага', value: '201.2 г' }
        ],
        features: ['Glyph Interface (900+ LED)', 'Nothing OS', '120 Гц LTPO', 'Бездротова зарядка', 'NFC'],
        tags: ['nothing', 'дизайн', 'унікальний', 'чистий android'],
        warranty: '2 роки',
        weight: { value: 201.2, unit: 'g' }
      },

      // ─────────────────────────────────────────────────────────────
      // ДОДАТКОВІ НОУТБУКИ (categories[1])
      // ─────────────────────────────────────────────────────────────
      {
        name: 'Acer Swift Go 14 (2024)',
        description: 'Acer Swift Go 14 — доступний ультрабук з OLED дисплеєм та чіпом Intel Core Ultra. Процесор з вбудованим NPU для AI-задач забезпечує розумну оптимізацію продуктивності та енергоспоживання. 14-дюймовий 2.8K OLED дисплей з 100% покриттям DCI-P3 та DisplayHDR TrueBlack 500 — один з найкращих серед ноутбуків цієї цінової категорії.',
        shortDescription: 'Доступний ультрабук з OLED та Intel Core Ultra',
        price: 34999,
        category: categories[1]._id,
        brand: 'Acer',
        sku: 'ACR-SG14-ULTRA7-512',
        stock: 24,
        lowStockThreshold: 4,
        images: [
          { url: 'https://placehold.co/800x800/0f172a/e2e8f0/png?text=Acer%20Swift%20Go%2014%20(2024)', alt: 'Acer Swift Go 14 (2024) (зображення-заповнювач)', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '14" 2.8K OLED (2880×1800), 90 Гц, 100% DCI-P3' },
          { name: 'Процесор', value: 'Intel Core Ultra 7 155H (16 ядер, NPU)' },
          { name: 'Оперативна пам\'ять', value: '16 ГБ LPDDR5X' },
          { name: 'Накопичувач', value: '512 ГБ NVMe PCIe Gen 4 SSD' },
          { name: 'Автономність', value: 'до 10 годин' },
          { name: 'Порти', value: '2× Thunderbolt 4, USB-A 3.2, HDMI 2.1' },
          { name: 'Вага', value: '1.32 кг' }
        ],
        features: ['OLED дисплей', 'Intel AI Boost NPU', 'Thunderbolt 4', 'Wi-Fi 7', 'Сканер відбитка'],
        tags: ['ультрабук', 'acer', 'oled', 'ai', 'для навчання'],
        warranty: '2 роки',
        weight: { value: 1320, unit: 'g' }
      },
      {
        name: 'ASUS Zenbook 14 OLED (UX3405)',
        description: 'ASUS Zenbook 14 OLED — стильний та ультралегкий ноутбук в алюмінієвому корпусі вагою 1.2 кг. 14-дюймовий 3K OLED дисплей з 120 Гц та 100% DCI-P3 забезпечує найкращу передачу кольорів серед ноутбуків цього класу. Intel Core Ultra 9 185H та 32 ГБ RAM справляються навіть з вимогливими задачами. NumberPad 2.0 — тачпад, який перетворюється на цифрову клавіатуру.',
        shortDescription: 'Ультралегкий OLED-ноутбук з Core Ultra',
        price: 49999,
        category: categories[1]._id,
        brand: 'ASUS',
        sku: 'ASU-ZB14-U9-1TB',
        stock: 10,
        lowStockThreshold: 2,
        images: [
          { url: 'https://placehold.co/800x800/0f172a/e2e8f0/png?text=ASUS%20Zenbook%2014%20OLED%20(UX3405)', alt: 'ASUS Zenbook 14 OLED (UX3405) (зображення-заповнювач)', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '14" 3K OLED (2880×1800), 120 Гц, 100% DCI-P3, Pantone Validated' },
          { name: 'Процесор', value: 'Intel Core Ultra 9 185H (16 ядер)' },
          { name: 'Оперативна пам\'ять', value: '32 ГБ LPDDR5X' },
          { name: 'Накопичувач', value: '1 ТБ PCIe Gen 4 SSD' },
          { name: 'Автономність', value: 'до 14 годин' },
          { name: 'Порти', value: '2× Thunderbolt 4, USB-A 3.2, HDMI 2.1, microSD' },
          { name: 'Вага', value: '1.2 кг' }
        ],
        features: ['3K 120 Гц OLED', 'NumberPad 2.0', 'ASUS ErgoSense клавіатура', 'Thunderbolt 4', 'Wi-Fi 7', '75 Вт·год батарея'],
        tags: ['ультрабук', 'asus', 'oled', 'легкий', 'для дизайнерів'],
        warranty: '2 роки',
        weight: { value: 1200, unit: 'g' },
        isFeatured: true
      },

      // ─────────────────────────────────────────────────────────────
      // ДОДАТКОВІ ПЛАНШЕТИ (categories[2])
      // ─────────────────────────────────────────────────────────────
      {
        name: 'iPad 10-го покоління 64GB',
        description: 'iPad 10-го покоління — доступний планшет Apple для повсякденних задач та навчання. Повністю оновлений дизайн з плоскими гранями та 10.9-дюймовим Liquid Retina дисплеєм. USB-C для зручної зарядки та підключення периферії. 12 Мп фронтальна ультраширока камера з Center Stage для відеодзвінків. Підтримує Apple Pencil (1-го покоління) та Magic Keyboard Folio.',
        shortDescription: 'Доступний iPad з сучасним дизайном та USB-C',
        price: 17999,
        category: categories[2]._id,
        brand: 'Apple',
        sku: 'APL-IPAD10-64-BLU',
        stock: 56,
        lowStockThreshold: 10,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/IPad_10.2%E2%80%91inch.png/960px-IPad_10.2%E2%80%91inch.png', alt: 'iPad 10-го покоління 64GB', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '10.9" Liquid Retina, 2360×1640, 500 ніт' },
          { name: 'Процесор', value: 'Apple A14 Bionic' },
          { name: 'Накопичувач', value: '64 ГБ' },
          { name: 'Камера', value: '12 Мп Wide (f/1.8)' },
          { name: 'Фронтальна камера', value: '12 Мп ультраширока з Center Stage (ландшафтна)' },
          { name: 'Автономність', value: 'до 10 годин' },
          { name: 'Порти', value: 'USB-C' },
          { name: 'Вага', value: '477 г (Wi-Fi)' }
        ],
        features: ['USB-C', 'Center Stage', 'Apple Pencil (1-го покоління)', 'Magic Keyboard Folio', 'Touch ID'],
        tags: ['apple', 'бюджетний', 'для навчання', 'планшет'],
        warranty: '1 рік',
        weight: { value: 477, unit: 'g' }
      },
      {
        name: 'Xiaomi Pad 6 128GB',
        description: 'Xiaomi Pad 6 — преміальний Android-планшет за доступною ціною. 11-дюймовий 2.8K IPS дисплей з частотою 144 Гц забезпечує максимально плавний перегляд контенту та ігри. Snapdragon 870 — продуктивний процесор з ефективним енергоспоживанням. Чотири динаміки Dolby Atmos для якісного стереозвуку. Стилус Xiaomi Smart Pen (окремо) з затримкою 12 мс.',
        shortDescription: 'Преміальний Android-планшет з дисплеєм 144 Гц',
        price: 13999,
        comparePrice: 15999,
        category: categories[2]._id,
        brand: 'Xiaomi',
        sku: 'XIA-PAD6-128-GRY',
        stock: 40,
        lowStockThreshold: 8,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Xiaomi_Pad_6_display.jpg/960px-Xiaomi_Pad_6_display.jpg', alt: 'Xiaomi Pad 6 128GB', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '11" 2.8K IPS (2880×1800), 144 Гц, 550 ніт' },
          { name: 'Процесор', value: 'Qualcomm Snapdragon 870' },
          { name: 'Оперативна пам\'ять', value: '8 ГБ' },
          { name: 'Накопичувач', value: '128 ГБ UFS 3.1' },
          { name: 'Камера', value: '13 Мп' },
          { name: 'Фронтальна камера', value: '8 Мп' },
          { name: 'Акумулятор', value: '8840 мАг, 33 Вт' },
          { name: 'Вага', value: '490 г' }
        ],
        features: ['144 Гц дисплей', 'Dolby Atmos (4 динаміки)', 'Xiaomi Smart Pen', 'Цільнометалевий корпус', 'Wi-Fi 6'],
        tags: ['xiaomi', 'бюджетний', '144 гц', 'планшет'],
        warranty: '1 рік',
        weight: { value: 490, unit: 'g' },
        isOnSale: true
      },

      // ─────────────────────────────────────────────────────────────
      // ДОДАТКОВІ НАВУШНИКИ (categories[3])
      // ─────────────────────────────────────────────────────────────
      {
        name: 'Bose QuietComfort Ultra Headphones',
        description: 'Bose QuietComfort Ultra — навушники з революційним просторовим звуком Bose Immersive Audio. Новий алгоритм шумоподавлення CustomTune автоматично калібрує ANC під форму вашого вуха за секунди. Режим Aware with ActiveSense дозволяє чути оточення без зняття навушників. Фірмові лінзи Bose забезпечують глибокий, чистий та багатий звук.',
        shortDescription: 'Преміум навушники з просторовим звуком Bose Immersive',
        price: 16999,
        category: categories[3]._id,
        brand: 'Bose',
        sku: 'BOS-QCUH-BLK',
        stock: 25,
        lowStockThreshold: 4,
        images: [
          { url: 'https://placehold.co/800x800/0f172a/e2e8f0/png?text=Bose%20QuietComfort%20Ultra%20Headphones', alt: 'Bose QuietComfort Ultra Headphones (зображення-заповнювач)', isMain: true }
        ],
        specifications: [
          { name: 'Тип', value: 'Повнорозмірні бездротові (over-ear)' },
          { name: 'Шумоподавлення', value: 'CustomTune ANC (автокалібрування)' },
          { name: 'Bluetooth', value: '5.3, кодеки aptX Adaptive, AAC, SBC' },
          { name: 'Автономність', value: 'до 24 годин з ANC' },
          { name: 'Просторовий звук', value: 'Bose Immersive Audio + head tracking' },
          { name: 'Multipoint', value: 'Так (2 пристрої)' },
          { name: 'Вага', value: '250 г' }
        ],
        features: ['Bose Immersive Audio', 'CustomTune ANC', 'Aware with ActiveSense', 'aptX Adaptive', 'Multipoint', 'Bose Music App'],
        tags: ['bose', 'преміум', 'шумоподавлення', 'просторовий звук'],
        warranty: '2 роки',
        weight: { value: 250, unit: 'g' }
      },
      {
        name: 'Marshall Major IV',
        description: 'Marshall Major IV — культові навушники з легендарним рок-звуком та рекордною автономністю 80+ годин. Фірмовий звук Marshall з багатим басом та чіткими середніми частотами. Бездротова зарядка Qi — поклав на площадку, і вони заряджаються. Класичний дизайн Marshall з м\'якою шкірою та металевими деталями.',
        shortDescription: 'Культові навушники з рок-звуком та 80 годин роботи',
        price: 4999,
        category: categories[3]._id,
        brand: 'Marshall',
        sku: 'MAR-MJ4-BLK',
        stock: 55,
        lowStockThreshold: 8,
        images: [
          { url: 'https://placehold.co/800x800/0f172a/e2e8f0/png?text=Marshall%20Major%20IV', alt: 'Marshall Major IV (зображення-заповнювач)', isMain: true }
        ],
        specifications: [
          { name: 'Тип', value: 'Накладні бездротові (on-ear)' },
          { name: 'Драйвери', value: '40 мм з кастомним налаштуванням' },
          { name: 'Bluetooth', value: '5.0, кодек SBC' },
          { name: 'Автономність', value: '80+ годин' },
          { name: 'Зарядка', value: 'USB-C + бездротова Qi' },
          { name: 'Мікрофон', value: 'Вбудований, кнопка керування' },
          { name: 'Вага', value: '165 г' }
        ],
        features: ['80+ годин автономності', 'Бездротова зарядка Qi', 'Фірмовий звук Marshall', 'Складна конструкція', 'Multi-directional кнопка'],
        tags: ['marshall', 'рок', 'довга батарея', 'стильні'],
        warranty: '1 рік',
        weight: { value: 165, unit: 'g' }
      },

      // ─────────────────────────────────────────────────────────────
      // ДОДАТКОВІ СМАРТ-ГОДИННИКИ (categories[4])
      // ─────────────────────────────────────────────────────────────
      {
        name: 'Garmin Venu 3 45mm',
        description: 'Garmin Venu 3 — розумний годинник для серйозних спортсменів з AMOLED дисплеєм. Вбудований мікрофон та динамік дозволяють здійснювати дзвінки прямо з годинника. Sleep Coach аналізує сон та дає персональні рекомендації. Garmin Coach пропонує адаптивні плани тренувань для бігу, велосипеда та плавання. Body Battery показує рівень енергії протягом дня.',
        shortDescription: 'Спортивний смарт-годинник з AMOLED та тренером Garmin',
        price: 17999,
        category: categories[4]._id,
        brand: 'Garmin',
        sku: 'GAR-V3-45-BLK',
        stock: 20,
        lowStockThreshold: 3,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Garmin_Venu_3_%28a%29.JPG/960px-Garmin_Venu_3_%28a%29.JPG', alt: 'Garmin Venu 3 45mm', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '1.4" AMOLED, 454×454, Always-On' },
          { name: 'Автономність', value: 'до 14 днів (smartwatch), до 26 годин GPS' },
          { name: 'Датчики', value: 'Elevate v5 (пульс, SpO2), барометр, компас, температура шкіри' },
          { name: 'Навігація', value: 'GPS, GLONASS, Galileo' },
          { name: 'Водонепроникність', value: '5 ATM (50 м)' },
          { name: 'Зв\'язок', value: 'Bluetooth 5.2, Wi-Fi, ANT+, мікрофон + динамік' },
          { name: 'Вага', value: '35 г (без ремінця)' }
        ],
        features: ['Garmin Coach', 'Body Battery', 'Sleep Coach', 'Дзвінки з годинника', 'Garmin Pay', '14+ днів батареї', 'Wheelchair Mode'],
        tags: ['garmin', 'спорт', 'фітнес', 'gps', 'довга батарея'],
        warranty: '2 роки',
        weight: { value: 35, unit: 'g' }
      },
      {
        name: 'Xiaomi Smart Band 8 Pro',
        description: 'Xiaomi Smart Band 8 Pro — розумний фітнес-браслет з великим 1.74-дюймовим AMOLED дисплеєм та вбудованим GPS. Відстежує 150+ видів тренувань з автоматичним визначенням. Моніторинг SpO2, пульсу та якості сну 24/7. Автономність до 14 днів на одному заряді. Водонепроникність 5 ATM дозволяє плавати з браслетом.',
        shortDescription: 'Розумний фітнес-браслет з GPS та AMOLED',
        price: 2499,
        category: categories[4]._id,
        brand: 'Xiaomi',
        sku: 'XIA-SB8P-BLK',
        stock: 110,
        lowStockThreshold: 20,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Xiaomi_Mi_Band_8.jpg/960px-Xiaomi_Mi_Band_8.jpg', alt: 'Xiaomi Smart Band 8 Pro', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '1.74" AMOLED, 336×480, 600 ніт' },
          { name: 'Автономність', value: 'до 14 днів (щоденне використання)' },
          { name: 'Датчики', value: 'Пульс, SpO2, акселерометр, гіроскоп' },
          { name: 'GPS', value: 'Вбудований GPS, GLONASS, Galileo, BeiDou' },
          { name: 'Водонепроникність', value: '5 ATM' },
          { name: 'Зв\'язок', value: 'Bluetooth 5.3' },
          { name: 'Вага', value: '24.5 г (без ремінця)' }
        ],
        features: ['Вбудований GPS', '150+ тренувань', 'SpO2 24/7', 'Сповіщення', '100+ циферблатів', 'Alexa'],
        tags: ['фітнес-браслет', 'xiaomi', 'бюджетний', 'gps'],
        warranty: '1 рік',
        weight: { value: 24.5, unit: 'g' },
        isFeatured: true
      },

      // ─────────────────────────────────────────────────────────────
      // ДОДАТКОВІ АКСЕСУАРИ (categories[5])
      // ─────────────────────────────────────────────────────────────
      {
        name: 'Baseus GaN5 Pro 100W Charger',
        description: 'Baseus GaN5 Pro — компактний зарядний пристрій потужністю 100 Вт з технологією GaN нітрид галію. Один пристрій для зарядки ноутбука, планшета та смартфона одночасно. 2 порти USB-C PD 3.0 (100 Вт + 30 Вт) та 2 порти USB-A QC (22.5 Вт). Розмір вдвічі менший за стандартний зарядний ноутбука. Захист від перегріву, перенапруги та короткого замикання.',
        shortDescription: 'Компактна зарядка 100 Вт GaN для ноутбука та смартфона',
        price: 1999,
        category: categories[5]._id,
        brand: 'Baseus',
        sku: 'BAS-GAN5P-100W',
        stock: 68,
        lowStockThreshold: 12,
        images: [
          { url: 'https://placehold.co/800x800/0f172a/e2e8f0/png?text=Baseus%20GaN5%20Pro%20100W%20Charger', alt: 'Baseus GaN5 Pro 100W Charger (зображення-заповнювач)', isMain: true }
        ],
        specifications: [
          { name: 'Потужність', value: '100 Вт (сумарна)' },
          { name: 'Порти', value: '2× USB-C PD 3.0 + 2× USB-A QC 3.0' },
          { name: 'Технологія', value: 'GaN III (нітрид галію)' },
          { name: 'Вхідна напруга', value: '100-240 В (універсальна)' },
          { name: 'Захист', value: 'Перегрів, перенапруга, перевантаження, к/з' },
          { name: 'Розміри', value: '72 × 70 × 32 мм' },
          { name: 'Вага', value: '218 г' }
        ],
        features: ['GaN III', '100 Вт для ноутбуків', '4 порти', 'Компактний', 'Універсальна напруга'],
        tags: ['зарядка', 'baseus', 'gan', '100w', 'для подорожей'],
        warranty: '18 місяців',
        weight: { value: 218, unit: 'g' }
      },
      {
        name: 'Apple AirTag 4 Pack',
        description: 'Apple AirTag — компактний Bluetooth-трекер для відстеження речей через мережу Find My. Точне знаходження (Precision Finding) з iPhone 11+ показує напрямок та відстань до AirTag. Вбудований динамік для звукового сигналу. Замінна батарея CR2032 працює до 1 року. IP67 захист від води. Набір із 4 штук для гаманця, ключів, сумки та валізи.',
        shortDescription: 'Bluetooth-трекер Apple для знаходження речей (4 шт.)',
        price: 4299,
        category: categories[5]._id,
        brand: 'Apple',
        sku: 'APL-ATAG-4PK',
        stock: 45,
        lowStockThreshold: 8,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Apple_AirTag_%2851334123725%29.jpg/960px-Apple_AirTag_%2851334123725%29.jpg', alt: 'Apple AirTag 4 Pack', isMain: true }
        ],
        specifications: [
          { name: 'Комплектація', value: '4 × AirTag' },
          { name: 'Підключення', value: 'Bluetooth 5.0, U1 (UWB)' },
          { name: 'Батарея', value: 'CR2032 (до 1 року)' },
          { name: 'Захист', value: 'IP67' },
          { name: 'Сумісність', value: 'iPhone з iOS 14.5+' },
          { name: 'Розміри', value: '31.9 × 31.9 × 8 мм (кожен)' },
          { name: 'Вага', value: '11 г (кожен)' }
        ],
        features: ['Precision Finding (U1)', 'Find My мережа', 'Замінна батарея', 'IP67', 'NFC для Lost Mode'],
        tags: ['трекер', 'apple', 'airtag', 'find my'],
        warranty: '1 рік',
        weight: { value: 44, unit: 'g' }
      },

      // ─────────────────────────────────────────────────────────────
      // ІГРОВІ КОНСОЛІ (categories[6])
      // ─────────────────────────────────────────────────────────────
      {
        name: 'PlayStation 5 Slim Digital Edition',
        description: 'PlayStation 5 Slim Digital Edition — компактна версія найпопулярнішої ігрової консолі у світі. На 30% менша за оригінальну PS5. Процесор AMD Zen 2 та GPU RDNA 2 з апаратним трасуванням променів забезпечують графіку нового покоління. SSD 1 ТБ з молниеносною швидкістю завантаження — ігри запускаються за секунди. DualSense контролер з адаптивними тригерами та тактильним зворотним зв\'язком.',
        shortDescription: 'Компактна PS5 без дисководу з SSD 1 ТБ',
        price: 17999,
        category: categories[6]._id,
        brand: 'Sony',
        sku: 'SON-PS5S-DIGI',
        stock: 30,
        lowStockThreshold: 5,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/PlayStation_5_and_DualSense_with_transparent_background.png/960px-PlayStation_5_and_DualSense_with_transparent_background.png', alt: 'PlayStation 5 Slim Digital Edition', isMain: true }
        ],
        specifications: [
          { name: 'Процесор', value: 'AMD Zen 2, 8 ядер, 3.5 ГГц' },
          { name: 'GPU', value: 'AMD RDNA 2, 10.28 TFLOPS, Ray Tracing' },
          { name: 'Оперативна пам\'ять', value: '16 ГБ GDDR6' },
          { name: 'Накопичувач', value: '1 ТБ NVMe SSD (5.5 ГБ/с)' },
          { name: 'Роздільність', value: 'до 4K 120 fps, 8K' },
          { name: 'Розміри', value: '358 × 80 × 216 мм' },
          { name: 'Вага', value: '3.2 кг' }
        ],
        features: ['DualSense контролер', 'Tempest 3D Audio', 'Ray Tracing', '4K@120fps', 'PlayStation VR2 сумісність', 'Wi-Fi 6'],
        tags: ['playstation', 'sony', 'ігрова консоль', 'ps5'],
        warranty: '2 роки',
        weight: { value: 3200, unit: 'g' },
        isFeatured: true
      },
      {
        name: 'Xbox Series X 1TB',
        description: 'Xbox Series X — найпотужніша ігрова консоль Microsoft з 12 TFLOPS GPU та 1 ТБ SSD. Підтримка до 4K при 120 fps з апаратним Ray Tracing. Xbox Game Pass Ultimate дає доступ до 400+ ігор за підпискою, включаючи нові ексклюзиви Microsoft у день релізу. Quick Resume — миттєве перемикання між кількома іграми без перезавантаження.',
        shortDescription: 'Найпотужніша консоль Microsoft з Game Pass',
        price: 22999,
        category: categories[6]._id,
        brand: 'Microsoft',
        sku: 'MSF-XBSX-1TB',
        stock: 22,
        lowStockThreshold: 4,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Xbox_Series_X_2.jpg/960px-Xbox_Series_X_2.jpg', alt: 'Xbox Series X 1TB', isMain: true }
        ],
        specifications: [
          { name: 'Процесор', value: 'AMD Zen 2, 8 ядер, 3.8 ГГц' },
          { name: 'GPU', value: 'AMD RDNA 2, 12 TFLOPS' },
          { name: 'Оперативна пам\'ять', value: '16 ГБ GDDR6' },
          { name: 'Накопичувач', value: '1 ТБ NVMe SSD' },
          { name: 'Роздільність', value: 'до 4K 120 fps, 8K HDR' },
          { name: 'Дисковод', value: '4K UHD Blu-ray' },
          { name: 'Вага', value: '4.45 кг' }
        ],
        features: ['Xbox Game Pass', 'Quick Resume', 'Smart Delivery', 'Dolby Vision/Atmos', 'Ray Tracing', 'Backwards Compatible'],
        tags: ['xbox', 'microsoft', 'ігрова консоль', 'game pass'],
        warranty: '2 роки',
        weight: { value: 4450, unit: 'g' }
      },
      {
        name: 'Nintendo Switch OLED',
        description: 'Nintendo Switch OLED — оновлена версія найуспішнішої гібридної консолі з яскравим 7-дюймовим OLED дисплеєм. Грайте на великому екрані телевізора в док-станції або в портативному режимі. Joy-Con контролери з HD Rumble та детектором руху. Бібліотека ігор: Mario, Zelda, Pokémon, Animal Crossing та тисячі інді-ігор.',
        shortDescription: 'Гібридна консоль Nintendo з OLED дисплеєм',
        price: 13999,
        category: categories[6]._id,
        brand: 'Nintendo',
        sku: 'NIN-SW-OLED-WHT',
        stock: 40,
        lowStockThreshold: 8,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Nintendo-Switch-Console-Docked-wJoyConRB.jpg/960px-Nintendo-Switch-Console-Docked-wJoyConRB.jpg', alt: 'Nintendo Switch OLED', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '7" OLED, 1280×720, multi-touch' },
          { name: 'Процесор', value: 'NVIDIA Custom Tegra' },
          { name: 'Накопичувач', value: '64 ГБ (microSD до 2 ТБ)' },
          { name: 'Роздільність', value: 'TV: до 1080p 60 fps, портативний: 720p' },
          { name: 'Автономність', value: '4.5-9 годин (залежно від гри)' },
          { name: 'Порти', value: 'USB-C, LAN (док), 3.5 мм' },
          { name: 'Вага', value: '420 г (з Joy-Con)' }
        ],
        features: ['OLED дисплей', '3 режими гри (TV/Tabletop/Handheld)', 'Joy-Con HD Rumble', 'Широка виносна підставка', 'LAN-порт у доці'],
        tags: ['nintendo', 'switch', 'портативна', 'для родини'],
        warranty: '1 рік',
        weight: { value: 420, unit: 'g' },
        isFeatured: true
      },

      // ─────────────────────────────────────────────────────────────
      // ТВ та МОНІТОРИ (categories[7])
      // ─────────────────────────────────────────────────────────────
      {
        name: 'Samsung 55" S95D QD-OLED 4K Smart TV',
        description: 'Samsung S95D — телевізор нового покоління з технологією QD-OLED, яка поєднує переваги OLED (ідеальний чорний, нескінченна контрастність) з яскравістю квантових точок. Антивідбликове покриття Glare Free забезпечує чітке зображення навіть у яскраво освітленому приміщенні. Процесор NQ4 AI Gen 2 з нейромережею покращує якість контенту в реальному часі. Smart Hub на Tizen OS з усіма популярними стримінговими сервісами.',
        shortDescription: 'QD-OLED телевізор з антивідбликовим покриттям',
        price: 59999,
        comparePrice: 64999,
        category: categories[7]._id,
        brand: 'Samsung',
        sku: 'SAM-S95D-55-QD-OLED',
        stock: 10,
        lowStockThreshold: 2,
        images: [
          { url: 'https://placehold.co/800x800/0f172a/e2e8f0/png?text=Samsung%2055%22%20S95D%20QD-OLED%204K%20Smart%20TV', alt: 'Samsung 55" S95D QD-OLED 4K Smart TV (зображення-заповнювач)', isMain: true }
        ],
        specifications: [
          { name: 'Діагональ', value: '55" (139 см)' },
          { name: 'Роздільність', value: '4K UHD (3840×2160)' },
          { name: 'Панель', value: 'QD-OLED, 144 Гц VRR' },
          { name: 'HDR', value: 'HDR10+, Dolby Vision IQ' },
          { name: 'Процесор', value: 'NQ4 AI Gen 2' },
          { name: 'Звук', value: '4.2.2 канали, 60 Вт, Dolby Atmos' },
          { name: 'Smart TV', value: 'Tizen OS, Samsung Gaming Hub' },
          { name: 'Ігрові функції', value: '4K@144Hz, Game Bar, FreeSync Premium' }
        ],
        features: ['QD-OLED', 'Glare Free', 'AI Upscaling', '4K@144Hz Gaming', 'Dolby Atmos', 'Samsung Gaming Hub', 'Object Tracking Sound+'],
        tags: ['телевізор', 'samsung', 'oled', '4k', 'для ігор'],
        warranty: '3 роки',
        weight: { value: 17900, unit: 'g' },
        isFeatured: true,
        isOnSale: true
      },
      {
        name: 'LG UltraGear 27" 27GP850-B',
        description: 'LG UltraGear 27GP850-B — ігровий IPS монітор з Nano IPS технологією та частотою 165 Гц (розгін до 180 Гц). Час відклику 1 мс GtG — ідеально для конкурентних шутерів. NVIDIA G-Sync Compatible та AMD FreeSync Premium — плавний геймплей без розривів. 98% DCI-P3 — також підходить для роботи з контентом. USB-C з Power Delivery 65 Вт для підключення ноутбука одним кабелем.',
        shortDescription: 'Ігровий QHD Nano IPS монітор 165 Гц з 1 мс',
        price: 15999,
        comparePrice: 17999,
        category: categories[7]._id,
        brand: 'LG',
        sku: 'LG-27GP850B-QHD',
        stock: 26,
        lowStockThreshold: 4,
        images: [
          { url: 'https://placehold.co/800x800/0f172a/e2e8f0/png?text=LG%20UltraGear%2027%22%2027GP850-B', alt: 'LG UltraGear 27" 27GP850-B (зображення-заповнювач)', isMain: true }
        ],
        specifications: [
          { name: 'Діагональ', value: '27" (68.6 см)' },
          { name: 'Роздільність', value: 'QHD (2560×1440)' },
          { name: 'Панель', value: 'Nano IPS, 1 мс GtG' },
          { name: 'Частота', value: '165 Гц (OC 180 Гц)' },
          { name: 'HDR', value: 'VESA DisplayHDR 400' },
          { name: 'Покриття', value: '98% DCI-P3, sRGB 135%' },
          { name: 'Adaptive Sync', value: 'G-Sync Compatible, FreeSync Premium' },
          { name: 'Порти', value: 'HDMI 2.0 × 2, DP 1.4, USB-C (65 Вт PD)' }
        ],
        features: ['Nano IPS', '1 мс GtG', 'G-Sync Compatible', '180 Гц OC', 'USB-C 65 Вт PD', 'DAS Mode'],
        tags: ['монітор', 'lg', 'ігровий', 'qhd', '165 гц'],
        warranty: '3 роки',
        weight: { value: 6300, unit: 'g' },
        isOnSale: true
      },
      {
        name: 'Dell UltraSharp U2723QE 27" 4K',
        description: 'Dell UltraSharp U2723QE — професійний 4K монітор для фотографів, дизайнерів та розробників. IPS Black технологія забезпечує контрастність 2000:1 — вдвічі краще за звичайні IPS. 100% sRGB та 98% DCI-P3 з калібрацією Delta E < 2 прямо з коробки. Built-in KVM дозволяє керувати двома PC одним набором клавіатури/миші. USB-C хаб з 90 Вт Power Delivery.',
        shortDescription: 'Професійний 4K IPS Black монітор з USB-C хабом',
        price: 24999,
        category: categories[7]._id,
        brand: 'Dell',
        sku: 'DEL-U2723QE-4K',
        stock: 18,
        lowStockThreshold: 3,
        images: [
          { url: 'https://placehold.co/800x800/0f172a/e2e8f0/png?text=Dell%20UltraSharp%20U2723QE%2027%22%204K', alt: 'Dell UltraSharp U2723QE 27" 4K (зображення-заповнювач)', isMain: true }
        ],
        specifications: [
          { name: 'Діагональ', value: '27" (68.6 см)' },
          { name: 'Роздільність', value: '4K UHD (3840×2160)' },
          { name: 'Панель', value: 'IPS Black, 5 мс GtG' },
          { name: 'Частота', value: '60 Гц' },
          { name: 'Контрастність', value: '2000:1 (IPS Black)' },
          { name: 'Покриття', value: '100% sRGB, 98% DCI-P3, Delta E < 2' },
          { name: 'Порти', value: 'HDMI 2.0, DP 1.4, USB-C (90 Вт PD), 5× USB-A, LAN' },
          { name: 'Калібрація', value: 'Заводська, Delta E < 2' }
        ],
        features: ['IPS Black (2000:1)', 'USB-C 90 Вт PD', 'KVM Switch', 'RJ45 Ethernet', 'VESA DisplayHDR 400', 'PbP/PiP'],
        tags: ['монітор', 'dell', 'професійний', '4k', 'для дизайнерів'],
        warranty: '3 роки',
        weight: { value: 7100, unit: 'g' }
      },

      // ─────────────────────────────────────────────────────────────
      // ФОТОАПАРАТИ (categories[8])
      // ─────────────────────────────────────────────────────────────
      {
        name: 'Sony Alpha A7 IV Body',
        description: 'Sony Alpha A7 IV — новий стандарт повнокадрових камер для фото та відео. Матриця 33 Мп Exmor R CMOS з BSI забезпечує високу роздільність та низькорівневий шум. Автофокус Real-time Eye AF розпізнає очі людей, тварин та птахів. Запис відео 4K 60p з 10-bit 4:2:2 та S-Log3 для професійного кольорокорекції. 759 точок фазового автофокусу покривають 94% кадру.',
        shortDescription: 'Повнокадрова камера Sony 33 Мп для фото та 4K відео',
        price: 84999,
        category: categories[8]._id,
        brand: 'Sony',
        sku: 'SON-A7IV-BODY',
        stock: 8,
        lowStockThreshold: 2,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Sony_A7_IV_%28ILCE-7M4%29_-_by_Henry_S%C3%B6derlund_%2851739988735%29.jpg/960px-Sony_A7_IV_%28ILCE-7M4%29_-_by_Henry_S%C3%B6derlund_%2851739988735%29.jpg', alt: 'Sony Alpha A7 IV Body', isMain: true }
        ],
        specifications: [
          { name: 'Тип', value: 'Повнокадрова безрзеркальна (Full Frame)' },
          { name: 'Матриця', value: '33 Мп Exmor R CMOS (35.9×23.9 мм)' },
          { name: 'Процесор', value: 'BIONZ XR' },
          { name: 'Автофокус', value: '759 точок фазового AF, Real-time Eye AF' },
          { name: 'Серійна зйомка', value: '10 к/с (механічний)' },
          { name: 'Відео', value: '4K 60p 10-bit 4:2:2, Full HD 120p' },
          { name: 'Стабілізація', value: '5-осьова IBIS (5.5 ступенів)' },
          { name: 'Видошукач', value: 'OLED EVF 3.69 Мп, 120 fps' },
          { name: 'Байонет', value: 'Sony E-mount' },
          { name: 'Вага', value: '658 г (body only)' }
        ],
        features: ['Real-time Eye AF', '10-bit 4:2:2 відео', 'S-Log3/S-Cinetone', '5-осьова IBIS', 'Два слоти карт', 'USB-C зарядка/стрім'],
        tags: ['sony', 'full frame', 'безрзеркальна', 'для професіоналів'],
        warranty: '2 роки',
        weight: { value: 658, unit: 'g' },
        isFeatured: true
      },
      {
        name: 'Canon EOS R50 Kit 18-45mm',
        description: 'Canon EOS R50 — компактна безрзеркальна камера для початківців та блогерів. Матриця APS-C 24.2 Мп з процесором DIGIC X та Deep Learning автофокусом, який розпізнає обличчя, очі, тіло, транспорт та тварин. Запис 4K 30p без обрізки. Вбудований мікрофон та поворотний екран ідеально підходять для влогів. Вага body 328 г — найлегша серед камер Canon.',
        shortDescription: 'Компактна камера Canon для початківців та влогерів',
        price: 31999,
        category: categories[8]._id,
        brand: 'Canon',
        sku: 'CAN-R50-KIT1845',
        stock: 14,
        lowStockThreshold: 3,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Canon_EOS_R50%2C_White%2C_2.jpg/960px-Canon_EOS_R50%2C_White%2C_2.jpg', alt: 'Canon EOS R50 Kit 18-45mm', isMain: true }
        ],
        specifications: [
          { name: 'Тип', value: 'APS-C безрзеркальна' },
          { name: 'Матриця', value: '24.2 Мп APS-C CMOS' },
          { name: 'Процесор', value: 'DIGIC X' },
          { name: 'Автофокус', value: 'Dual Pixel CMOS AF II, Deep Learning AF' },
          { name: 'Серійна зйомка', value: '15 к/с (електронний)' },
          { name: 'Відео', value: '4K 30p, Full HD 120p' },
          { name: 'Екран', value: '3" поворотний тачскрін' },
          { name: 'Об\'єктив у комплекті', value: 'RF-S 18-45mm f/4.5-6.3 IS STM' },
          { name: 'Байонет', value: 'Canon RF-S' },
          { name: 'Вага', value: '328 г (body)' }
        ],
        features: ['Deep Learning AF', '4K без обрізки', 'Поворотний екран', 'Wi-Fi + Bluetooth', 'USB-C зарядка', 'Creative Filters'],
        tags: ['canon', 'для початківців', 'влог', 'компактна'],
        warranty: '2 роки',
        weight: { value: 328, unit: 'g' }
      },

      // ─────────────────────────────────────────────────────────────
      // РОЗУМНИЙ ДІМ (categories[9])
      // ─────────────────────────────────────────────────────────────
      {
        name: 'Apple HomePod mini',
        description: 'Apple HomePod mini — компактна розумна колонка з вражаючим 360° звуком та Siri. Повнодіапазонний драйвер та два пасивних випромінювачі створюють глибокий бас та чітке звучання. Чіп Apple S5 із обчислювальним аудіо аналізує музику та оптимізує звук у реальному часі. Підтримує AirPlay 2, Apple Music, Spotify та керування HomeKit-пристроями.',
        shortDescription: 'Компактна розумна колонка Apple з Siri',
        price: 4299,
        category: categories[9]._id,
        brand: 'Apple',
        sku: 'APL-HPM-BLU',
        stock: 52,
        lowStockThreshold: 8,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Apple_HomePod_mini.jpg/960px-Apple_HomePod_mini.jpg', alt: 'Apple HomePod mini', isMain: true }
        ],
        specifications: [
          { name: 'Тип', value: 'Розумна колонка' },
          { name: 'Чіп', value: 'Apple S5' },
          { name: 'Драйвери', value: 'Повнодіапазонний + 2 пасивних випромювачі' },
          { name: 'Мікрофони', value: '4 мікрофони' },
          { name: 'Підключення', value: 'Wi-Fi 5, Bluetooth 5.0, Thread, UWB (U1)' },
          { name: 'Голосовий асистент', value: 'Siri' },
          { name: 'Розміри', value: '97.9 × 84.3 мм' },
          { name: 'Вага', value: '345 г' }
        ],
        features: ['Siri', 'AirPlay 2', 'HomeKit Hub', 'Intercom', 'Sound Recognition', 'Мультирум (стерео пара)'],
        tags: ['apple', 'розумна колонка', 'siri', 'homekit'],
        warranty: '1 рік',
        weight: { value: 345, unit: 'g' }
      },
      {
        name: 'Google Nest Hub 2-го покоління',
        description: 'Google Nest Hub 2 — розумний дисплей для дому з 7-дюймовим екраном та Google Assistant. Відстежує якість сну без контактних датчиків за допомогою радара Soli — просто поставте біля ліжка. Показує фото з Google Photos, рецепти, відео з YouTube, погоду та календар. Керуйте усіма розумними пристроями дому одним дотиком або голосом.',
        shortDescription: 'Розумний дисплей Google з відстеженням сну',
        price: 3999,
        category: categories[9]._id,
        brand: 'Google',
        sku: 'GOO-NHUB2-CHR',
        stock: 35,
        lowStockThreshold: 6,
        images: [
          { url: 'https://placehold.co/800x800/0f172a/e2e8f0/png?text=Google%20Nest%20Hub%202-%D0%B3%D0%BE%20%D0%BF%D0%BE%D0%BA%D0%BE%D0%BB%D1%96%D0%BD%D0%BD%D1%8F', alt: 'Google Nest Hub 2-го покоління (зображення-заповнювач)', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '7" LCD тачскрін' },
          { name: 'Голосовий асистент', value: 'Google Assistant' },
          { name: 'Датчики', value: 'Soli радар (відстеження сну), температура, світло, ультразвук' },
          { name: 'Камера', value: 'Немає (приватність)' },
          { name: 'Динаміки', value: '1.7" повнодіапазонний, 43.5 мм' },
          { name: 'Підключення', value: 'Wi-Fi 5, Bluetooth 5.0, Thread, Chromecast' },
          { name: 'Розміри', value: '177.4 × 120.4 × 69.5 мм' }
        ],
        features: ['Sleep Sensing (Soli)', 'Google Assistant', 'Google Photos рамка', 'Smart Home Dashboard', 'YouTube', 'Duo відеодзвінки (зовнішня камера)'],
        tags: ['google', 'розумний дисплей', 'google assistant', 'smart home'],
        warranty: '1 рік',
        weight: { value: 558, unit: 'g' }
      },
      {
        name: 'Philips Hue Starter Kit (3 лампи + Bridge)',
        description: 'Philips Hue Starter Kit — набір з 3 розумних LED-ламп та Bridge для початку побудови системи розумного освітлення. 16 мільйонів кольорів та відтінків білого від теплого до холодного. Керування через додаток Hue, голосом через Siri/Alexa/Google, або автоматичний сценарій за розкладом. Bridge підтримує до 50 ламп та аксесуарів.',
        shortDescription: 'Стартовий набір розумного освітлення Philips Hue',
        price: 5499,
        category: categories[9]._id,
        brand: 'Philips',
        sku: 'PHP-HUE-START3',
        stock: 32,
        lowStockThreshold: 5,
        images: [
          { url: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Philips_Hue_hub_and_2_bulbs.jpg', alt: 'Philips Hue Starter Kit (3 лампи + Bridge)', isMain: true }
        ],
        specifications: [
          { name: 'Комплектація', value: '3× Hue E27 Color Ambiance + 1× Hue Bridge' },
          { name: 'Потужність', value: '9 Вт (еквівалент 60 Вт) кожна' },
          { name: 'Яскравість', value: '806 люмен кожна' },
          { name: 'Кольори', value: '16 млн кольорів + відтінки білого (2000-6500K)' },
          { name: 'Підключення', value: 'Zigbee 3.0 (через Bridge), Wi-Fi (Bridge)' },
          { name: 'Цоколь', value: 'E27' },
          { name: 'Ресурс', value: '25000 годин' }
        ],
        features: ['16 млн кольорів', 'Hue App сценарії', 'Siri/Alexa/Google', 'Геолокація (увімкнення при поверненні)', 'Hue Entertainment (синхронізація з ТВ/музикою)', 'До 50 ламп на 1 Bridge'],
        tags: ['philips', 'розумне освітлення', 'smart home', 'hue'],
        warranty: '2 роки',
        weight: { value: 820, unit: 'g' }
      }
    ];

    const products = [];
    for (const prodData of productData) {
      const product = await Product.create(prodData);
      products.push(product);
    }
    console.log(`✅ Створено ${products.length} товарів`);

    // ═══════════════════════════════════════════════════════════════
    // 4. ВІДГУКИ
    // ═══════════════════════════════════════════════════════════════
    console.log('⭐ Створення відгуків...');

    const reviewsData = [
      // iPhone 15 Pro Max (products[0]) — 4 відгуки
      {
        product: products[0]._id,
        user: users[0]._id,
        rating: 5,
        title: 'Найкращий смартфон, яким я користувався',
        comment: 'Перейшов з iPhone 13 Pro Max. Різниця колосальна: камера просто космос, особливо портретний режим та нічні фото. Титановий корпус приємно тримати в руці, став легшим за попередній. A17 Pro тягне все — навіть Resident Evil Village йде плавно. Батарея на 2 дні при помірному використанні. Action Button налаштував на камеру — дуже зручно. USB-C нарешті! Єдиний мінус — ціна.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(180)
      },
      {
        product: products[0]._id,
        user: users[1]._id,
        rating: 5,
        title: 'Перейшла з Android — не шкодую',
        comment: 'Завжди була на Samsung, але вирішила спробувати Apple. Екосистема вражає: iPhone + AirPods + MacBook працюють як одне ціле. Dynamic Island зручніший за будь-який Android-аналог. Камера дійсно робить кадри, які хочеться публікувати без фільтрів. FaceTime з друзями — окрема радість. Адаптація до iOS зайняла пару днів.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(150)
      },
      {
        product: products[0]._id,
        user: users[2]._id,
        rating: 4,
        title: 'Відмінний апарат, але дорого',
        comment: 'Технічно бездоганний телефон. Камера на вищому рівні, особливо телефото 5x — нарешті нормальний зум. Action Button зручний, налаштував на ліхтарик. Але чесно кажучи, для більшості задач iPhone 15 Pro за нижчу ціну — це більш розумний вибір. Pro Max виправдовує себе тільки якщо вам критично потрібен великий екран та максимальна батарея.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(120)
      },
      {
        product: products[0]._id,
        user: users[4]._id,
        rating: 5,
        title: 'Камера замінила мою дзеркалку у подорожах',
        comment: 'Поїхав у відпустку тільки з iPhone 15 Pro Max замість Canon. 48 Мп у режимі HEIF дають неймовірну деталізацію. Телефото 5x — знімав архітектуру та деталі без наближення. ProRes відео 4K — просто кінематографічна якість. Cinematic Mode з глибиною різкості виглядає професійно. Чесно, для 90% моїх потреб дзеркалка більше не потрібна.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(60)
      },

      // Samsung Galaxy S24 Ultra (products[2]) — 3 відгуки
      {
        product: products[2]._id,
        user: users[1]._id,
        rating: 5,
        title: 'Galaxy AI — це справді майбутнє',
        comment: 'Купила S24 Ultra заради AI і не розчарувалася. Circle to Search — обводиш об\'єкт на екрані і отримуєш інформацію. Live Translate перекладає розмови по телефону в реальному часі — тестувала з англійською, працює добре. Edit Suggestion в галереї пропонує видалити зайві об\'єкти з фото одним натисканням. S Pen як завжди на висоті — роблю нотатки на парах. Камера 200 Мп при хорошому освітленні дає божевільну деталізацію.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(140)
      },
      {
        product: products[2]._id,
        user: users[3]._id,
        rating: 5,
        title: 'Найкращий Android-смартфон без сумнівів',
        comment: 'Користуюся вже 3 місяці. Екран 6.8" — ідеальний для перегляду відео та роботи з документами. S Pen використовую для підпису PDF та швидких нотаток. Батарея 5000 мАг тримає повний день навіть при активному використанні. Titanium рамка додає преміальності. Snapdragon 8 Gen 3 — жодних лагів, навіть Genshin Impact на максималках.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(100)
      },
      {
        product: products[2]._id,
        user: users[6]._id,
        rating: 4,
        title: 'Потужний, але великий',
        comment: 'Функціонал на 10 з 10: камера, продуктивність, S Pen, AI — все працює відмінно. Але для моїх рук він завеликий — незручно користуватися однією рукою. Якби S Pen був у S24+ — взяв би його. У комплекті немає зарядки — це вже тренд, але все одно неприємно за такі гроші. В цілому — найкращий великий смартфон на ринку.',
        isVerifiedPurchase: false,
        createdAt: daysAgo(25)
      },

      // MacBook Pro 16 M3 Pro (products[8]) — 3 відгуки
      {
        product: products[8]._id,
        user: users[0]._id,
        rating: 5,
        title: 'Ідеальний ноутбук для розробника',
        comment: 'Працюю як Full-Stack розробник. M3 Pro просто літає: Docker-контейнери піднімаються за секунди, npm install миттєвий, TypeScript компіляція великих проєктів — 2 секунди. VS Code + 20 вкладок Chrome + Figma + Slack — все одночасно без найменших затримок. 18 ГБ Unified Memory вистачає з запасом. Батарея: починаю працювати о 9:00, зарядка потрібна тільки після 20:00. Екран — окрема історія: кольори точні, 120 Гц помітно при скролі коду. MagSafe рятує від вирваного кабелю.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(200)
      },
      {
        product: products[8]._id,
        user: users[2]._id,
        rating: 5,
        title: 'Замінив робочу станцію Dell',
        comment: 'Монтую відео 4K ProRes для YouTube-каналу. На Dell з i9 + RTX 3070 таймлайн лагав при мультикамерному монтажі. M3 Pro прокручує 3 потоки 4K ProRes без рендерингу. Експорт 20-хвилинного відео — 8 хвилин (на Dell було 25). Кольори дисплея — калібрований монітор не потрібен. Динаміки — найкращі серед ноутбуків, перестав носити колонку.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(160)
      },
      {
        product: products[8]._id,
        user: users[5]._id,
        rating: 4,
        title: 'Чудовий, але 18 ГБ маловато для 3D',
        comment: 'Для дизайну в Figma та Sketch — ідеально. Для 3D в Blender з великими сценами 18 ГБ буває замало — треба було брати версію з 36 ГБ. Але це мій прорахунок. У всьому іншому — найкращий ноутбук. Клавіатура чудова, трекпад величезний. Нагрівається мінімально навіть під навантаженням.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(45)
      },

      // Sony WH-1000XM5 (products[17]) — 3 відгуки
      {
        product: products[17]._id,
        user: users[0]._id,
        rating: 5,
        title: 'Рятують у офісі з open space',
        comment: 'Працюю у великому опенспейсі — без цих навушників просто не можу зосередитися. ANC знижує шум кондиціонера та розмови до мінімуму. Speak-to-Chat автоматично ставить музику на паузу, коли починаєш говорити — не треба знімати навушники. Звук чистий, LDAC з Sony Xperia дає Hi-Res якість. Носив 8 годин підряд — жодного дискомфорту.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(170)
      },
      {
        product: products[17]._id,
        user: users[1]._id,
        rating: 5,
        title: 'Найкращі навушники для перельотів',
        comment: 'Літаю по роботі 2-3 рази на місяць. Ці навушники повністю прибирають гул двигунів. 30 годин батареї — вистачає на переліт туди-назад + очікування в аеропорту. Звук деталізований, басів достатньо. Кейс компактний, складаються плоско. Multipoint — підключені до телефону і ноутбука одночасно, перемикається миттєво.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(110)
      },
      {
        product: products[17]._id,
        user: users[3]._id,
        rating: 4,
        title: 'Відмінні, але мікрофон міг бути краще',
        comment: 'Для прослуховування музики та ANC — 10/10. Але для робочих дзвінків у Zoom мікрофон посередній: колеги кажуть, що звучу нормально, але не ідеально. Якщо дзвінки — ваш пріоритет, тестуйте перед покупкою. У всьому іншому — найкращі навушники, які я пробував (а пробував багато).',
        isVerifiedPurchase: true,
        createdAt: daysAgo(80)
      },

      // AirPods Pro 2 (products[18]) — 2 відгуки
      {
        product: products[18]._id,
        user: users[5]._id,
        rating: 5,
        title: 'Ідеальні для екосистеми Apple',
        comment: 'У мене iPhone 15 + MacBook Air + iPad — AirPods Pro 2 перемикаються між ними миттєво. Adaptive Audio — найкрутіша фіча: автоматично мікшує ANC та прозорість. Їдеш у метро — повне шумоподавлення. Виходиш на вулицю — чуєш оточення. Conversation Awareness знижує гучність, коли говориш з кимось — не треба нічого натискати. USB-C кейс нарешті!',
        isVerifiedPurchase: true,
        createdAt: daysAgo(55)
      },
      {
        product: products[18]._id,
        user: users[4]._id,
        rating: 4,
        title: 'Чудові, але час роботи 6 годин — мало',
        comment: 'Якість звуку та ANC — на рівні найкращих в індустрії. Просторове аудіо у фільмах створює ефект кінотеатру. Але 6 годин з ANC — це мало для робочого дня. Доводиться класти в кейс на обід. Кейс з USB-C заряджається від MacBook — це зручно. Find My працює відмінно — один раз загубив навушник у диванних подушках, знайшов за 10 секунд.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(30)
      },

      // Apple Watch Series 9 (products[22]) — 2 відгуки
      {
        product: products[22]._id,
        user: users[2]._id,
        rating: 5,
        title: 'Double Tap — це геніально',
        comment: 'Їду на велосипеді, руки на кермі — Double Tap дозволяє відповісти на дзвінок, поставити таймер, зупинити музику. Не треба піднімати руку! Трекінг тренувань точний: біг, велосипед, плавання — все автоматично визначає. Екран яскравий навіть на сонці (2000 ніт). watchOS 10 з новими віджетами — інформація завжди під рукою.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(90)
      },
      {
        product: products[22]._id,
        user: users[7]._id,
        rating: 4,
        title: 'Прекрасний годинник, але батарея на 1 день',
        comment: 'Відстеження здоров\'я працює чудово: пульс, кисень у крові, ЕКГ зробив кілька разів — збігається з показаннями тонометра. Але доводиться заряджати щоночі. Якщо забув зарядку — на другий день вмирає до обіду. Швидка зарядка рятує: від 0 до 80% за 45 хвилин.',
        isVerifiedPurchase: false,
        createdAt: daysAgo(10)
      },

      // iPad Pro 13 M4 (products[15]) — 2 відгуки
      {
        product: products[15]._id,
        user: users[3]._id,
        rating: 5,
        title: 'Замінив ноутбук для роботи дизайнера',
        comment: 'Працюю ілюстратором — iPad Pro з Apple Pencil Pro повністю замінив Wacom Cintiq. OLED дисплей показує кольори точно як на каліброваному моніторі. М4 тягне Procreate з 100+ шарами без найменшого уповільнення. Apple Pencil Pro з датчиком стискання — нарешті натуральне відчуття пензля. 5.1 мм товщини — ношу з собою у сумці щодня.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(70)
      },
      {
        product: products[15]._id,
        user: users[6]._id,
        rating: 5,
        title: 'Ідеальний для студента медика',
        comment: 'Я студент-медик: конспекти в GoodNotes, 3D-анатомія в Complete Anatomy, підручники в PDF. iPad Pro M4 справляється з усім миттєво. Stage Manager дозволяє працювати з кількома додатками одночасно. Камера Center Stage тримає мене в кадрі на онлайн-лекціях. Найкраща інвестиція в навчання.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(20)
      },

      // HP Pavilion 15 (products[13]) — 1 відгук
      {
        product: products[13]._id,
        user: users[8]._id,
        rating: 4,
        title: 'Відмінний ноутбук за свою ціну',
        comment: 'Купив для навчання в університеті: Word, Excel, Chrome з 15 вкладками, Zoom — все працює без гальм. SSD 512 ГБ — завантаження за 8 секунд. Екран IPS — кути огляду нормальні, але яскравість могла б бути вищою. Клавіатура з підсвіткою — зручно писати конспекти ввечері. Батарея тримає 6-7 годин реального використання. За 23 тисячі — найкращий вибір.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(3)
      },

      // Logitech MX Master 3S (products[26]) — 1 відгук
      {
        product: products[26]._id,
        user: users[2]._id,
        rating: 5,
        title: 'Незамінна для роботи з кодом',
        comment: 'MagSpeed колесо — найкраща річ: скролю довгі файли коду зі швидкістю 1000 рядків на секунду. Бокове колесо — горизонтальний скрол у таблицях. Flow — переміщую файли між робочим Mac та домашнім PC просто перетягуванням. Тихі клацання не заважають колегам. Сенсор працює навіть на скляному столі. Батарея — заряджав один раз за 2 місяці. 10/10.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(85)
      },

      // JBL Tune 770NC (products[20]) — 1 відгук
      {
        product: products[20]._id,
        user: users[6]._id,
        rating: 4,
        title: 'Найкраще за ці гроші',
        comment: 'За 3500 грн отримуєш ANC, 40+ годин батареї, непоганий бас та Bluetooth 5.3. Порівнював з навушниками вдвічі дорожчими — різниця є, але вона не двократна. Для метро, спортзалу та офісу — більш ніж достатньо. Мінуси: пластиковий корпус виглядає простенько, і при тривалому носінні трохи тиснуть на вуха. Але за цю ціну — рекомендую.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(15)
      },

      // ASUS ROG Strix G16 (products[10]) — 1 відгук
      {
        product: products[10]._id,
        user: users[4]._id,
        rating: 5,
        title: 'Ігровий ноутбук мрії',
        comment: 'Cyberpunk 2077 на Ultra + RT — 60-70 fps при QHD. Hogwarts Legacy — 80+ fps. Дисплей 240 Гц — у CS2 та Valorant різниця після 60 Гц — небо і земля. 32 ГБ RAM вистачає для стримінгу (OBS + гра + Chrome). Система охолодження працює ефективно: під навантаженням CPU до 85°C, GPU до 78°C. Мінус — вентилятори гучні на максимумі. Та важкий для щоденного носіння (2.5 кг). Але як ігрова станція — 10/10.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(50)
      },

      // ── ДОДАТКОВІ ВІДГУКИ ──

      // Samsung Galaxy A55 (products[28]) — 2 відгуки
      {
        product: products[28]._id,
        user: users[13]._id,
        rating: 5,
        title: 'Найкращий телефон до 15 тисяч',
        comment: 'Як студентка — не можу собі дозволити флагман, але A55 дає 90% флагманського досвіду. AMOLED 120 Гц — після нього не можу дивитися на IPS. IP67 — не боюся дощу та випадково пролитої кави. Камера 50 Мп з OIS — інстаграмні фото без редактора. Samsung обіцяє 4 роки оновлень — чудово! Єдине, чого не вистачає — телеоб\'єктива.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(35)
      },
      {
        product: products[28]._id,
        user: users[14]._id,
        rating: 4,
        title: 'Гідна заміна A53, але зарядка повільна',
        comment: 'Перейшов з Galaxy A53. Різниця є: екран яскравіший, процесор швидший, корпус преміальніший (скло + метал). Камера стала краще при слабкому освітленні. Але зарядка 25 Вт — це мало у 2025 році, конкуренти від Xiaomi заряджають за 30 хвилин. У мене зарядка до 100% займає 1.5 години. В решті — відмінний телефон за свої гроші.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(18)
      },

      // Xiaomi Redmi Note 13 Pro (products[29]) — 2 відгуки
      {
        product: products[29]._id,
        user: users[11]._id,
        rating: 5,
        title: '200 Мп камера за 11 тисяч — нереально!',
        comment: 'Купила для фотографії квітів та макро-зйомки. 200 Мп дає такий рівень деталізації, що можна обрізати фото і все одно залишиться 12 Мп якість. AMOLED екран яскравий та насичений — фото виглядають чудово. Зарядка 67 Вт — від 10% до 100% за 50 хвилин. За цю ціну — однозначно рекомендую!',
        isVerifiedPurchase: true,
        createdAt: daysAgo(22)
      },
      {
        product: products[29]._id,
        user: users[12]._id,
        rating: 4,
        title: 'Добре для ігор, але Helio G99 — не Snapdragon',
        comment: 'Для повсякденних задач, соцмереж та навіть PUBG Mobile — працює чудово. Але у важких іграх типу Genshin Impact на максималках бувають просадки fps. Для бюджетного телефону — це нормально. Екран AMOLED шикарний, батарея тримає 2 дні. Камера 200 Мп — маркетинг, але фото дійсно якісні при хорошому освітленні.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(12)
      },

      // Nothing Phone 2 (products[30]) — 1 відгук
      {
        product: products[30]._id,
        user: users[12]._id,
        rating: 5,
        title: 'Унікальний дизайн, чудовий телефон',
        comment: 'Взяв Nothing Phone 2 через дизайн — і не пошкодував. Glyph Interface — це не просто LED-індикатори, а повноцінна система сповіщень. Кожен контакт має свій патерн — знаю хто дзвонить, навіть не дивлячись на екран. Nothing OS — чистий Android без зайвого, все працює плавно. 120 Гц LTPO дисплей — красивий та економний. Камера — на рівні, хоча конкуренти за ці гроші знімають трохи краще.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(65)
      },

      // iPad 10 (products[31]) — 1 відгук
      {
        product: products[31]._id,
        user: users[13]._id,
        rating: 4,
        title: 'Ідеальний для студента',
        comment: 'Використовую для конспектів у GoodNotes, перегляду лекцій в YouTube та читання PDF-підручників. Для цих задач iPad 10 — ідеальний. Дисплей великий та яскравий, динаміки стерео. USB-C — нарешті! Мінуси: підтримує лише Apple Pencil 1-го покоління (з перехідником), і 64 ГБ — мало, треба було брати 256 ГБ. Але за 18 тисяч — відмінний планшет.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(28)
      },

      // Xiaomi Pad 6 (products[32]) — 1 відгук
      {
        product: products[32]._id,
        user: users[7]._id,
        rating: 5,
        title: 'iPad Pro для бідних — і це комплімент!',
        comment: 'За 14 тисяч отримуєш 2.8K дисплей 144 Гц, Snapdragon 870 та 4 динаміки Dolby Atmos. Серіали на Netflix виглядають шикарно. Для ігор — стабільні 60 fps у Genshin Impact. Стилус Xiaomi Smart Pen купив окремо — малює з мінімальною затримкою. Батарея 8840 мАг тримає 3 дні при помірному використанні. Мінус — MIUI Pad іноді глючить з оптимізацією додатків.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(40)
      },

      // Bose QuietComfort Ultra (products[33]) — 1 відгук
      {
        product: products[33]._id,
        user: users[10]._id,
        rating: 5,
        title: 'Шумоподавлення навіть краще ніж у Sony',
        comment: 'Мала Sony WH-1000XM4, перейшла на Bose QC Ultra. CustomTune ANC — це щось неймовірне: навушники калібруються під форму моїх вух за 3 секунди. Immersive Audio з head tracking — слухаю концерти в просторовому звуці, відчуття як у залі. Звук теплий, деталізований, без надмірного басу. Єдиний мінус — 24 години проти 30 у Sony, але якість це компенсує.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(42)
      },

      // Marshall Major IV (products[34]) — 1 відгук
      {
        product: products[34]._id,
        user: users[14]._id,
        rating: 4,
        title: 'Стиль + батарея = Marshall Major IV',
        comment: 'Купив передусім за дизайн — виглядають як вінтажні Marshall підсилювачі. 80 годин батареї — не жарт, заряджаю раз на 2 тижні. Звук з характерним Marshall-басом, підходить для року та метру. Має бездротову зарядку Qi — кладу на площадку Samsung перед сном. Мінуси: немає ANC, конструкція on-ear трохи тисне після 3+ годин. Але за 5 тисяч — відмінна пропозиція.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(16)
      },

      // PlayStation 5 Slim (products[38]) — 2 відгуки
      {
        product: products[38]._id,
        user: users[11]._id,
        rating: 5,
        title: 'DualSense — найкращий геймпад в історії',
        comment: 'Перейшов з PS4 Pro — різниця вражає. SSD змінює досвід: завантаження Hogwarts Legacy за 3 секунди замість хвилини. DualSense з адаптивними тригерами та хаптіком — це революція. В Returnal відчуваєш краплі дощу, в Astro Bot — кожну поверхню. Графіка на 4K ТВ — як кіно. Digital Edition — не відчуваю нестачі дисководу, все купую в PS Store.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(55)
      },
      {
        product: products[38]._id,
        user: users[4]._id,
        rating: 5,
        title: 'Компактніша за оригінал і працює тихо',
        comment: 'Мав оригінальну PS5 — вентилятор іноді гудів. Slim версія тихіша та на 30% менша — нарешті нормально стає на полку. 1 ТБ вистачає на 8-10 ігор великих AAA. Spider-Man 2, God of War Ragnarök, FF7 Rebirth — все на ультра з Ray Tracing. PS Plus Premium дає доступ до каталогу стрімінгу — граю в класичні PS1/PS2 ігри через хмару.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(33)
      },

      // Nintendo Switch OLED (products[40]) — 1 відгук
      {
        product: products[40]._id,
        user: users[5]._id,
        rating: 5,
        title: 'Ідеальна консоль для подорожей та родини',
        comment: 'Граємо всією родиною: Mario Kart 8, Animal Crossing, Just Dance. OLED екран проти старого LCD — небо і земля, кольори яскраві та соковиті. У поїзді граю в Zelda Tears of the Kingdom — 5 годин батареї вистачає на дорогу Вінниця-Київ. Joy-Con з HD Rumble — діти в захваті від 1-2-Switch. Мінус тільки один — хочеться 4K у режимі ТВ, але Nintendo це Nintendo.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(48)
      },

      // Samsung S95D QD-OLED TV (products[41]) — 1 відгук
      {
        product: products[41]._id,
        user: users[2]._id,
        rating: 5,
        title: 'Найкращий ТВ, який я бачив',
        comment: 'Підключив PS5 через HDMI 2.1 — 4K 120 fps з VRR. QD-OLED — це ідеальний чорний OLED плюс яскравість та насиченість квантових точок. Glare Free покриття — навіть з вікном навпроти зображення залишається чітким. AI Upscaling перетворює Full HD контент на майже-4K. Dolby Atmos звук з вбудованих динаміків — неочікувано якісний. Samsung Gaming Hub — граю у хмарні ігри без консолі.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(38)
      },

      // LG UltraGear 27GP850-B (products[42]) — 1 відгук
      {
        product: products[42]._id,
        user: users[11]._id,
        rating: 5,
        title: 'Ідеальний баланс для ігор та роботи',
        comment: 'QHD 165 Гц — золота середина між 1080p та 4K. RTX 4070 тягне все на максималках при цій роздільності. Nano IPS — кольори насичені та точні, DCI-P3 98% — монтую відео без зовнішнього монітора. G-Sync Compatible працює ідеально — жодних розривів. USB-C з 65 Вт PD — підключаю MacBook одним кабелем (картинка + зарядка). За 16 тисяч — кращого монітора не знайти.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(72)
      },

      // Sony Alpha A7 IV (products[44]) — 1 відгук
      {
        product: products[44]._id,
        user: users[10]._id,
        rating: 5,
        title: 'Перейшла з Canon 5D Mark IV — не шкодую',
        comment: 'Як весільний фотограф — камера критично важлива. A7 IV з Real-time Eye AF ніколи не промахується по очах навіть при f/1.4. 33 Мп — ідеальний баланс між роздільністю та розміром файлів. Відео 4K 60p 10-bit — знімаю весільні кліпи без зовнішнього рекордера. 5-осьова стабілізація рятує при знімках з рук у затемненому залі. Два слоти карт (CFexpress A + SD) — надійність. Батарея NP-FZ100 тримає весь весільний день (~700 фото + 30 хв відео).',
        isVerifiedPurchase: true,
        createdAt: daysAgo(130)
      },

      // Canon EOS R50 (products[45]) — 1 відгук
      {
        product: products[45]._id,
        user: users[8]._id,
        rating: 4,
        title: 'Ідеальна перша камера для блогера',
        comment: 'Почав вести YouTube-канал — вибирав між Sony ZV-E10 та Canon R50. Обрав Canon за автофокус — Deep Learning AF тримає фокус на обличчі навіть коли відвертаюся. 4K 30p без обрізки — важливо для влогів. Поворотний екран — бачу себе при зйомці. Мінус: kit-об\'єктив 18-45 темнуватий (f/4.5), для стримів потрібно додаткове світло. Планую купити RF 50mm f/1.8 пізніше.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(4)
      },

      // Garmin Venu 3 (products[35]) — 1 відгук
      {
        product: products[35]._id,
        user: users[12]._id,
        rating: 5,
        title: 'Ідеальний годинник для бігунів',
        comment: 'Біг — мій хобі, і Garmin Venu 3 — найкращий компаньйон. GPS фіксує маршрут з точністю до метрів. Body Battery показує оптимальний час для тренування. Garmin Coach побудував мені план підготовки до напівмарафону. 14 днів батареї — заряджаю раз на 2 тижні. AMOLED екран гарний та яскравий. Нова фіча — дзвінки з годинника через Bluetooth — зручно на пробіжці.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(58)
      },

      // Baseus GaN5 Pro (products[37]) — 1 відгук
      {
        product: products[37]._id,
        user: users[2]._id,
        rating: 5,
        title: 'Замінив 3 зарядки одним пристроєм',
        comment: 'Раніше носив окремо зарядку для MacBook (61 Вт), для iPhone та для годинника. Тепер один Baseus GaN5 Pro 100 Вт заряджає все. USB-C 100 Вт тягне MacBook Air, другий USB-C заряджає iPhone, а USB-A — годинник/навушники. Розмір — вдвічі менший за стандартний блок MacBook. Для відрядження та подорожей — must-have.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(95)
      },

      // Philips Hue (products[49]) — 1 відгук  
      {
        product: products[49]._id,
        user: users[14]._id,
        rating: 4,
        title: 'Розумне освітлення змінює атмосферу дому',
        comment: 'Почав з цього стартового набору — тепер маю 12 ламп Hue по всій квартирі. Автоматичний сценарій: лампи вмикаються теплим світлом о 18:00 та поступово тьмяніють до 23:00:00 — засинаю краще. На вечірках — кольоровий режим з синхронізацією під музику Spotify. Керування через Siri — "Привіт Siri, увімкни кіно" — світло тьмяніє до 10%. Мінус — ціна: кожна додаткова лампа коштує 800-1500 грн.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(88)
      },

      // Lenovo ThinkPad X1 Carbon (products[11]) — 1 відгук
      {
        product: products[11]._id,
        user: users[12]._id,
        rating: 5,
        title: 'Найкращий ноутбук для бізнес-подорожей',
        comment: 'Подорожую по Україні 3-4 рази на місяць. ThinkPad X1 Carbon — ідеальний: вага 1.12 кг, витримує все (сертифікат MIL-STD). OLED екран 2.8K — документи, таблиці та презентації виглядають ідеально. Батарея тримає 10-12 годин реальної роботи. Клавіатура — найкраща серед ноутбуків, TrackPoint незамінний у потязі. ІЧ-камера — розблокування обличчям за секунду. Мій четвертий ThinkPad і не сумніваюся.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(82)
      },

      // Google Pixel 8 Pro (products[4]) — 1 відгук
      {
        product: products[4]._id,
        user: users[6]._id,
        rating: 5,
        title: 'AI-фішки Google — це нереально',
        comment: 'Magic Eraser прибирає людей з фото одним дотиком — ніби їх там ніколи й не було. Best Take — робиш групове фото, а потім обираєш найкращий вираз обличчя кожної людини. Audio Magic Eraser — видалив шум вітру з відео. Чистий Android без реклами та зайвих додатків. 7 років оновлень — мій iPhone отримує підтримку 5 років, Pixel — 7. Камера при слабкому освітленні — магія, Night Sight робить яскраві фото в повній темряві.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(62)
      },

      // Samsung Galaxy Watch 6 Classic (products[23]) — 1 відгук
      {
        product: products[23]._id,
        user: users[3]._id,
        rating: 4,
        title: 'Обертовий безель — це зручно',
        comment: 'Перейшла з Apple Watch — фізичний безель значно зручніший за цифрову корону. Прокручую сповіщення, меню, таймер — все без торкання екрану. Аналіз складу тіла BIA — цікава фіча, хоча точність відносна. Трекінг сну з Sleep Coaching дійсно покращив мій режим. Мінус: Wear OS 4 іноді підвисає, і екосистема додатків бідніша за watchOS.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(68)
      },

      // Dell XPS 15 (products[14]) — 1 відгук
      {
        product: products[14]._id,
        user: users[10]._id,
        rating: 5,
        title: 'OLED дисплей для фотографа — ідеально',
        comment: 'Як фотограф, мені критично важлива точність кольорів. Dell XPS 15 з 3.5K OLED та 100% DCI-P3 — калібрований монітор у ноутбуці. Редагую фото в Lightroom та Photoshop — кольори збігаються з друкованою продукцією. RTX 4060 прискорює AI Denoise та експорт. InfinityEdge рамки — екран здається більшим. Thunderbolt 4 — підключаю зовнішній SSD та монітор одним хабом.',
        isVerifiedPurchase: true,
        createdAt: daysAgo(105)
      }
    ];

    for (const reviewData of reviewsData) {
      await Review.create(reviewData);
    }
    console.log(`✅ Створено ${reviewsData.length} відгуків`);

    // ═══════════════════════════════════════════════════════════════
    // 5. КУПОНИ
    // ═══════════════════════════════════════════════════════════════
    console.log('🎟️  Створення купонів...');
    const now = new Date();

    const couponsData = [
      {
        code: 'WELCOME10',
        description: 'Знижка 10% для нових клієнтів на перше замовлення',
        type: 'percentage',
        value: 10,
        minPurchase: 1000,
        maxDiscount: 5000,
        usageLimit: 1000,
        startDate: daysAgo(60),
        endDate: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000),
        isActive: true,
        isPublic: true
      },
      {
        code: 'TECHSTORE500',
        description: 'Знижка 500 грн на замовлення від 5000 грн',
        type: 'fixed',
        value: 500,
        minPurchase: 5000,
        usageLimit: 300,
        startDate: daysAgo(30),
        endDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
        isActive: true,
        isPublic: true
      },
      {
        code: 'WINTER2026',
        description: 'Зимова акція — знижка 15% на всю техніку',
        type: 'percentage',
        value: 15,
        minPurchase: 3000,
        maxDiscount: 10000,
        usageLimit: 500,
        startDate: daysAgo(14),
        endDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
        isActive: true,
        isPublic: true
      },
      {
        code: 'APPLE20',
        description: 'Знижка 20% на аксесуари Apple',
        type: 'percentage',
        value: 20,
        minPurchase: 2000,
        maxDiscount: 8000,
        usageLimit: 100,
        applicableCategories: [categories[5]._id],
        startDate: daysAgo(7),
        endDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
        isActive: true,
        isPublic: false
      },
      {
        code: 'VIP25',
        description: 'VIP знижка 25% для постійних клієнтів',
        type: 'percentage',
        value: 25,
        minPurchase: 20000,
        maxDiscount: 25000,
        usageLimit: 50,
        startDate: daysAgo(90),
        endDate: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000),
        isActive: true,
        isPublic: false
      }
    ];

    for (const couponData of couponsData) {
      await Coupon.create(couponData);
    }
    console.log(`✅ Створено ${couponsData.length} купонів`);

    // ═══════════════════════════════════════════════════════════════
    // 6. ЗАМОВЛЕННЯ
    // ═══════════════════════════════════════════════════════════════
    console.log('📋 Створення замовлень...');

    const ordersData = [
      // Замовлення 1 — Олександр, дoставлено 5 місяців тому
      {
        user: users[0]._id,
        items: [
          { product: products[0]._id, name: products[0].name, image: products[0].images[0]?.url, price: products[0].price, quantity: 1, subtotal: products[0].price },
          { product: products[18]._id, name: products[18].name, image: products[18].images[0]?.url, price: products[18].price, quantity: 1, subtotal: products[18].price }
        ],
        shippingAddress: {
          firstName: 'Олександр', lastName: 'Петренко',
          email: 'o.petrenko@gmail.com', phone: '+380671234567',
          street: 'вул. Тараса Шевченка, 25, кв. 14',
          city: 'Львів', state: 'Львівська область', zipCode: '79000', country: 'Україна'
        },
        paymentMethod: 'card',
        paymentStatus: 'paid',
        paymentDetails: { transactionId: 'PAY-LVV-20250816-001', paidAt: daysAgo(185) },
        orderStatus: 'delivered',
        subtotal: products[0].price + products[18].price,
        shippingCost: 0,
        tax: Math.round((products[0].price + products[18].price) * 0.2),
        total: Math.round((products[0].price + products[18].price) * 1.2),
        deliveredAt: daysAgo(181),
        statusHistory: [
          { status: 'pending', date: daysAgo(186), note: 'Замовлення створено' },
          { status: 'processing', date: daysAgo(185), note: 'Оплата підтверджена, замовлення передано на склад' },
          { status: 'shipped', date: daysAgo(184), note: 'Відправлено Новою Поштою, ТТН: 20450123456789' },
          { status: 'delivered', date: daysAgo(181), note: 'Отримано у відділенні Нова Пошта №15, Львів' }
        ],
        trackingNumber: '20450123456789',
        createdAt: daysAgo(186)
      },
      // Замовлення 2 — Марія, доставлено 3 місяці тому
      {
        user: users[1]._id,
        items: [
          { product: products[2]._id, name: products[2].name, image: products[2].images[0]?.url, price: products[2].price, quantity: 1, subtotal: products[2].price }
        ],
        shippingAddress: {
          firstName: 'Марія', lastName: 'Коваленко',
          email: 'maria.kovalenko@ukr.net', phone: '+380931234567',
          street: 'пр. Науки, 45, кв. 78',
          city: 'Харків', state: 'Харківська область', zipCode: '61166', country: 'Україна'
        },
        paymentMethod: 'card',
        paymentStatus: 'paid',
        paymentDetails: { transactionId: 'PAY-KHR-20251016-002', paidAt: daysAgo(122) },
        orderStatus: 'delivered',
        subtotal: products[2].price,
        shippingCost: 0,
        tax: Math.round(products[2].price * 0.2),
        total: Math.round(products[2].price * 1.2),
        deliveredAt: daysAgo(118),
        statusHistory: [
          { status: 'pending', date: daysAgo(123), note: 'Замовлення створено' },
          { status: 'processing', date: daysAgo(122), note: 'Оплату підтверджено' },
          { status: 'shipped', date: daysAgo(121), note: 'Відправлено Новою Поштою' },
          { status: 'delivered', date: daysAgo(118), note: 'Доставлено' }
        ],
        trackingNumber: '20450234567890',
        createdAt: daysAgo(123)
      },
      // Замовлення 3 — Андрій, MacBook, доставлено
      {
        user: users[2]._id,
        items: [
          { product: products[8]._id, name: products[8].name, image: products[8].images[0]?.url, price: products[8].price, quantity: 1, subtotal: products[8].price },
          { product: products[26]._id, name: products[26].name, image: products[26].images[0]?.url, price: products[26].price, quantity: 1, subtotal: products[26].price }
        ],
        shippingAddress: {
          firstName: 'Андрій', lastName: 'Шевченко',
          email: 'andrii.shevchenko@gmail.com', phone: '+380502223344',
          street: 'вул. Антоновича, 172',
          city: 'Київ', state: 'Київська область', zipCode: '03150', country: 'Україна'
        },
        paymentMethod: 'card',
        paymentStatus: 'paid',
        paymentDetails: { transactionId: 'PAY-KYV-20250616-003', paidAt: daysAgo(245) },
        orderStatus: 'delivered',
        subtotal: products[8].price + products[26].price,
        shippingCost: 0,
        tax: Math.round((products[8].price + products[26].price) * 0.2),
        total: Math.round((products[8].price + products[26].price) * 1.2),
        deliveredAt: daysAgo(241),
        statusHistory: [
          { status: 'pending', date: daysAgo(246), note: 'Замовлення створено' },
          { status: 'processing', date: daysAgo(245), note: 'Оплата підтверджена' },
          { status: 'shipped', date: daysAgo(244), note: 'Відправлено кур\'єром Meest Express' },
          { status: 'delivered', date: daysAgo(241), note: 'Доставлено за адресою' }
        ],
        createdAt: daysAgo(246)
      },
      // Замовлення 4 — Ірина, iPad Pro, доставлено
      {
        user: users[3]._id,
        items: [
          { product: products[15]._id, name: products[15].name, image: products[15].images[0]?.url, price: products[15].price, quantity: 1, subtotal: products[15].price }
        ],
        shippingAddress: {
          firstName: 'Ірина', lastName: 'Бондаренко',
          email: 'iryna.bondarenko@outlook.com', phone: '+380673334455',
          street: 'вул. Дерибасівська, 18, кв. 5',
          city: 'Одеса', state: 'Одеська область', zipCode: '65026', country: 'Україна'
        },
        paymentMethod: 'cash_on_delivery',
        paymentStatus: 'paid',
        paymentDetails: { paidAt: daysAgo(73) },
        orderStatus: 'delivered',
        subtotal: products[15].price,
        shippingCost: 80,
        tax: Math.round(products[15].price * 0.2),
        total: Math.round(products[15].price * 1.2) + 80,
        deliveredAt: daysAgo(73),
        statusHistory: [
          { status: 'pending', date: daysAgo(77), note: 'Замовлення створено' },
          { status: 'processing', date: daysAgo(76), note: 'Комплектація на складі' },
          { status: 'shipped', date: daysAgo(75), note: 'Відправлено Новою Поштою' },
          { status: 'delivered', date: daysAgo(73), note: 'Отримано, оплата при отриманні' }
        ],
        trackingNumber: '20450345678901',
        createdAt: daysAgo(77)
      },
      // Замовлення 5 — Дмитро, навушники + павербанк, відправлено
      {
        user: users[4]._id,
        items: [
          { product: products[17]._id, name: products[17].name, image: products[17].images[0]?.url, price: products[17].price, quantity: 1, subtotal: products[17].price },
          { product: products[25]._id, name: products[25].name, image: products[25].images[0]?.url, price: products[25].price, quantity: 2, subtotal: products[25].price * 2 }
        ],
        shippingAddress: {
          firstName: 'Дмитро', lastName: 'Мельник',
          email: 'dmytro.melnyk@gmail.com', phone: '+380934445566',
          street: 'пр. Дмитра Яворницького, 67, кв. 32',
          city: 'Дніпро', state: 'Дніпропетровська область', zipCode: '49000', country: 'Україна'
        },
        paymentMethod: 'card',
        paymentStatus: 'paid',
        paymentDetails: { transactionId: 'PAY-DNP-20260210-005', paidAt: daysAgo(5) },
        orderStatus: 'shipped',
        subtotal: products[17].price + products[25].price * 2,
        shippingCost: 0,
        tax: Math.round((products[17].price + products[25].price * 2) * 0.2),
        total: Math.round((products[17].price + products[25].price * 2) * 1.2),
        statusHistory: [
          { status: 'pending', date: daysAgo(6), note: 'Замовлення створено' },
          { status: 'processing', date: daysAgo(5), note: 'Оплата підтверджена' },
          { status: 'shipped', date: daysAgo(4), note: 'Відправлено Новою Поштою, ТТН: 20450456789012' }
        ],
        trackingNumber: '20450456789012',
        createdAt: daysAgo(6)
      },
      // Замовлення 6 — Наталія, Samsung S24, обробляється
      {
        user: users[5]._id,
        items: [
          { product: products[3]._id, name: products[3].name, image: products[3].images[0]?.url, price: products[3].price, quantity: 1, subtotal: products[3].price }
        ],
        shippingAddress: {
          firstName: 'Наталія', lastName: 'Ткаченко',
          email: 'natalia.tkachenko@ukr.net', phone: '+380505556677',
          street: 'вул. Соборна, 112, кв. 8',
          city: 'Вінниця', state: 'Вінницька область', zipCode: '21000', country: 'Україна'
        },
        paymentMethod: 'card',
        paymentStatus: 'paid',
        paymentDetails: { transactionId: 'PAY-VIN-20260215-006', paidAt: daysAgo(1) },
        orderStatus: 'processing',
        subtotal: products[3].price,
        shippingCost: 0,
        tax: Math.round(products[3].price * 0.2),
        total: Math.round(products[3].price * 1.2),
        statusHistory: [
          { status: 'pending', date: daysAgo(2), note: 'Замовлення створено' },
          { status: 'processing', date: daysAgo(1), note: 'Комплектація на складі' }
        ],
        createdAt: daysAgo(2)
      },
      // Замовлення 7 — Максим, ASUS ROG + годинник, очікує
      {
        user: users[6]._id,
        items: [
          { product: products[10]._id, name: products[10].name, image: products[10].images[0]?.url, price: products[10].price, quantity: 1, subtotal: products[10].price },
          { product: products[22]._id, name: products[22].name, image: products[22].images[0]?.url, price: products[22].price, quantity: 1, subtotal: products[22].price }
        ],
        shippingAddress: {
          firstName: 'Максим', lastName: 'Кравченко',
          email: 'max.kravchenko@gmail.com', phone: '+380676667788',
          street: 'вул. Університетська, 34, кв. 19',
          city: 'Запоріжжя', state: 'Запорізька область', zipCode: '69000', country: 'Україна'
        },
        paymentMethod: 'cash_on_delivery',
        paymentStatus: 'pending',
        orderStatus: 'pending',
        subtotal: products[10].price + products[22].price,
        shippingCost: 0,
        tax: Math.round((products[10].price + products[22].price) * 0.2),
        total: Math.round((products[10].price + products[22].price) * 1.2),
        statusHistory: [
          { status: 'pending', date: daysAgo(0), note: 'Очікує підтвердження' }
        ],
        createdAt: daysAgo(0)
      },
      // Замовлення 8 — Олександр (повторне), HP Pavilion, скасовано
      {
        user: users[0]._id,
        items: [
          { product: products[13]._id, name: products[13].name, image: products[13].images[0]?.url, price: products[13].price, quantity: 1, subtotal: products[13].price }
        ],
        shippingAddress: {
          firstName: 'Олександр', lastName: 'Петренко',
          email: 'o.petrenko@gmail.com', phone: '+380671234567',
          street: 'вул. Тараса Шевченка, 25, кв. 14',
          city: 'Львів', state: 'Львівська область', zipCode: '79000', country: 'Україна'
        },
        paymentMethod: 'card',
        paymentStatus: 'refunded',
        orderStatus: 'cancelled',
        subtotal: products[13].price,
        shippingCost: 80,
        tax: Math.round(products[13].price * 0.2),
        total: Math.round(products[13].price * 1.2) + 80,
        cancellationReason: 'Знайшов цю модель дешевше в іншому магазині',
        cancelledAt: daysAgo(28),
        statusHistory: [
          { status: 'pending', date: daysAgo(32), note: 'Замовлення створено' },
          { status: 'processing', date: daysAgo(31), note: 'Обробка замовлення' },
          { status: 'cancelled', date: daysAgo(28), note: 'Скасовано покупцем: знайшов дешевше' }
        ],
        createdAt: daysAgo(32)
      },
      // Замовлення 9 — Юлія (фотограф), камера Sony + SD SSD, доставлено
      {
        user: users[10]._id,
        items: [
          { product: products[44]._id, name: products[44].name, image: products[44].images[0]?.url, price: products[44].price, quantity: 1, subtotal: products[44].price },
          { product: products[27]._id, name: products[27].name, image: products[27].images[0]?.url, price: products[27].price, quantity: 1, subtotal: products[27].price }
        ],
        shippingAddress: {
          firstName: 'Юлія', lastName: 'Гончаренко',
          email: 'yulia.goncharenko@gmail.com', phone: '+380501112233',
          street: 'вул. Чорновола, 15, кв. 7',
          city: 'Рівне', state: 'Рівненська область', zipCode: '33000', country: 'Україна'
        },
        paymentMethod: 'card',
        paymentStatus: 'paid',
        paymentDetails: { transactionId: 'PAY-RVN-20251010-009', paidAt: daysAgo(132) },
        orderStatus: 'delivered',
        subtotal: products[44].price + products[27].price,
        shippingCost: 0,
        tax: Math.round((products[44].price + products[27].price) * 0.2),
        total: Math.round((products[44].price + products[27].price) * 1.2),
        deliveredAt: daysAgo(128),
        statusHistory: [
          { status: 'pending', date: daysAgo(133), note: 'Замовлення створено' },
          { status: 'processing', date: daysAgo(132), note: 'Оплата підтверджена' },
          { status: 'shipped', date: daysAgo(131), note: 'Відправлено Новою Поштою' },
          { status: 'delivered', date: daysAgo(128), note: 'Доставлено' }
        ],
        trackingNumber: '20450567890123',
        createdAt: daysAgo(133)
      },
      // Замовлення 10 — Павло (геймер), PS5 + ігровий монітор, доставлено
      {
        user: users[11]._id,
        items: [
          { product: products[38]._id, name: products[38].name, image: products[38].images[0]?.url, price: products[38].price, quantity: 1, subtotal: products[38].price },
          { product: products[42]._id, name: products[42].name, image: products[42].images[0]?.url, price: products[42].price, quantity: 1, subtotal: products[42].price }
        ],
        shippingAddress: {
          firstName: 'Павло', lastName: 'Романюк',
          email: 'pavlo.romaniuk@gmail.com', phone: '+380672223344',
          street: 'вул. Руська, 44, кв. 10',
          city: 'Тернопіль', state: 'Тернопільська область', zipCode: '46000', country: 'Україна'
        },
        paymentMethod: 'card',
        paymentStatus: 'paid',
        paymentDetails: { transactionId: 'PAY-TER-20260105-010', paidAt: daysAgo(42) },
        orderStatus: 'delivered',
        subtotal: products[38].price + products[42].price,
        shippingCost: 0,
        tax: Math.round((products[38].price + products[42].price) * 0.2),
        total: Math.round((products[38].price + products[42].price) * 1.2),
        deliveredAt: daysAgo(38),
        statusHistory: [
          { status: 'pending', date: daysAgo(43), note: 'Замовлення створено' },
          { status: 'processing', date: daysAgo(42), note: 'Оплата підтверджена' },
          { status: 'shipped', date: daysAgo(41), note: 'Відправлено Meest Express' },
          { status: 'delivered', date: daysAgo(38), note: 'Доставлено' }
        ],
        trackingNumber: 'ME20260105001234',
        createdAt: daysAgo(43)
      },
      // Замовлення 11 — Тарас (IT), Zenbook 14 + Baseus зарядка, відправлено
      {
        user: users[12]._id,
        items: [
          { product: products[31]._id, name: products[31].name, image: products[31].images[0]?.url, price: products[31].price, quantity: 1, subtotal: products[31].price },
          { product: products[37]._id, name: products[37].name, image: products[37].images[0]?.url, price: products[37].price, quantity: 1, subtotal: products[37].price }
        ],
        shippingAddress: {
          firstName: 'Тарас', lastName: 'Федорчук',
          email: 'taras.fedorchuk@ukr.net', phone: '+380933344556',
          street: 'пл. Театральна, 8, кв. 22',
          city: 'Ужгород', state: 'Закарпатська область', zipCode: '88000', country: 'Україна'
        },
        paymentMethod: 'card',
        paymentStatus: 'paid',
        paymentDetails: { transactionId: 'PAY-UZH-20260212-011', paidAt: daysAgo(3) },
        orderStatus: 'shipped',
        subtotal: products[31].price + products[37].price,
        shippingCost: 80,
        tax: Math.round((products[31].price + products[37].price) * 0.2),
        total: Math.round((products[31].price + products[37].price) * 1.2) + 80,
        statusHistory: [
          { status: 'pending', date: daysAgo(4), note: 'Замовлення створено' },
          { status: 'processing', date: daysAgo(3), note: 'Оплата підтверджена' },
          { status: 'shipped', date: daysAgo(2), note: 'Відправлено Укрпоштою' }
        ],
        trackingNumber: 'UA204501234560',
        createdAt: daysAgo(4)
      },
      // Замовлення 12 — Анна (студентка), Galaxy A55 + AirTag, очікує
      {
        user: users[13]._id,
        items: [
          { product: products[28]._id, name: products[28].name, image: products[28].images[0]?.url, price: products[28].price, quantity: 1, subtotal: products[28].price },
          { product: products[38]._id, name: products[38].name, image: products[38].images[0]?.url, price: products[38].price, quantity: 1, subtotal: products[38].price }
        ],
        shippingAddress: {
          firstName: 'Анна', lastName: 'Кузьменко',
          email: 'anna.kuzmenko@gmail.com', phone: '+380504455667',
          street: 'вул. Кривий Вал, 30, кв. 4',
          city: 'Луцьк', state: 'Волинська область', zipCode: '43000', country: 'Україна'
        },
        paymentMethod: 'cash_on_delivery',
        paymentStatus: 'pending',
        orderStatus: 'processing',
        subtotal: products[28].price + products[38].price,
        shippingCost: 80,
        tax: Math.round((products[28].price + products[38].price) * 0.2),
        total: Math.round((products[28].price + products[38].price) * 1.2) + 80,
        statusHistory: [
          { status: 'pending', date: daysAgo(1), note: 'Замовлення створено' },
          { status: 'processing', date: daysAgo(0), note: 'Комплектація на складі' }
        ],
        createdAt: daysAgo(1)
      },
      // Замовлення 13 — Роман, Nintendo Switch + Hue, доставлено
      {
        user: users[14]._id,
        items: [
          { product: products[40]._id, name: products[40].name, image: products[40].images[0]?.url, price: products[40].price, quantity: 1, subtotal: products[40].price },
          { product: products[49]._id, name: products[49].name, image: products[49].images[0]?.url, price: products[49].price, quantity: 1, subtotal: products[49].price }
        ],
        shippingAddress: {
          firstName: 'Роман', lastName: 'Зінченко',
          email: 'roman.zinchenko@outlook.com', phone: '+380675566778',
          street: 'пр. Миру, 52, кв. 16',
          city: 'Чернігів', state: 'Чернігівська область', zipCode: '14000', country: 'Україна'
        },
        paymentMethod: 'card',
        paymentStatus: 'paid',
        paymentDetails: { transactionId: 'PAY-CHR-20260201-013', paidAt: daysAgo(14) },
        orderStatus: 'delivered',
        subtotal: products[40].price + products[49].price,
        shippingCost: 0,
        tax: Math.round((products[40].price + products[49].price) * 0.2),
        total: Math.round((products[40].price + products[49].price) * 1.2),
        deliveredAt: daysAgo(10),
        statusHistory: [
          { status: 'pending', date: daysAgo(15), note: 'Замовлення створено' },
          { status: 'processing', date: daysAgo(14), note: 'Оплата підтверджена' },
          { status: 'shipped', date: daysAgo(13), note: 'Відправлено Новою Поштою' },
          { status: 'delivered', date: daysAgo(10), note: 'Доставлено' }
        ],
        trackingNumber: '20450678901234',
        createdAt: daysAgo(15)
      }
    ];

    for (let i = 0; i < ordersData.length; i++) {
      const orderData = ordersData[i];
      const orderDate = orderData.createdAt || new Date();
      const year = orderDate.getFullYear();
      const month = String(orderDate.getMonth() + 1).padStart(2, '0');
      orderData.orderNumber = `ORD-${year}${month}-${String(i + 1).padStart(4, '0')}`;
      await Order.create(orderData);
    }
    console.log(`✅ Створено ${ordersData.length} замовлень`);

    // ═══════════════════════════════════════════════════════════════
    // ПІДСУМОК
    // ═══════════════════════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════');
    console.log('🎉 Базу даних успішно заповнено!');
    console.log('══════════════════════════════════════════');
    console.log('\n📊 Створено:');
    console.log(`   👤 ${users.length + 1} користувачів (1 адмін + ${users.length} користувачів)`);
    console.log(`   📁 ${categories.length} категорій`);
    console.log(`   📦 ${products.length} товарів`);
    console.log(`   ⭐ ${reviewsData.length} відгуків`);
    console.log(`   🎟️  ${couponsData.length} купонів`);
    console.log(`   📋 ${ordersData.length} замовлень`);
    console.log('\n🔐 Дані для входу:');
    console.log(`   Адмін:      ${admin.email} / ${process.env.ADMIN_PASSWORD || 'Admin123!@#'}`);
    console.log(`   Користувач: o.petrenko@gmail.com / User123!@#`);
    console.log(`   Користувач: maria.kovalenko@ukr.net / Maria123!@#`);
    console.log('══════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Помилка при заповненні бази:', error);
    process.exit(1);
  }
};

seedDatabase();
