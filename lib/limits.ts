import { adminDb, isAdminInitialized } from './admin'
import { FieldValue } from 'firebase-admin/firestore'
import type { DocumentSnapshot } from 'firebase-admin/firestore'
import { withTimeout, TIMEOUTS } from './timeout'
import { CREDIT_COSTS, type CreditAction } from './creditSystem'

// Credit-based system - no more plans!
export interface UserCredits {
    total: number
    used: number
    remaining: number
}

export interface UserData {
    credits: UserCredits
    createdAt: any
    lastUpdated: any
}

// Get user credits from Firebase (using userCredits collection)
export async function getUserCredits(uid: string): Promise<UserCredits> {
    if (!isAdminInitialized() || !adminDb) {
        console.warn('Firebase Admin not initialized, returning zero credits')
        return { total: 0, used: 0, remaining: 0 }
    }

    try {
        // Use userCredits collection instead of users
        const userDoc = await withTimeout(
            adminDb.collection('userCredits').doc(uid).get(),
            TIMEOUTS.FIREBASE_OPERATION,
            'Firebase operation timed out'
        ) as DocumentSnapshot
        
        const data = userDoc.data()
        if (!data) {
            return { total: 0, used: 0, remaining: 0 }
        }
        
        return {
            total: data.totalCredits || 0,
            used: data.usedCredits || 0,
            remaining: data.remainingCredits || 0
        }
    } catch (error: any) {
        console.error('Error getting user credits:', error.message)
        return { total: 0, used: 0, remaining: 0 }
    }
}

// Check if user has enough credits for an action
export async function checkCredits(uid: string, action: CreditAction) {
    if (!isAdminInitialized() || !adminDb) {
        console.warn('Firebase Admin not initialized, denying action')
        return { 
            allowed: false, 
            message: 'Service temporarily unavailable',
            credits: { total: 0, used: 0, remaining: 0 }
        }
    }

    try {
        // Use userCredits collection
        const userRef = adminDb.collection('userCredits').doc(uid)
        const userDoc = await withTimeout(
            userRef.get(),
            TIMEOUTS.FIREBASE_OPERATION,
            'Firebase operation timed out'
        ) as DocumentSnapshot

        if (!userDoc.exists) {
            // Create default user doc with zero credits
            await withTimeout(
                userRef.set({
                    userId: uid,
                    totalCredits: 0,
                    usedCredits: 0,
                    remainingCredits: 0,
                    purchaseHistory: [],
                    usageHistory: [],
                    createdAt: FieldValue.serverTimestamp(),
                    lastUpdated: FieldValue.serverTimestamp()
                }),
                TIMEOUTS.FIREBASE_OPERATION,
                'Firebase operation timed out'
            )
            return { 
                allowed: false, 
                message: 'No credits available. Please purchase credits to continue.',
                credits: { total: 0, used: 0, remaining: 0 },
                required: CREDIT_COSTS[action]
            }
        }

        const userData = userDoc.data() || {}
        const credits: UserCredits = {
            total: userData.totalCredits || 0,
            used: userData.usedCredits || 0,
            remaining: userData.remainingCredits || 0
        }
        
        // Get required credits for this action
        const requiredCredits = CREDIT_COSTS[action]
        
        console.log(`[Credits] User ${uid} has ${credits.remaining} credits, needs ${requiredCredits} for ${action}`)
        
        if (credits.remaining < requiredCredits) {
            return { 
                allowed: false, 
                message: `Insufficient credits. You need ${requiredCredits} credit(s) but have ${credits.remaining}.`,
                credits,
                required: requiredCredits
            }
        }

        return { allowed: true, credits, required: requiredCredits }
    } catch (error: any) {
        console.error('Error checking credits:', error.message)
        // On error, DENY action for security
        return { 
            allowed: false, 
            message: 'Error checking credits. Please try again.',
            credits: { total: 0, used: 0, remaining: 0 }
        }
    }
}

// Use credits for an action (deduct from user's balance)
export async function useCredits(uid: string, action: CreditAction, metadata?: any) {
    if (!isAdminInitialized() || !adminDb) {
        console.warn('Firebase Admin not initialized, skipping credit deduction')
        return
    }

    try {
        // Use userCredits collection
        const userRef = adminDb.collection('userCredits').doc(uid)
        const creditsToUse = CREDIT_COSTS[action]

        // Update user credits atomically
        await withTimeout(
            userRef.update({
                usedCredits: FieldValue.increment(creditsToUse),
                remainingCredits: FieldValue.increment(-creditsToUse),
                lastUpdated: FieldValue.serverTimestamp()
            }),
            TIMEOUTS.FIREBASE_OPERATION,
            'Firebase operation timed out'
        )

        // Log usage for tracking
        await withTimeout(
            adminDb.collection('creditUsage').add({
                userId: uid,
                action,
                credits: creditsToUse,
                metadata: metadata || {},
                timestamp: FieldValue.serverTimestamp()
            }),
            TIMEOUTS.FIREBASE_OPERATION,
            'Firebase operation timed out'
        )

        console.log(`[Credits] Used ${creditsToUse} credit(s) for ${action} by user ${uid}`)
    } catch (error: any) {
        console.error('Error using credits:', error.message)
        // Don't throw - credit tracking is important but shouldn't block the operation
    }
}

// Add credits to user account (for purchases or admin grants)
export async function addCredits(uid: string, amount: number, source: string = 'purchase', metadata?: any) {
    if (!isAdminInitialized() || !adminDb) {
        console.warn('Firebase Admin not initialized, skipping credit addition')
        throw new Error('Service temporarily unavailable')
    }

    try {
        // Use userCredits collection
        const userRef = adminDb.collection('userCredits').doc(uid)
        
        // Check if user exists, if not create
        const userDoc = await userRef.get()
        if (!userDoc.exists) {
            await userRef.set({
                userId: uid,
                totalCredits: amount,
                usedCredits: 0,
                remainingCredits: amount,
                purchaseHistory: [],
                usageHistory: [],
                createdAt: FieldValue.serverTimestamp(),
                lastUpdated: FieldValue.serverTimestamp()
            })
        } else {
            // Update existing user credits atomically
            await withTimeout(
                userRef.update({
                    totalCredits: FieldValue.increment(amount),
                    remainingCredits: FieldValue.increment(amount),
                    lastUpdated: FieldValue.serverTimestamp()
                }),
                TIMEOUTS.FIREBASE_OPERATION,
                'Firebase operation timed out'
            )
        }

        // Log purchase for tracking
        await withTimeout(
            adminDb.collection('creditPurchases').add({
                userId: uid,
                credits: amount,
                source,
                metadata: metadata || {},
                timestamp: FieldValue.serverTimestamp()
            }),
            TIMEOUTS.FIREBASE_OPERATION,
            'Firebase operation timed out'
        )

        console.log(`[Credits] Added ${amount} credit(s) to user ${uid} from ${source}`)
    } catch (error: any) {
        console.error('Error adding credits:', error.message)
        throw error // Throw here because failed credit addition is critical
    }
}
