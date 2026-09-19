import { GameMode, OrderStatus, PrismaClient, RoundStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const userSeed = [
  {
    id: 'user_alex',
    email: 'alex@example.com',
    fullName: 'Alex Miller',
    memberId: '#8821',
    handicapIndex: 12.4,
    avatarUrl: 'https://i.pravatar.cc/300?img=12',
  },
  {
    id: 'user_sarah',
    email: 'sarah@example.com',
    fullName: 'Sarah Jenkins',
    memberId: '#4402',
    handicapIndex: 8.2,
    avatarUrl: 'https://i.pravatar.cc/300?img=47',
  },
  {
    id: 'user_marcus',
    email: 'marcus@example.com',
    fullName: 'Marcus Wu',
    memberId: '#1093',
    handicapIndex: 14.1,
    avatarUrl: 'https://i.pravatar.cc/300?img=13',
  },
  {
    id: 'user_jordan',
    email: 'jordan@example.com',
    fullName: 'Jordan Smith',
    memberId: '#7701',
    handicapIndex: 5.6,
    avatarUrl: 'https://i.pravatar.cc/300?img=14',
  },
  {
    id: 'user_linda',
    email: 'linda@example.com',
    fullName: 'Linda Wu',
    memberId: '#3318',
    handicapIndex: 10.4,
    avatarUrl: 'https://i.pravatar.cc/300?img=48',
  },
  {
    id: 'user_david',
    email: 'david@example.com',
    fullName: 'David Chen',
    memberId: '#9014',
    handicapIndex: 3.9,
    avatarUrl: 'https://i.pravatar.cc/300?img=15',
  },
  {
    id: 'user_admin',
    email: 'admin@golfinity.id',
    fullName: 'Golfinity Admin',
    password: 'admin123',
    memberId: '#0001',
    handicapIndex: 0.0,
    avatarUrl: 'https://i.pravatar.cc/300?img=1',
  },
];

const courseSeed = [
  {
    id: 'course_pebble_beach',
    name: 'Pebble Beach Golf Links',
    city: 'Pebble Beach',
    country: 'USA',
    totalHoles: 18,
    imageUrl:
      'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=1200&q=80',
    teeBoxes: [
      { id: 'tee_pebble_blue', name: 'Blue (Championship)', yardage: 7075, rating: 75.5, slope: 143 },
      { id: 'tee_pebble_white', name: 'White (Standard)', yardage: 6445, rating: 72.1, slope: 131 },
      { id: 'tee_pebble_red', name: 'Red (Forward)', yardage: 5120, rating: 70.0, slope: 121 },
    ],
  },
  {
    id: 'course_pine_valley',
    name: 'Pine Valley Golf Club',
    city: 'Pine Valley',
    country: 'USA',
    totalHoles: 18,
    imageUrl:
      'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?auto=format&fit=crop&w=1200&q=80',
    teeBoxes: [
      { id: 'tee_pine_black', name: 'Black (Tournament)', yardage: 7215, rating: 76.3, slope: 146 },
      { id: 'tee_pine_blue', name: 'Blue (Member)', yardage: 6710, rating: 73.8, slope: 138 },
      { id: 'tee_pine_gold', name: 'Gold (Forward)', yardage: 5480, rating: 70.2, slope: 124 },
    ],
  },
  {
    id: 'course_augusta',
    name: 'Padang Golf Sulaiman',
    city: 'Bandung',
    country: 'Indonesia',
    totalHoles: 18,
    imageUrl:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    teeBoxes: [
      { id: 'tee_augusta_masters', name: 'Masters Tees', yardage: 7510, rating: 77.9, slope: 149 },
      { id: 'tee_augusta_member', name: 'Member Tees', yardage: 6835, rating: 74.0, slope: 140 },
      { id: 'tee_augusta_forward', name: 'Forward Tees', yardage: 5605, rating: 70.5, slope: 126 },
    ],
  },
];

const menuItems = [
  {
    id: 'item_transfusion',
    category: 'Drinks',
    name: 'Transfusion Cocktail',
    description: 'The classic golf course cocktail: vodka, grape juice, ginger ale.',
    price: 12.0,
    imageUrl:
      'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'item_signature_club',
    category: 'Meals',
    name: 'Signature Club Sandwich',
    description: 'Turkey, bacon, lettuce, tomato on toasted sourdough.',
    price: 14.5,
    imageUrl:
      'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'item_artisan_burger',
    category: 'Meals',
    name: 'Artisan Beef Burger',
    description: 'Brioche bun with cheddar and secret course sauce.',
    price: 16.0,
    imageUrl:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'item_fruit_medley',
    category: 'Snacks',
    name: 'Fresh Fruit Medley',
    description: 'Seasonal sliced fruits and berries.',
    price: 8.0,
    imageUrl:
      'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'item_wagyu_sliders',
    category: 'Meals',
    name: 'Wagyu Sliders',
    description: 'Two mini wagyu sliders with truffle aioli.',
    price: 22.0,
    imageUrl:
      'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'item_iced_matcha',
    category: 'Drinks',
    name: 'Iced Matcha Latte',
    description: 'Matcha, milk, and ice. Lightly sweetened.',
    price: 7.5,
    imageUrl:
      'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'item_protein_bar',
    category: 'Snacks',
    name: 'House Protein Bar',
    description: 'Nuts, oats, dates, and dark chocolate.',
    price: 5.0,
    imageUrl:
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
  },
];

async function resetData() {
  await prisma.orderStatusLog.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.holeScore.deleteMany();
  await prisma.roundPlayer.deleteMany();
  await prisma.round.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.userPreference.deleteMany();
  await prisma.hole.deleteMany();
  await prisma.teeBox.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();
}

function parsByHole() {
  return [4, 5, 3, 4, 4, 5, 3, 4, 4, 4, 3, 4, 5, 4, 4, 3, 4, 5];
}

async function seedCoursesAndHoles() {
  for (const course of courseSeed) {
    await prisma.course.create({
      data: {
        id: course.id,
        name: course.name,
        city: course.city,
        country: course.country,
        totalHoles: course.totalHoles,
        imageUrl: course.imageUrl,
      },
    });

    await prisma.teeBox.createMany({
      data: course.teeBoxes.map((tee) => ({
        id: tee.id,
        courseId: course.id,
        name: tee.name,
        yardage: tee.yardage,
        rating: tee.rating,
        slope: tee.slope,
      })),
    });

    const parTemplate = parsByHole();

    let startLat = 0;
    let startLon = 0;
    if (course.id === 'course_pebble_beach') {
      startLat = 36.5698;
      startLon = -121.9532;
    } else if (course.id === 'course_pine_valley') {
      startLat = 39.7876;
      startLon = -74.9760;
    } else if (course.id === 'course_augusta') {
      startLat = 33.5021;
      startLon = -82.0226;
    }

    await prisma.hole.createMany({
      data: Array.from({ length: 18 }).map((_, index) => ({
        id: `hole_${course.id}_${index + 1}`,
        courseId: course.id,
        number: index + 1,
        par: parTemplate[index],
        lengthYds: 355 + index * 11 + (index % 2 === 0 ? 12 : 0),
        latitude: startLat + (Math.floor(index / 9) * 0.005) + (index % 9) * 0.001,
        longitude: startLon + (Math.floor(index / 9) * 0.005) + (index % 9) * 0.001,
      })),
    });
  }
}

async function seedUsers() {
  const saltedUsers = await Promise.all(
    userSeed.map(async (user) => {
      if (user.password) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return { ...user, password: hashedPassword };
      }
      return user;
    }),
  );

  await prisma.user.createMany({
    data: saltedUsers,
  });
}

