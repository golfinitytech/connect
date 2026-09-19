import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as fs from 'fs';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private firebaseApp: admin.app.App;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const configPath = this.configService.get<string>('FIREBASE_CONFIG_PATH');

    if (!configPath || !fs.existsSync(configPath)) {
      this.logger.error(`Firebase config file not found at: ${configPath}`);
      return;
    }

    try {
      const serviceAccount = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      this.logger.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK', error.stack);
    }
  }

  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      return await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      this.logger.error('Firebase ID token verification failed', error.stack);
      throw error;
    }
  }

  async sendPushNotification(
    token: string,
    title: string,
    body: string,
    data?: any,
  ) {
    if (!this.firebaseApp) {
      this.logger.warn(
        'Firebase app not initialized. Skipping push notification.',
      );
      return;
    }

    try {
      const message: admin.messaging.Message = {
        notification: { title, body },
        data: data || {},
        token,
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`Successfully sent push notification: ${response}`);
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to send push notification to token ${token}`,
        error.stack,
      );
    }
  }

  async sendPushToTopic(
    topic: string,
    title: string,
    body: string,
    data?: any,
  ) {
    if (!this.firebaseApp) {
      this.logger.warn(
        'Firebase app not initialized. Skipping push notification.',
      );
      return;
    }

    try {
      const message: admin.messaging.Message = {
        notification: { title, body },
        data: data || {},
        topic,
      };

      const response = await admin.messaging().send(message);
      this.logger.log(
        `Successfully sent push notification to topic ${topic}: ${response}`,
      );
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to send push notification to topic ${topic}`,
        error.stack,
      );
    }
  }

  getAuth(): admin.auth.Auth {
    return admin.auth();
  }
}
