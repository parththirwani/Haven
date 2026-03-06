import { z } from "zod"

export const ItemTypeEnum = z.enum(["NOTE", "LINK", "RESOURCE", "PASSWORD"])
export const ResourceTypeEnum = z.enum(["ARTICLE", "PAPER", "BOOK", "VIDEO", "PODCAST", "OTHER"])

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
  url:         z.string().url(),
  description: z.string().optional(),
  tags:        z.array(z.string()).optional(),
  faviconUrl:  z.string().url().optional(),
  siteName:    z.string().optional(),
})

export const CreateResourceSchema = z.object({
  type:         z.literal("RESOURCE"),
  title:        z.string().min(1),
  content:      z.string().optional(),
  sourceUrl:    z.string().url().optional(),
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
  url:              z.string().url().optional(),
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


export const UpdateNoteSchema = CreateNoteSchema
  .omit({ type: true })
  .partial()
  .extend({ id: z.string().uuid() })

export const UpdateLinkSchema = CreateLinkSchema
  .omit({ type: true })
  .partial()
  .extend({ id: z.string().uuid() })

export const UpdateResourceSchema = CreateResourceSchema
  .omit({ type: true })
  .partial()
  .extend({ id: z.string().uuid() })

export const UpdatePasswordSchema = CreatePasswordSchema
  .omit({ type: true })
  .partial()
  .extend({ id: z.string().uuid() })

export const UpdateItemSchema = z.object({ id: z.string().uuid() }).and(
  z.union([
    UpdateNoteSchema,
    UpdateLinkSchema,
    UpdateResourceSchema,
    UpdatePasswordSchema,
  ])
)

const NoteSubrecord = z.object({
  id:         z.string().uuid(),
  titleEnc:   z.string().nullable(),
  contentEnc: z.string(),
  previewEnc: z.string().nullable(),
  tagsEnc:    z.string().nullable(),
  isPinned:   z.boolean(),
  wordCount:  z.number().int().nullable(),
}).nullable()

const LinkSubrecord = z.object({
  id:             z.string().uuid(),
  urlEnc:         z.string(),
  descriptionEnc: z.string().nullable(),
  tagsEnc:        z.string().nullable(),
  faviconUrl:     z.string().nullable(),
  siteName:       z.string().nullable(),
}).nullable()

const ResourceSubrecord = z.object({
  id:           z.string().uuid(),
  titleEnc:     z.string().nullable(),
  contentEnc:   z.string(),
  sourceUrlEnc: z.string().nullable(),
  authorEnc:    z.string().nullable(),
  tagsEnc:      z.string().nullable(),
  resourceType: ResourceTypeEnum,
  publishedAt:  z.date().nullable(),
}).nullable()

const PasswordSubrecord = z.object({
  id:               z.string().uuid(),
  usernameEnc:      z.string(),
  passwordEnc:      z.string(),
  urlEnc:           z.string().nullable(),
  notesEnc:         z.string().nullable(),
  totpSecretEnc:    z.string().nullable(),
  passwordStrength: z.number().int().nullable(),
  lastUsedAt:       z.date().nullable(),
}).nullable()

export const VaultItemOutput = z.object({
  id:        z.string().uuid(),
  type:      ItemTypeEnum,
  titleEnc:  z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  note:      NoteSubrecord,
  link:      LinkSubrecord,
  resource:  ResourceSubrecord,
  password:  PasswordSubrecord,
})

export const ListItemsInput = z.object({
  type:           ItemTypeEnum.optional(),
  includeDeleted: z.boolean().optional().default(false),
  cursor:         z.string().uuid().optional(),
  limit:          z.number().int().min(1).max(100).default(20),
})

export const ListItemsOutput = z.object({
  items:      z.array(VaultItemOutput),
  nextCursor: z.string().uuid().nullable(),
  total:      z.number().int(),
})

export const GetItemInput  = z.object({ id: z.string().uuid()})
export const GetItemOutput = VaultItemOutput

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


export const MutationSuccessOutput = z.object({
  success: z.boolean(),
  id:      z.string().uuid(),
})

export type CreateItemInput    = z.infer<typeof CreateItemSchema>
export type UpdateItemInput    = z.infer<typeof UpdateItemSchema>
export type ListItemsInputType = z.infer<typeof ListItemsInput>
export type VaultItemOutputType = z.infer<typeof VaultItemOutput>