async function seedPreferences() {
  await prisma.userPreference.createMany({
    data: [
      {
        userId: 'user_alex',
        notificationsEnabled: true,
        marketingEmails: false,
        privacyMode: 'MEMBERS_ONLY',
      },
      {
        userId: 'user_sarah',
        notificationsEnabled: true,
        marketingEmails: true,
        privacyMode: 'PUBLIC',
      },
      {
        userId: 'user_marcus',
        notificationsEnabled: false,
        marketingEmails: false,
        privacyMode: 'PRIVATE',
      },
      {
        userId: 'user_jordan',
        notificationsEnabled: true,
        marketingEmails: false,
        privacyMode: 'MEMBERS_ONLY',
      },
      {
        userId: 'user_linda',
        notificationsEnabled: true,
        marketingEmails: true,
        privacyMode: 'PUBLIC',
      },
      {
        userId: 'user_david',
        notificationsEnabled: true,
        marketingEmails: false,
        privacyMode: 'MEMBERS_ONLY',
      },
      {
        userId: 'user_admin',
        notificationsEnabled: true,
        marketingEmails: false,
        privacyMode: 'PRIVATE',
      },
    ],
  });
}

async function seedEvents() {
  await prisma.event.createMany({
    data: [
      {
        id: 'event_club_championship',
        title: 'Club Championship',
        subtitle: 'Main Course • 8:00 AM',
        imageUrl:
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
        startDate: new Date('2026-10-12T08:00:00.000Z'),
        courseId: 'course_pebble_beach',
      },
      {
        id: 'event_masters_invitational',
        title: 'Masters Invitational',
        subtitle: 'Championship Flight',
        imageUrl:
          'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1200&q=80',
        startDate: new Date('2026-11-03T09:00:00.000Z'),
        courseId: 'course_augusta',
      },
    ],
  });
}

