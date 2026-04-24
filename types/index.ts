export type CatalogItem = {
  salon_id: string;
  salon_name: string;
  salon_slug: string;
  city: string | null;
  plan: string;
  short_description: string | null;
  primary_host: string | null;
  rank: number;
};
