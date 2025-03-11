export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      banking_natwest_bank_statements: {
        Row: {
          account_name: string | null
          account_number: string | null
          balance: number | null
          created_at: string | null
          date: string | null
          description: string | null
          id: number
          type: string | null
          value: number | null
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          balance?: number | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: number
          type?: string | null
          value?: number | null
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          balance?: number | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: number
          type?: string | null
          value?: number | null
        }
        Relationships: []
      }
      charities_charities: {
        Row: {
          address_city: string | null
          address_line_1: string | null
          address_line_2: string | null
          address_line_3: string | null
          address_postcode: string | null
          charity_base_id: number | null
          charity_name: string
          company_id: string | null
          created_at: string
          deleted_at: string | null
          id: string
          registered_number: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address_city?: string | null
          address_line_1?: string | null
          address_line_2?: string | null
          address_line_3?: string | null
          address_postcode?: string | null
          charity_base_id?: number | null
          charity_name: string
          company_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          registered_number?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address_city?: string | null
          address_line_1?: string | null
          address_line_2?: string | null
          address_line_3?: string | null
          address_postcode?: string | null
          charity_base_id?: number | null
          charity_name?: string
          company_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          registered_number?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      charities_charities_BACKUP: {
        Row: {
          address_city: string | null
          address_line_1: string | null
          address_line_2: string | null
          address_line_3: string | null
          address_postcode: string | null
          charity_base_id: number | null
          charity_name: string
          company_id: string | null
          created_at: string
          deleted_at: string | null
          id: string
          registered_number: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address_city?: string | null
          address_line_1?: string | null
          address_line_2?: string | null
          address_line_3?: string | null
          address_postcode?: string | null
          charity_base_id?: number | null
          charity_name: string
          company_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          registered_number?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address_city?: string | null
          address_line_1?: string | null
          address_line_2?: string | null
          address_line_3?: string | null
          address_postcode?: string | null
          charity_base_id?: number | null
          charity_name?: string
          company_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          registered_number?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      charities_charity_causes: {
        Row: {
          cause_name: string
          charity_comm_classification_code: number | null
          created_at: string
          deleted_at: string | null
          description: string
          id: number
          img: string | null
          updated_at: string | null
        }
        Insert: {
          cause_name: string
          charity_comm_classification_code?: number | null
          created_at?: string
          deleted_at?: string | null
          description: string
          id?: number
          img?: string | null
          updated_at?: string | null
        }
        Update: {
          cause_name?: string
          charity_comm_classification_code?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string
          id?: number
          img?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      charities_charity_featured: {
        Row: {
          additional_notes: string | null
          agreed_charge: number
          cause_id: number | null
          charity_id: string
          created_at: string
          deleted_at: string | null
          end_date: string
          id: number
          start_date: string
          sub_cause_id: number | null
        }
        Insert: {
          additional_notes?: string | null
          agreed_charge: number
          cause_id?: number | null
          charity_id: string
          created_at?: string
          deleted_at?: string | null
          end_date: string
          id?: number
          start_date: string
          sub_cause_id?: number | null
        }
        Update: {
          additional_notes?: string | null
          agreed_charge?: number
          cause_id?: number | null
          charity_id?: string
          created_at?: string
          deleted_at?: string | null
          end_date?: string
          id?: number
          start_date?: string
          sub_cause_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "charities_charity_featured_sub_cause_id_fkey"
            columns: ["sub_cause_id"]
            isOneToOne: false
            referencedRelation: "charities_charity_sub_causes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charities_charity_featured_sub_cause_id_fkey"
            columns: ["sub_cause_id"]
            isOneToOne: false
            referencedRelation: "v_charities_by_subcause"
            referencedColumns: ["subcause_id"]
          },
          {
            foreignKeyName: "charities_charity_featured_sub_cause_id_fkey"
            columns: ["sub_cause_id"]
            isOneToOne: false
            referencedRelation: "v_charities_sub_causes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charity_featured_cause_id_fkey"
            columns: ["cause_id"]
            isOneToOne: false
            referencedRelation: "charities_charity_causes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charity_featured_cause_id_fkey"
            columns: ["cause_id"]
            isOneToOne: false
            referencedRelation: "v_charities_causes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charity_featured_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "charities_charities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charity_featured_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "v_charities_by_subcause"
            referencedColumns: ["charity_id"]
          },
        ]
      }
      charities_charity_metadata: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string
          id: number
          img: string | null
          meta_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description: string
          id?: number
          img?: string | null
          meta_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string
          id?: number
          img?: string | null
          meta_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      charities_charity_partners: {
        Row: {
          charity_id: string
          contact_email: string | null
          contact_name: string | null
          contact_number: string | null
          created_at: string
          end_date: string | null
          payment_details_ref: string | null
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          charity_id: string
          contact_email?: string | null
          contact_name?: string | null
          contact_number?: string | null
          created_at?: string
          end_date?: string | null
          payment_details_ref?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          charity_id?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_number?: string | null
          created_at?: string
          end_date?: string | null
          payment_details_ref?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "charity_partners_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: true
            referencedRelation: "charities_charities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charity_partners_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: true
            referencedRelation: "v_charities_by_subcause"
            referencedColumns: ["charity_id"]
          },
        ]
      }
      charities_charity_regions: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string
          id: number
          img: string | null
          region_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description: string
          id?: number
          img?: string | null
          region_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string
          id?: number
          img?: string | null
          region_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      charities_charity_spotlight: {
        Row: {
          agreed_charge: number
          charity_id: string
          created_at: string
          deleted_at: string | null
          end_date: string
          id: number
          notes: string | null
          region_id: number | null
          start_date: string
        }
        Insert: {
          agreed_charge: number
          charity_id: string
          created_at?: string
          deleted_at?: string | null
          end_date: string
          id?: number
          notes?: string | null
          region_id?: number | null
          start_date: string
        }
        Update: {
          agreed_charge?: number
          charity_id?: string
          created_at?: string
          deleted_at?: string | null
          end_date?: string
          id?: number
          notes?: string | null
          region_id?: number | null
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "charities_charity_spotlight_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "charities_charity_regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charities_charity_spotlight_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "v_charities_regions_spotlight"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charity_spotlight_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "charities_charities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charity_spotlight_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "v_charities_by_subcause"
            referencedColumns: ["charity_id"]
          },
        ]
      }
      charities_charity_sub_causes: {
        Row: {
          cause_id: number | null
          created_at: string
          deleted_at: string | null
          description: string
          id: number
          img: string | null
          subcause_name: string
          updated_at: string | null
        }
        Insert: {
          cause_id?: number | null
          created_at?: string
          deleted_at?: string | null
          description: string
          id?: number
          img?: string | null
          subcause_name: string
          updated_at?: string | null
        }
        Update: {
          cause_id?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string
          id?: number
          img?: string | null
          subcause_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      charities_meta: {
        Row: {
          charities_id: string
          created_at: string
          id: number
          meta_id: number
        }
        Insert: {
          charities_id: string
          created_at?: string
          id?: number
          meta_id: number
        }
        Update: {
          charities_id?: string
          created_at?: string
          id?: number
          meta_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "charities_meta_meta_id_fkey"
            columns: ["meta_id"]
            isOneToOne: false
            referencedRelation: "charities_charity_metadata"
            referencedColumns: ["id"]
          },
        ]
      }
      charities_regions: {
        Row: {
          charities_id: string
          created_at: string
          id: number
          region_id: number
        }
        Insert: {
          charities_id: string
          created_at?: string
          id?: number
          region_id: number
        }
        Update: {
          charities_id?: string
          created_at?: string
          id?: number
          region_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "charities_regions_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "charities_charity_regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charities_regions_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "v_charities_regions_spotlight"
            referencedColumns: ["id"]
          },
        ]
      }
      charities_subcauses: {
        Row: {
          charity_id: string
          created_at: string
          id: number
          subcause_id: number
        }
        Insert: {
          charity_id: string
          created_at?: string
          id?: number
          subcause_id: number
        }
        Update: {
          charity_id?: string
          created_at?: string
          id?: number
          subcause_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "charities_subcauses_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "charities_charities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charities_subcauses_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "v_charities_by_subcause"
            referencedColumns: ["charity_id"]
          },
          {
            foreignKeyName: "charities_subcauses_sub_cause_id_fkey"
            columns: ["subcause_id"]
            isOneToOne: false
            referencedRelation: "charities_charity_sub_causes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charities_subcauses_sub_cause_id_fkey"
            columns: ["subcause_id"]
            isOneToOne: false
            referencedRelation: "v_charities_by_subcause"
            referencedColumns: ["subcause_id"]
          },
          {
            foreignKeyName: "charities_subcauses_sub_cause_id_fkey"
            columns: ["subcause_id"]
            isOneToOne: false
            referencedRelation: "v_charities_sub_causes"
            referencedColumns: ["id"]
          },
        ]
      }
      fingerprints: {
        Row: {
          created_at: string
          deleted_at: string | null
          fingerprint: string
          name: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          fingerprint: string
          name?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          fingerprint?: string
          name?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      fingerprints_allocations: {
        Row: {
          allocation_charity_id: string | null
          allocation_daf: boolean | null
          allocation_meta_id: number | null
          allocation_percentage: number | null
          allocation_region_id: number | null
          allocation_spotlight: boolean | null
          allocation_subcause_id: number | null
          created_at: string
          deleted_at: string | null
          fingerprints_users_id: number | null
          id: number
          version: number | null
        }
        Insert: {
          allocation_charity_id?: string | null
          allocation_daf?: boolean | null
          allocation_meta_id?: number | null
          allocation_percentage?: number | null
          allocation_region_id?: number | null
          allocation_spotlight?: boolean | null
          allocation_subcause_id?: number | null
          created_at?: string
          deleted_at?: string | null
          fingerprints_users_id?: number | null
          id?: number
          version?: number | null
        }
        Update: {
          allocation_charity_id?: string | null
          allocation_daf?: boolean | null
          allocation_meta_id?: number | null
          allocation_percentage?: number | null
          allocation_region_id?: number | null
          allocation_spotlight?: boolean | null
          allocation_subcause_id?: number | null
          created_at?: string
          deleted_at?: string | null
          fingerprints_users_id?: number | null
          id?: number
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fingerprint_allocation_fingerprint_user_id_fkey"
            columns: ["fingerprints_users_id"]
            isOneToOne: false
            referencedRelation: "fingerprints_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_allocation_charity"
            columns: ["allocation_charity_id"]
            isOneToOne: false
            referencedRelation: "charities_charities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_allocation_charity"
            columns: ["allocation_charity_id"]
            isOneToOne: false
            referencedRelation: "v_charities_by_subcause"
            referencedColumns: ["charity_id"]
          },
          {
            foreignKeyName: "fk_allocation_meta"
            columns: ["allocation_meta_id"]
            isOneToOne: false
            referencedRelation: "charities_charity_metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_allocation_region"
            columns: ["allocation_region_id"]
            isOneToOne: false
            referencedRelation: "charities_charity_regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_allocation_region"
            columns: ["allocation_region_id"]
            isOneToOne: false
            referencedRelation: "v_charities_regions_spotlight"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_allocation_subcause"
            columns: ["allocation_subcause_id"]
            isOneToOne: false
            referencedRelation: "charities_charity_sub_causes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_allocation_subcause"
            columns: ["allocation_subcause_id"]
            isOneToOne: false
            referencedRelation: "v_charities_by_subcause"
            referencedColumns: ["subcause_id"]
          },
          {
            foreignKeyName: "fk_allocation_subcause"
            columns: ["allocation_subcause_id"]
            isOneToOne: false
            referencedRelation: "v_charities_sub_causes"
            referencedColumns: ["id"]
          },
        ]
      }
      fingerprints_users: {
        Row: {
          created_at: string
          deleted_at: string | null
          fingerprint_id: string
          id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          fingerprint_id: string
          id?: number
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          fingerprint_id?: string
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fingerprints_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fingerprints_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_donors_list"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_crm: {
        Row: {
          additional_info: string | null
          approach_notes: string | null
          background: string | null
          category: string | null
          contact_email: string | null
          contact_name: string | null
          contact_number: string | null
          created_at: string
          id: number
          investment_focus: string | null
          investor_name: string | null
          key_individuals: string | null
          removed_at: string | null
          status: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          additional_info?: string | null
          approach_notes?: string | null
          background?: string | null
          category?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_number?: string | null
          created_at?: string
          id?: number
          investment_focus?: string | null
          investor_name?: string | null
          key_individuals?: string | null
          removed_at?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          additional_info?: string | null
          approach_notes?: string | null
          background?: string | null
          category?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_number?: string | null
          created_at?: string
          id?: number
          investment_focus?: string | null
          investor_name?: string | null
          key_individuals?: string | null
          removed_at?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      investor_crm_contact_log: {
        Row: {
          added_by: string | null
          created_at: string
          date: string | null
          follow_up: string | null
          id: number
          investor_id: number | null
          note: string | null
          subject: string | null
          type: string | null
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          date?: string | null
          follow_up?: string | null
          id?: number
          investor_id?: number | null
          note?: string | null
          subject?: string | null
          type?: string | null
        }
        Update: {
          added_by?: string | null
          created_at?: string
          date?: string | null
          follow_up?: string | null
          id?: number
          investor_id?: number | null
          note?: string | null
          subject?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investor_crm_contact_log_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investor_crm"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger_accounts: {
        Row: {
          archived_at: string | null
          code: string | null
          created_at: string
          description: string | null
          id: number
          modified_at: string | null
          name: string | null
          parent_id: number | null
          type: number | null
        }
        Insert: {
          archived_at?: string | null
          code?: string | null
          created_at?: string
          description?: string | null
          id?: number
          modified_at?: string | null
          name?: string | null
          parent_id?: number | null
          type?: number | null
        }
        Update: {
          archived_at?: string | null
          code?: string | null
          created_at?: string
          description?: string | null
          id?: number
          modified_at?: string | null
          name?: string | null
          parent_id?: number | null
          type?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_accounts_type_fkey"
            columns: ["type"]
            isOneToOne: false
            referencedRelation: "ledger_accounts_type"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger_accounts_type: {
        Row: {
          created_at: string
          id: number
          name: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      ledger_transactions: {
        Row: {
          amount_type: number | null
          created_at: string
          created_by: string | null
          description: string | null
          effective_date: string | null
          id: number
          reference: string | null
          status: string | null
          total_amount: number | null
          trans_type_id: number | null
        }
        Insert: {
          amount_type?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          effective_date?: string | null
          id?: number
          reference?: string | null
          status?: string | null
          total_amount?: number | null
          trans_type_id?: number | null
        }
        Update: {
          amount_type?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          effective_date?: string | null
          id?: number
          reference?: string | null
          status?: string | null
          total_amount?: number | null
          trans_type_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_transactions_trans_type_id_fkey"
            columns: ["trans_type_id"]
            isOneToOne: false
            referencedRelation: "ledger_transactions_types"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger_transactions_entries: {
        Row: {
          account_id: number | null
          amount: number | null
          amount_type: number | null
          created_at: string
          description: string | null
          fingerprint_id: string | null
          id: number
          status: string | null
          trans_type_id: number | null
          transaction_id: number | null
        }
        Insert: {
          account_id?: number | null
          amount?: number | null
          amount_type?: number | null
          created_at?: string
          description?: string | null
          fingerprint_id?: string | null
          id?: number
          status?: string | null
          trans_type_id?: number | null
          transaction_id?: number | null
        }
        Update: {
          account_id?: number | null
          amount?: number | null
          amount_type?: number | null
          created_at?: string
          description?: string | null
          fingerprint_id?: string | null
          id?: number
          status?: string | null
          trans_type_id?: number | null
          transaction_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_transactions_entries_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "ledger_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_transactions_entries_fingerprint_id_fkey"
            columns: ["fingerprint_id"]
            isOneToOne: false
            referencedRelation: "fingerprints"
            referencedColumns: ["fingerprint"]
          },
          {
            foreignKeyName: "ledger_transactions_entries_trans_type_id_fkey"
            columns: ["trans_type_id"]
            isOneToOne: false
            referencedRelation: "ledger_transactions_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_transactions_entries_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "ledger_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger_transactions_types: {
        Row: {
          amount_type: number | null
          archived_at: string | null
          created_at: string
          description: string | null
          id: number
          trans_type: string | null
        }
        Insert: {
          amount_type?: number | null
          archived_at?: string | null
          created_at?: string
          description?: string | null
          id?: number
          trans_type?: string | null
        }
        Update: {
          amount_type?: number | null
          archived_at?: string | null
          created_at?: string
          description?: string | null
          id?: number
          trans_type?: string | null
        }
        Relationships: []
      }
      old_fingerprint_live: {
        Row: {
          allocation_percentage: number
          cause_id: number | null
          charity_id: string | null
          created_at: string
          deleted_at: string | null
          id: string
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          allocation_percentage: number
          cause_id?: number | null
          charity_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          allocation_percentage?: number
          cause_id?: number | null
          charity_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fingerprint_live_cause_id_fkey"
            columns: ["cause_id"]
            isOneToOne: false
            referencedRelation: "charities_charity_sub_causes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fingerprint_live_cause_id_fkey"
            columns: ["cause_id"]
            isOneToOne: false
            referencedRelation: "v_charities_by_subcause"
            referencedColumns: ["subcause_id"]
          },
          {
            foreignKeyName: "fingerprint_live_cause_id_fkey"
            columns: ["cause_id"]
            isOneToOne: false
            referencedRelation: "v_charities_sub_causes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fingerprint_live_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "charities_charities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fingerprint_live_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "v_charities_by_subcause"
            referencedColumns: ["charity_id"]
          },
          {
            foreignKeyName: "fingerprint_live_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fingerprint_live_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_donors_list"
            referencedColumns: ["id"]
          },
        ]
      }
      old_fingerprint_temp: {
        Row: {
          allocation_percentage: number
          cause_id: number | null
          charity_id: string | null
          created_at: string
          deleted_at: string | null
          id: number
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          allocation_percentage: number
          cause_id?: number | null
          charity_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: number
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          allocation_percentage?: number
          cause_id?: number | null
          charity_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: number
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fingerprint_temp_cause_id_fkey"
            columns: ["cause_id"]
            isOneToOne: false
            referencedRelation: "charities_charity_sub_causes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fingerprint_temp_cause_id_fkey"
            columns: ["cause_id"]
            isOneToOne: false
            referencedRelation: "v_charities_by_subcause"
            referencedColumns: ["subcause_id"]
          },
          {
            foreignKeyName: "fingerprint_temp_cause_id_fkey"
            columns: ["cause_id"]
            isOneToOne: false
            referencedRelation: "v_charities_sub_causes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fingerprint_temp_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "charities_charities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fingerprint_temp_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "v_charities_by_subcause"
            referencedColumns: ["charity_id"]
          },
          {
            foreignKeyName: "fingerprint_temp_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fingerprint_temp_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_donors_list"
            referencedColumns: ["id"]
          },
        ]
      }
      processes_categories: {
        Row: {
          archived_at: string | null
          category: string | null
          created_at: string
          id: number
        }
        Insert: {
          archived_at?: string | null
          category?: string | null
          created_at?: string
          id?: number
        }
        Update: {
          archived_at?: string | null
          category?: string | null
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      processes_processes: {
        Row: {
          archived_at: string | null
          created_at: string
          description: string | null
          frequency: string | null
          id: number
          kb_link: string | null
          modified_at: string | null
          name: string | null
          perform_link: string | null
          process_category_id: number | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          description?: string | null
          frequency?: string | null
          id?: number
          kb_link?: string | null
          modified_at?: string | null
          name?: string | null
          perform_link?: string | null
          process_category_id?: number | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          description?: string | null
          frequency?: string | null
          id?: number
          kb_link?: string | null
          modified_at?: string | null
          name?: string | null
          perform_link?: string | null
          process_category_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "processes_process_category_id_fkey"
            columns: ["process_category_id"]
            isOneToOne: false
            referencedRelation: "processes_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          causes_description: string | null
          created_at: string
          display_name: string | null
          id: string
          is_published: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          causes_description?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          is_published?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          causes_description?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_published?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      register_interest: {
        Row: {
          charity_name: string | null
          charity_number: number | null
          created_at: string
          email: string
          full_name: string
          id: string
          message: string | null
          opt_in: boolean | null
          source: string | null
          type: string
        }
        Insert: {
          charity_name?: string | null
          charity_number?: number | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          message?: string | null
          opt_in?: boolean | null
          source?: string | null
          type: string
        }
        Update: {
          charity_name?: string | null
          charity_number?: number | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          opt_in?: boolean | null
          source?: string | null
          type?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      v_active_partner_charities: {
        Row: {
          charity_id: string | null
          charity_name: string | null
          end_date: string | null
          registered_number: string | null
          start_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "charity_partners_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: true
            referencedRelation: "charities_charities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charity_partners_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: true
            referencedRelation: "v_charities_by_subcause"
            referencedColumns: ["charity_id"]
          },
        ]
      }
      v_charities_by_subcause: {
        Row: {
          charity_id: string | null
          charity_name: string | null
          end_date: string | null
          start_date: string | null
          subcause_id: number | null
          subcause_name: string | null
        }
        Relationships: []
      }
      v_charities_causes: {
        Row: {
          cause_name: string | null
          charity_comm_classification_code: number | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: number | null
          img: string | null
          updated_at: string | null
        }
        Insert: {
          cause_name?: string | null
          charity_comm_classification_code?: number | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: number | null
          img?: string | null
          updated_at?: string | null
        }
        Update: {
          cause_name?: string | null
          charity_comm_classification_code?: number | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: number | null
          img?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      v_charities_featured_charities: {
        Row: {
          additional_notes: string | null
          agreed_charge: number | null
          cause_id: number | null
          cause_name: string | null
          charity_id: string | null
          charity_name: string | null
          created_at: string | null
          deleted_at: string | null
          end_date: string | null
          feature_type: string | null
          id: number | null
          start_date: string | null
          status: string | null
          sub_cause_id: number | null
          subcause_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "charities_charity_featured_sub_cause_id_fkey"
            columns: ["sub_cause_id"]
            isOneToOne: false
            referencedRelation: "charities_charity_sub_causes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charities_charity_featured_sub_cause_id_fkey"
            columns: ["sub_cause_id"]
            isOneToOne: false
            referencedRelation: "v_charities_by_subcause"
            referencedColumns: ["subcause_id"]
          },
          {
            foreignKeyName: "charities_charity_featured_sub_cause_id_fkey"
            columns: ["sub_cause_id"]
            isOneToOne: false
            referencedRelation: "v_charities_sub_causes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charity_featured_cause_id_fkey"
            columns: ["cause_id"]
            isOneToOne: false
            referencedRelation: "charities_charity_causes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charity_featured_cause_id_fkey"
            columns: ["cause_id"]
            isOneToOne: false
            referencedRelation: "v_charities_causes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charity_featured_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "charities_charities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charity_featured_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "v_charities_by_subcause"
            referencedColumns: ["charity_id"]
          },
        ]
      }
      v_charities_partner_charities: {
        Row: {
          charity_id: string | null
          charity_name: string | null
          contact_email: string | null
          contact_name: string | null
          contact_number: string | null
          created_at: string | null
          end_date: string | null
          payment_details_ref: string | null
          start_date: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "charity_partners_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: true
            referencedRelation: "charities_charities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charity_partners_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: true
            referencedRelation: "v_charities_by_subcause"
            referencedColumns: ["charity_id"]
          },
        ]
      }
      v_charities_regions_spotlight: {
        Row: {
          charity_id: string | null
          charity_name: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          end_date: string | null
          id: number | null
          img: string | null
          region_name: string | null
          start_date: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "charity_spotlight_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "charities_charities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charity_spotlight_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "v_charities_by_subcause"
            referencedColumns: ["charity_id"]
          },
        ]
      }
      v_charities_spotlight_charities: {
        Row: {
          agreed_charge: number | null
          charity_id: string | null
          charity_name: string | null
          created_at: string | null
          deleted_at: string | null
          end_date: string | null
          id: number | null
          notes: string | null
          region_id: number | null
          region_name: string | null
          start_date: string | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "charities_charity_spotlight_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "charities_charity_regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charities_charity_spotlight_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "v_charities_regions_spotlight"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charity_spotlight_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "charities_charities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charity_spotlight_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "v_charities_by_subcause"
            referencedColumns: ["charity_id"]
          },
        ]
      }
      v_charities_sub_causes: {
        Row: {
          cause_id: number | null
          cause_name: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: number | null
          img: string | null
          subcause_name: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      v_donors_list: {
        Row: {
          email: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          last_sign_in_at: string | null
        }
        Relationships: []
      }
      v_fingerprint_live: {
        Row: {
          allocation_percentage: number | null
          cause_id: number | null
          cause_name: string | null
          charity_id: string | null
          charity_name: string | null
          created_at: string | null
          id: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fingerprint_live_cause_id_fkey"
            columns: ["cause_id"]
            isOneToOne: false
            referencedRelation: "charities_charity_sub_causes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fingerprint_live_cause_id_fkey"
            columns: ["cause_id"]
            isOneToOne: false
            referencedRelation: "v_charities_by_subcause"
            referencedColumns: ["subcause_id"]
          },
          {
            foreignKeyName: "fingerprint_live_cause_id_fkey"
            columns: ["cause_id"]
            isOneToOne: false
            referencedRelation: "v_charities_sub_causes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fingerprint_live_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "charities_charities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fingerprint_live_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "v_charities_by_subcause"
            referencedColumns: ["charity_id"]
          },
          {
            foreignKeyName: "fingerprint_live_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fingerprint_live_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_donors_list"
            referencedColumns: ["id"]
          },
        ]
      }
      v_fingerprint_temp: {
        Row: {
          allocation_percentage: number | null
          cause_id: number | null
          cause_name: string | null
          charity_id: string | null
          charity_name: string | null
          created_at: string | null
          deleted_at: string | null
          id: number | null
          submitted_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fingerprint_temp_cause_id_fkey"
            columns: ["cause_id"]
            isOneToOne: false
            referencedRelation: "charities_charity_sub_causes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fingerprint_temp_cause_id_fkey"
            columns: ["cause_id"]
            isOneToOne: false
            referencedRelation: "v_charities_by_subcause"
            referencedColumns: ["subcause_id"]
          },
          {
            foreignKeyName: "fingerprint_temp_cause_id_fkey"
            columns: ["cause_id"]
            isOneToOne: false
            referencedRelation: "v_charities_sub_causes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fingerprint_temp_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "charities_charities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fingerprint_temp_charity_id_fkey"
            columns: ["charity_id"]
            isOneToOne: false
            referencedRelation: "v_charities_by_subcause"
            referencedColumns: ["charity_id"]
          },
          {
            foreignKeyName: "fingerprint_temp_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fingerprint_temp_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_donors_list"
            referencedColumns: ["id"]
          },
        ]
      }
      v_fingerprints_live: {
        Row: {
          allocation_charity_id: string | null
          allocation_daf: boolean | null
          allocation_meta_id: number | null
          allocation_name: string | null
          allocation_percentage: number | null
          allocation_region_id: number | null
          allocation_spotlight: boolean | null
          allocation_subcause_id: number | null
          allocation_type: string | null
          created_at: string | null
          deleted_at: string | null
          fingerprint_id: string | null
          fingerprints_users_id: number | null
          id: number | null
          user_id: string | null
          version: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fingerprint_allocation_fingerprint_user_id_fkey"
            columns: ["fingerprints_users_id"]
            isOneToOne: false
            referencedRelation: "fingerprints_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fingerprints_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fingerprints_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_donors_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_allocation_charity"
            columns: ["allocation_charity_id"]
            isOneToOne: false
            referencedRelation: "charities_charities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_allocation_charity"
            columns: ["allocation_charity_id"]
            isOneToOne: false
            referencedRelation: "v_charities_by_subcause"
            referencedColumns: ["charity_id"]
          },
          {
            foreignKeyName: "fk_allocation_meta"
            columns: ["allocation_meta_id"]
            isOneToOne: false
            referencedRelation: "charities_charity_metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_allocation_region"
            columns: ["allocation_region_id"]
            isOneToOne: false
            referencedRelation: "charities_charity_regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_allocation_region"
            columns: ["allocation_region_id"]
            isOneToOne: false
            referencedRelation: "v_charities_regions_spotlight"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_allocation_subcause"
            columns: ["allocation_subcause_id"]
            isOneToOne: false
            referencedRelation: "charities_charity_sub_causes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_allocation_subcause"
            columns: ["allocation_subcause_id"]
            isOneToOne: false
            referencedRelation: "v_charities_by_subcause"
            referencedColumns: ["subcause_id"]
          },
          {
            foreignKeyName: "fk_allocation_subcause"
            columns: ["allocation_subcause_id"]
            isOneToOne: false
            referencedRelation: "v_charities_sub_causes"
            referencedColumns: ["id"]
          },
        ]
      }
      v_ledger_transactions_entries: {
        Row: {
          account_id: number | null
          account_name: string | null
          amount: number | null
          amount_type: number | null
          created_at: string | null
          description: string | null
          effective_date: string | null
          fingerprint_id: string | null
          id: number | null
          status: string | null
          trans_type_id: number | null
          transaction_id: number | null
          transaction_type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_transactions_entries_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "ledger_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_transactions_entries_fingerprint_id_fkey"
            columns: ["fingerprint_id"]
            isOneToOne: false
            referencedRelation: "fingerprints"
            referencedColumns: ["fingerprint"]
          },
          {
            foreignKeyName: "ledger_transactions_entries_trans_type_id_fkey"
            columns: ["trans_type_id"]
            isOneToOne: false
            referencedRelation: "ledger_transactions_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_transactions_entries_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "ledger_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      v_register_interest: {
        Row: {
          charity_name: string | null
          charity_number: number | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          message: string | null
          opt_in: boolean | null
          type: string | null
        }
        Insert: {
          charity_name?: string | null
          charity_number?: number | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          message?: string | null
          opt_in?: boolean | null
          type?: string | null
        }
        Update: {
          charity_name?: string | null
          charity_number?: number | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          message?: string | null
          opt_in?: boolean | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_new_fingerprint: {
        Args: {
          puserid: string
        }
        Returns: undefined
      }
      get_current_versions: {
        Args: {
          p_fingerprints_users_id: number
        }
        Returns: {
          max_version: number
        }[]
      }
      initialize_user_fingerprint: {
        Args: {
          p_user_id: string
        }
        Returns: string
      }
      ledger_donor_balances_report: {
        Args: {
          target_date: string
        }
        Returns: {
          fingerprint_id: string
          balance: number
        }[]
      }
      ledger_trial_balance_report: {
        Args: {
          target_date: string
        }
        Returns: Json
      }
      mark_fingerprint_allocations_as_deleted: {
        Args: {
          p_fingerprints_users_id: number
        }
        Returns: {
          rows_affected: number
        }[]
      }
      sumallocation: {
        Args: {
          puserid: string
        }
        Returns: number
      }
      update_fingerprint_allocations: {
        Args: {
          p_fingerprints_users_id: number
          p_new_allocations: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
