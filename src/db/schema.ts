import { relations } from 'drizzle-orm';
import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name').default('Vinay Kumar'),
  role: text('role').default('user').notNull(), // 'user' | 'admin'
  plan: text('plan').default('free').notNull(), // 'free' | 'pro' | 'executive'
  linkedinUrl: text('linkedin_url'),
  resumesCount: integer('resumes_count').default(1).notNull(),
  avgAtsScore: integer('avg_ats_score').default(88).notNull(),
  lastActiveAt: timestamp('last_active_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const resumes = pgTable('resumes', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').notNull(),
  title: text('title').notNull(),
  templateId: text('template_id').default('nordic-slate').notNull(),
  language: text('language').default('en').notNull(),
  atsScore: integer('ats_score').default(88).notNull(),
  targetJobTitle: text('target_job_title').default('Data Analyst'),
  targetJobDescription: text('target_job_description'),
  data: jsonb('data').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const coverLetters = pgTable('cover_letters', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').notNull(),
  jobTitle: text('job_title').notNull(),
  companyName: text('company_name').notNull(),
  tone: text('tone').default('professional').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const supportTickets = pgTable('support_tickets', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  recipientEmail: text('recipient_email').default('atsfriendlyresumes.admin@gmail.com').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  status: text('status').default('open').notNull(), // 'open' | 'resolved'
  createdAt: timestamp('created_at').defaultNow(),
});

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  sessionId: text('session_id').notNull(),
  sender: text('sender').notNull(), // 'user' | 'agent'
  senderName: text('sender_name').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').notNull(),
  email: text('email').notNull(),
  plan: text('plan').notNull(),
  amountCents: integer('amount_cents').notNull(),
  currency: text('currency').default('USD').notNull(),
  provider: text('provider').default('stripe').notNull(),
  status: text('status').default('succeeded').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const analyticsEvents = pgTable('analytics_events', {
  id: serial('id').primaryKey(),
  eventType: text('event_type').notNull(), // 'resume_export_pdf' | 'resume_export_docx' | 'jd_scan' | 'template_select' | 'language_parse'
  templateId: text('template_id'),
  language: text('language'),
  atsScore: integer('ats_score'),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});
