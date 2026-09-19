import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: 'guest@golfinity.id' },
    update: { id: 'dummy-user-id' },
    create: {
      id: 'dummy-user-id',
      email: 'guest@golfinity.id',
      password: 'password',
      fullName: 'Guest User',
      memberId: 'GUEST001',
      handicapIndex: 0,
    },
  });
  console.log('User seeded');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
