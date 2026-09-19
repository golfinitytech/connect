import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { EventsModule } from './events/events.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { MenuModule } from './menu/menu.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';
import { RoundsModule } from './rounds/rounds.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { FirebaseModule } from './firebase/firebase.module';
import { AdminModule } from './admin/admin.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { AdminNotificationModule } from './admin-notification/admin-notification.module';
import { CaddiePerformanceModule } from './caddie-performance/caddie-performance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    MailModule,
    FirebaseModule,
    AuthModule,
    CoursesModule,
    EventsModule,
    RoundsModule,
    MenuModule,
    OrdersModule,
    LeaderboardModule,
    UsersModule,
    NotificationsModule,
    AdminModule,
    TournamentsModule,
    AdminNotificationModule,
    CaddiePerformanceModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