async function seedEventRegistrations() {
  await prisma.eventRegistration.createMany({
    data: [
      {
        eventId: 'event_club_championship',
        userId: 'user_alex',
      },
      {
        eventId: 'event_masters_invitational',
        userId: 'user_sarah',
      },
    ],
  });
}

async function seedNotifications() {
  await prisma.notification.createMany({
    data: [
      {
        id: 'note_1',
        userId: 'user_alex',
        title: 'Club Championship',
        message: 'Registration confirmed for the upcoming club championship.',
        category: 'TOURNAMENT',
        createdAt: new Date('2026-03-12T08:20:00.000Z'),
      },
      {
        id: 'note_2',
        userId: 'user_sarah',
        title: 'Order Delivered',
        message: 'Your order for the turn house was delivered near Hole 7.',
        category: 'ORDER',
        createdAt: new Date('2026-03-12T09:05:00.000Z'),
      },
      {
        id: 'note_3',
        userId: 'user_alex',
        title: 'Round Update',
        message: 'Marcus Wu posted a new round summary.',
        category: 'SOCIAL',
        createdAt: new Date('2026-03-12T09:22:00.000Z'),
      },
      {
        id: 'note_4',
        userId: 'user_alex',
        title: 'System Check',
        message: 'Course GPS calibration complete for Pebble Beach.',
        category: 'SYSTEM',
        createdAt: new Date('2026-03-12T09:40:00.000Z'),
      },
    ],
  });
}

async function seedMenu() {
  const categoryMap = new Map<string, string>();
  for (const categoryName of ['Drinks', 'Snacks', 'Meals']) {
    const category = await prisma.menuCategory.create({
      data: { name: categoryName },
    });
    categoryMap.set(categoryName, category.id);
  }

  await prisma.menuItem.createMany({
    data: menuItems.map((item) => ({
      id: item.id,
      categoryId: categoryMap.get(item.category)!,
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: item.imageUrl,
      isAvailable: true,
    })),
  });
}

