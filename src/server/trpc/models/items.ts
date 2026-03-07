import { z } from "zod"

export const ItemTypeEnum      = z.enum(["NOTE", "LINK", "RESOURCE", "PASSWORD"])
export const ResourceTypeEnum  = z.enum(["ARTICLE", "PAPER", "BOOK", "VIDEO", "PODCAST", "OTHER"])

export const CreateNoteSchema = z.object({
  type:     z.literal("NOTE"),
  title:    z.string().min(1),
  content:  z.string().min(1),
  preview:  z.string().optional(),
  isPinned: z.boolean().optional().default(false),
  tags:     z.array(z.string()).optional(),
})

export const CreateLinkSchema = z.object({
  type:        z.literal("LINK"),
  title:       z.string().min(1),
  url:         z.string().min(1),
  description: z.string().optional(),
  tags:        z.array(z.string()).optional(),
  faviconUrl:  z.string().optional(),
  siteName:    z.string().optional(),
})

export const CreateResourceSchema = z.object({
  type:         z.literal("RESOURCE"),
  title:        z.string().min(1),
  content:      z.string().optional(),
  sourceUrl:    z.string().optional(),
  author:       z.string().optional(),
  tags:         z.array(z.string()).optional(),
  resourceType: ResourceTypeEnum.default("ARTICLE"),
  publishedAt:  z.coerce.date().optional(),
})

export const CreatePasswordSchema = z.object({
  type:             z.literal("PASSWORD"),
  title:            z.string().min(1),
  username:         z.string().min(1),
  password:         z.string().min(1),
  url:              z.string().optional(),
  notes:            z.string().optional(),
  totpSecret:       z.string().optional(),
  passwordStrength: z.number().int().min(0).max(100).optional(),
})

export const CreateItemSchema = z.discriminatedUnion("type", [
  CreateNoteSchema,
  CreateLinkSchema,
  CreateResourceSchema,
  CreatePasswordSchema,
])

export const UpdateNoteSchema = z.object({
  id:       z.string().uuid(),
  type:     z.literal("NOTE"),
  title:    z.string().min(1).optional(),
  content:  z.string().optional(),
  preview:  z.string().optional(),
  isPinned: z.boolean().optional(),
  tags:     z.array(z.string()).optional(),
})

export const UpdateLinkSchema = z.object({
  id:          z.string().uuid(),
  type:        z.literal("LINK"),
  title:       z.string().min(1).optional(),
  url:         z.string().optional(),
  description: z.string().optional(),
  tags:        z.array(z.string()).optional(),
  faviconUrl:  z.string().optional(),
  siteName:    z.string().optional(),
})

export const UpdateResourceSchema = z.object({
  id:           z.string().uuid(),
  type:         z.literal("RESOURCE"),
  title:        z.string().min(1).optional(),
  content:      z.string().optional(),
  sourceUrl:    z.string().optional(),
  author:       z.string().optional(),
  tags:         z.array(z.string()).optional(),
  resourceType: ResourceTypeEnum.optional(),
  publishedAt:  z.coerce.date().optional(),
})

export const UpdatePasswordSchema = z.object({
  id:               z.string().uuid(),
  type:             z.literal("PASSWORD"),
  title:            z.string().min(1).optional(),
  username:         z.string().optional(),
  password:         z.string().optional(),
  url:              z.string().optional(),
  notes:            z.string().optional(),
  totpSecret:       z.string().optional(),
  passwordStrength: z.number().int().min(0).max(100).optional(),
})

export const UpdateItemSchema = z.discriminatedUnion("type", [
  UpdateNoteSchema,
  UpdateLinkSchema,
  UpdateResourceSchema,
  UpdatePasswordSchema,
])


export const ListItemsInput = z.object({
  type:           ItemTypeEnum.optional(),
  includeDeleted: z.boolean().optional().default(false),
  cursor:         z.string().uuid().optional(),
  limit:          z.number().int().min(1).max(100).default(20),
})

export const GetItemInput     = z.object({ id: z.string().uuid() })
export const DeleteItemInput  = z.object({ id: z.string().uuid() })
export const RestoreItemInput = z.object({ id: z.string().uuid() })

export const LinkItemsInput = z.object({
  sourceId:      z.string().uuid(),
  targetId:      z.string().uuid(),
  annotationEnc: z.string().optional(),
})

export const UnlinkItemsInput = z.object({
  sourceId: z.string().uuid(),
  targetId: z.string().uuid(),
})

export type CreateItemInput    = z.infer<typeof CreateItemSchema>
export type UpdateItemInput    = z.infer<typeof UpdateItemSchema>
export type ListItemsInputType = z.infer<typeof ListItemsInput>