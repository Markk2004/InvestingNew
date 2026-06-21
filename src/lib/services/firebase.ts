// ─────────────────────────────────────────────────────────────
//  FirebaseDb — Backend Database Class (Admin SDK version)
//  Uses firebase-admin with Service Account credentials for secure,
//  privileged direct access to Cloud Firestore.
// ─────────────────────────────────────────────────────────────

import * as admin from "firebase-admin";
import type { NewsItem } from "../db/types";

export class FirebaseDb {
  private db: admin.firestore.Firestore | null;
  private readonly isConfigured: boolean;

  constructor() {
    // Format private key properly, handling JSON newline escaping
    const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
    const privateKey = rawPrivateKey
      ? rawPrivateKey.replace(/\\n/g, "\n").replace(/^"|"$/g, "") // remove surrounding quotes if any
      : undefined;

    const config = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    };

    // Verify config is populated and not using default placeholders
    this.isConfigured = !!(
      config.projectId &&
      config.clientEmail &&
      config.clientEmail !== "YOUR_SERVICE_ACCOUNT_EMAIL_HERE" &&
      config.privateKey
    );

    if (!this.isConfigured) {
      console.warn(
        "[FirebaseDb] Firebase Service Account is not fully configured yet in .env.local. Operations bypassed."
      );
      this.db = null;
      return;
    }

    try {
      // Prevent duplicate initialization errors during Next.js Hot Module Replacement (HMR)
      if (admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert(config),
        });
        this.db = admin.firestore();
        this.db.settings({ ignoreUndefinedProperties: true });
      } else {
        this.db = admin.firestore();
      }
      console.log("[FirebaseDb] Admin SDK Initialized successfully.");
    } catch (error) {
      console.error("[FirebaseDb] Admin SDK Initialization failed:", error);
      this.db = null;
      this.isConfigured = false;
    }
  }

  /**
   * Save or update multiple NewsItems in Firestore using an atomic batch write.
   * Privileged Service Account access bypasses security rules.
   */
  async saveNewsItems(items: NewsItem[]): Promise<void> {
    if (!this.isConfigured || !this.db) {
      return;
    }

    try {
      const batch = this.db.batch();

      items.forEach((item) => {
        const docRef = this.db!.collection("news").doc(item.id);
        batch.set(
          docRef,
          {
            ...item,
            savedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true } // Merge if exists, create if not
        );
      });

      await batch.commit();
      console.log(`[FirebaseDb] Saved ${items.length} news items to Firestore.`);

      // Automatically clean up news older than 3 days to conserve space
      await this.cleanupOldNews(3);
    } catch (error) {
      console.error("[FirebaseDb] Failed to save news items:", error);
    }
  }

  /**
   * Delete news items older than N days from Cloud Firestore to preserve storage.
   * Pass days=0 to delete everything before the start of today, days=1 for start of yesterday, etc.
   */
  async cleanupOldNews(days = 1): Promise<void> {
    if (!this.isConfigured || !this.db) {
      return;
    }

    try {
      // Compute start-of-day for the cutoff
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      cutoffDate.setUTCHours(0, 0, 0, 0);
      const cutoffString = cutoffDate.toISOString();

      // Find documents published older than the cutoff
      const querySnapshot = await this.db
        .collection("news")
        .where("publishedAt", "<", cutoffString)
        .get();

      if (querySnapshot.empty) {
        console.log("[FirebaseDb] Auto-Cleanup: No old articles found to delete.");
        return;
      }

      const batch = this.db.batch();
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(
        `[FirebaseDb] Auto-Cleanup: Deleted ${querySnapshot.size} news items (cutoff: ${cutoffString}).`
      );
    } catch (error) {
      console.error("[FirebaseDb] Auto-Cleanup failed:", error);
    }
  }

  /**
   * Retrieve the most recent analyzed news items from Firestore.
   */
  async getNewsItems(limitCount = 10): Promise<NewsItem[]> {
    if (!this.isConfigured || !this.db) {
      return [];
    }

    try {
      const querySnapshot = await this.db
        .collection("news")
        .orderBy("publishedAt", "desc")
        .limit(limitCount)
        .get();

      const items: NewsItem[] = [];

      querySnapshot.forEach((doc) => {
        const newsItem = { ...doc.data() };
        delete (newsItem as Record<string, unknown>).savedAt;
        items.push(newsItem as NewsItem);
      });

      return items;
    } catch (error) {
      console.error("[FirebaseDb] Failed to retrieve news items:", error);
      return [];
    }
  }

  /**
   * Retrieve recent news items (published since start of X days ago UTC).
   * Used for the daily news view (daysBack=1 keeps today and yesterday).
   */
  async getRecentNewsItems(limitCount = 50, daysBack = 1): Promise<NewsItem[]> {
    if (!this.isConfigured || !this.db) {
      return [];
    }

    try {
      // Compute start-of-day UTC for the cutoff
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysBack);
      cutoffDate.setUTCHours(0, 0, 0, 0);
      const cutoffString = cutoffDate.toISOString();

      const querySnapshot = await this.db
        .collection("news")
        .where("publishedAt", ">=", cutoffString)
        .orderBy("publishedAt", "desc")
        .limit(limitCount)
        .get();

      const items: NewsItem[] = [];

      querySnapshot.forEach((doc) => {
        const newsItem = { ...doc.data() };
        delete (newsItem as Record<string, unknown>).savedAt;
        items.push(newsItem as NewsItem);
      });

      console.log(`[FirebaseDb] getRecentNewsItems: Found ${items.length} articles published since ${cutoffString}.`);
      return items;
    } catch (error) {
      console.error("[FirebaseDb] Failed to retrieve recent news items:", error);
      return [];
    }
  }
}
