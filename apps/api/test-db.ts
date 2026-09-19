import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.menuCategory.findMany();
  console.log('Categories:', categories.length);
  
  if (categories.length === 0) {
    const cat = await prisma.menuCategory.create({
      data: { name: 'Food' }
    });
    
    await prisma.menuItem.createMany({
      data: [
        { id: '1', categoryId: cat.id, name: 'Club Sandwich', description: '', price: 78512 },
        { id: '2', categoryId: cat.id, name: 'Hot Dog', description: '', price: 36364 },
        { id: '3', categoryId: cat.id, name: 'French Fries', description: '', price: 61983 },
        { id: '4', categoryId: cat.id, name: 'Mie Goreng', description: '', price: 73554 },
        { id: '5', categoryId: cat.id, name: 'Nasi Goreng Special', description: '', price: 74380 },
        { id: '6', categoryId: cat.id, name: 'Kwetiaw Goreng', description: '', price: 73554 },
      ]
    });
    console.log('Created menu items!');
  }
  
  const items = await prisma.menuItem.findMany();
  console.log('Menu Items:', items.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
