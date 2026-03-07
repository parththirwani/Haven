import { prisma } from "@/src/lib/prisma";
import {
  CreateItemSchema,
  DeleteItemInput,
  GetItemInput,
  GetItemOutput,
  LinkItemsInput,
  ListItemsInput,
  ListItemsOutput,
  MutationSuccessOutput,
  RestoreItemInput,
  UnlinkItemsInput,
  UpdateItemSchema,
} from "../models/items";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";

export const vaultRouter = router({
  listItems: protectedProcedure
    .input(ListItemsInput)
    .output(ListItemsOutput)
    .query(async ({ input, ctx }) => {
      const { type, includeDeleted, cursor, limit } = input;

      const items = await prisma.vaultItem.findMany({
        where: {
          userId:    ctx.user.id,
          ...(type && { type }),
          deletedAt: includeDeleted ? undefined : null,
        },
        include: {
          note:     type === "NOTE"     ? true : false,
          link:     type === "LINK"     ? true : false,
          resource: type === "RESOURCE" ? true : false,
          password: type === "PASSWORD" ? true : false,
        },
        orderBy: { createdAt: "desc" },
        take:    limit + 1,
        ...(cursor && {
          cursor: { id: cursor },
          skip:   1,
        }),
      });

      const hasNextPage = items.length > limit;
      const page        = hasNextPage ? items.slice(0, -1) : items;

      return {
        items:      page,
        nextCursor: hasNextPage ? page[page.length - 1].id : null,
        total:      page.length,
      };
    }),

  getItem: protectedProcedure
    .input(GetItemInput)
    .output(GetItemOutput)
    .query(async ({ input, ctx }) => {
      const { id } = input;

      const item = await prisma.vaultItem.findUnique({
        where: { id, userId: ctx.user.id },
        include: {
          note:     true,
          link:     true,
          resource: true,
          password: true,
        },
      });

      if (!item) {
        throw new TRPCError({
          code:    "NOT_FOUND",
          message: "Item not found",
        });
      }

      return item;
    }),

  createItem: protectedProcedure
    .input(CreateItemSchema)
    .output(MutationSuccessOutput)
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await prisma.$transaction(async (tx) => {
          if (input.type === "NOTE") {
            const vaultItem = await tx.vaultItem.create({
              data: {
                userId:   ctx.user.id,
                type:     "NOTE",
                titleEnc: input.title,
              },
            });
            await tx.note.create({
              data: {
                vaultItemId: vaultItem.id,
                userId:      ctx.user.id,
                contentEnc:  input.content,
                previewEnc:  input.preview ?? null,
                tagsEnc:     input.tags    ? JSON.stringify(input.tags) : null,
                isPinned:    input.isPinned ?? false,
              },
            });
            return vaultItem;
          }

          if (input.type === "LINK") {
            const vaultItem = await tx.vaultItem.create({
              data: {
                userId:   ctx.user.id,
                type:     "LINK",
                titleEnc: input.title,
              },
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
              data: {
                userId:   ctx.user.id,
                type:     "RESOURCE",
                titleEnc: input.title,
              },
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
              data: {
                userId:   ctx.user.id,
                type:     "PASSWORD",
                titleEnc: input.title,
              },
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
    .output(MutationSuccessOutput)
    .mutation(async ({ input, ctx }) => {
      try {
        const existing = await prisma.vaultItem.findUnique({
          where: { id: input.id, userId: ctx.user.id },
        });

        if (!existing) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
        }

        await prisma.$transaction(async (tx) => {
          if (input.title) {
            await tx.vaultItem.update({
              where: { id: input.id },
              data:  { titleEnc: input.title },
            });
          }

          if (existing.type === "NOTE") {
            await tx.note.update({
              where: { vaultItemId: input.id },
              data: {
                ...("content"  in input && input.content  ? { contentEnc: input.content }               : {}),
                ...("preview"  in input && input.preview  ? { previewEnc: input.preview }               : {}),
                ...("tags"     in input && input.tags     ? { tagsEnc:    JSON.stringify(input.tags) }  : {}),
                ...("isPinned" in input && input.isPinned !== undefined ? { isPinned: input.isPinned }  : {}),
              },
            });
          }

          if (existing.type === "LINK") {
            await tx.link.update({
              where: { vaultItemId: input.id },
              data: {
                ...("url"         in input && input.url         ? { urlEnc:         input.url }                      : {}),
                ...("description" in input && input.description ? { descriptionEnc: input.description }              : {}),
                ...("tags"        in input && input.tags        ? { tagsEnc:        JSON.stringify(input.tags) }     : {}),
                ...("faviconUrl"  in input && input.faviconUrl  ? { faviconUrl:     input.faviconUrl }               : {}),
                ...("siteName"    in input && input.siteName    ? { siteName:       input.siteName }                 : {}),
              },
            });
          }

          if (existing.type === "RESOURCE") {
            await tx.resource.update({
              where: { vaultItemId: input.id },
              data: {
                ...("content"      in input && input.content      ? { contentEnc:   input.content }                  : {}),
                ...("sourceUrl"    in input && input.sourceUrl    ? { sourceUrlEnc: input.sourceUrl }                : {}),
                ...("author"       in input && input.author       ? { authorEnc:    input.author }                   : {}),
                ...("tags"         in input && input.tags         ? { tagsEnc:      JSON.stringify(input.tags) }     : {}),
                ...("resourceType" in input && input.resourceType ? { resourceType: input.resourceType }             : {}),
                ...("publishedAt"  in input && input.publishedAt  ? { publishedAt:  input.publishedAt }              : {}),
              },
            });
          }

          if (existing.type === "PASSWORD") {
            await tx.password.update({
              where: { vaultItemId: input.id },
              data: {
                ...("username"         in input && input.username         ? { usernameEnc:      input.username }         : {}),
                ...("password"         in input && input.password         ? { passwordEnc:      input.password }         : {}),
                ...("url"              in input && input.url              ? { urlEnc:           input.url }              : {}),
                ...("notes"            in input && input.notes            ? { notesEnc:         input.notes }            : {}),
                ...("totpSecret"       in input && input.totpSecret       ? { totpSecretEnc:    input.totpSecret }       : {}),
                ...("passwordStrength" in input && input.passwordStrength !== undefined ? { passwordStrength: input.passwordStrength } : {}),
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
    .output(MutationSuccessOutput)
    .mutation(async ({ input, ctx }) => {
      try {
        const item = await prisma.vaultItem.findUnique({
          where: { id: input.id, userId: ctx.user.id },
        });

        if (!item) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
        }

        if (item.deletedAt) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Item is already in trash" });
        }

        await prisma.vaultItem.update({
          where: { id: input.id },
          data:  { deletedAt: new Date() },
        });

        return { success: true, id: input.id };

      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete item" });
      }
    }),

  restoreItem: protectedProcedure
    .input(RestoreItemInput)
    .output(MutationSuccessOutput)
    .mutation(async ({ input, ctx }) => {
      try {
        const item = await prisma.vaultItem.findUnique({
          where: { id: input.id, userId: ctx.user.id },
        });

        if (!item) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
        }

        if (!item.deletedAt) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Item is not in trash" });
        }

        await prisma.vaultItem.update({
          where: { id: input.id },
          data:  { deletedAt: null },
        });

        return { success: true, id: input.id };

      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to restore item" });
      }
    }),

  hardDeleteItem: protectedProcedure
    .input(DeleteItemInput)
    .output(MutationSuccessOutput)
    .mutation(async ({ input, ctx }) => {
      try {
        const item = await prisma.vaultItem.findUnique({
          where: { id: input.id, userId: ctx.user.id },
        });

        if (!item) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
        }

        if (!item.deletedAt) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Item must be in trash before permanent deletion" });
        }

        await prisma.vaultItem.delete({
          where: { id: input.id },
        });

        return { success: true, id: input.id };

      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to permanently delete item" });
      }
    }),

  linkItems: protectedProcedure
    .input(LinkItemsInput)
    .output(MutationSuccessOutput)
    .mutation(async ({ input, ctx }) => {
      try {
        const { sourceId, targetId, annotationEnc } = input;

        if (sourceId === targetId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot link an item to itself" });
        }

        const [source, target] = await Promise.all([
          prisma.vaultItem.findUnique({ where: { id: sourceId, userId: ctx.user.id } }),
          prisma.vaultItem.findUnique({ where: { id: targetId, userId: ctx.user.id } }),
        ]);

        if (!source || !target) {
          throw new TRPCError({ code: "NOT_FOUND", message: "One or both items not found" });
        }

        const link = await prisma.itemLink.create({
          data: { sourceId, targetId, annotationEnc: annotationEnc ?? null },
        });

        return { success: true, id: link.id };

      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "CONFLICT", message: "Items are already linked" });
      }
    }),

  unlinkItems: protectedProcedure
    .input(UnlinkItemsInput)
    .output(MutationSuccessOutput)
    .mutation(async ({ input, ctx }) => {
      try {
        const { sourceId, targetId } = input;

        const source = await prisma.vaultItem.findUnique({
          where: { id: sourceId, userId: ctx.user.id },
        });

        if (!source) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
        }

        const link = await prisma.itemLink.findUnique({
          where: { sourceId_targetId: { sourceId, targetId } },
        });

        if (!link) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Link not found" });
        }

        await prisma.itemLink.delete({
          where: { sourceId_targetId: { sourceId, targetId } },
        });

        return { success: true, id: link.id };

      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to unlink items" });
      }
    }),
});