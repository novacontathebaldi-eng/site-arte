
import { z } from 'zod';
import { ProductCategory } from '../../types/product';

const translationSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  description: z.string(),
  material_label: z.string().default(''), // Made required (with default) to match ProductTranslation interface
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});

export const productSchema = z.object({
  sku: z.string().min(1, "SKU é obrigatório"),
  slug: z.string().min(1, "URL amigável é obrigatória").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Formato inválido (use letras-minusculas-hifens)"),
  
  price: z.coerce.number().min(0, "O preço deve ser positivo"),
  stock: z.coerce.number().int().min(0),
  category: z.nativeEnum(ProductCategory),
  status: z.enum(['active', 'draft', 'sold', 'reserved']),
  featured: z.boolean(),
  displayOrder: z.coerce.number(),

  // Specs
  dimensions: z.object({
    height: z.coerce.number(),
    width: z.coerce.number(),
    depth: z.coerce.number(),
    unit: z.enum(['cm', 'in'])
  }),
  weight: z.coerce.number().min(0),
  medium: z.string().optional(),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
  framing: z.enum(['framed', 'unframed', 'not_applicable']),
  authenticity_certificate: z.boolean(),
  signature: z.boolean(),

  // i18n
  translations: z.object({
    fr: translationSchema,
    en: translationSchema,
    pt: translationSchema,
    de: translationSchema
  }),
  
  tags: z.string(), // Recebe como string separada por vírgula no form, converte depois

  // Images não são validadas aqui pois são gerenciadas separadamente no upload state
});

export type ProductFormValues = z.infer<typeof productSchema>;
