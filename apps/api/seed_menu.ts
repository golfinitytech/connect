import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const cat = await prisma.menuCategory.upsert({
    where: { id: 'FOOD' },
    update: {},
    create: { id: 'FOOD', name: 'Food' },
  });

  const menuItems = [
    { id: '1', name: 'Club Sandwich', description: 'Club Sandwich', price: 78512, categoryId: cat.id, imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop' },
    { id: '2', name: 'Hot Dog', description: 'Hot Dog', price: 36364, categoryId: cat.id, imageUrl: 'https://images.unsplash.com/photo-1541214113241-21578d2d9b62?w=800&auto=format&fit=crop' },
    { id: '3', name: 'French Fries', description: 'French Fries', price: 61983, categoryId: cat.id, imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&auto=format&fit=crop' },
    { id: '4', name: 'Mie Goreng', description: 'Mie Goreng', price: 73554, categoryId: cat.id, imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&auto=format&fit=crop' },
    { id: '5', name: 'Nasi Goreng Special', description: 'Nasi Goreng Special', price: 74380, categoryId: cat.id, imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop' },
    { id: '6', name: 'Kwetiaw Goreng', description: 'Kwetiaw Goreng', price: 73554, categoryId: cat.id, imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop' },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }
  console.log('Menu items seeded');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
