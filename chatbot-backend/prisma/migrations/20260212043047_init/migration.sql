-- CreateEnum
CREATE TYPE "MessageFrom" AS ENUM ('CLIENT', 'BOT');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CLIENT');

-- CreateEnum
CREATE TYPE "PlanTypes" AS ENUM ('FREE', 'BASIC', 'PRO');

-- CreateEnum
CREATE TYPE "KnowledgeCategory" AS ENUM ('PRODUCT', 'SERVICE', 'POLICY', 'FAQ', 'COMPANY_INFO', 'CUSTOM');

-- CreateEnum
CREATE TYPE "CacheType" AS ENUM ('CACHE', 'MEMORY', 'HYBRID');

-- CreateEnum
CREATE TYPE "CacheSource" AS ENUM ('RAG', 'MEMORY', 'AI', 'HYBRID');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MemoryType" AS ENUM ('PREFERENCE', 'CONTEXT', 'FACT', 'PATTERN', 'INTENT');

-- CreateEnum
CREATE TYPE "MemorySource" AS ENUM ('CONVERSATION', 'MANUAL', 'AI_INFERRED', 'SYSTEM');

-- CreateEnum
CREATE TYPE "MessageContentType" AS ENUM ('TEXT', 'IMAGE', 'AUDIO', 'VIDEO', 'DOCUMENT', 'LOCATION', 'CONTACT');

-- CreateEnum
CREATE TYPE "MessageSource" AS ENUM ('WHATSAPP', 'WEB_CHAT', 'API', 'TEST', 'SYSTEM');

-- CreateEnum
CREATE TYPE "MacroCategory" AS ENUM ('TECNOLOGIA', 'SAUDE_E_BEM_ESTAR', 'EDUCACAO', 'CONSULTORIA_E_SERVICOS_PROFISSIONAIS', 'COMERCIO_E_VAREJO', 'INDUSTRIA_E_PRODUCAO', 'SERVICOS_OPERACIONAIS', 'FINANCEIRO', 'IMOBILIARIO', 'OUTROS');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "planType" "PlanTypes" NOT NULL DEFAULT 'FREE',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_plans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "planType" "PlanTypes" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "whatsappNumber" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION,
    "category" "MacroCategory" NOT NULL DEFAULT 'OUTROS',
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION,
    "category" "MacroCategory" NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "from" "MessageFrom" NOT NULL,
    "content" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_data" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "trainedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "limitMessages" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "planType" "PlanTypes" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "clientMessages" INTEGER NOT NULL DEFAULT 0,
    "botMessages" INTEGER NOT NULL DEFAULT 0,
    "responseRate" DOUBLE PRECISION,
    "averageResponseTime" DOUBLE PRECISION,
    "automaticResponses" INTEGER NOT NULL DEFAULT 0,
    "manualResponses" INTEGER NOT NULL DEFAULT 0,
    "hourlyDistribution" JSONB,
    "topKeywords" JSONB,
    "dailyVolume" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_bases" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "KnowledgeCategory" NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_bases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_chunks" (
    "id" TEXT NOT NULL,
    "knowledgeBaseId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" JSONB,
    "chunkIndex" INTEGER NOT NULL,
    "tokenCount" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contentHash" TEXT NOT NULL,

    CONSTRAINT "knowledge_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "clientPhone" TEXT,
    "clientName" TEXT,
    "sessionId" TEXT,
    "status" "ConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_caches" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "conversationId" TEXT,
    "queryEmbedding" JSONB,
    "queryText" TEXT,
    "response" TEXT,
    "cacheType" "CacheType" NOT NULL,
    "memoryType" "MemoryType",
    "key" TEXT,
    "value" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "similarityScore" DOUBLE PRECISION,
    "source" "CacheSource" NOT NULL,
    "context" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_caches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_logs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "conversationId" TEXT,
    "from" "MessageFrom" NOT NULL,
    "content" TEXT NOT NULL,
    "contentType" "MessageContentType" NOT NULL DEFAULT 'TEXT',
    "metadata" JSONB,
    "processingTime" DOUBLE PRECISION,
    "aiModel" TEXT,
    "aiTokens" INTEGER,
    "aiCost" DOUBLE PRECISION,
    "source" "MessageSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "user_plans_userId_key" ON "user_plans"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "plans_planType_key" ON "plans"("planType");

-- CreateIndex
CREATE INDEX "analytics_companyId_date_idx" ON "analytics"("companyId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_companyId_date_key" ON "analytics"("companyId", "date");

-- CreateIndex
CREATE INDEX "knowledge_bases_companyId_isActive_idx" ON "knowledge_bases"("companyId", "isActive");

-- CreateIndex
CREATE INDEX "knowledge_bases_companyId_category_idx" ON "knowledge_bases"("companyId", "category");

-- CreateIndex
CREATE INDEX "knowledge_chunks_companyId_knowledgeBaseId_idx" ON "knowledge_chunks"("companyId", "knowledgeBaseId");

-- CreateIndex
CREATE INDEX "knowledge_chunks_knowledgeBaseId_chunkIndex_idx" ON "knowledge_chunks"("knowledgeBaseId", "chunkIndex");

-- CreateIndex
CREATE INDEX "conversations_companyId_status_idx" ON "conversations"("companyId", "status");

-- CreateIndex
CREATE INDEX "conversations_companyId_startedAt_idx" ON "conversations"("companyId", "startedAt");

-- CreateIndex
CREATE INDEX "conversations_clientPhone_idx" ON "conversations"("clientPhone");

-- CreateIndex
CREATE INDEX "conversation_caches_companyId_cacheType_isActive_idx" ON "conversation_caches"("companyId", "cacheType", "isActive");

-- CreateIndex
CREATE INDEX "conversation_caches_companyId_source_idx" ON "conversation_caches"("companyId", "source");

-- CreateIndex
CREATE INDEX "conversation_caches_companyId_expiresAt_idx" ON "conversation_caches"("companyId", "expiresAt");

-- CreateIndex
CREATE INDEX "conversation_caches_conversationId_idx" ON "conversation_caches"("conversationId");

-- CreateIndex
CREATE INDEX "conversation_caches_queryText_idx" ON "conversation_caches"("queryText");

-- CreateIndex
CREATE INDEX "conversation_caches_key_idx" ON "conversation_caches"("key");

-- CreateIndex
CREATE INDEX "message_logs_companyId_createdAt_idx" ON "message_logs"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "message_logs_conversationId_createdAt_idx" ON "message_logs"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "message_logs_companyId_from_idx" ON "message_logs"("companyId", "from");

-- CreateIndex
CREATE INDEX "message_logs_source_idx" ON "message_logs"("source");

-- AddForeignKey
ALTER TABLE "user_plans" ADD CONSTRAINT "user_plans_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_plans" ADD CONSTRAINT "user_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_data" ADD CONSTRAINT "training_data_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_bases" ADD CONSTRAINT "knowledge_bases_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_knowledgeBaseId_fkey" FOREIGN KEY ("knowledgeBaseId") REFERENCES "knowledge_bases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_caches" ADD CONSTRAINT "conversation_caches_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_caches" ADD CONSTRAINT "conversation_caches_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_logs" ADD CONSTRAINT "message_logs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_logs" ADD CONSTRAINT "message_logs_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