async function seedRoundsAndScores() {
  const finishedRound = await prisma.round.create({
    data: {
      id: 'round_finished_pebble',
      courseId: 'course_pebble_beach',
      teeBoxId: 'tee_pebble_blue',
      gameMode: GameMode.STROKE_PLAY,
      status: RoundStatus.FINISHED,
      currentHole: 18,
      startedAt: new Date('2026-03-01T08:00:00.000Z'),
      finishedAt: new Date('2026-03-01T12:15:00.000Z'),
      players: {
        create: [
          { userId: 'user_alex', isOwner: true },
          { userId: 'user_sarah' },
          { userId: 'user_marcus' },
          { userId: 'user_jordan' },
        ],
      },
    },
  });

  const liveRound = await prisma.round.create({
    data: {
      id: 'round_live_augusta',
      courseId: 'course_augusta',
      teeBoxId: 'tee_augusta_masters',
      gameMode: GameMode.STROKE_PLAY,
      status: RoundStatus.IN_PROGRESS,
      currentHole: 14,
      startedAt: new Date('2026-03-12T07:30:00.000Z'),
      players: {
        create: [
          { userId: 'user_david', isOwner: true },
          { userId: 'user_linda' },
          { userId: 'user_sarah' },
          { userId: 'user_marcus' },
        ],
      },
    },
  });

  const practiceRound = await prisma.round.create({
    data: {
      id: 'round_practice_pine',
      courseId: 'course_pine_valley',
      teeBoxId: 'tee_pine_blue',
      gameMode: GameMode.STABLEFORD,
      status: RoundStatus.IN_PROGRESS,
      currentHole: 7,
      startedAt: new Date('2026-03-10T10:00:00.000Z'),
      players: {
        create: [{ userId: 'user_alex', isOwner: true }, { userId: 'user_marcus' }],
      },
    },
  });

  const pebbleHoles = await prisma.hole.findMany({
    where: { courseId: 'course_pebble_beach' },
    orderBy: { number: 'asc' },
  });
  const augustaHoles = await prisma.hole.findMany({
    where: { courseId: 'course_augusta' },
    orderBy: { number: 'asc' },
  });
  const pineHoles = await prisma.hole.findMany({
    where: { courseId: 'course_pine_valley' },
    orderBy: { number: 'asc' },
  });

  for (const [holeIndex, hole] of pebbleHoles.entries()) {
    await prisma.holeScore.createMany({
      data: [
        {
          roundId: finishedRound.id,
          holeId: hole.id,
          userId: 'user_alex',
          strokes: hole.par + (holeIndex % 4 === 0 ? 1 : 0),
          putts: 2,
          fairwayHit: ['LEFT', 'CENTER', 'RIGHT'][holeIndex % 3] as any,
          gir: holeIndex % 2 === 0,
        },
        {
          roundId: finishedRound.id,
          holeId: hole.id,
          userId: 'user_sarah',
          strokes: hole.par,
          putts: 2,
          fairwayHit: 'CENTER',
          gir: true,
        },
        {
          roundId: finishedRound.id,
          holeId: hole.id,
          userId: 'user_marcus',
          strokes: hole.par + (holeIndex % 5 === 0 ? 2 : 1),
          putts: 2,
          fairwayHit: holeIndex % 2 === 0 ? 'RIGHT' : 'LEFT',
          gir: holeIndex % 3 === 0,
        },
        {
          roundId: finishedRound.id,
          holeId: hole.id,
          userId: 'user_jordan',
          strokes: hole.par - (holeIndex % 6 === 0 ? 1 : 0),
          putts: 1,
          fairwayHit: 'CENTER',
          gir: true,
        },
      ],
    });
  }

  for (const hole of augustaHoles.slice(0, 14)) {
    await prisma.holeScore.createMany({
      data: [
        {
          roundId: liveRound.id,
          holeId: hole.id,
          userId: 'user_david',
          strokes: hole.par,
          putts: 2,
          fairwayHit: 'CENTER',
          gir: true,
        },
        {
          roundId: liveRound.id,
          holeId: hole.id,
          userId: 'user_linda',
          strokes: hole.par + 1,
          putts: 2,
          fairwayHit: 'LEFT',
          gir: hole.number % 2 === 0,
        },
        {
          roundId: liveRound.id,
          holeId: hole.id,
          userId: 'user_sarah',
          strokes: hole.par - (hole.number % 5 === 0 ? 1 : 0),
          putts: 2,
          fairwayHit: 'CENTER',
          gir: true,
        },
        {
          roundId: liveRound.id,
          holeId: hole.id,
          userId: 'user_marcus',
          strokes: hole.par + (hole.number % 4 === 0 ? 2 : 1),
          putts: 2,
          fairwayHit: 'RIGHT',
          gir: false,
        },
      ],
    });
  }

  for (const hole of pineHoles.slice(0, 7)) {
    await prisma.holeScore.createMany({
      data: [
        {
          roundId: practiceRound.id,
          holeId: hole.id,
          userId: 'user_alex',
          strokes: hole.par + (hole.number % 3 === 0 ? 1 : 0),
          putts: 2,
          fairwayHit: 'CENTER',
          gir: hole.number % 2 === 1,
        },
        {
          roundId: practiceRound.id,
          holeId: hole.id,
          userId: 'user_marcus',
          strokes: hole.par + 1,
          putts: 2,
          fairwayHit: 'LEFT',
          gir: false,
        },
      ],
    });
  }
}

