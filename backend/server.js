import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory cart store: { [cartId]: [ { id, productId, quantity, toppings, name, price, src } ] }
const carts = {};

// Helper to generate UUID
const generateId = () => Math.random().toString(36).substring(2, 15);

// List of 21 premium products
const products = [
  {
    id: 'choco-bliss',
    src: './images/choco.png',
    alt: 'Chocolate Shake',
    title: 'Velvet Choco Bliss',
    category: 'Signature Shake',
    price: 6.99,
    rating: 4.9,
    reviews: 124,
    description: 'Dive into layers of rich cocoa, smooth cream, and a swirl of happiness. Our signature chocolate shake is made to melt your heart and satisfy your cravings.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #f3ebd8 50%, #c49675 100%)',
    themeColor: '#5c2e1a',
    accentColor: '#a1673f',
    textColor: '#3a2b23',
    specs: [
      { label: "Rich Cocoa", value: "85%" },
      { label: "Milk Type", value: "Oat Milk" },
      { label: "Calories", value: "320 kcal" },
      { label: "Serving", value: "350 ml" }
    ],
    ingredients: ['Dutch Cocoa Powder', 'Belgian Chocolate Chunks', 'Organic Oat Milk', 'Brown Sugar Cane', 'Gourmet Whipped Cream'],
    nutrition: [
      { name: 'Carbs', percentage: 65 },
      { name: 'Fats', percentage: 45 },
      { name: 'Proteins', percentage: 35 },
      { name: 'Sugars', percentage: 25 }
    ],
    bgText: 'CHOCO'
  },
  {
    id: 'mint-cupcake',
    src: './images/cupcake.png',
    alt: 'Cupcake',
    title: 'Minty Cupcake Cloud',
    category: 'Gourmet Cupcake',
    price: 4.50,
    rating: 4.8,
    reviews: 98,
    description: 'A swirl of vanilla, a dash of mint, and the fluffiest cupcake you have ever met. Light, creamy, and dreamy in every single bite.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #e6f7ef 50%, #abd8c0 100%)',
    themeColor: '#1c4c34',
    accentColor: '#3a9b6c',
    textColor: '#1a3327',
    specs: [
      { label: "Gluten-free", value: "No" },
      { label: "Frosting", value: "Mint Buttercream" },
      { label: "Calories", value: "240 kcal" },
      { label: "Bake Temp", value: "180°C" }
    ],
    ingredients: ['Organic Wheat Flour', 'Madagascar Vanilla Extract', 'Fresh Mint Leaves', 'Swiss Meringue Buttercream', 'Sugar Pearls'],
    nutrition: [
      { name: 'Carbs', percentage: 70 },
      { name: 'Fats', percentage: 38 },
      { name: 'Proteins', percentage: 12 },
      { name: 'Sugars', percentage: 55 }
    ],
    bgText: 'SWEET'
  },
  {
    id: 'blueberry-dream',
    src: './images/blueberry.png',
    alt: 'Blueberry Shake',
    title: 'Berrylicious Dream',
    category: 'Fresh Berry Shake',
    price: 7.25,
    rating: 4.9,
    reviews: 146,
    description: 'Bursting with real wild blueberries, whipped cream, and a whole lot of magic. This one’s made to refresh, delight, and impress.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #f4e8fa 50%, #caa4db 100%)',
    themeColor: '#4f2b5c',
    accentColor: '#8a4c9c',
    textColor: '#361d3f',
    specs: [
      { label: "Berries", value: "Wild Organic" },
      { label: "Milk Type", value: "Almond Milk" },
      { label: "Calories", value: "290 kcal" },
      { label: "Serving", value: "350 ml" }
    ],
    ingredients: ['Wild Organic Blueberries', 'Unsweetened Almond Milk', 'Raw Clover Honey', 'Chia Seeds', 'Greek Vanilla Yogurt'],
    nutrition: [
      { name: 'Carbs', percentage: 50 },
      { name: 'Fats', percentage: 22 },
      { name: 'Proteins', percentage: 40 },
      { name: 'Sugars', percentage: 18 }
    ],
    bgText: 'BERRY'
  },
  {
    id: 'strawberry-donut',
    src: './images/donut.png',
    alt: 'Donut',
    title: 'Sugar Glazed Hug',
    category: 'Handcrafted Donut',
    price: 3.99,
    rating: 4.7,
    reviews: 112,
    description: 'Soft, fluffy, and coated in pink sweetness. Our custom strawberry-glazed donut is a cuddle disguised as a delicious snack.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #fdf0f4 50%, #f3b5c7 100%)',
    themeColor: '#7a2f45',
    accentColor: '#d65376',
    textColor: '#421a25',
    specs: [
      { label: "Glaze", value: "Strawberry Glaze" },
      { label: "Baked Type", value: "Fluffy Yeast" },
      { label: "Calories", value: "190 kcal" },
      { label: "Freshness", value: "24 Hours" }
    ],
    ingredients: ['Wheat Flour Blend', 'Active Yeast', 'Strawberry Nectar Glaze', 'Rainbow Sugar Sprinkles', 'Vanilla Extract'],
    nutrition: [
      { name: 'Carbs', percentage: 75 },
      { name: 'Fats', percentage: 48 },
      { name: 'Proteins', percentage: 15 },
      { name: 'Sugars', percentage: 40 }
    ],
    bgText: 'DONUT'
  },
  {
    id: 'golden-croissant',
    src: './images/croissant.png',
    alt: 'Golden Croissant',
    title: 'Golden Glaze Croissant',
    category: 'Warm Pastry',
    price: 3.49,
    rating: 4.8,
    reviews: 87,
    description: 'Flaky, buttery layers baked to golden perfection. Every bite releases a warm, rich aroma of premium Normandy butter.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #fef3e2 50%, #f1c40f 100%)',
    themeColor: '#7e5109',
    accentColor: '#d4ac0d',
    textColor: '#4a3002',
    specs: [
      { label: "Butter", value: "Normandy 82%" },
      { label: "Style", value: "French Classic" },
      { label: "Calories", value: "280 kcal" },
      { label: "Serving", value: "90 g" }
    ],
    ingredients: ['Stone Ground Flour', 'French Normandy Butter', 'Dry Active Yeast', 'Sea Salt', 'Organic Sugar Cane'],
    nutrition: [
      { name: 'Carbs', percentage: 45 },
      { name: 'Fats', percentage: 65 },
      { name: 'Proteins', percentage: 20 },
      { name: 'Sugars', percentage: 8 }
    ],
    bgText: 'PASTRY'
  },
  {
    id: 'red-velvet-cake',
    src: './images/cake.png',
    alt: 'Red Velvet Cake',
    title: 'Red Velvet Symphony',
    category: 'Gourmet Cake',
    price: 5.99,
    rating: 4.9,
    reviews: 165,
    description: 'Layers of vibrant red cocoa sponge paired with silky cream cheese frosting and a hint of fresh vanilla bean.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #fdebd0 50%, #e74c3c 100%)',
    themeColor: '#78281f',
    accentColor: '#c0392b',
    textColor: '#4d1c17',
    specs: [
      { label: "Layers", value: "3 Tier Sponge" },
      { label: "Frosting", value: "Cream Cheese" },
      { label: "Calories", value: "380 kcal" },
      { label: "Bake Temp", value: "175°C" }
    ],
    ingredients: ['Cake Flour', 'Premium Cocoa Powder', 'Cream Cheese', 'Organic Buttermilk', 'Vanilla Extract'],
    nutrition: [
      { name: 'Carbs', percentage: 68 },
      { name: 'Fats', percentage: 52 },
      { name: 'Proteins', percentage: 18 },
      { name: 'Sugars', percentage: 48 }
    ],
    bgText: 'CAKE'
  },
  {
    id: 'pistachio-macaron',
    src: './images/macaron.png',
    alt: 'Pistachio Macarons',
    title: 'Pistachio Dream Macaron',
    category: 'French Macaron',
    price: 4.99,
    rating: 4.8,
    reviews: 79,
    description: 'Delicate almond meringue shells filled with rich, nutty pistachio white chocolate ganache.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #ebf5fb 50%, #85c1e9 100%)',
    themeColor: '#1b4f72',
    accentColor: '#3498db',
    textColor: '#153e5b',
    specs: [
      { label: "Flour", value: "Almond Meal" },
      { label: "Filling", value: "Pistachio Ganache" },
      { label: "Calories", value: "150 kcal" },
      { label: "Gluten-free", value: "Yes" }
    ],
    ingredients: ['Almond Flour', 'Egg Whites', 'Powdered Sugar', 'Roasted Pistachios', 'White Chocolate'],
    nutrition: [
      { name: 'Carbs', percentage: 38 },
      { name: 'Fats', percentage: 42 },
      { name: 'Proteins', percentage: 24 },
      { name: 'Sugars', percentage: 30 }
    ],
    bgText: 'SWEET'
  },
  {
    id: 'strawberry-waffle',
    src: './images/waffle.png',
    alt: 'Strawberry Waffle',
    title: 'Strawberry Dream Waffle',
    category: 'Belgian Waffle',
    price: 5.50,
    rating: 4.7,
    reviews: 94,
    description: 'A crispy, warm Belgian waffle loaded with sweet fresh strawberry slices, gourmet whipped cream, and a drizzle of maple syrup.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #fdf2e9 50%, #e59866 100%)',
    themeColor: '#6e2c00',
    accentColor: '#dc7633',
    textColor: '#4e2000',
    specs: [
      { label: "Base", value: "Belgian Yeast" },
      { label: "Topping", value: "Fresh Strawberries" },
      { label: "Calories", value: "310 kcal" },
      { label: "Waffle Grid", value: "4x4 Classic" }
    ],
    ingredients: ['Pastry Flour', 'Yeast Batter', 'Fresh Strawberries', 'Pure Maple Syrup', 'Double Cream'],
    nutrition: [
      { name: 'Carbs', percentage: 60 },
      { name: 'Fats', percentage: 32 },
      { name: 'Proteins', percentage: 14 },
      { name: 'Sugars', percentage: 28 }
    ],
    bgText: 'WAFFLE'
  },
  {
    id: 'dark-choco-croissant',
    src: './images/dark_croissant.png',
    alt: 'Dark Chocolate Croissant',
    title: 'Dark Cocoa Croissant',
    category: 'Warm Pastry',
    price: 3.99,
    rating: 4.9,
    reviews: 104,
    description: 'Flaky golden pastry filled with three decadent bars of 70% dark Belgian chocolate, finished with a dust of cocoa.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #eae2d6 50%, #a07855 100%)',
    themeColor: '#4b2e1e',
    accentColor: '#835c3b',
    textColor: '#2e1c12',
    specs: [
      { label: "Cocoa", value: "70% Belgian" },
      { label: "Flakiness", value: "Extra Crispy" },
      { label: "Calories", value: "340 kcal" },
      { label: "Serving", value: "95 g" }
    ],
    ingredients: ['French Wheat Flour', 'Cultured Butter', 'Dark Belgian Chocolate', 'Raw Cocoa Powder', 'Yeast'],
    nutrition: [
      { name: 'Carbs', percentage: 52 },
      { name: 'Fats', percentage: 58 },
      { name: 'Proteins', percentage: 16 },
      { name: 'Sugars', percentage: 18 }
    ],
    bgText: 'CHOCO'
  },
  {
    id: 'choco-sprinkle-donut',
    src: './images/choco_donut.png',
    alt: 'Choco Sprinkle Donut',
    title: 'Chocolate Carnival Donut',
    category: 'Handcrafted Donut',
    price: 4.25,
    rating: 4.8,
    reviews: 132,
    description: 'Freshly fried yeast donut glazed with rich milk chocolate and showered with colorful gourmet sprinkles.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #f5eef8 50%, #bb8fce 100%)',
    themeColor: '#4a235a',
    accentColor: '#8e44ad',
    textColor: '#2c1236',
    specs: [
      { label: "Glaze", value: "Milk Chocolate" },
      { label: "Topping", value: "Rainbow Sprinkles" },
      { label: "Calories", value: "220 kcal" },
      { label: "Freshness", value: "Fresh Baked" }
    ],
    ingredients: ['Enriched Wheat Flour', 'Milk Chocolate Glaze', 'Rainbow Sprinkles', 'Butter', 'Whole Milk'],
    nutrition: [
      { name: 'Carbs', percentage: 72 },
      { name: 'Fats', percentage: 46 },
      { name: 'Proteins', percentage: 18 },
      { name: 'Sugars', percentage: 38 }
    ],
    bgText: 'DONUT'
  },
  {
    id: 'vanilla-cupcake',
    src: './images/vanilla_cupcake.png',
    alt: 'Vanilla Cupcake',
    title: 'Vanilla Custard Cupcake',
    category: 'Gourmet Cupcake',
    price: 4.25,
    rating: 4.6,
    reviews: 73,
    description: 'Golden vanilla sponge filled with a secret pocket of creamy vanilla custard and topped with whipped white frosting.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #fcf3cf 50%, #f4d03f 100%)',
    themeColor: '#7d6608',
    accentColor: '#f1c40f',
    textColor: '#4d3f03',
    specs: [
      { label: "Filling", value: "Vanilla Custard" },
      { label: "Vanilla", value: "Tahitian Bean" },
      { label: "Calories", value: "250 kcal" },
      { label: "Bake Time", value: "22 mins" }
    ],
    ingredients: ['Cake Flour', 'Tahitian Vanilla Bean', 'Custard Cream', 'Organic Eggs', 'Sugar Pearls'],
    nutrition: [
      { name: 'Carbs', percentage: 68 },
      { name: 'Fats', percentage: 40 },
      { name: 'Proteins', percentage: 14 },
      { name: 'Sugars', percentage: 45 }
    ],
    bgText: 'SWEET'
  },
  {
    id: 'double-berry-waffle',
    src: './images/berry_waffle.png',
    alt: 'Double Berry Waffle',
    title: 'Double Berry Mountain Waffle',
    category: 'Belgian Waffle',
    price: 5.99,
    rating: 4.9,
    reviews: 110,
    description: 'Warm, thick waffle layered with fresh blackberries, strawberries, vanilla ice cream, and a drizzle of fruit purée.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #f5ebf8 50%, #d395e7 100%)',
    themeColor: '#5b1e70',
    accentColor: '#af54d4',
    textColor: '#361143',
    specs: [
      { label: "Berries", value: "Black & Strawberry" },
      { label: "Ice Cream", value: "Vanilla Bean" },
      { label: "Calories", value: "350 kcal" },
      { label: "Style", value: "Liege Waffle" }
    ],
    ingredients: ['Yeast Batter', 'Fresh Blackberries', 'Strawberries', 'Vanilla Ice Cream', 'Berry Purée'],
    nutrition: [
      { name: 'Carbs', percentage: 65 },
      { name: 'Fats', percentage: 35 },
      { name: 'Proteins', percentage: 15 },
      { name: 'Sugars', percentage: 32 }
    ],
    bgText: 'WAFFLE'
  },
  {
    id: 'caramel-macaron',
    src: './images/caramel_macaron.png',
    alt: 'Caramel Macaron',
    title: 'Salted Caramel Macaron',
    category: 'French Macaron',
    price: 4.75,
    rating: 4.9,
    reviews: 119,
    description: 'Crisp, airy macaron shells sandwiched around a rich, buttery salted caramel center. Sweet and salty perfection.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #fef5e7 50%, #f5b041 100%)',
    themeColor: '#784212',
    accentColor: '#e67e22',
    textColor: '#4d2708',
    specs: [
      { label: "Caramel", value: "Salted Butter" },
      { label: "Salt Type", value: "Fleur de Sel" },
      { label: "Calories", value: "140 kcal" },
      { label: "Gluten-Free", value: "Yes" }
    ],
    ingredients: ['Almond Flour', 'Egg Whites', 'Salted Butter Caramel', 'Fleur de Sel', 'Brown Sugar'],
    nutrition: [
      { name: 'Carbs', percentage: 48 },
      { name: 'Fats', percentage: 38 },
      { name: 'Proteins', percentage: 10 },
      { name: 'Sugars', percentage: 36 }
    ],
    bgText: 'MACARON'
  },
  {
    id: 'matcha-donut',
    src: './images/matcha_donut.png',
    alt: 'Matcha Donut',
    title: 'Zen Matcha Glazed Donut',
    category: 'Handcrafted Donut',
    price: 4.50,
    rating: 4.7,
    reviews: 86,
    description: 'Our fluffy handcrafted donut glazed with an organic Uji matcha green tea icing for a subtle earthy sweetness.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #e8f8f5 50%, #76d7c4 100%)',
    themeColor: '#0e6251',
    accentColor: '#1abc9c',
    textColor: '#0a3d32',
    specs: [
      { label: "Matcha", value: "Ceremonial Uji" },
      { label: "Glaze", value: "Earthy Matcha" },
      { label: "Calories", value: "200 kcal" },
      { label: "Fat Content", value: "Low Fat" }
    ],
    ingredients: ['Wheat Flour', 'Uji Matcha Powder', 'Powdered Sugar', 'Butter Milk', 'White Chocolate Drizzle'],
    nutrition: [
      { name: 'Carbs', percentage: 62 },
      { name: 'Fats', percentage: 30 },
      { name: 'Proteins', percentage: 16 },
      { name: 'Sugars', percentage: 22 }
    ],
    bgText: 'GREEN'
  },
  {
    id: 'hazelnut-shake',
    src: './images/hazelnut_shake.png',
    alt: 'Hazelnut Shake',
    title: 'Hazelnut Dream Shake',
    category: 'Signature Shake',
    price: 7.50,
    rating: 4.9,
    reviews: 143,
    description: 'Creamy hazelnut paste blended with vanilla ice cream, topped with crushed roasted hazelnuts and chocolate sauce.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #fbf5f0 50%, #e2c0a8 100%)',
    themeColor: '#5d3a21',
    accentColor: '#b07d5b',
    textColor: '#3d2615',
    specs: [
      { label: "Nuts", value: "Italian Hazelnut" },
      { label: "Base", value: "Vanilla Bean" },
      { label: "Calories", value: "340 kcal" },
      { label: "Serving", value: "350 ml" }
    ],
    ingredients: ['Roasted Hazelnut Paste', 'Creamy Milk', 'Vanilla Ice Cream', 'Chocolate Ganache', 'Crushed Praline'],
    nutrition: [
      { name: 'Carbs', percentage: 55 },
      { name: 'Fats', percentage: 50 },
      { name: 'Proteins', percentage: 22 },
      { name: 'Sugars', percentage: 20 }
    ],
    bgText: 'SHAKE'
  },
  {
    id: 'lemon-tart',
    src: './images/lemon_tart.png',
    alt: 'Lemon Tart',
    title: 'Lemon Meringue Symphony',
    category: 'Gourmet Cake',
    price: 5.25,
    rating: 4.8,
    reviews: 95,
    description: 'Crisp sweet pastry crust filled with tangy lemon curd, topped with swirls of toasted fluffy Italian meringue.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #fef9e7 50%, #f7dc6f 100%)',
    themeColor: '#7d6608',
    accentColor: '#f1c40f',
    textColor: '#514205',
    specs: [
      { label: "Curd", value: "Tangy Eureka Lemon" },
      { label: "Crust", value: "Pâte Sablée" },
      { label: "Calories", value: "290 kcal" },
      { label: "Size", value: "4 inch Tart" }
    ],
    ingredients: ['Sable Pastry Crust', 'Fresh Lemon Juice & Zest', 'Egg Yolks', 'Toasted Italian Meringue', 'Vanilla Extract'],
    nutrition: [
      { name: 'Carbs', percentage: 64 },
      { name: 'Fats', percentage: 38 },
      { name: 'Proteins', percentage: 12 },
      { name: 'Sugars', percentage: 40 }
    ],
    bgText: 'LEMON'
  },
  {
    id: 'almond-croissant',
    src: './images/almond_croissant.png',
    alt: 'Almond Croissant',
    title: 'Almond Frangipane Croissant',
    category: 'Warm Pastry',
    price: 3.99,
    rating: 4.7,
    reviews: 74,
    description: 'Double-baked croissant filled with rich sweet almond frangipane cream and topped with sliced toasted almonds.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #f9ebea 50%, #f2d7d5 100%)',
    themeColor: '#641e16',
    accentColor: '#c0392b',
    textColor: '#40120d',
    specs: [
      { label: "Cream", value: "Almond Frangipane" },
      { label: "Topping", value: "Flaked Almonds" },
      { label: "Calories", value: "360 kcal" },
      { label: "Style", value: "Double Baked" }
    ],
    ingredients: ['French Croissant', 'Almond Flour', 'Unsalted Butter', 'Flaked Almonds', 'Powdered Sugar Dust'],
    nutrition: [
      { name: 'Carbs', percentage: 40 },
      { name: 'Fats', percentage: 70 },
      { name: 'Proteins', percentage: 22 },
      { name: 'Sugars', percentage: 12 }
    ],
    bgText: 'ALMOND'
  },
  {
    id: 'raspberry-cupcake',
    src: './images/raspberry_cupcake.png',
    alt: 'Raspberry Cupcake',
    title: 'Raspberry Velvet Cupcake',
    category: 'Gourmet Cupcake',
    price: 4.50,
    rating: 4.8,
    reviews: 83,
    description: 'Vibrant raspberry-infused sponge cake topped with a swirls of pink raspberry buttercream and a single fresh raspberry.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #fdf2f4 50%, #f5b7b1 100%)',
    themeColor: '#7b241c',
    accentColor: '#e74c3c',
    textColor: '#4d1510',
    specs: [
      { label: "Sponge", value: "Raspberry Infused" },
      { label: "Buttercream", value: "Real Fruit Puree" },
      { label: "Calories", value: "230 kcal" },
      { label: "Fruit Content", value: "Fresh Raspberry" }
    ],
    ingredients: ['Cake Flour', 'Raspberry Jam Pocket', 'Pink Raspberry Buttercream', 'Fresh Berries', 'Vanilla Paste'],
    nutrition: [
      { name: 'Carbs', percentage: 70 },
      { name: 'Fats', percentage: 38 },
      { name: 'Proteins', percentage: 12 },
      { name: 'Sugars', percentage: 50 }
    ],
    bgText: 'BERRY'
  },
  {
    id: 'mango-shake',
    src: './images/mango_shake.png',
    alt: 'Mango Passion Shake',
    title: 'Mango Passion Fruit Shake',
    category: 'Signature Shake',
    price: 7.25,
    rating: 4.8,
    reviews: 121,
    description: 'Exotic blend of sweet Alfonso mango pulp, tangy passion fruit syrup, and creamy organic milk, topped with whipped cream.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #fef9e7 50%, #f8c471 100%)',
    themeColor: '#7e5109',
    accentColor: '#f39c12',
    textColor: '#513203',
    specs: [
      { label: "Mango", value: "Alfonso Puree" },
      { label: "Passionfruit", value: "Tangy Pulp" },
      { label: "Calories", value: "280 kcal" },
      { label: "Serving", value: "350 ml" }
    ],
    ingredients: ['Alfonso Mango Pulp', 'Passion Fruit Syrup', 'Fresh Milk', 'Vanilla Ice Cream', 'Double Cream Whipped'],
    nutrition: [
      { name: 'Carbs', percentage: 65 },
      { name: 'Fats', percentage: 22 },
      { name: 'Proteins', percentage: 18 },
      { name: 'Sugars', percentage: 34 }
    ],
    bgText: 'MANGO'
  },
  {
    id: 'blueberry-macaron',
    src: './images/blueberry_macaron.png',
    alt: 'Blueberry Macaron',
    title: 'Wild Blueberry Macaron',
    category: 'French Macaron',
    price: 4.75,
    rating: 4.7,
    reviews: 62,
    description: 'Crisp French macaron shells containing a luxurious blueberry chocolate ganache and a drop of fresh blueberry compote.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #ebf5fb 50%, #a9cce3 100%)',
    themeColor: '#1b4f72',
    accentColor: '#5499c7',
    textColor: '#113248',
    specs: [
      { label: "Flavor", value: "Wild Blueberry" },
      { label: "Shell", value: "Soft & Chewy" },
      { label: "Calories", value: "145 kcal" },
      { label: "Gluten-Free", value: "Yes" }
    ],
    ingredients: ['Almond Flour', 'Egg Whites', 'Blueberry Compote', 'White Chocolate Ganache', 'Natural Blue Extract'],
    nutrition: [
      { name: 'Carbs', percentage: 46 },
      { name: 'Fats', percentage: 38 },
      { name: 'Proteins', percentage: 12 },
      { name: 'Sugars', percentage: 32 }
    ],
    bgText: 'BLUE'
  },
  {
    id: 'cinnamon-roll',
    src: './images/cinnamon_roll.png',
    alt: 'Cinnamon Roll',
    title: 'Gourmet Cinnamon Roll',
    category: 'Warm Pastry',
    price: 3.75,
    rating: 4.9,
    reviews: 156,
    description: 'Warm fluffy cinnamon bun with brown sugar swirls and loaded with creamy vanilla cream cheese glaze dripping off the sides.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #fbf5f0 50%, #ddc3ab 100%)',
    themeColor: '#5c4033',
    accentColor: '#9c6644',
    textColor: '#3c2a21',
    specs: [
      { label: "Glaze", value: "Cream Cheese" },
      { label: "Cinnamon", value: "Ceylon Organic" },
      { label: "Calories", value: "320 kcal" },
      { label: "Serving", value: "110 g" }
    ],
    ingredients: ['Yeast Dough', 'Ceylon Cinnamon', 'Dark Brown Sugar', 'Cream Cheese Frosting', 'Cultured Butter'],
    nutrition: [
      { name: 'Carbs', percentage: 70 },
      { name: 'Fats', percentage: 48 },
      { name: 'Proteins', percentage: 14 },
      { name: 'Sugars', percentage: 35 }
    ],
    bgText: 'CINNY'
  },
  {
    id: 'rose-donut',
    src: './images/rose_donut.png',
    alt: 'Velvet Rose Donut',
    title: 'Velvet Rose Donut',
    category: 'Handcrafted Donut',
    price: 4.50,
    rating: 4.9,
    reviews: 84,
    description: 'A beautiful pink velvet rose glazed donut, decorated with delicate white frosting petals and a soft vanilla aroma.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #fdf0f4 50%, #f3b5c7 100%)',
    themeColor: '#7a2f45',
    accentColor: '#d65376',
    textColor: '#421a25',
    specs: [
      { label: "Glaze", value: "Rose Syrup Glaze" },
      { label: "Style", value: "Pink Velvet Yeast" },
      { label: "Calories", value: "210 kcal" },
      { label: "Freshness", value: "Fresh Baked" }
    ],
    ingredients: ['Velvet Cake Flour', 'Rose Water Syrup', 'Vanilla Cream Petals', 'Sugar Pearls', 'Organic Butter'],
    nutrition: [
      { name: 'Carbs', percentage: 70 },
      { name: 'Fats', percentage: 40 },
      { name: 'Proteins', percentage: 14 },
      { name: 'Sugars', percentage: 38 }
    ],
    bgText: 'ROSE'
  },
  {
    id: 'matcha-waffle',
    src: './images/matcha_waffle.png',
    alt: 'Matcha Garden Waffle',
    title: 'Matcha Garden Waffle',
    category: 'Belgian Waffle',
    price: 5.75,
    rating: 4.8,
    reviews: 76,
    description: 'A golden Belgian waffle dusted with green ceremonial matcha powder, topped with fresh whipped cream and sweet red bean paste.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #e8f8f5 50%, #76d7c4 100%)',
    themeColor: '#0e6251',
    accentColor: '#1abc9c',
    textColor: '#0a3d32',
    specs: [
      { label: "Matcha", value: "Ceremonial Uji" },
      { label: "Base", value: "Lighter Batter" },
      { label: "Calories", value: "295 kcal" },
      { label: "Bake Temp", value: "190°C" }
    ],
    ingredients: ['Stone Ground Flour', 'Uji Matcha Powder', 'Whipped Cream', 'Sweet Red Bean', 'Organic Honey'],
    nutrition: [
      { name: 'Carbs', percentage: 58 },
      { name: 'Fats', percentage: 32 },
      { name: 'Proteins', percentage: 16 },
      { name: 'Sugars', percentage: 24 }
    ],
    bgText: 'MATCHA'
  },
  {
    id: 'lava-cake',
    src: './images/lava_cake.png',
    alt: 'Gourmet Fudge Lava Cake',
    title: 'Gourmet Fudge Lava Cake',
    category: 'Gourmet Cake',
    price: 6.25,
    rating: 4.9,
    reviews: 189,
    description: 'A rich chocolate lava cake with warm molten Belgian fudge flowing out of the center, paired with a vanilla bean dusting.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #f3ebd8 50%, #c49675 100%)',
    themeColor: '#5c2e1a',
    accentColor: '#a1673f',
    textColor: '#3a2b23',
    specs: [
      { label: "Fudge", value: "Belgian Molten" },
      { label: "Layers", value: "Warm Liquid Center" },
      { label: "Calories", value: "390 kcal" },
      { label: "Serving", value: "120 g" }
    ],
    ingredients: ['Belgian Cocoa Liquor', 'Brown Butter', 'Gourmet Sugar Cane', 'Fresh Farm Eggs', 'Vanilla Bean Powder'],
    nutrition: [
      { name: 'Carbs', percentage: 62 },
      { name: 'Fats', percentage: 56 },
      { name: 'Proteins', percentage: 18 },
      { name: 'Sugars', percentage: 42 }
    ],
    bgText: 'LAVA'
  },
  {
    id: 'pistachio-shake',
    src: './images/pistachio_shake.png',
    alt: 'Pistachio Shake',
    title: 'Pistachio Praline Shake',
    category: 'Signature Shake',
    price: 7.75,
    rating: 4.9,
    reviews: 108,
    description: 'A creamy pistachio shake in a glass, topped with whipped cream, crushed green pistachios, and caramel praline pieces.',
    bg: 'radial-gradient(circle at center, #ffffff 0%, #ebf5fb 50%, #85c1e9 100%)',
    themeColor: '#1b4f72',
    accentColor: '#3498db',
    textColor: '#153e5b',
    specs: [
      { label: "Nuts", value: "Sicilian Pistachio" },
      { label: "Base", value: "Oat Milk & Gelato" },
      { label: "Calories", value: "350 kcal" },
      { label: "Serving", value: "350 ml" }
    ],
    ingredients: ['Sicilian Pistachio Gelato', 'Organic Oat Milk', 'Whipped Double Cream', 'Caramel Praline Crumbles', 'Raw Honey'],
    nutrition: [
      { name: 'Carbs', percentage: 52 },
      { name: 'Fats', percentage: 48 },
      { name: 'Proteins', percentage: 24 },
      { name: 'Sugars', percentage: 22 }
    ],
    bgText: 'PRALINE'
  }
];

