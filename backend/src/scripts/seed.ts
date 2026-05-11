/**
 * Seed script — run once to populate the DB with sample data.
 * Usage: npx ts-node src/scripts/seed.ts
 */
import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { hashPassword } from "../lib/password.js";

async function main() {
  // Admin user
  const adminHash = await hashPassword("Admin@12345");
  const admin = await prisma.user.upsert({
    where: { email: "admin@elctro.com" },
    update: {},
    create: {
      email: "admin@elctro.com",
      passwordHash: adminHash,
      name: "Admin",
      role: "ADMIN",
    },
  });

  // Demo customer
  const customerHash = await hashPassword("Customer@12345");
  await prisma.user.upsert({
    where: { email: "customer@elctro.com" },
    update: {},
    create: {
      email: "customer@elctro.com",
      passwordHash: customerHash,
      name: "John Doe",
    },
  });

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "burgers" },
      update: {},
      create: { name: "Burgers", nameAr: "برجر", slug: "burgers" },
    }),
    prisma.category.upsert({
      where: { slug: "pizzas" },
      update: {},
      create: { name: "Pizzas", nameAr: "بيتزا", slug: "pizzas" },
    }),
    prisma.category.upsert({
      where: { slug: "drinks" },
      update: {},
      create: { name: "Drinks", nameAr: "مشروبات", slug: "drinks" },
    }),
    prisma.category.upsert({
      where: { slug: "sides" },
      update: {},
      create: { name: "Sides", nameAr: "إضافات", slug: "sides" },
    }),
  ]);

  const [burgers, pizzas, drinks, sides] = categories;

  // Products
  const products = [
    { name: "Classic Burger", nameAr: "برجر كلاسيك", description: "Juicy beef patty with fresh vegetables", price: 8.99, categoryId: burgers.id },
    { name: "BBQ Burger", nameAr: "برجر باربيكيو", description: "Smoky BBQ sauce with crispy onion rings", price: 10.99, categoryId: burgers.id },
    { name: "Margherita Pizza", nameAr: "بيتزا مارغريتا", description: "Classic tomato and mozzarella", price: 12.99, categoryId: pizzas.id },
    { name: "Pepperoni Pizza", nameAr: "بيتزا بيبروني", description: "Loaded with premium pepperoni", price: 14.99, categoryId: pizzas.id },
    { name: "Cola", nameAr: "كولا", description: "Chilled Coca-Cola 500ml", price: 2.49, categoryId: drinks.id },
    { name: "Fresh Lemonade", nameAr: "ليمونادة طازجة", description: "Freshly squeezed lemonade", price: 3.49, categoryId: drinks.id },
    { name: "French Fries", nameAr: "بطاطس مقلية", description: "Crispy golden fries with seasoning", price: 3.99, categoryId: sides.id },
    { name: "Onion Rings", nameAr: "حلقات بصل", description: "Crispy battered onion rings", price: 4.49, categoryId: sides.id },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.name.toLowerCase().replace(/ /g, "-") },
      update: {},
      create: p,
    }).catch(() => prisma.product.create({ data: p }));
  }

  console.log("Seed completed.");
  console.log(`Admin: admin@elctro.com / Admin@12345`);
  console.log(`Customer: customer@elctro.com / Customer@12345`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
