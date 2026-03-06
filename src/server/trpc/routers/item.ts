import { prisma } from "@/src/lib/prisma";
import {
  CreateItemSchema,
  GetItemInput,
  GetItemOutput,
  ListItemsInput,
  ListItemsOutput,
  MutationSuccessOutput,
} from "../models/items";
import { protectedProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";

export const itemRouter = router({
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
                previewEnc:  input.preview  ?? null,
                tagsEnc:     input.tags     ? JSON.stringify(input.tags) : null,
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
                contentEnc:   input.content   ?? "", 
                sourceUrlEnc: input.sourceUrl ?? null,
                authorEnc:    input.author    ?? null,
                tagsEnc:      input.tags      ? JSON.stringify(input.tags) : null,
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

          throw new TRPCError({
            code:    "BAD_REQUEST",
            message: "Invalid item type",
          });
        });

        return {
          success: true,
          id:      result.id,
        };

      } catch (err) {
        if (err instanceof TRPCError) throw err;

        console.error("createItem error:", err);
        throw new TRPCError({
          code:    "INTERNAL_SERVER_ERROR",
          message: "Failed to create item",
        });
      }
    }),
});