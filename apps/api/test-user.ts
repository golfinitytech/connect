import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { id: 'dummy-user-id' } });
  console.log('User exists?', !!user);
  if (!user) {
    await prisma.user.create({
      data: {
        id: 'dummy-user-id',
        email: 'dummy@example.com',
        fullName: 'Dummy User',
        memberId: 'DUMMY001',
        handicapIndex: 0
      }
    });
    console.log('Created dummy user!');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
