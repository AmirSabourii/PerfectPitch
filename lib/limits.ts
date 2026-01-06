import { adminDb } from './admin'
import { FieldValue } from 'firebase-admin/firestore'

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
    const userDoc = await adminDb.collection('users').doc(uid).get()
    const data = userDoc.data()
    return (data?.plan as PlanType) || 'starter'
}

export async function checkUsage(uid: string, feature: 'analysis' | 'roleplay') {
    const userRef = adminDb.collection('users').doc(uid)
    const userDoc = await userRef.get()

    if (!userDoc.exists) {
        // Create default user doc if not exists
        await userRef.set({
            plan: 'starter',
            createdAt: FieldValue.serverTimestamp(),
            usage: {
                analysisCount: 0,
                roleplayMinutes: 0
            }
        })
        return { allowed: true, plan: 'starter' }
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
}

export async function incrementUsage(uid: string, feature: 'analysis' | 'roleplay', quantity: number = 1) {
    const userRef = adminDb.collection('users').doc(uid)

    if (feature === 'analysis') {
        await userRef.update({
            'usage.analysisCount': FieldValue.increment(quantity),
            'lastUsageDate': FieldValue.serverTimestamp()
        })
    } else if (feature === 'roleplay') {
        await userRef.update({
            'usage.roleplayMinutes': FieldValue.increment(quantity),
            'lastUsageDate': FieldValue.serverTimestamp()
        })
    }
}

export async function reportUsage(uid: string, feature: 'roleplay', quantity: number) {
    // Call this after a session to record time used
    const userRef = adminDb.collection('users').doc(uid)
    if (feature === 'roleplay') {
        await userRef.update({
            'usage.roleplayMinutes': FieldValue.increment(quantity)
        })
    }
}