// 1. GET ALL PRODUCTS
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Helper to get or initialize a cart
const getCart = (cartId) => {
  if (!cartId) return { cartId: null, items: [] };
  if (!carts[cartId]) {
    carts[cartId] = [];
  }
  return { cartId, items: carts[cartId] };
};

// 2. GET CART
app.get('/api/cart', (req, res) => {
  const cartId = req.query.cartId || generateId();
  const cart = getCart(cartId);
  res.json(cart);
});

// 3. ADD TO CART
app.post('/api/cart', (req, res) => {
  let { cartId, productId, quantity, toppings } = req.body;
  if (!cartId) {
    cartId = generateId();
  }
  const cart = getCart(cartId);
  const product = products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Toppings signature to identify unique combinations
  const toppingsKey = Object.keys(toppings || {})
    .filter(k => toppings[k])
    .sort()
    .join(',');

  // Check if item with same product and toppings already exists
  const existingItem = cart.items.find(item => 
    item.productId === productId && 
    item.toppingsKey === toppingsKey
  );

  if (existingItem) {
    existingItem.quantity += quantity || 1;
  } else {
    cart.items.push({
      id: generateId(),
      productId,
      name: product.title,
      price: product.price,
      src: product.src,
      quantity: quantity || 1,
      toppings: toppings || {},
      toppingsKey
    });
  }

  res.json({ cartId, items: cart.items });
});

