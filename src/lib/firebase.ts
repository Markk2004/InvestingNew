// ─────────────────────────────────────────────────────────────
//  FirebaseDb — Backend Database Class (Admin SDK version)
//  Uses firebase-admin with Service Account credentials for secure,
//  privileged direct access to Cloud Firestore.
// ─────────────────────────────────────────────────────────────

import * as admin from "firebase-admin";
import type { NewsItem } from "./types";

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
      }
      this.db = admin.firestore();
      this.db.settings({ ignoreUndefinedProperties: true });
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
   */
  async cleanupOldNews(days = 3): Promise<void> {
    if (!this.isConfigured || !this.db) {
      return;
    }

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const cutoffString = cutoffDate.toISOString();

      // Find documents published older than the cutoff
      const querySnapshot = await this.db
        .collection("news")
        .where("publishedAt", "<", cutoffString)
        .get();

      if (querySnapshot.empty) {
        return;
      }

      const batch = this.db.batch();
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(
        `[FirebaseDb] Auto-Cleanup: Successfully deleted ${querySnapshot.size} news items older than ${days} days.`
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
        const data = doc.data();
        // Remove metadata field 'savedAt' before returning to UI
        const { savedAt, ...newsItem } = data;
        items.push(newsItem as NewsItem);
      });

      return items;
    } catch (error) {
      console.error("[FirebaseDb] Failed to retrieve news items:", error);
      return [];
    }
  }
}
