import { createClient, SupabaseClient, User } from '@supabase/supabase-js'
import { Preferences } from '@capacitor/preferences'
import type { Database } from '@/types/supabase'

class SupabaseService {
  private client: SupabaseClient<Database>
  private static instance: SupabaseService

  private constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    this.client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: this.createCustomStorage(),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          'X-Client-Info': 'songwars-mobile/1.0.0',
        },
      },
    })

    this.setupAuthStateListener()
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService()
    }
    return SupabaseService.instance
  }

  public getClient(): SupabaseClient<Database> {
    return this.client
  }

  private createCustomStorage() {
    return {
      getItem: async (key: string): Promise<string | null> => {
        const { value } = await Preferences.get({ key })
        return value
      },
      setItem: async (key: string, value: string): Promise<void> => {
        await Preferences.set({ key, value })
      },
      removeItem: async (key: string): Promise<void> => {
        await Preferences.remove({ key })
      },
    }
  }

  private setupAuthStateListener() {
    this.client.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)
      if (event === 'SIGNED_IN') {
        console.log('User signed in')
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out')
        this.clearCache()
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed')
      } else if (event === 'USER_UPDATED') {
        console.log('User updated')
      }
    })
  }

  private async clearCache() {
    try {
      await Preferences.clear()
    } catch (error) {
      console.error('Error clearing cache:', error)
    }
  }

  public async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await this.client.auth.getUser()
    return user
  }

  public async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await this.client.auth.getSession()
    return !!session
  }

  public async getSession() {
    const { data: { session } } = await this.client.auth.getSession()
    return session
  }

  public async signInWithEmail(email: string, password: string) {
    return await this.client.auth.signInWithPassword({
      email,
      password,
    })
  }

  public async signUpWithEmail(email: string, password: string) {
    return await this.client.auth.signUp({
      email,
      password,
    })
  }

  public async signOut() {
    return await this.client.auth.signOut()
  }

  public async resetPassword(email: string) {
    return await this.client.auth.resetPasswordForEmail(email, {
      redirectTo: 'songwars://reset-password',
    })
  }

  public async signInWithGoogle() {
    return await this.client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'songwars://oauth-callback',
      },
    })
  }

  public async signInWithFacebook() {
    return await this.client.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: 'songwars://oauth-callback',
      },
    })
  }

  public async updatePassword(newPassword: string) {
    return await this.client.auth.updateUser({
      password: newPassword,
    })
  }

  public async updateProfile(updates: {
    display_name?: string
    username?: string
    avatar_url?: string
    bio?: string
    region?: string
    age_range?: string
    musical_preferences?: string
    role?: string
    social_links?: any
    is_public?: boolean
    roulette_sound_enabled?: boolean
    confetti_sound_enabled?: boolean
  }) {
    const user = await this.getCurrentUser()
    if (!user) {
      throw new Error('No authenticated user')
    }

    return await this.client
      .from('profiles')
      .upsert({ 
        ...updates, 
        id: user.id,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
      .select()
      .single()
  }

  public async getProfile(userId?: string) {
    const user = userId ? { id: userId } : await this.getCurrentUser()
    if (!user) {
      throw new Error('No user provided or authenticated')
    }

    return await this.client
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
  }

  public async uploadFile(bucket: string, path: string, file: File) {
    return await this.client.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })
  }

  public async deleteFile(bucket: string, path: string) {
    return await this.client.storage
      .from(bucket)
      .remove([path])
  }

  public getPublicUrl(bucket: string, path: string) {
    const { data } = this.client.storage
      .from(bucket)
      .getPublicUrl(path)
    return data.publicUrl
  }
}

export const supabaseService = SupabaseService.getInstance()
export const supabase = supabaseService.getClient()