// 4. UPDATE CART ITEM QUANTITY OR TOPPINGS
app.put('/api/cart/item', (req, res) => {
  const { cartId, itemId, quantity, toppings } = req.body;
  const cart = getCart(cartId);
  const itemIndex = cart.items.findIndex(item => item.id === itemId);

  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Cart item not found' });
  }

  if (quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    const item = cart.items[itemIndex];
    item.quantity = quantity;
    if (toppings) {
      item.toppings = toppings;
      item.toppingsKey = Object.keys(toppings)
        .filter(k => toppings[k])
        .sort()
        .join(',');
    }
  }

  res.json({ cartId, items: cart.items });
});

// 5. REMOVE FROM CART
app.delete('/api/cart/item', (req, res) => {
  const { cartId, itemId } = req.body;
  const cart = getCart(cartId);
  const itemIndex = cart.items.findIndex(item => item.id === itemId);

  if (itemIndex !== -1) {
    cart.items.splice(itemIndex, 1);
  }

  res.json({ cartId, items: cart.items });
});

// 6. CLEAR CART
app.post('/api/cart/clear', (req, res) => {
  const { cartId } = req.body;
  if (cartId && carts[cartId]) {
    carts[cartId] = [];
  }
  res.json({ cartId, items: [] });
});

app.listen(PORT, () => {
  console.log(`Bakery Backend API running on http://localhost:${PORT}`);
});
