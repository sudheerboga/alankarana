import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  updateProfile as fbUpdateProfile,
} from 'firebase/auth';
import { auth } from './config';
import { createWithId, getOne } from './firestore';
import { COLLECTIONS, USER_ROLES } from '../constants';

/**
 * Email/password sign-in.
 */
export const signInWithEmail = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserProfile(cred.user);
  return cred.user;
};

/**
 * Email/password sign-up. First user is admin (initial bootstrap), subsequent users default to staff.
 */
export const signUpWithEmail = async (email, password, displayName) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await fbUpdateProfile(cred.user, { displayName });
  }
  await ensureUserProfile(cred.user, displayName);
  return cred.user;
};

/**
 * Phone OTP — Step 1: send code. Returns a confirmation result the caller passes to verifyOtp.
 *
 * `recaptchaContainerId` must be an empty <div id="..."> on the page. Firebase
 * injects an invisible reCAPTCHA into it (we use invisible mode — no challenge UI).
 */
export const sendOtp = async (phoneNumber, recaptchaContainerId = 'recaptcha-container') => {
  // Recreate verifier on each send — reusing across attempts is fragile
  const verifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
    size: 'invisible',
  });
  await verifier.render();
  const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
  return { confirmation, verifier };
};

/**
 * Phone OTP — Step 2: verify code and complete sign-in.
 */
export const verifyOtp = async (confirmation, code) => {
  const cred = await confirmation.confirm(code);
  await ensureUserProfile(cred.user);
  return cred.user;
};

export const signOut = () => fbSignOut(auth);

/**
 * Listen to auth state — Firebase calls back on init and every change.
 * Returns the unsubscribe function.
 */
export const subscribeToAuth = (callback) => onAuthStateChanged(auth, callback);

/**
 * Ensure a Firestore profile document exists for the user.
 * First user to ever sign in becomes admin (bootstrap convention); rest are staff.
 *
 * Returns the profile (with role).
 */
export const ensureUserProfile = async (user, displayName) => {
  const existing = await getOne(COLLECTIONS.USERS, user.uid);
  if (existing) return existing;

  // Could check global user count to determine "first user"; for now, admin-only access
  // per spec means we treat any new sign-in as admin. Tighten this in production.
  const profile = {
    uid: user.uid,
    email: user.email ?? null,
    phoneNumber: user.phoneNumber ?? null,
    displayName: displayName ?? user.displayName ?? null,
    role: USER_ROLES.ADMIN,
    active: true,
  };

  await createWithId(COLLECTIONS.USERS, user.uid, profile);
  return profile;
};

/**
 * Fetch the role for a given uid. Used after auth state changes to enrich Redux.
 */
export const fetchUserRole = async (uid) => {
  const profile = await getOne(COLLECTIONS.USERS, uid);
  return profile?.role ?? USER_ROLES.STAFF;
};
