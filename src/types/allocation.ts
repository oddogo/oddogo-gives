
export type AllocationType = 'Charity' | 'Subcause' | 'Meta' | 'Region' | 'DAF' | 'Spotlight' | 'None - Error';

export interface Allocation {
  id: number;
  allocation_name: string;
  allocation_type: AllocationType;
  allocation_percentage: number;
  cause_name?: string | null;
  website_favicon?: string | null;
}
