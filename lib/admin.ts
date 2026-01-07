import * as admin from 'firebase-admin'

let adminInitialized = false

function initializeAdmin() {
    if (admin.apps.length > 0) {
        adminInitialized = true
        return
    }

    if (adminInitialized) {
        return
    }

    try {
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

        if (!projectId || !clientEmail || !privateKey) {
            console.error('Firebase Admin: Missing required environment variables')
            adminInitialized = false
            return
        }

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        })
        adminInitialized = true
        console.log('Firebase Admin initialized successfully')
    } catch (error: any) {
        console.error('Firebase Admin initialization error:', error.message)
        adminInitialized = false
        // Don't throw - allow app to continue but operations will fail gracefully
    }
}

// Initialize on module load
initializeAdmin()

// Export with safety checks
export const adminDb = admin.apps.length > 0 ? admin.firestore() : null as any
export const adminAuth = admin.apps.length > 0 ? admin.auth() : null as any

// Helper to check if admin is initialized
export function isAdminInitialized(): boolean {
    return admin.apps.length > 0 && adminInitialized
}
