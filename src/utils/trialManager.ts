import { Preferences } from '@capacitor/preferences'

const TRIAL_KEY = 'songwars_trial_battles'
const MAX_TRIALS = 5

export async function getTrialCount(): Promise<number> {
  try {
    const { value } = await Preferences.get({ key: TRIAL_KEY })
    return Number(value || '0')
  } catch (error) {
    console.error('Failed to get trial count:', error)
    return 0
  }
}

export async function incrementTrial(): Promise<number> {
  try {
    const current = await getTrialCount()
    const next = current + 1
    await Preferences.set({ key: TRIAL_KEY, value: String(next) })
    return next
  } catch (error) {
    console.error('Failed to increment trial:', error)
    return 0
  }
}

export async function getTrialsRemaining(): Promise<number> {
  const used = await getTrialCount()
  return Math.max(0, MAX_TRIALS - used)
}

export async function hasExceededTrialLimit(): Promise<boolean> {
  const remaining = await getTrialsRemaining()
  return remaining <= 0
}

export async function resetTrialCount(): Promise<void> {
  try {
    await Preferences.remove({ key: TRIAL_KEY })
  } catch (error) {
    console.error('Failed to reset trial count:', error)
  }
}

export function getMaxTrials(): number {
  return MAX_TRIALS
}

