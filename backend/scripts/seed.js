const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User.model');
const Category = require('../models/Category.model');
const Product = require('../models/Product.model');
const Review = require('../models/Review.model');
const Coupon = require('../models/Coupon.model');
const Order = require('../models/Order.model');

const seedDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Review.deleteMany({});
    await Coupon.deleteMany({});
    await Order.deleteMany({});
    
    // Drop indexes to avoid conflicts
    try {
      await mongoose.connection.collection('categories').dropIndexes();
      await mongoose.connection.collection('products').dropIndexes();
    } catch (e) {
      // Indexes may not exist yet
    }
    console.log('✅ Data cleared');

    // Create admin user
    console.log('👤 Creating admin user...');
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: process.env.ADMIN_EMAIL || 'admin@electronics.com',
      password: process.env.ADMIN_PASSWORD || 'Admin123!@#',
      role: 'admin',
      isActive: true,
      emailVerified: true,
      phone: '+380501234567',
      address: [{
        label: 'Office',
        street: 'вул. Хрещатик, 1',
        city: 'Київ',
        state: 'Київська область',
        zipCode: '01001',
        country: 'Україна',
        isDefault: true
      }]
    });
    console.log('✅ Admin user created');

    // Create demo users
    console.log('👥 Creating demo users...');
    const demoUsers = await Promise.all([
      User.create({
        firstName: 'Олександр',
        lastName: 'Петренко',
        email: 'user@demo.com',
        password: 'User123!@#',
        role: 'user',
        isActive: true,
        emailVerified: true,
        phone: '+380671234567',
        address: [{
          label: 'Дім',
          street: 'вул. Шевченка, 25',
          city: 'Львів',
          state: 'Львівська область',
          zipCode: '79000',
          country: 'Україна',
          isDefault: true
        }]
      }),
      User.create({
        firstName: 'Марія',
        lastName: 'Коваленко',
        email: 'maria@demo.com',
        password: 'Maria123!@#',
        role: 'user',
        isActive: true,
        emailVerified: true,
        phone: '+380931234567',
        address: [{
          label: 'Дім',
          street: 'пр. Свободи, 12',
          city: 'Харків',
          state: 'Харківська область',
          zipCode: '61000',
          country: 'Україна',
          isDefault: true
        }]
      }),
      User.create({
        firstName: 'Андрій',
        lastName: 'Шевченко',
        email: 'andrii@demo.com',
        password: 'Andrii123!@#',
        role: 'user',
        isActive: true,
        emailVerified: true,
        phone: '+380501112233'
      }),
      User.create({
        firstName: 'Ірина',
        lastName: 'Бондаренко',
        email: 'iryna@demo.com',
        password: 'Iryna123!@#',
        role: 'user',
        isActive: true,
        emailVerified: true,
        phone: '+380671112233'
      }),
      User.create({
        firstName: 'Дмитро',
        lastName: 'Мельник',
        email: 'dmytro@demo.com',
        password: 'Dmytro123!@#',
        role: 'user',
        isActive: true,
        emailVerified: false,
        phone: '+380931112233'
      })
    ]);
    console.log('✅ Demo users created');

    // Create categories (one by one to trigger pre-save hooks)
    console.log('📁 Creating categories...');
    const categoryData = [
      { name: 'Смартфони', slug: 'smartphones', description: 'Найновіші смартфони та мобільні пристрої від провідних брендів', order: 1, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400' },
      { name: 'Ноутбуки', slug: 'laptops', description: 'Потужні ноутбуки та ультрабуки для роботи та розваг', order: 2, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400' },
      { name: 'Планшети', slug: 'tablets', description: 'Планшети та iPad для навчання, роботи та розваг', order: 3, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400' },
      { name: 'Смарт-годинники', slug: 'smartwatches', description: 'Розумні годинники та фітнес-трекери', order: 4, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' },
      { name: 'Навушники', slug: 'headphones', description: 'Бездротові та дротові навушники преміум якості', order: 5, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
      { name: 'Фотоапарати', slug: 'cameras', description: 'Цифрові камери та аксесуари для фотографії', order: 6, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400' },
      { name: 'Ігрові консолі', slug: 'gaming', description: 'Ігрові приставки та аксесуари для геймерів', order: 7, image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400' },
      { name: 'Аксесуари', slug: 'accessories', description: 'Різноманітні електронні аксесуари', order: 8, image: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400' },
      { name: 'ТВ та Монітори', slug: 'tv-monitors', description: 'Телевізори та комп\'ютерні монітори', order: 9, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400' },
      { name: 'Розумний дім', slug: 'smart-home', description: 'Пристрої для розумного дому та автоматизації', order: 10, image: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=400' }
    ];
    
    const categories = [];
    for (const catData of categoryData) {
      const category = await Category.create(catData);
      categories.push(category);
    }
    console.log('✅ Categories created');

    // Create sample products (one by one to trigger pre-save hooks)
    console.log('📦 Creating sample products...');
    const productData = [
      // Смартфони (category 0)
      {
        name: 'iPhone 15 Pro Max',
        description: 'Найпотужніший iPhone з чіпом A17 Pro, титановим корпусом та революційною системою камер. Підтримка USB 3, Action Button та найкраща автономність серед iPhone.',
        shortDescription: 'Флагман Apple з чіпом A17 Pro та титановим корпусом',
        price: 52999,
        comparePrice: 56999,
        category: categories[0]._id,
        brand: 'Apple',
        sku: 'IPH15PM256',
        stock: 50,
        images: [
          { url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800', alt: 'iPhone 15 Pro Max', isMain: true },
          { url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800', alt: 'iPhone 15 Pro Max Blue' }
        ],
        specifications: [
          { name: 'Дисплей', value: '6.7" Super Retina XDR OLED' },
          { name: 'Процесор', value: 'Apple A17 Pro' },
          { name: 'Пам\'ять', value: '256GB' },
          { name: 'Камера', value: '48MP + 12MP + 12MP' },
          { name: 'Батарея', value: '4422 mAh' },
          { name: 'ОС', value: 'iOS 17' }
        ],
        features: ['ProMotion 120Hz', 'Always-On Display', 'Dynamic Island', 'Ceramic Shield', '5G', 'USB Type-C'],
        tags: ['новинка', 'хіт продажів', 'преміум'],
        warranty: '2 роки',
        isFeatured: true,
        isOnSale: true
      },
      {
        name: 'iPhone 15 Pro',
        description: 'Компактний флагман Apple з чіпом A17 Pro. Титановий дизайн, потужна камера та Action Button для швидкого доступу до функцій.',
        shortDescription: 'Компактний флагман з A17 Pro',
        price: 46999,
        comparePrice: 49999,
        category: categories[0]._id,
        brand: 'Apple',
        sku: 'IPH15P128',
        stock: 65,
        images: [
          { url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800', alt: 'iPhone 15 Pro', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '6.1" Super Retina XDR' },
          { name: 'Процесор', value: 'Apple A17 Pro' },
          { name: 'Пам\'ять', value: '128GB' },
          { name: 'Камера', value: '48MP + 12MP + 12MP' }
        ],
        features: ['ProMotion 120Hz', 'Dynamic Island', 'Titanium Design', '5G'],
        tags: ['новинка', 'преміум'],
        warranty: '2 роки',
        isFeatured: true,
        isOnSale: true
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Флагман Samsung з потужним AI, вбудованим S Pen та камерою 200MP. Galaxy AI допоможе з перекладом, редагуванням фото та багато іншого.',
        shortDescription: 'Преміум Android-флагман з S Pen та AI',
        price: 49999,
        comparePrice: 54999,
        category: categories[0]._id,
        brand: 'Samsung',
        sku: 'SGS24U256',
        stock: 45,
        images: [
          { url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800', alt: 'Samsung Galaxy S24 Ultra', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '6.8" Dynamic AMOLED 2X' },
          { name: 'Процесор', value: 'Snapdragon 8 Gen 3' },
          { name: 'Пам\'ять', value: '256GB / 12GB RAM' },
          { name: 'Камера', value: '200MP + 12MP + 50MP + 10MP' },
          { name: 'Батарея', value: '5000 mAh' }
        ],
        features: ['Galaxy AI', 'S Pen', '120Hz LTPO', '5G', 'Titanium Frame'],
        tags: ['новинка', 'штучний інтелект', 'хіт продажів'],
        warranty: '2 роки',
        isFeatured: true,
        isOnSale: true
      },
      {
        name: 'Samsung Galaxy S24',
        description: 'Компактний флагман Samsung з Galaxy AI. Потужний процесор, яскравий дисплей та преміальний дизайн.',
        shortDescription: 'Компактний флагман з Galaxy AI',
        price: 31999,
        category: categories[0]._id,
        brand: 'Samsung',
        sku: 'SGS24128',
        stock: 80,
        images: [
          { url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800', alt: 'Samsung Galaxy S24', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '6.2" Dynamic AMOLED 2X' },
          { name: 'Процесор', value: 'Exynos 2400' },
          { name: 'Пам\'ять', value: '128GB / 8GB RAM' },
          { name: 'Камера', value: '50MP + 12MP + 10MP' }
        ],
        features: ['Galaxy AI', '120Hz', '5G', 'IP68'],
        tags: ['новинка', 'штучний інтелект'],
        warranty: '2 роки',
        isFeatured: true
      },
      {
        name: 'Google Pixel 8 Pro',
        description: 'Найкращий смартфон Google з передовим AI та неперевершеною камерою. Tensor G3 забезпечує магію обробки фото та голосу.',
        shortDescription: 'Смартфон Google з найкращою камерою та AI',
        price: 39999,
        category: categories[0]._id,
        brand: 'Google',
        sku: 'GP8PRO128',
        stock: 35,
        images: [
          { url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800', alt: 'Google Pixel 8 Pro', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '6.7" LTPO OLED' },
          { name: 'Процесор', value: 'Google Tensor G3' },
          { name: 'Пам\'ять', value: '128GB / 12GB RAM' },
          { name: 'Камера', value: '50MP + 48MP + 48MP' }
        ],
        features: ['Best Take', 'Magic Eraser', 'Audio Magic Eraser', '7 років оновлень'],
        tags: ['штучний інтелект', 'найкраща камера'],
        warranty: '2 роки',
        isFeatured: true
      },
      {
        name: 'Xiaomi 14 Pro',
        description: 'Флагман Xiaomi з оптикою Leica та потужним Snapdragon 8 Gen 3. Преміальний дизайн та швидка зарядка 120W.',
        shortDescription: 'Флагман з оптикою Leica',
        price: 34999,
        comparePrice: 37999,
        category: categories[0]._id,
        brand: 'Xiaomi',
        sku: 'XM14PRO256',
        stock: 40,
        images: [
          { url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800', alt: 'Xiaomi 14 Pro', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '6.73" LTPO AMOLED' },
          { name: 'Процесор', value: 'Snapdragon 8 Gen 3' },
          { name: 'Пам\'ять', value: '256GB / 12GB RAM' },
          { name: 'Камера', value: '50MP Leica + 50MP + 50MP' }
        ],
        features: ['Leica Optics', '120W Charging', '120Hz', 'IP68'],
        tags: ['новинка', 'leica'],
        warranty: '2 роки',
        isOnSale: true
      },
      {
        name: 'OnePlus 12',
        description: 'Флагман OnePlus з камерою Hasselblad та найшвидшою зарядкою 100W. Snapdragon 8 Gen 3 забезпечує неперевершену продуктивність.',
        shortDescription: 'Швидкий флагман з Hasselblad',
        price: 32999,
        category: categories[0]._id,
        brand: 'OnePlus',
        sku: 'OP12256',
        stock: 30,
        images: [
          { url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800', alt: 'OnePlus 12', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '6.82" LTPO AMOLED' },
          { name: 'Процесор', value: 'Snapdragon 8 Gen 3' },
          { name: 'Пам\'ять', value: '256GB / 12GB RAM' },
          { name: 'Камера', value: '50MP + 64MP + 48MP' }
        ],
        features: ['100W SuperVOOC', 'Hasselblad', '120Hz', '5G'],
        tags: ['швидка зарядка'],
        warranty: '2 роки'
      },

      // Ноутбуки (category 1)
      {
        name: 'MacBook Pro 16" M3 Pro',
        description: 'Професійний ноутбук Apple з чіпом M3 Pro. Неймовірна продуктивність, приголомшливий дисплей Liquid Retina XDR та батарея на весь день.',
        shortDescription: 'Професійний ноутбук з чіпом M3 Pro',
        price: 109999,
        comparePrice: 119999,
        category: categories[1]._id,
        brand: 'Apple',
        sku: 'MBP16M3P512',
        stock: 30,
        images: [
          { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', alt: 'MacBook Pro 16', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '16.2" Liquid Retina XDR' },
          { name: 'Процесор', value: 'Apple M3 Pro (12-core CPU)' },
          { name: 'Пам\'ять', value: '18GB Unified Memory' },
          { name: 'Накопичувач', value: '512GB SSD' },
          { name: 'Батарея', value: 'до 22 годин' }
        ],
        features: ['ProMotion 120Hz', 'MagSafe 3', 'HDMI', 'SDXC', 'Thunderbolt 4'],
        tags: ['професійний', 'для роботи'],
        warranty: '2 роки',
        isFeatured: true,
        isOnSale: true
      },
      {
        name: 'MacBook Air 15" M3',
        description: 'Найтонший 15-дюймовий ноутбук у світі. Чіп M3 забезпечує неймовірну продуктивність при абсолютній тиші роботи.',
        shortDescription: 'Тонкий та легкий з чіпом M3',
        price: 59999,
        category: categories[1]._id,
        brand: 'Apple',
        sku: 'MBA15M3256',
        stock: 45,
        images: [
          { url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800', alt: 'MacBook Air 15', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '15.3" Liquid Retina' },
          { name: 'Процесор', value: 'Apple M3 (8-core CPU)' },
          { name: 'Пам\'ять', value: '8GB Unified Memory' },
          { name: 'Накопичувач', value: '256GB SSD' },
          { name: 'Батарея', value: 'до 18 годин' }
        ],
        features: ['Fanless Design', 'MagSafe', '1080p Camera', 'Touch ID'],
        tags: ['для навчання', 'легкий'],
        warranty: '2 роки',
        isFeatured: true
      },
      {
        name: 'Dell XPS 15',
        description: 'Преміальний ноутбук Dell з дисплеєм InfinityEdge та потужним процесором Intel Core i7. Ідеальний для творчих професіоналів.',
        shortDescription: 'Преміум-ноутбук для творчих задач',
        price: 64999,
        comparePrice: 69999,
        category: categories[1]._id,
        brand: 'Dell',
        sku: 'DXPS15I7512',
        stock: 25,
        images: [
          { url: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800', alt: 'Dell XPS 15', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '15.6" OLED 3.5K' },
          { name: 'Процесор', value: 'Intel Core i7-13700H' },
          { name: 'Пам\'ять', value: '16GB DDR5' },
          { name: 'Накопичувач', value: '512GB NVMe SSD' },
          { name: 'Графіка', value: 'NVIDIA RTX 4060' }
        ],
        features: ['InfinityEdge Display', 'Thunderbolt 4', 'Fingerprint Reader'],
        tags: ['для дизайнерів', 'OLED'],
        warranty: '2 роки',
        isOnSale: true
      },
      {
        name: 'ASUS ROG Strix G16',
        description: 'Потужний ігровий ноутбук з RTX 4070 та дисплеєм 240Hz. Створений для перемог у найвимогливіших іграх.',
        shortDescription: 'Ігровий ноутбук з RTX 4070',
        price: 72999,
        category: categories[1]._id,
        brand: 'ASUS',
        sku: 'ROGSG16RTX',
        stock: 20,
        images: [
          { url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800', alt: 'ASUS ROG Strix', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '16" QHD 240Hz' },
          { name: 'Процесор', value: 'Intel Core i9-13980HX' },
          { name: 'Пам\'ять', value: '32GB DDR5' },
          { name: 'Накопичувач', value: '1TB NVMe SSD' },
          { name: 'Графіка', value: 'NVIDIA RTX 4070' }
        ],
        features: ['ROG Intelligent Cooling', 'RGB Keyboard', 'Dolby Atmos'],
        tags: ['ігровий', 'RTX 4070'],
        warranty: '2 роки',
        isFeatured: true
      },
      {
        name: 'Lenovo ThinkPad X1 Carbon Gen 11',
        description: 'Бізнес-ноутбук преміум-класу. Легкий, надійний та захищений за військовими стандартами.',
        shortDescription: 'Преміальний бізнес-ноутбук',
        price: 79999,
        category: categories[1]._id,
        brand: 'Lenovo',
        sku: 'TPX1C11512',
        stock: 15,
        images: [
          { url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800', alt: 'ThinkPad X1 Carbon', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '14" 2.8K OLED' },
          { name: 'Процесор', value: 'Intel Core i7-1365U' },
          { name: 'Пам\'ять', value: '16GB LPDDR5' },
          { name: 'Накопичувач', value: '512GB SSD' },
          { name: 'Вага', value: '1.12 кг' }
        ],
        features: ['MIL-STD-810H', 'Fingerprint', 'IR Camera', '5G LTE'],
        tags: ['бізнес', 'легкий'],
        warranty: '3 роки'
      },
      {
        name: 'HP Pavilion 15',
        description: 'Універсальний ноутбук для навчання та роботи. Оптимальне співвідношення ціни та якості.',
        shortDescription: 'Універсальний ноутбук за доступною ціною',
        price: 24999,
        comparePrice: 27999,
        category: categories[1]._id,
        brand: 'HP',
        sku: 'HPPAV15I5',
        stock: 60,
        images: [
          { url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800', alt: 'HP Pavilion 15', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '15.6" FHD IPS' },
          { name: 'Процесор', value: 'Intel Core i5-1335U' },
          { name: 'Пам\'ять', value: '8GB DDR4' },
          { name: 'Накопичувач', value: '512GB SSD' }
        ],
        features: ['Fast Charge', 'WiFi 6', 'Backlit Keyboard'],
        tags: ['для навчання', 'бюджетний'],
        warranty: '2 роки',
        isOnSale: true
      },

      // Планшети (category 2)
      {
        name: 'iPad Pro 12.9" M2',
        description: 'Найпотужніший iPad з чіпом M2 та приголомшливим дисплеєм Liquid Retina XDR. Ідеальний для творчих професіоналів.',
        shortDescription: 'Професійний планшет з чіпом M2',
        price: 47999,
        comparePrice: 51999,
        category: categories[2]._id,
        brand: 'Apple',
        sku: 'IPADP129M2',
        stock: 25,
        images: [
          { url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800', alt: 'iPad Pro 12.9', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '12.9" Liquid Retina XDR' },
          { name: 'Процесор', value: 'Apple M2' },
          { name: 'Пам\'ять', value: '128GB' },
          { name: 'Камера', value: '12MP Wide + 10MP Ultra Wide' }
        ],
        features: ['ProMotion 120Hz', 'Face ID', 'Apple Pencil 2', 'Thunderbolt'],
        tags: ['професійний', 'для художників'],
        warranty: '2 роки',
        isFeatured: true,
        isOnSale: true
      },
      {
        name: 'iPad Air 5',
        description: 'Потужний та універсальний iPad з чіпом M1. Підтримує Apple Pencil та Magic Keyboard.',
        shortDescription: 'Універсальний планшет з чіпом M1',
        price: 27999,
        category: categories[2]._id,
        brand: 'Apple',
        sku: 'IPADA564',
        stock: 40,
        images: [
          { url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800', alt: 'iPad Air', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '10.9" Liquid Retina' },
          { name: 'Процесор', value: 'Apple M1' },
          { name: 'Пам\'ять', value: '64GB' },
          { name: 'Камера', value: '12MP Wide' }
        ],
        features: ['Touch ID', 'Apple Pencil 2', 'USB-C'],
        tags: ['для навчання'],
        warranty: '2 роки',
        isFeatured: true
      },
      {
        name: 'Samsung Galaxy Tab S9 Ultra',
        description: 'Найбільший планшет Samsung з 14.6" AMOLED дисплеєм та S Pen у комплекті. Ідеальний для роботи та розваг.',
        shortDescription: 'Великий планшет з S Pen',
        price: 44999,
        category: categories[2]._id,
        brand: 'Samsung',
        sku: 'SGTS9U256',
        stock: 20,
        images: [
          { url: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800', alt: 'Galaxy Tab S9 Ultra', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '14.6" Dynamic AMOLED 2X' },
          { name: 'Процесор', value: 'Snapdragon 8 Gen 2' },
          { name: 'Пам\'ять', value: '256GB / 12GB RAM' },
          { name: 'Батарея', value: '11200 mAh' }
        ],
        features: ['S Pen included', '120Hz', 'IP68', 'DeX Mode'],
        tags: ['преміум', 'великий дисплей'],
        warranty: '2 роки'
      },

      // Смарт-годинники (category 3)
      {
        name: 'Apple Watch Series 9',
        description: 'Найпотужніший Apple Watch з новим жестом Double Tap, яскравішим дисплеєм та покращеним відстеженням здоров\'я.',
        shortDescription: 'Найновіший Apple Watch',
        price: 18999,
        comparePrice: 19999,
        category: categories[3]._id,
        brand: 'Apple',
        sku: 'AW9GPS45',
        stock: 60,
        images: [
          { url: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800', alt: 'Apple Watch Series 9', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '45mm Always-On Retina LTPO OLED' },
          { name: 'Процесор', value: 'Apple S9 SiP' },
          { name: 'Пам\'ять', value: '64GB' },
          { name: 'Батарея', value: 'до 18 годин' }
        ],
        features: ['Double Tap', 'Blood Oxygen', 'ECG', 'Crash Detection', 'WR50'],
        tags: ['новинка', 'здоров\'я'],
        warranty: '2 роки',
        isFeatured: true,
        isOnSale: true
      },
      {
        name: 'Apple Watch Ultra 2',
        description: 'Найміцніший та найфункціональніший Apple Watch для екстремальних пригод та спорту.',
        shortDescription: 'Преміум-годинник для екстремалів',
        price: 37999,
        category: categories[3]._id,
        brand: 'Apple',
        sku: 'AWU2GPS49',
        stock: 25,
        images: [
          { url: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800', alt: 'Apple Watch Ultra 2', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '49mm Always-On Retina LTPO OLED' },
          { name: 'Процесор', value: 'Apple S9 SiP' },
          { name: 'Батарея', value: 'до 36 годин' },
          { name: 'Корпус', value: 'Титан' }
        ],
        features: ['Action Button', 'Depth Gauge', 'Siren', 'WR100'],
        tags: ['преміум', 'для спорту', 'титан'],
        warranty: '2 роки',
        isFeatured: true
      },
      {
        name: 'Samsung Galaxy Watch 6 Classic',
        description: 'Класичний дизайн з обертовим безелем та передовими функціями відстеження здоров\'я.',
        shortDescription: 'Класичний смарт-годинник Samsung',
        price: 15999,
        category: categories[3]._id,
        brand: 'Samsung',
        sku: 'SGW6C47',
        stock: 40,
        images: [
          { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', alt: 'Galaxy Watch 6 Classic', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '47mm Super AMOLED' },
          { name: 'Процесор', value: 'Exynos W930' },
          { name: 'Пам\'ять', value: '16GB' },
          { name: 'Батарея', value: '425 mAh' }
        ],
        features: ['Rotating Bezel', 'BioActive Sensor', 'Sleep Coaching', '5ATM + IP68'],
        tags: ['класичний дизайн'],
        warranty: '2 роки'
      },
      {
        name: 'Garmin Fenix 7 Pro',
        description: 'Мультиспортивний GPS-годинник преміум-класу з сонячною зарядкою та детальними картами.',
        shortDescription: 'Мультиспортивний годинник з GPS',
        price: 29999,
        category: categories[3]._id,
        brand: 'Garmin',
        sku: 'GF7PRO47',
        stock: 15,
        images: [
          { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', alt: 'Garmin Fenix 7 Pro', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '47mm MIP' },
          { name: 'Батарея', value: 'до 22 днів' },
          { name: 'GPS', value: 'Multi-band GNSS' },
          { name: 'Водонепроникність', value: '10ATM' }
        ],
        features: ['Solar Charging', 'TopoActive Maps', 'Training Readiness', 'HRV Status'],
        tags: ['для спорту', 'GPS', 'тривала батарея'],
        warranty: '2 роки'
      },

      // Навушники (category 4)
      {
        name: 'Sony WH-1000XM5',
        description: 'Навушники з найкращим шумоподавленням у галузі та неперевершеною якістю звуку. Ідеальні для меломанів.',
        shortDescription: 'Преміум навушники з шумоподавленням',
        price: 14999,
        comparePrice: 16999,
        category: categories[4]._id,
        brand: 'Sony',
        sku: 'SONYWH1000XM5',
        stock: 40,
        images: [
          { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', alt: 'Sony WH-1000XM5', isMain: true }
        ],
        specifications: [
          { name: 'Тип', value: 'Повнорозмірні бездротові' },
          { name: 'Шумоподавлення', value: 'Лідер галузі' },
          { name: 'Батарея', value: 'до 30 годин' },
          { name: 'Bluetooth', value: '5.2, LDAC' }
        ],
        features: ['Multipoint', 'Speak-to-Chat', 'Adaptive Sound Control', 'Hi-Res Audio'],
        tags: ['шумоподавлення', 'преміум'],
        warranty: '2 роки',
        isFeatured: true,
        isOnSale: true
      },
      {
        name: 'Apple AirPods Pro 2',
        description: 'Активне шумоподавлення, адаптивний звук та персоналізований просторовий аудіо. Із зарядним кейсом USB-C.',
        shortDescription: 'Преміум TWS навушники Apple',
        price: 10999,
        category: categories[4]._id,
        brand: 'Apple',
        sku: 'APP2USBC',
        stock: 70,
        images: [
          { url: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800', alt: 'AirPods Pro 2', isMain: true }
        ],
        specifications: [
          { name: 'Тип', value: 'TWS (True Wireless)' },
          { name: 'Чіп', value: 'Apple H2' },
          { name: 'Батарея', value: '6 + 30 годин з кейсом' },
          { name: 'Шумоподавлення', value: '2x краще за попередні' }
        ],
        features: ['Adaptive Audio', 'Conversation Awareness', 'Personalized Spatial Audio', 'MagSafe'],
        tags: ['TWS', 'Apple'],
        warranty: '2 роки',
        isFeatured: true
      },
      {
        name: 'Samsung Galaxy Buds2 Pro',
        description: 'Компактні TWS навушники з активним шумоподавленням та якістю звуку Hi-Fi 24-bit.',
        shortDescription: 'Преміум TWS від Samsung',
        price: 7999,
        comparePrice: 8999,
        category: categories[4]._id,
        brand: 'Samsung',
        sku: 'SGB2PRO',
        stock: 50,
        images: [
          { url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800', alt: 'Galaxy Buds2 Pro', isMain: true }
        ],
        specifications: [
          { name: 'Тип', value: 'TWS (True Wireless)' },
          { name: 'Динаміки', value: '2-way (Woofer + Tweeter)' },
          { name: 'Батарея', value: '5 + 18 годин з кейсом' },
          { name: 'Кодеки', value: 'SSC HiFi, AAC, SBC' }
        ],
        features: ['360 Audio', 'Voice Detect', 'ANC', 'IPX7'],
        tags: ['TWS', 'Hi-Fi'],
        warranty: '2 роки',
        isOnSale: true
      },
      {
        name: 'Bose QuietComfort Ultra',
        description: 'Нові флагманські навушники Bose з іммерсивним аудіо та неперевершеним комфортом носіння.',
        shortDescription: 'Преміум навушники Bose',
        price: 16999,
        category: categories[4]._id,
        brand: 'Bose',
        sku: 'BOSEQCU',
        stock: 25,
        images: [
          { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', alt: 'Bose QuietComfort Ultra', isMain: true }
        ],
        specifications: [
          { name: 'Тип', value: 'Повнорозмірні бездротові' },
          { name: 'Батарея', value: 'до 24 годин' },
          { name: 'Bluetooth', value: '5.3, aptX Adaptive' },
          { name: 'Шумоподавлення', value: 'CustomTune' }
        ],
        features: ['Immersive Audio', 'CustomTune', 'Aware Mode', 'Multipoint'],
        tags: ['шумоподавлення', 'преміум', 'комфорт'],
        warranty: '2 роки'
      },
      {
        name: 'JBL Tune 770NC',
        description: 'Доступні бездротові навушники з активним шумоподавленням та тривалою роботою батареї.',
        shortDescription: 'Доступні навушники з ANC',
        price: 3499,
        comparePrice: 3999,
        category: categories[4]._id,
        brand: 'JBL',
        sku: 'JBLT770NC',
        stock: 80,
        images: [
          { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', alt: 'JBL Tune 770NC', isMain: true }
        ],
        specifications: [
          { name: 'Тип', value: 'Повнорозмірні бездротові' },
          { name: 'Батарея', value: 'до 70 годин без ANC' },
          { name: 'Bluetooth', value: '5.3' },
          { name: 'Динаміки', value: '40mm' }
        ],
        features: ['Adaptive ANC', 'Smart Ambient', 'JBL Pure Bass', 'Multipoint'],
        tags: ['бюджетний', 'ANC', 'тривала батарея'],
        warranty: '1 рік',
        isOnSale: true
      },

      // Фотоапарати (category 5)
      {
        name: 'Canon EOS R5',
        description: 'Професійна бездзеркальна камера з сенсором 45MP та записом відео 8K RAW. Для найвимогливіших фотографів.',
        shortDescription: 'Професійна камера з 8K відео',
        price: 154999,
        category: categories[5]._id,
        brand: 'Canon',
        sku: 'CANR5BODY',
        stock: 15,
        images: [
          { url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800', alt: 'Canon EOS R5', isMain: true }
        ],
        specifications: [
          { name: 'Сенсор', value: '45MP Full-Frame CMOS' },
          { name: 'Відео', value: '8K RAW 30fps, 4K 120fps' },
          { name: 'Автофокус', value: 'Dual Pixel CMOS AF II' },
          { name: 'ISO', value: '100-51200' },
          { name: 'Стабілізація', value: '8 стопів IBIS' }
        ],
        features: ['Eye AF (people, animals, vehicles)', 'Dual Card Slots', 'Weather Sealed'],
        tags: ['професійний', '8K', 'Full Frame'],
        warranty: '2 роки',
        isFeatured: true
      },
      {
        name: 'Sony A7 IV',
        description: 'Універсальна повнокадрова бездзеркальна камера з новим сенсором 33MP та покращеним автофокусом.',
        shortDescription: 'Універсальна повнокадрова камера',
        price: 89999,
        comparePrice: 94999,
        category: categories[5]._id,
        brand: 'Sony',
        sku: 'SONYA7M4',
        stock: 20,
        images: [
          { url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800', alt: 'Sony A7 IV', isMain: true }
        ],
        specifications: [
          { name: 'Сенсор', value: '33MP Full-Frame Exmor R' },
          { name: 'Відео', value: '4K 60fps, 10-bit 4:2:2' },
          { name: 'Автофокус', value: '759 точок' },
          { name: 'ISO', value: '100-51200' }
        ],
        features: ['Real-time Eye AF', 'Creative Look', '5-axis IBIS'],
        tags: ['Full Frame', 'гібрид'],
        warranty: '2 роки',
        isOnSale: true
      },
      {
        name: 'Fujifilm X-T5',
        description: 'Компактна ретро-камера з новим сенсором 40MP та культовою якістю кольору Fujifilm.',
        shortDescription: 'Ретро-камера з сенсором 40MP',
        price: 69999,
        category: categories[5]._id,
        brand: 'Fujifilm',
        sku: 'FUJXT5BODY',
        stock: 18,
        images: [
          { url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800', alt: 'Fujifilm X-T5', isMain: true }
        ],
        specifications: [
          { name: 'Сенсор', value: '40.2MP X-Trans CMOS 5 HR' },
          { name: 'Відео', value: '6.2K 30fps, 4K 60fps' },
          { name: 'ISO', value: '125-12800' },
          { name: 'Стабілізація', value: '7 стопів IBIS' }
        ],
        features: ['Film Simulations', '3-way Tilt Screen', 'Dual SD Card Slots'],
        tags: ['ретро', 'APS-C', 'компактний'],
        warranty: '2 роки'
      },
      {
        name: 'DJI Mini 3 Pro',
        description: 'Компактний дрон вагою менше 249г з камерою 4K та функцією уникнення перешкод.',
        shortDescription: 'Компактний дрон з 4K камерою',
        price: 34999,
        comparePrice: 37999,
        category: categories[5]._id,
        brand: 'DJI',
        sku: 'DJIM3PRO',
        stock: 30,
        images: [
          { url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800', alt: 'DJI Mini 3 Pro', isMain: true }
        ],
        specifications: [
          { name: 'Камера', value: '48MP, 1/1.3" CMOS' },
          { name: 'Відео', value: '4K 60fps HDR' },
          { name: 'Політ', value: 'до 34 хвилин' },
          { name: 'Вага', value: '249г' }
        ],
        features: ['Obstacle Avoidance', 'MasterShots', 'FocusTrack', 'True Vertical Shooting'],
        tags: ['дрон', 'компактний', '4K'],
        warranty: '2 роки',
        isOnSale: true
      },

      // Ігрові консолі (category 6)
      {
        name: 'PlayStation 5',
        description: 'Консоль нового покоління з надшвидким SSD, трасуванням променів та контролером DualSense.',
        shortDescription: 'Консоль нового покоління',
        price: 22999,
        category: categories[6]._id,
        brand: 'Sony',
        sku: 'PS5CONSOLE',
        stock: 20,
        images: [
          { url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800', alt: 'PlayStation 5', isMain: true }
        ],
        specifications: [
          { name: 'CPU', value: 'AMD Zen 2, 8 ядер 3.5GHz' },
          { name: 'GPU', value: 'AMD RDNA 2, 10.28 TFLOPS' },
          { name: 'Накопичувач', value: '825GB SSD' },
          { name: 'Роздільна здатність', value: 'до 8K' }
        ],
        features: ['Ray Tracing', 'Tempest 3D Audio', 'DualSense', 'Backward Compatible'],
        tags: ['нове покоління', 'ігри'],
        warranty: '2 роки',
        isFeatured: true
      },
      {
        name: 'Xbox Series X',
        description: 'Найпотужніша консоль Xbox з підтримкою 4K 120fps та Xbox Game Pass.',
        shortDescription: 'Найпотужніша Xbox',
        price: 21999,
        category: categories[6]._id,
        brand: 'Microsoft',
        sku: 'XBOXSX',
        stock: 25,
        images: [
          { url: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800', alt: 'Xbox Series X', isMain: true }
        ],
        specifications: [
          { name: 'CPU', value: 'AMD Zen 2, 8 ядер 3.8GHz' },
          { name: 'GPU', value: 'AMD RDNA 2, 12 TFLOPS' },
          { name: 'Накопичувач', value: '1TB SSD' },
          { name: 'Роздільна здатність', value: 'до 8K' }
        ],
        features: ['Quick Resume', 'Smart Delivery', 'Xbox Game Pass', 'Backward Compatible'],
        tags: ['нове покоління', 'Game Pass'],
        warranty: '2 роки',
        isFeatured: true
      },
      {
        name: 'Nintendo Switch OLED',
        description: 'Гібридна консоль Nintendo з яскравим 7" OLED дисплеєм для гри вдома та в дорозі.',
        shortDescription: 'Гібридна консоль з OLED',
        price: 14999,
        category: categories[6]._id,
        brand: 'Nintendo',
        sku: 'NSWITCHOLED',
        stock: 35,
        images: [
          { url: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800', alt: 'Nintendo Switch OLED', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '7" OLED' },
          { name: 'Накопичувач', value: '64GB' },
          { name: 'Батарея', value: '4.5-9 годин' },
          { name: 'Підставка', value: 'Широка регульована' }
        ],
        features: ['TV Mode', 'Tabletop Mode', 'Handheld Mode', 'LAN Port'],
        tags: ['гібрид', 'портативна', 'OLED'],
        warranty: '2 роки'
      },
      {
        name: 'Steam Deck OLED',
        description: 'Портативний ігровий ПК від Valve з новим OLED дисплеєм та покращеною батареєю.',
        shortDescription: 'Портативний ігровий ПК',
        price: 24999,
        category: categories[6]._id,
        brand: 'Valve',
        sku: 'STEAMDECKOLED',
        stock: 15,
        images: [
          { url: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800', alt: 'Steam Deck OLED', isMain: true }
        ],
        specifications: [
          { name: 'APU', value: 'AMD Zen 2 + RDNA 2' },
          { name: 'Дисплей', value: '7.4" OLED HDR' },
          { name: 'Накопичувач', value: '512GB NVMe SSD' },
          { name: 'Батарея', value: 'до 12 годин' }
        ],
        features: ['SteamOS', 'Desktop Mode', 'Steam Library', 'Gyro Controls'],
        tags: ['портативний', 'PC Gaming', 'OLED'],
        warranty: '1 рік'
      },

      // Аксесуари (category 7)
      {
        name: 'Apple MagSafe Charger',
        description: 'Бездротова зарядка Apple з магнітним кріпленням для iPhone та AirPods.',
        shortDescription: 'Бездротова зарядка MagSafe',
        price: 1899,
        category: categories[7]._id,
        brand: 'Apple',
        sku: 'APMAGSAFE',
        stock: 100,
        images: [
          { url: 'https://images.unsplash.com/photo-1600490722773-8a6d75739926?w=800', alt: 'MagSafe Charger', isMain: true }
        ],
        specifications: [
          { name: 'Потужність', value: 'до 15W' },
          { name: 'Сумісність', value: 'iPhone 12 і новіші' },
          { name: 'Довжина кабелю', value: '1м' }
        ],
        features: ['Magnetic Alignment', 'Fast Wireless Charging', 'Qi Compatible'],
        tags: ['зарядка', 'MagSafe'],
        warranty: '1 рік'
      },
      {
        name: 'Anker PowerCore 26800mAh',
        description: 'Потужний павербанк з можливістю зарядки ноутбука та швидкою зарядкою смартфонів.',
        shortDescription: 'Павербанк великої ємності',
        price: 2499,
        comparePrice: 2899,
        category: categories[7]._id,
        brand: 'Anker',
        sku: 'ANKPC26800',
        stock: 60,
        images: [
          { url: 'https://images.unsplash.com/photo-1609592424438-72ee21d66b04?w=800', alt: 'Anker PowerCore', isMain: true }
        ],
        specifications: [
          { name: 'Ємність', value: '26800mAh' },
          { name: 'Виходи', value: '2x USB-A, 1x USB-C PD' },
          { name: 'Потужність', value: 'до 60W PD' }
        ],
        features: ['PowerIQ 3.0', 'USB-C PD', 'Trickle Charge'],
        tags: ['павербанк', 'подорож'],
        warranty: '18 місяців',
        isOnSale: true
      },
      {
        name: 'Samsung 1TB T7 Shield SSD',
        description: 'Захищений портативний SSD зі швидкістю до 1050MB/s та захистом IP65.',
        shortDescription: 'Захищений портативний SSD',
        price: 4999,
        category: categories[7]._id,
        brand: 'Samsung',
        sku: 'SAMT7S1TB',
        stock: 40,
        images: [
          { url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800', alt: 'Samsung T7 Shield', isMain: true }
        ],
        specifications: [
          { name: 'Ємність', value: '1TB' },
          { name: 'Швидкість', value: 'до 1050MB/s' },
          { name: 'Захист', value: 'IP65, падіння з 3м' }
        ],
        features: ['Hardware Encryption', 'USB 3.2 Gen 2', 'Mac & PC Compatible'],
        tags: ['SSD', 'портативний', 'захищений'],
        warranty: '3 роки'
      },
      {
        name: 'Logitech MX Master 3S',
        description: 'Преміальна бездротова миша для продуктивності з тихими клацаннями та MagSpeed колесом.',
        shortDescription: 'Преміальна миша для роботи',
        price: 4499,
        comparePrice: 4999,
        category: categories[7]._id,
        brand: 'Logitech',
        sku: 'LOGMXM3S',
        stock: 35,
        images: [
          { url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800', alt: 'MX Master 3S', isMain: true }
        ],
        specifications: [
          { name: 'Сенсор', value: '8000 DPI' },
          { name: 'Підключення', value: 'Bluetooth, Logi Bolt' },
          { name: 'Батарея', value: 'до 70 днів' }
        ],
        features: ['Quiet Clicks', 'MagSpeed Wheel', 'Flow Cross-Computer', 'USB-C Charging'],
        tags: ['миша', 'продуктивність', 'бездротова'],
        warranty: '2 роки',
        isOnSale: true
      },

      // ТВ та Монітори (category 8)
      {
        name: 'LG OLED65C3',
        description: '65-дюймовий OLED телевізор з процесором α9 Gen 6, Dolby Vision та ідеальним чорним кольором.',
        shortDescription: '65" OLED телевізор',
        price: 69999,
        comparePrice: 79999,
        category: categories[8]._id,
        brand: 'LG',
        sku: 'LGOLEDC365',
        stock: 12,
        images: [
          { url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800', alt: 'LG OLED C3', isMain: true }
        ],
        specifications: [
          { name: 'Діагональ', value: '65"' },
          { name: 'Роздільна здатність', value: '4K UHD' },
          { name: 'Частота оновлення', value: '120Hz' },
          { name: 'HDR', value: 'Dolby Vision, HDR10, HLG' }
        ],
        features: ['Perfect Black', 'webOS 23', '4x HDMI 2.1', 'G-Sync & FreeSync'],
        tags: ['OLED', '4K', 'ігровий'],
        warranty: '2 роки',
        isFeatured: true,
        isOnSale: true
      },
      {
        name: 'Samsung QN55S95C OLED',
        description: '55-дюймовий QD-OLED телевізор з яскравістю до 2000 ніт та Neural Quantum Processor.',
        shortDescription: '55" QD-OLED телевізор',
        price: 64999,
        category: categories[8]._id,
        brand: 'Samsung',
        sku: 'SAMQN55S95C',
        stock: 10,
        images: [
          { url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800', alt: 'Samsung S95C', isMain: true }
        ],
        specifications: [
          { name: 'Діагональ', value: '55"' },
          { name: 'Панель', value: 'QD-OLED' },
          { name: 'Роздільна здатність', value: '4K UHD' },
          { name: 'Частота оновлення', value: '144Hz' }
        ],
        features: ['Neural Quantum Processor', 'Object Tracking Sound', 'Anti-Reflection'],
        tags: ['QD-OLED', '4K', 'преміум'],
        warranty: '2 роки',
        isFeatured: true
      },
      {
        name: 'Dell UltraSharp U2723QE',
        description: '27-дюймовий 4K монітор з IPS Black технологією та широким охопленням sRGB.',
        shortDescription: '27" 4K професійний монітор',
        price: 24999,
        category: categories[8]._id,
        brand: 'Dell',
        sku: 'DELLU2723QE',
        stock: 20,
        images: [
          { url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800', alt: 'Dell UltraSharp', isMain: true }
        ],
        specifications: [
          { name: 'Діагональ', value: '27"' },
          { name: 'Роздільна здатність', value: '4K UHD (3840x2160)' },
          { name: 'Панель', value: 'IPS Black' },
          { name: 'Колір', value: '100% sRGB, 98% DCI-P3' }
        ],
        features: ['USB-C 90W PD', 'KVM Switch', 'ComfortView Plus'],
        tags: ['для дизайнерів', '4K', 'USB-C'],
        warranty: '3 роки'
      },
      {
        name: 'ASUS ROG Swift PG27AQDM',
        description: '27-дюймовий ігровий OLED монітор з частотою 240Hz та часом відгуку 0.03ms.',
        shortDescription: '27" ігровий OLED монітор',
        price: 34999,
        category: categories[8]._id,
        brand: 'ASUS',
        sku: 'ASUSPG27AQDM',
        stock: 15,
        images: [
          { url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800', alt: 'ASUS ROG Swift', isMain: true }
        ],
        specifications: [
          { name: 'Діагональ', value: '27"' },
          { name: 'Роздільна здатність', value: '1440p QHD' },
          { name: 'Частота оновлення', value: '240Hz' },
          { name: 'Час відгуку', value: '0.03ms GtG' }
        ],
        features: ['OLED Panel', 'G-Sync Compatible', 'Anti-Burn-in', 'ROG Desk Mount Kit'],
        tags: ['ігровий', 'OLED', '240Hz'],
        warranty: '3 роки'
      },

      // Розумний дім (category 9)
      {
        name: 'Apple HomePod mini',
        description: 'Компактна розумна колонка з Siri, підтримкою HomeKit та приголомшливим звуком.',
        shortDescription: 'Розумна колонка Apple',
        price: 4499,
        category: categories[9]._id,
        brand: 'Apple',
        sku: 'APHPMINI',
        stock: 50,
        images: [
          { url: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800', alt: 'HomePod mini', isMain: true }
        ],
        specifications: [
          { name: 'Динамік', value: 'Full-range driver + passive radiators' },
          { name: 'Чіп', value: 'Apple S5' },
          { name: 'Підключення', value: 'WiFi 4, Bluetooth 5.0' }
        ],
        features: ['Siri', 'HomeKit Hub', 'Intercom', 'Stereo Pair'],
        tags: ['HomeKit', 'розумний дім', 'колонка'],
        warranty: '1 рік'
      },
      {
        name: 'Google Nest Hub Max',
        description: 'Розумний дисплей з камерою, Google Assistant та функцією відеодзвінків.',
        shortDescription: 'Розумний дисплей Google',
        price: 8999,
        category: categories[9]._id,
        brand: 'Google',
        sku: 'GNESTHUBMAX',
        stock: 30,
        images: [
          { url: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800', alt: 'Nest Hub Max', isMain: true }
        ],
        specifications: [
          { name: 'Дисплей', value: '10" HD' },
          { name: 'Камера', value: '6.5MP з Nest Cam' },
          { name: 'Динаміки', value: 'Stereo speakers' }
        ],
        features: ['Google Assistant', 'Video Calls', 'Face Match', 'Smart Home Control'],
        tags: ['Google Home', 'розумний дисплей'],
        warranty: '1 рік'
      },
      {
        name: 'Philips Hue Starter Kit',
        description: 'Стартовий набір розумного освітлення з 3 лампами та мостом для управління.',
        shortDescription: 'Стартовий набір розумного світла',
        price: 3999,
        comparePrice: 4499,
        category: categories[9]._id,
        brand: 'Philips',
        sku: 'PHHUESTART',
        stock: 45,
        images: [
          { url: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800', alt: 'Philips Hue', isMain: true }
        ],
        specifications: [
          { name: 'Лампи', value: '3x E27 White & Color' },
          { name: 'Міст', value: 'Hue Bridge' },
          { name: 'Яскравість', value: '800 люмен' }
        ],
        features: ['16 мільйонів кольорів', 'Voice Control', 'Routines', 'Entertainment Sync'],
        tags: ['освітлення', 'HomeKit', 'Alexa', 'Google'],
        warranty: '2 роки',
        isOnSale: true
      },
      {
        name: 'Ring Video Doorbell 4',
        description: 'Розумний відеодзвінок з камерою 1080p HD та функцією Pre-Roll.',
        shortDescription: 'Розумний відеодзвінок',
        price: 6999,
        category: categories[9]._id,
        brand: 'Ring',
        sku: 'RINGVD4',
        stock: 35,
        images: [
          { url: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800', alt: 'Ring Video Doorbell', isMain: true }
        ],
        specifications: [
          { name: 'Відео', value: '1080p HD' },
          { name: 'Живлення', value: 'Батарея або дротове' },
          { name: 'Поле зору', value: '160° по горизонталі' }
        ],
        features: ['Pre-Roll Video', 'Two-Way Talk', 'Motion Detection', 'Night Vision'],
        tags: ['безпека', 'відеоспостереження', 'Alexa'],
        warranty: '2 роки'
      }
    ];

    const products = [];
    for (const prodData of productData) {
      const product = await Product.create(prodData);
      products.push(product);
    }
    console.log('✅ Sample products created');

    // Create reviews
    console.log('⭐ Creating reviews...');
    const reviewsData = [
      // iPhone 15 Pro Max reviews (index 0)
      { product: products[0]._id, user: demoUsers[0]._id, rating: 5, title: 'Найкращий iPhone!', comment: 'Чіп A17 Pro просто неймовірний! Камера робить приголомшливі фото навіть вночі. Титановий корпус виглядає преміально. Батарея тримає весь день.', isVerifiedPurchase: true },
      { product: products[0]._id, user: demoUsers[1]._id, rating: 5, title: 'Вражаючий апарат', comment: 'Перейшла з Android і не шкодую. USB-C нарешті! Екран просто казка, Dynamic Island дуже зручний.', isVerifiedPurchase: true },
      { product: products[0]._id, user: demoUsers[2]._id, rating: 4, title: 'Відмінний, але дорогий', comment: 'Телефон чудовий, але ціна кусається. Action Button зручний, камера на вищому рівні.', isVerifiedPurchase: true },
      
      // Samsung Galaxy S24 Ultra reviews (index 2)
      { product: products[2]._id, user: demoUsers[1]._id, rating: 5, title: 'Galaxy AI - майбутнє тут', comment: 'AI функції просто неймовірні! Переклад в реальному часі, редагування фото з AI - це щось. S Pen як завжди на висоті.', isVerifiedPurchase: true },
      { product: products[2]._id, user: demoUsers[3]._id, rating: 5, title: 'Камера 200MP вражає', comment: 'Нарешті справжній флагман з усіма можливостями. Батарея тримає відмінно, екран яскравий.', isVerifiedPurchase: true },
      
      // MacBook Pro reviews (index 7)
      { product: products[7]._id, user: demoUsers[0]._id, rating: 5, title: 'Ідеальний для розробки', comment: 'M3 Pro справляється з будь-якими задачами. Компілюю великі проєкти за секунди. Батарея тримає весь робочий день.', isVerifiedPurchase: true },
      { product: products[7]._id, user: demoUsers[2]._id, rating: 5, title: 'Найкращий ноутбук', comment: 'Працюю з відео та 3D - M3 Pro справляється ідеально. Екран приголомшливий, звук відмінний.', isVerifiedPurchase: true },
      
      // Sony WH-1000XM5 reviews (index 20)
      { product: products[20]._id, user: demoUsers[0]._id, rating: 5, title: 'Шумоподавлення на вищому рівні', comment: 'Працюю в опенспейсі - ці навушники рятують. Звук чистий, комфортні для багатогодинного носіння.', isVerifiedPurchase: true },
      { product: products[20]._id, user: demoUsers[1]._id, rating: 5, title: 'Найкращі навушники', comment: 'Користуюсь вже 3 місяці - батарея тримає як заявлено, шумодав відмінний. Звук деталізований.', isVerifiedPurchase: true },
      { product: products[20]._id, user: demoUsers[3]._id, rating: 4, title: 'Майже ідеальні', comment: 'Чудові навушники, але хотілося б кращий мікрофон для дзвінків. В усьому іншому - топ.', isVerifiedPurchase: true },
      
      // Apple Watch Series 9 reviews (index 16)
      { product: products[16]._id, user: demoUsers[2]._id, rating: 5, title: 'Double Tap - геніально', comment: 'Новий жест Double Tap дуже зручний! Відстеження здоров\'я працює чудово. Батарея на день вистачає.', isVerifiedPurchase: true },
      { product: products[16]._id, user: demoUsers[4]._id, rating: 4, title: 'Відмінний годинник', comment: 'Користуюсь для фітнесу - трекінг точний. Інтеграція з iPhone бездоганна.', isVerifiedPurchase: true },
      
      // PlayStation 5 reviews (index 29)
      { product: products[29]._id, user: demoUsers[0]._id, rating: 5, title: 'Нове покоління ігор', comment: 'DualSense - це щось неймовірне! Тактильний відгук занурює в гру. Швидкість завантаження вражає.', isVerifiedPurchase: true },
      { product: products[29]._id, user: demoUsers[3]._id, rating: 5, title: 'Варта кожної гривні', comment: 'Графіка в іграх приголомшлива. 3D аудіо створює неймовірну атмосферу.', isVerifiedPurchase: true },
      
      // iPad Pro reviews (index 13)
      { product: products[13]._id, user: demoUsers[1]._id, rating: 5, title: 'Замінив ноутбук', comment: 'З Apple Pencil це ідеальний інструмент для дизайнера. M2 справляється з будь-якими задачами.', isVerifiedPurchase: true },
      
      // LG OLED C3 reviews (index 37)
      { product: products[37]._id, user: demoUsers[0]._id, rating: 5, title: 'Ідеальний чорний', comment: 'OLED панель робить неймовірну картинку. Для фільмів та ігор - найкращий вибір. 120Hz для PS5 ідеально.', isVerifiedPurchase: true },
      { product: products[37]._id, user: demoUsers[2]._id, rating: 5, title: 'Кіно вдома', comment: 'Dolby Vision + Dolby Atmos = справжній кінотеатр. Дизайн тонкий, webOS зручна.', isVerifiedPurchase: true },
      
      // AirPods Pro 2 reviews (index 21)
      { product: products[21]._id, user: demoUsers[1]._id, rating: 5, title: 'Найкращі TWS', comment: 'Шумоподавлення стало ще кращим! Adaptive Audio автоматично підлаштовується. USB-C кейс дуже зручний.', isVerifiedPurchase: true },
      { product: products[21]._id, user: demoUsers[4]._id, rating: 4, title: 'Відмінні навушники', comment: 'Звук чудовий, шумодав працює. Хотілося б довшу батарею самих навушників.', isVerifiedPurchase: true }
    ];

    for (const reviewData of reviewsData) {
      await Review.create(reviewData);
    }
    console.log('✅ Reviews created');

    // Create coupons
    console.log('🎟️  Creating coupons...');
    const now = new Date();
    const futureDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days from now
    
    const couponsData = [
      {
        code: 'WELCOME10',
        description: 'Знижка 10% для нових клієнтів',
        type: 'percentage',
        value: 10,
        minPurchase: 1000,
        maxDiscount: 5000,
        usageLimit: 1000,
        startDate: now,
        endDate: futureDate,
        isActive: true
      },
      {
        code: 'SUMMER2024',
        description: 'Літній розпродаж - знижка 15%',
        type: 'percentage',
        value: 15,
        minPurchase: 5000,
        maxDiscount: 10000,
        usageLimit: 500,
        startDate: now,
        endDate: futureDate,
        isActive: true
      },
      {
        code: 'TECH500',
        description: 'Знижка 500 грн на техніку',
        type: 'fixed',
        value: 500,
        minPurchase: 3000,
        usageLimit: 200,
        startDate: now,
        endDate: futureDate,
        isActive: true
      },
      {
        code: 'APPLE20',
        description: 'Знижка 20% на продукцію Apple',
        type: 'percentage',
        value: 20,
        minPurchase: 10000,
        maxDiscount: 15000,
        usageLimit: 100,
        applicableCategories: [categories[0]._id, categories[1]._id, categories[2]._id, categories[3]._id],
        startDate: now,
        endDate: futureDate,
        isActive: true
      },
      {
        code: 'FREESHIP',
        description: 'Безкоштовна доставка',
        type: 'fixed',
        value: 150,
        minPurchase: 2000,
        usageLimit: null,
        startDate: now,
        endDate: futureDate,
        isActive: true
      },
      {
        code: 'VIP25',
        description: 'VIP знижка 25% для постійних клієнтів',
        type: 'percentage',
        value: 25,
        minPurchase: 20000,
        maxDiscount: 25000,
        usageLimit: 50,
        startDate: now,
        endDate: futureDate,
        isActive: true
      }
    ];

    for (const couponData of couponsData) {
      await Coupon.create(couponData);
    }
    console.log('✅ Coupons created');

    // Create sample orders
    console.log('📋 Creating sample orders...');
    const generateOrderNumber = () => {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `ORD-${timestamp}-${random}`;
    };

    const ordersData = [
      {
        orderNumber: generateOrderNumber(),
        user: demoUsers[0]._id,
        items: [
          { product: products[0]._id, name: products[0].name, image: products[0].images[0]?.url, price: products[0].price, quantity: 1, subtotal: products[0].price },
          { product: products[21]._id, name: products[21].name, image: products[21].images[0]?.url, price: products[21].price, quantity: 1, subtotal: products[21].price }
        ],
        shippingAddress: {
          firstName: 'Олександр',
          lastName: 'Петренко',
          email: 'user@demo.com',
          phone: '+380671234567',
          street: 'вул. Шевченка, 25',
          city: 'Львів',
          state: 'Львівська область',
          zipCode: '79000',
          country: 'Україна'
        },
        paymentMethod: 'card',
        paymentStatus: 'paid',
        orderStatus: 'delivered',
        subtotal: products[0].price + products[21].price,
        shippingCost: 0,
        tax: 0,
        total: products[0].price + products[21].price,
        statusHistory: [
          { status: 'pending', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), note: 'Замовлення створено' },
          { status: 'processing', date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), note: 'Замовлення обробляється' },
          { status: 'shipped', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), note: 'Відправлено Новою Поштою' },
          { status: 'delivered', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), note: 'Доставлено' }
        ]
      },
      {
        orderNumber: generateOrderNumber(),
        user: demoUsers[1]._id,
        items: [
          { product: products[7]._id, name: products[7].name, image: products[7].images[0]?.url, price: products[7].price, quantity: 1, subtotal: products[7].price }
        ],
        shippingAddress: {
          firstName: 'Марія',
          lastName: 'Коваленко',
          email: 'maria@demo.com',
          phone: '+380931234567',
          street: 'пр. Свободи, 12',
          city: 'Харків',
          state: 'Харківська область',
          zipCode: '61000',
          country: 'Україна'
        },
        paymentMethod: 'card',
        paymentStatus: 'paid',
        orderStatus: 'shipped',
        subtotal: products[7].price,
        shippingCost: 150,
        tax: 0,
        total: products[7].price + 150,
        statusHistory: [
          { status: 'pending', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), note: 'Замовлення створено' },
          { status: 'processing', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), note: 'Замовлення обробляється' },
          { status: 'shipped', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), note: 'Відправлено УкрПоштою' }
        ]
      },
      {
        orderNumber: generateOrderNumber(),
        user: demoUsers[2]._id,
        items: [
          { product: products[29]._id, name: products[29].name, image: products[29].images[0]?.url, price: products[29].price, quantity: 1, subtotal: products[29].price },
          { product: products[20]._id, name: products[20].name, image: products[20].images[0]?.url, price: products[20].price, quantity: 1, subtotal: products[20].price }
        ],
        shippingAddress: {
          firstName: 'Андрій',
          lastName: 'Шевченко',
          email: 'andrii@demo.com',
          phone: '+380501112233',
          street: 'вул. Лесі Українки, 5',
          city: 'Київ',
          state: 'Київська область',
          zipCode: '01001',
          country: 'Україна'
        },
        paymentMethod: 'cash_on_delivery',
        paymentStatus: 'pending',
        orderStatus: 'processing',
        subtotal: products[29].price + products[20].price,
        shippingCost: 100,
        tax: 0,
        total: products[29].price + products[20].price + 100,
        statusHistory: [
          { status: 'pending', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), note: 'Замовлення створено' },
          { status: 'processing', date: new Date(), note: 'Комплектується на складі' }
        ]
      },
      {
        orderNumber: generateOrderNumber(),
        user: demoUsers[3]._id,
        items: [
          { product: products[2]._id, name: products[2].name, image: products[2].images[0]?.url, price: products[2].price, quantity: 1, subtotal: products[2].price }
        ],
        shippingAddress: {
          firstName: 'Ірина',
          lastName: 'Бондаренко',
          email: 'iryna@demo.com',
          phone: '+380671112233',
          street: 'вул. Соборна, 100',
          city: 'Одеса',
          state: 'Одеська область',
          zipCode: '65000',
          country: 'Україна'
        },
        paymentMethod: 'card',
        paymentStatus: 'paid',
        orderStatus: 'delivered',
        subtotal: products[2].price,
        shippingCost: 0,
        tax: 0,
        total: products[2].price,
        statusHistory: [
          { status: 'pending', date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), note: 'Замовлення створено' },
          { status: 'processing', date: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000), note: 'Обробка' },
          { status: 'shipped', date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), note: 'Відправлено' },
          { status: 'delivered', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), note: 'Доставлено' }
        ]
      },
      {
        orderNumber: generateOrderNumber(),
        user: demoUsers[0]._id,
        items: [
          { product: products[16]._id, name: products[16].name, image: products[16].images[0]?.url, price: products[16].price, quantity: 1, subtotal: products[16].price }
        ],
        shippingAddress: {
          firstName: 'Олександр',
          lastName: 'Петренко',
          email: 'user@demo.com',
          phone: '+380671234567',
          street: 'вул. Шевченка, 25',
          city: 'Львів',
          state: 'Львівська область',
          zipCode: '79000',
          country: 'Україна'
        },
        paymentMethod: 'card',
        paymentStatus: 'paid',
        orderStatus: 'pending',
        subtotal: products[16].price,
        shippingCost: 80,
        tax: 0,
        total: products[16].price + 80,
        statusHistory: [
          { status: 'pending', date: new Date(), note: 'Очікує підтвердження' }
        ]
      }
    ];

    for (const orderData of ordersData) {
      await Order.create(orderData);
    }
    console.log('✅ Sample orders created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Credentials:');
    console.log(`\n👤 Admin:`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'Admin123!@#'}`);
    console.log(`\n👥 Demo User:`);
    console.log(`   Email: user@demo.com`);
    console.log(`   Password: User123!@#`);
    console.log(`\n📊 Created:`);
    console.log(`   - ${categories.length} categories`);
    console.log(`   - ${products.length} products`);
    console.log(`   - ${reviewsData.length} reviews`);
    console.log(`   - ${couponsData.length} coupons`);
    console.log(`   - ${ordersData.length} orders`);
    console.log(`   - ${demoUsers.length + 1} users`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
