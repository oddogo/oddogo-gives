
export type AllocationType = 'Charity' | 'Subcause' | 'Meta' | 'Region' | 'DAF' | 'Spotlight' | 'None - Error';

export interface Allocation {
  id: string;
  allocation_name: string;
  allocation_type: AllocationType;
  allocation_percentage: number;
  cause_name?: string | null;
  website_favicon?: string | null;
  deleted_at?: string | null;
  
  // New optional fields for different allocation types
  allocation_charity_id?: string;
  allocation_subcause_id?: string;
  allocation_region_id?: string;
  allocation_meta_id?: string;
  allocation_daf?: boolean;
  allocation_spotlight?: boolean;
}
