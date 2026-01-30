'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { OrganizationMembership, Organization } from '@/lib/organizationTypes';

interface UserProfile {
    credits: {
        total: number;
        used: number;
        remaining: number;
    };
    createdAt: Date;
    lastUpdated: Date;
}

interface UserOrganizationContext {
    membership: OrganizationMembership | null;
    organization: Organization | null;
}

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    organizationContext: UserOrganizationContext | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userProfile: null,
    organizationContext: null,
    loading: true,
    signInWithGoogle: async () => { },
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [organizationContext, setOrganizationContext] = useState<UserOrganizationContext | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
            setUser(authUser);

            if (authUser) {
                // Subscribe to user profile in Firestore with error handling
                const unsubscribeSnapshot = onSnapshot(
                    doc(db, 'users', authUser.uid), 
                    (doc) => {
                        if (doc.exists()) {
                            setUserProfile(doc.data() as UserProfile);
                        } else {
                            // Default profile if not exists
                            setUserProfile({
                                credits: {
                                    total: 0,
                                    used: 0,
                                    remaining: 0
                                },
                                createdAt: new Date(),
                                lastUpdated: new Date()
                            });
                        }
                    }, 
                    (error) => {
                        console.error("Error fetching user profile:", error);
                        // Set default profile on error to prevent blocking
                        setUserProfile({
                            credits: {
                                total: 0,
                                used: 0,
                                remaining: 0
                            },
                            createdAt: new Date(),
                            lastUpdated: new Date()
                        });
                    }
                );

                // Load organization membership
                try {
                    const membershipsQuery = query(
                        collection(db, 'organizationMemberships'),
                        where('userId', '==', authUser.uid),
                        where('status', '==', 'active')
                    );
                    const membershipsSnapshot = await getDocs(membershipsQuery);
                    
                    if (!membershipsSnapshot.empty) {
                        const membership = membershipsSnapshot.docs[0].data() as OrganizationMembership;
                        
                        // Load organization details
                        const orgDoc = await getDocs(query(
                            collection(db, 'organizations'),
                            where('__name__', '==', membership.organizationId)
                        ));
                        
                        if (!orgDoc.empty) {
                            const organization = { id: orgDoc.docs[0].id, ...orgDoc.docs[0].data() } as Organization;
                            setOrganizationContext({ membership, organization });
                        } else {
                            setOrganizationContext({ membership, organization: null });
                        }
                    } else {
                        setOrganizationContext(null);
                    }
                } catch (error) {
                    console.error("Error loading organization context:", error);
                    setOrganizationContext(null);
                }
                
                setLoading(false);

                return () => unsubscribeSnapshot();
            } else {
                setUserProfile(null);
                setOrganizationContext(null);
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, userProfile, organizationContext, loading, signInWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
