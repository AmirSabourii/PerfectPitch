import { adminDb, isAdminInitialized } from './admin'
import { FieldValue } from 'firebase-admin/firestore'
import type { DocumentSnapshot } from 'firebase-admin/firestore'
import { withTimeout, TIMEOUTS } from './timeout'

export type PlanType = 'starter' | 'pro'

export const PLAN_LIMITS = {
    starter: {
        analysisLimit: 1,
        roleplayTimeLimit: 1, // minutes (approximate or sessions)
        canAccessPremiumRole: false
    },
    pro: {
        analysisLimit: 20,
        roleplayTimeLimit: 60,
        canAccessPremiumRole: true
    }
}

export async function getUserPlan(uid: string): Promise<PlanType> {
    if (!isAdminInitialized() || !adminDb) {
        console.warn('Firebase Admin not initialized, defaulting to starter plan')
        return 'starter'
    }

    try {
        const userDoc = await withTimeout(
            adminDb.collection('users').doc(uid).get(),
            TIMEOUTS.FIREBASE_OPERATION,
            'Firebase operation timed out'
        ) as DocumentSnapshot
        const data = userDoc.data()
        return (data?.plan as PlanType) || 'starter'
    } catch (error: any) {
        console.error('Error getting user plan:', error.message)
        return 'starter' // Default to starter on error
    }
}

export async function checkUsage(uid: string, feature: 'analysis' | 'roleplay') {
    if (!isAdminInitialized() || !adminDb) {
        console.warn('Firebase Admin not initialized, allowing usage')
        return { allowed: true, plan: 'starter' as PlanType }
    }

    try {
        const userRef = adminDb.collection('users').doc(uid)
        const userDoc = await withTimeout(
            userRef.get(),
            TIMEOUTS.FIREBASE_OPERATION,
            'Firebase operation timed out'
        ) as DocumentSnapshot

        if (!userDoc.exists) {
            // Create default user doc if not exists
            await withTimeout(
                userRef.set({
                    plan: 'starter',
                    createdAt: FieldValue.serverTimestamp(),
                    usage: {
                        analysisCount: 0,
                        roleplayMinutes: 0
                    }
                }),
                TIMEOUTS.FIREBASE_OPERATION,
                'Firebase operation timed out'
            )
            return { allowed: true, plan: 'starter' as PlanType }
        }

        const userData = userDoc.data() || {}
        const plan = (userData.plan as PlanType) || 'starter'
        const usage = userData.usage || { analysisCount: 0, roleplayMinutes: 0 }

        const limits = PLAN_LIMITS[plan]

        if (feature === 'analysis') {
            if (usage.analysisCount >= limits.analysisLimit) {
                return { allowed: false, message: `Monthly analysis limit reached for ${plan} plan.`, plan }
            }
            return { allowed: true, plan }
        }

        if (feature === 'roleplay') {
            if ((usage.roleplayMinutes || 0) >= limits.roleplayTimeLimit) {
                return { allowed: false, message: `Roleplay limit reached for ${plan} plan.`, plan }
            }
            return { allowed: true, plan }
        }

        return { allowed: false, message: 'Unknown feature', plan }
    } catch (error: any) {
        console.error('Error checking usage:', error.message)
        // On error, allow usage to prevent blocking users
        return { allowed: true, plan: 'starter' as PlanType }
    }
}

export async function incrementUsage(uid: string, feature: 'analysis' | 'roleplay', quantity: number = 1) {
    if (!isAdminInitialized() || !adminDb) {
        console.warn('Firebase Admin not initialized, skipping usage increment')
        return
    }

    try {
        const userRef = adminDb.collection('users').doc(uid)

        if (feature === 'analysis') {
            await withTimeout(
                userRef.update({
                    'usage.analysisCount': FieldValue.increment(quantity),
                    'lastUsageDate': FieldValue.serverTimestamp()
                }),
                TIMEOUTS.FIREBASE_OPERATION,
                'Firebase operation timed out'
            )
        } else if (feature === 'roleplay') {
            await withTimeout(
                userRef.update({
                    'usage.roleplayMinutes': FieldValue.increment(quantity),
                    'lastUsageDate': FieldValue.serverTimestamp()
                }),
                TIMEOUTS.FIREBASE_OPERATION,
                'Firebase operation timed out'
            )
        }
    } catch (error: any) {
        console.error('Error incrementing usage:', error.message)
        // Don't throw - usage tracking is not critical
    }
}

export async function reportUsage(uid: string, feature: 'roleplay', quantity: number) {
    if (!isAdminInitialized() || !adminDb) {
        console.warn('Firebase Admin not initialized, skipping usage report')
        return
    }

    try {
        const userRef = adminDb.collection('users').doc(uid)
        if (feature === 'roleplay') {
            await withTimeout(
                userRef.update({
                    'usage.roleplayMinutes': FieldValue.increment(quantity)
                }),
                TIMEOUTS.FIREBASE_OPERATION,
                'Firebase operation timed out'
            )
        }
    } catch (error: any) {
        console.error('Error reporting usage:', error.message)
        // Don't throw - usage tracking is not critical
    }
}