async function seedOrders() {
  const delivered = await prisma.order.create({
    data: {
      id: 'order_delivered_1',
      userId: 'user_alex',
      roundId: 'round_finished_pebble',
      holeNumber: 7,
      status: OrderStatus.DELIVERED,
      subtotal: 36.0,
      serviceFee: 6.48,
      totalPaid: 42.48,
      items: {
        create: [
          { menuItemId: 'item_transfusion', quantity: 1, unitPrice: 14.0 },
          { menuItemId: 'item_wagyu_sliders', quantity: 1, unitPrice: 22.0 },
        ],
      },
      statusLogs: {
        create: [
          { status: OrderStatus.PENDING, note: 'Order pending' },
          { status: OrderStatus.PREPARING, note: 'Kitchen preparing order' },
          { status: OrderStatus.ON_THE_WAY, note: 'Runner departed from clubhouse' },
          { status: OrderStatus.DELIVERED, note: 'Delivered near Hole 7 fairway' },
        ],
      },
    },
  });

  const preparing = await prisma.order.create({
    data: {
      id: 'order_preparing_live',
      userId: 'user_sarah',
      roundId: 'round_live_augusta',
      holeNumber: 14,
      status: OrderStatus.PREPARING,
      subtotal: 26.5,
      serviceFee: 4.77,
      totalPaid: 31.27,
      items: {
        create: [
          { menuItemId: 'item_signature_club', quantity: 1, unitPrice: 14.5 },
          { menuItemId: 'item_iced_matcha', quantity: 1, unitPrice: 7.5 },
          { menuItemId: 'item_protein_bar', quantity: 1, unitPrice: 4.5 },
        ],
      },
      statusLogs: {
        create: [
          { status: OrderStatus.PENDING, note: 'Order pending' },
          { status: OrderStatus.PREPARING, note: 'Chef started preparing' },
        ],
      },
    },
  });

  return { delivered, preparing };
}

async function main() {
  await resetData();
  await seedUsers();
  await seedPreferences();
  await seedCoursesAndHoles();
  await seedEvents();
  await seedEventRegistrations();
  await seedNotifications();
  await seedMenu();
  await seedRoundsAndScores();
  const orders = await seedOrders();

  console.log('Seed complete');
  console.log(`Users: ${userSeed.length}`);
  console.log(`Courses: ${courseSeed.length}`);
  console.log(`Menu items: ${menuItems.length}`);
  console.log(`Orders: ${orders.delivered.id}, ${orders.preparing.id}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
