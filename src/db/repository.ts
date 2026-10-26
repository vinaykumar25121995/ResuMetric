import { desc, eq } from 'drizzle-orm';
import { db } from './index.ts';
import {
  analyticsEvents,
  chatMessages,
  coverLetters,
  payments,
  resumes,
  supportTickets,
  users,
} from './schema.ts';

export async function getOrCreateUser(
  uid: string,
  email: string,
  name = 'Vinay Kumar',
  linkedinUrl?: string
) {
  try {
    const role = email.toLowerCase() === 'vinay22y95@gmail.com' ? 'admin' : 'user';
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        name,
        role,
        linkedinUrl: linkedinUrl || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          name,
          lastActiveAt: new Date(),
          ...(linkedinUrl ? { linkedinUrl } : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed in getOrCreateUser:', error);
    throw new Error('Failed to synchronize user profile.', { cause: error });
  }
}

export async function getAllUsers() {
  try {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  } catch (error) {
    console.error('Database query failed in getAllUsers:', error);
    throw new Error('Failed to load users.', { cause: error });
  }
}

export async function updateUserRoleAndPlan(uid: string, role: string, plan: string) {
  try {
    const result = await db
      .update(users)
      .set({ role, plan, lastActiveAt: new Date() })
      .where(eq(users.uid, uid))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in updateUserRoleAndPlan:', error);
    throw new Error('Failed to update user account.', { cause: error });
  }
}

export async function saveUserResume(params: {
  userUid: string;
  title: string;
  templateId: string;
  language: string;
  atsScore: number;
  targetJobTitle: string;
  targetJobDescription?: string;
  data: unknown;
}) {
  try {
    const existing = await db
      .select()
      .from(resumes)
      .where(eq(resumes.userUid, params.userUid));

    if (existing.length > 0) {
      const updated = await db
        .update(resumes)
        .set({
          title: params.title,
          templateId: params.templateId,
          language: params.language,
          atsScore: params.atsScore,
          targetJobTitle: params.targetJobTitle,
          targetJobDescription: params.targetJobDescription || null,
          data: params.data,
          updatedAt: new Date(),
        })
        .where(eq(resumes.id, existing[0].id))
        .returning();
      return updated[0];
    }

    const inserted = await db
      .insert(resumes)
      .values({
        userUid: params.userUid,
        title: params.title,
        templateId: params.templateId,
        language: params.language,
        atsScore: params.atsScore,
        targetJobTitle: params.targetJobTitle,
        targetJobDescription: params.targetJobDescription || null,
        data: params.data,
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Database query failed in saveUserResume:', error);
    throw new Error('Failed to save resume to database.', { cause: error });
  }
}

export async function saveCoverLetterRecord(params: {
  userUid: string;
  jobTitle: string;
  companyName: string;
  tone: string;
  content: string;
}) {
  try {
    const result = await db.insert(coverLetters).values(params).returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in saveCoverLetterRecord:', error);
    throw new Error('Failed to save cover letter.', { cause: error });
  }
}

export async function createSupportTicket(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  try {
    const result = await db
      .insert(supportTickets)
      .values({
        name: params.name,
        email: params.email,
        recipientEmail: 'atsfriendlyresumes.admin@gmail.com',
        subject: params.subject,
        message: params.message,
        status: 'open',
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in createSupportTicket:', error);
    throw new Error('Failed to submit support ticket.', { cause: error });
  }
}

export async function getAllSupportTickets() {
  try {
    return await db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
  } catch (error) {
    console.error('Database query failed in getAllSupportTickets:', error);
    throw new Error('Failed to fetch support tickets.', { cause: error });
  }
}

export async function updateSupportTicketStatus(id: number, status: string) {
  try {
    const result = await db
      .update(supportTickets)
      .set({ status })
      .where(eq(supportTickets.id, id))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in updateSupportTicketStatus:', error);
    throw new Error('Failed to update support ticket status.', { cause: error });
  }
}

export async function getChatHistory(sessionId = 'default-session') {
  try {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt);
  } catch (error) {
    console.error('Database query failed in getChatHistory:', error);
    throw new Error('Failed to load live chat history.', { cause: error });
  }
}

export async function appendChatMessage(params: {
  sessionId: string;
  sender: string;
  senderName: string;
  message: string;
}) {
  try {
    const result = await db.insert(chatMessages).values(params).returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in appendChatMessage:', error);
    throw new Error('Failed to save chat message.', { cause: error });
  }
}

export async function recordPaymentTransaction(params: {
  userUid: string;
  email: string;
  plan: string;
  amountCents: number;
  currency: string;
  provider: string;
}) {
  try {
    const paymentResult = await db
      .insert(payments)
      .values({
        ...params,
        status: 'succeeded',
      })
      .returning();

    await db
      .update(users)
      .set({ plan: params.plan, lastActiveAt: new Date() })
      .where(eq(users.uid, params.userUid));

    return paymentResult[0];
  } catch (error) {
    console.error('Database query failed in recordPaymentTransaction:', error);
    throw new Error('Failed to record payment transaction.', { cause: error });
  }
}

export async function getAllPayments() {
  try {
    return await db.select().from(payments).orderBy(desc(payments.createdAt));
  } catch (error) {
    console.error('Database query failed in getAllPayments:', error);
    throw new Error('Failed to load payment history.', { cause: error });
  }
}

export async function recordAnalyticsEvent(params: {
  eventType: string;
  templateId?: string;
  language?: string;
  atsScore?: number;
  metadata?: string;
}) {
  try {
    const result = await db.insert(analyticsEvents).values(params).returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed in recordAnalyticsEvent:', error);
    throw new Error('Failed to log analytics event.', { cause: error });
  }
}

export async function getRecentAnalyticsEvents() {
  try {
    return await db.select().from(analyticsEvents).orderBy(desc(analyticsEvents.createdAt));
  } catch (error) {
    console.error('Database query failed in getRecentAnalyticsEvents:', error);
    throw new Error('Failed to fetch analytics events.', { cause: error });
  }
}
