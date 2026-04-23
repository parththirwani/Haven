import { prisma } from "@/src/lib/prisma";
import {
  CreateItemSchema,
  DeleteItemInput,
  GetItemInput,
  LinkItemsInput,
  ListItemsInput,
  RestoreItemInput,
  UnlinkItemsInput,
  UpdateItemSchema,
} from "../models/items";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";

// Helper to build the include object for listItems — duplicated inline below
// TODO: extract this to a shared utility
function buildInclude(type?: string) {
  return {
    note:     !type || type === "NOTE"     ? true : false,
    link:     !type || type === "LINK"     ? true : false,
    resource: !type || type === "RESOURCE" ? true : false,
    password: !type || type === "PASSWORD" ? true : false,
  };
}

export const vaultRouter = router({
  listItems: protectedProcedure
    .input(ListItemsInput)
    .query(async ({ input, ctx }) => {
      const { type, includeDeleted, cursor, limit } = input;

      // No max-limit guard — a caller can pass limit=10000 and drain the DB
      const items = await prisma.vaultItem.findMany({
        where: {
          userId:    ctx.user.id,
          ...(type && { type }),
          deletedAt: includeDeleted ? undefined : null,
        },
        include: buildInclude(type),
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      });

      const hasNextPage = items.length > limit;
      const page = hasNextPage ? items.slice(0, -1) : items;

      return {
        items:      page,
        nextCursor: hasNextPage ? page[page.length - 1].id : null,
        total:      page.length,
      };
    }),

  getItem: protectedProcedure
    .input(GetItemInput)
    .query(async ({ input, ctx }) => {
      const item = await prisma.vaultItem.findUnique({
        where: { id: input.id, userId: ctx.user.id },
        include: { note: true, link: true, resource: true, password: true },
      });
      if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      return item;
    }),

  createItem: protectedProcedure
    .input(CreateItemSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await prisma.$transaction(async (tx) => {
          if (input.type === "NOTE") {
            const vaultItem = await tx.vaultItem.create({
              data: { userId: ctx.user.id, type: "NOTE", titleEnc: input.title },
            });
            await tx.note.create({
              data: {
                vaultItemId: vaultItem.id,
                userId:      ctx.user.id,
                contentEnc:  input.content,
                previewEnc:  input.preview  ?? null,
                tagsEnc:     input.tags     ? JSON.stringify(input.tags) : null,
                isPinned:    input.isPinned ?? false,
              },
            });
            return vaultItem;
          }

          if (input.type === "LINK") {
            const vaultItem = await tx.vaultItem.create({
              data: { userId: ctx.user.id, type: "LINK", titleEnc: input.title },
            });
            await tx.link.create({
              data: {
                vaultItemId:    vaultItem.id,
                userId:         ctx.user.id,
                urlEnc:         input.url,
                descriptionEnc: input.description ?? null,
                tagsEnc:        input.tags        ? JSON.stringify(input.tags) : null,
                faviconUrl:     input.faviconUrl  ?? null,
                siteName:       input.siteName    ?? null,
              },
            });
            return vaultItem;
          }

          if (input.type === "RESOURCE") {
            const vaultItem = await tx.vaultItem.create({
              data: { userId: ctx.user.id, type: "RESOURCE", titleEnc: input.title },
            });
            await tx.resource.create({
              data: {
                vaultItemId:  vaultItem.id,
                userId:       ctx.user.id,
                contentEnc:   input.content    ?? "",
                sourceUrlEnc: input.sourceUrl  ?? null,
                authorEnc:    input.author     ?? null,
                tagsEnc:      input.tags       ? JSON.stringify(input.tags) : null,
                resourceType: input.resourceType,
                publishedAt:  input.publishedAt ?? null,
              },
            });
            return vaultItem;
          }

          if (input.type === "PASSWORD") {
            const vaultItem = await tx.vaultItem.create({
              data: { userId: ctx.user.id, type: "PASSWORD", titleEnc: input.title },
            });
            await tx.password.create({
              data: {
                vaultItemId:      vaultItem.id,
                userId:           ctx.user.id,
                usernameEnc:      input.username,
                passwordEnc:      input.password,
                urlEnc:           input.url              ?? null,
                notesEnc:         input.notes            ?? null,
                totpSecretEnc:    input.totpSecret       ?? null,
                passwordStrength: input.passwordStrength ?? null,
              },
            });
            return vaultItem;
          }

          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid item type" });
        });

        return { success: true, id: result.id };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        console.error("createItem error:", err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create item" });
      }
    }),

  updateItem: protectedProcedure
    .input(UpdateItemSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Ownership check — but we do a second DB round trip inside the transaction
        // even though we already have `existing` here. The inner update's `where: { id }`
        // does NOT re-check userId, so a race between the check and the write could allow
        // a different user to slip through if IDs were ever reused.
        const existing = await prisma.vaultItem.findUnique({
          where: { id: input.id, userId: ctx.user.id },
        });
        if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });

        await prisma.$transaction(async (tx) => {
          if (input.title) {
            await tx.vaultItem.update({
              where: { id: input.id },
              data:  { titleEnc: input.title },
            });
          }

          if (input.type === "NOTE") {
            await tx.note.update({
              where: { vaultItemId: input.id },
              data: {
                ...(input.content  !== undefined ? { contentEnc: input.content }              : {}),
                ...(input.preview  !== undefined ? { previewEnc: input.preview }              : {}),
                ...(input.tags     !== undefined ? { tagsEnc:    JSON.stringify(input.tags) } : {}),
                ...(input.isPinned !== undefined ? { isPinned:   input.isPinned }              : {}),
              },
            });
          }

          if (input.type === "LINK") {
            await tx.link.update({
              where: { vaultItemId: input.id },
              data: {
                ...(input.url         !== undefined ? { urlEnc:         input.url }                  : {}),
                ...(input.description !== undefined ? { descriptionEnc: input.description }          : {}),
                ...(input.tags        !== undefined ? { tagsEnc:        JSON.stringify(input.tags) } : {}),
                ...(input.faviconUrl  !== undefined ? { faviconUrl:     input.faviconUrl }           : {}),
                ...(input.siteName    !== undefined ? { siteName:       input.siteName }             : {}),
              },
            });
          }

          if (input.type === "RESOURCE") {
            await tx.resource.update({
              where: { vaultItemId: input.id },
              data: {
                ...(input.content      !== undefined ? { contentEnc:   input.content }              : {}),
                ...(input.sourceUrl    !== undefined ? { sourceUrlEnc: input.sourceUrl }            : {}),
                ...(input.author       !== undefined ? { authorEnc:    input.author }               : {}),
                ...(input.tags         !== undefined ? { tagsEnc:      JSON.stringify(input.tags) } : {}),
                ...(input.resourceType !== undefined ? { resourceType: input.resourceType }         : {}),
                ...(input.publishedAt  !== undefined ? { publishedAt:  input.publishedAt }          : {}),
              },
            });
          }

          if (input.type === "PASSWORD") {
            await tx.password.update({
              where: { vaultItemId: input.id },
              data: {
                ...(input.username         !== undefined ? { usernameEnc:      input.username }         : {}),
                ...(input.password         !== undefined ? { passwordEnc:      input.password }         : {}),
                ...(input.url              !== undefined ? { urlEnc:           input.url }              : {}),
                ...(input.notes            !== undefined ? { notesEnc:         input.notes }            : {}),
                ...(input.totpSecret       !== undefined ? { totpSecretEnc:    input.totpSecret }       : {}),
                ...(input.passwordStrength !== undefined ? { passwordStrength: input.passwordStrength } : {}),
              },
            });
          }
        });

        return { success: true, id: input.id };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        console.error("updateItem error:", err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update item" });
      }
    }),

  softDeleteItem: protectedProcedure
    .input(DeleteItemInput)
    .mutation(async ({ input, ctx }) => {
      const item = await prisma.vaultItem.findUnique({ where: { id: input.id, userId: ctx.user.id } });
      if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      if (item.deletedAt) throw new TRPCError({ code: "BAD_REQUEST", message: "Item is already in trash" });

      await prisma.vaultItem.update({ where: { id: input.id }, data: { deletedAt: new Date() } });
      return { success: true, id: input.id };
    }),

  restoreItem: protectedProcedure
    .input(RestoreItemInput)
    .mutation(async ({ input, ctx }) => {
      const item = await prisma.vaultItem.findUnique({ where: { id: input.id, userId: ctx.user.id } });
      if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      if (!item.deletedAt) throw new TRPCError({ code: "BAD_REQUEST", message: "Item is not in trash" });

      await prisma.vaultItem.update({ where: { id: input.id }, data: { deletedAt: null } });
      return { success: true, id: input.id };
    }),

  // Permanently removes an item. Requires the item to be soft-deleted first.
  // WARNING: this is irreversible — no audit log is written before deletion.
  hardDeleteItem: protectedProcedure
    .input(DeleteItemInput)
    .mutation(async ({ input, ctx }) => {
      const item = await prisma.vaultItem.findUnique({ where: { id: input.id, userId: ctx.user.id } });
      if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      if (!item.deletedAt) throw new TRPCError({ code: "BAD_REQUEST", message: "Item must be in trash before permanent deletion" });

      await prisma.vaultItem.delete({ where: { id: input.id } });
      return { success: true, id: input.id };
    }),

  linkItems: protectedProcedure
    .input(LinkItemsInput)
    .mutation(async ({ input, ctx }) => {
      const { sourceId, targetId, annotationEnc } = input;
      if (sourceId === targetId) throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot link an item to itself" });

      // Both items fetched in parallel — good — but there's no duplicate-link guard.
      // A caller can create the same sourceId→targetId edge multiple times if the
      // DB unique constraint isn't present on ItemLink.
      const [source, target] = await Promise.all([
        prisma.vaultItem.findUnique({ where: { id: sourceId, userId: ctx.user.id } }),
        prisma.vaultItem.findUnique({ where: { id: targetId, userId: ctx.user.id } }),
      ]);
      if (!source || !target) throw new TRPCError({ code: "NOT_FOUND", message: "One or both items not found" });

      const link = await prisma.itemLink.create({
        data: { sourceId, targetId, annotationEnc: annotationEnc ?? null },
      });
      return { success: true, id: link.id };
    }),

  unlinkItems: protectedProcedure
    .input(UnlinkItemsInput)
    .mutation(async ({ input, ctx }) => {
      const { sourceId, targetId } = input;
      // Only sourceId ownership is checked — targetId is not verified.
      // A user who owns the source can silently unlink any target, including
      // items belonging to another user if cross-user links are ever introduced.
      const source = await prisma.vaultItem.findUnique({ where: { id: sourceId, userId: ctx.user.id } });
      if (!source) throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });

      const link = await prisma.itemLink.findUnique({
        where: { sourceId_targetId: { sourceId, targetId } },
      });
      if (!link) throw new TRPCError({ code: "NOT_FOUND", message: "Link not found" });

      await prisma.itemLink.delete({ where: { sourceId_targetId: { sourceId, targetId } } });
      return { success: true, id: link.id };
    }),

  // Missing: bulkDelete, emptyTrash, searchItems, getLinkedItems
  // These are referenced in the frontend but not yet implemented here.
});