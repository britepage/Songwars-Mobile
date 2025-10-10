export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type song_status = "live" | "under_review" | "removed"
export type flag_category = "hate_speech" | "copyright"

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          musical_preferences: string | null
          age_range: string | null
          region: string | null
          bio: string | null
          created_at: string
          is_public: boolean | null
          is_test_data: boolean | null
          social_links: Json | null
          roulette_sound_enabled: boolean | null
          confetti_sound_enabled: boolean | null
          role: string
          avatar_url: string | null
          display_name: string | null
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          musical_preferences?: string | null
          age_range?: string | null
          region?: string | null
          bio?: string | null
          created_at?: string
          is_public?: boolean | null
          is_test_data?: boolean | null
          social_links?: Json | null
          roulette_sound_enabled?: boolean | null
          confetti_sound_enabled?: boolean | null
          role?: string
          avatar_url?: string | null
          display_name?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          musical_preferences?: string | null
          age_range?: string | null
          region?: string | null
          bio?: string | null
          created_at?: string
          is_public?: boolean | null
          is_test_data?: boolean | null
          social_links?: Json | null
          roulette_sound_enabled?: boolean | null
          confetti_sound_enabled?: boolean | null
          role?: string
          avatar_url?: string | null
          display_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      songs: {
        Row: {
          id: string
          user_id: string
          created_at: string
          title: string
          artist: string
          filename: string | null
          url: string | null
          likes: number
          dislikes: number
          churnState: Json | null
          genre: string | null
          is_active: boolean | null
          churn_start_date: string | null
          last_score_update: string | null
          clip_start_time: number | null
          is_public: boolean | null
          privacy_level: string | null
          status: song_status
          rights_confirmed: boolean
          status_changed_at: string | null
          status_changed_by: string | null
          status_change_reason: string | null
          deleted_at: string | null
          trash_expires_at: string | null
          deleted_by: string | null
          is_test_data: boolean | null
          total_tags_received: number | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          title: string
          artist: string
          filename?: string | null
          url?: string | null
          likes?: number
          dislikes?: number
          churnState?: Json | null
          genre?: string | null
          is_active?: boolean | null
          churn_start_date?: string | null
          last_score_update?: string | null
          clip_start_time?: number | null
          is_public?: boolean | null
          privacy_level?: string | null
          status?: song_status
          rights_confirmed?: boolean
          status_changed_at?: string | null
          status_changed_by?: string | null
          status_change_reason?: string | null
          deleted_at?: string | null
          trash_expires_at?: string | null
          deleted_by?: string | null
          is_test_data?: boolean | null
          total_tags_received?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          title?: string
          artist?: string
          filename?: string | null
          url?: string | null
          likes?: number
          dislikes?: number
          churnState?: Json | null
          genre?: string | null
          is_active?: boolean | null
          churn_start_date?: string | null
          last_score_update?: string | null
          clip_start_time?: number | null
          is_public?: boolean | null
          privacy_level?: string | null
          status?: song_status
          rights_confirmed?: boolean
          status_changed_at?: string | null
          status_changed_by?: string | null
          status_change_reason?: string | null
          deleted_at?: string | null
          trash_expires_at?: string | null
          deleted_by?: string | null
          is_test_data?: boolean | null
          total_tags_received?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "songs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      battles: {
        Row: {
          id: string
          song_a_id: string
          song_b_id: string
          created_at: string
          is_test_data: boolean | null
        }
        Insert: {
          id?: string
          song_a_id: string
          song_b_id: string
          created_at?: string
          is_test_data?: boolean | null
        }
        Update: {
          id?: string
          song_a_id?: string
          song_b_id?: string
          created_at?: string
          is_test_data?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "battles_song_a_id_fkey"
            columns: ["song_a_id"]
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battles_song_b_id_fkey"
            columns: ["song_b_id"]
            referencedRelation: "songs"
            referencedColumns: ["id"]
          }
        ]
      }
      votes: {
        Row: {
          id: string
          user_id: string
          battle_id: string
          song_id_voted_for: string
          created_at: string
          is_test_data: boolean | null
        }
        Insert: {
          id?: string
          user_id: string
          battle_id: string
          song_id_voted_for: string
          created_at?: string
          is_test_data?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string
          battle_id?: string
          song_id_voted_for?: string
          created_at?: string
          is_test_data?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "votes_battle_id_fkey"
            columns: ["battle_id"]
            referencedRelation: "battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_song_id_voted_for_fkey"
            columns: ["song_id_voted_for"]
            referencedRelation: "songs"
            referencedColumns: ["id"]
          }
        ]
      }
      song_flags: {
        Row: {
          id: string
          song_id: string
          user_id: string
          reason: string | null
          category: flag_category
          created_at: string
        }
        Insert: {
          id?: string
          song_id: string
          user_id: string
          reason?: string | null
          category: flag_category
          created_at?: string
        }
        Update: {
          id?: string
          song_id?: string
          user_id?: string
          reason?: string | null
          category?: flag_category
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "song_flags_song_id_fkey"
            columns: ["song_id"]
            referencedRelation: "songs"
            referencedColumns: ["id"]
          }
        ]
      }
      golden_ears: {
        Row: {
          id: string
          judge_id: string
          week_start: string
          week_end: string
          battles_judged: number
          accuracy_score: number
          rank_position: number
          awarded: boolean
          created_at: string
          is_test_data: boolean | null
        }
        Insert: {
          id?: string
          judge_id: string
          week_start: string
          week_end: string
          battles_judged: number
          accuracy_score: number
          rank_position: number
          awarded: boolean
          created_at?: string
          is_test_data?: boolean | null
        }
        Update: {
          id?: string
          judge_id?: string
          week_start?: string
          week_end?: string
          battles_judged?: number
          accuracy_score?: number
          rank_position?: number
          awarded?: boolean
          created_at?: string
          is_test_data?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "golden_ears_judge_id_fkey"
            columns: ["judge_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      record_comparison_vote: {
        Args: {
          chosen_song_id: string
          unchosen_song_id: string
          user_id: string
        }
        Returns: void
      }
      get_leaderboard_by_genre_and_week: {
        Args: {
          genre_filter?: string
          week?: number
        }
        Returns: {
          song_id: string
          title: string
          artist: string
          genre: string
          score: number
          total_votes: number
          rank: number
          week_number: number
          is_active: boolean
          username: string
        }[]
      }
      soft_delete_song: {
        Args: {
          p_song_id: string
        }
        Returns: Database['public']['Tables']['songs']['Row']
      }
      restore_song: {
        Args: {
          p_song_id: string
        }
        Returns: Database['public']['Tables']['songs']['Row']
      }
      get_random_songs_for_comparison: {
        Args: {
          genre_filter?: string
          limit_count?: number
        }
        Returns: {
          id: string
          title: string
          artist: string
          url: string
          genre: string
          clip_start_time: number
          likes: number
          dislikes: number
          user_id: string
          filename: string
          created_at: string
          churnstate: Json
        }[]
      }
      flag_song: {
        Args: {
          p_song_id: string
          p_category: flag_category
          p_reason?: string
        }
        Returns: number
      }
      hard_delete_song: {
        Args: {
          p_song_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      song_status: song_status
      flag_category: flag_category
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
