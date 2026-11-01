/**
 * Client-Side WebAuthn & Biometric Passkey Helper Library for Clean Quest.
 * Built with @simplewebauthn/browser for full W3C WebAuthn Level 3 compliance.
 *
 * Security Architecture:
 * 1. Server generates cryptographically secure one-time challenges.
 * 2. Device hardware enclave (TPM / Apple Secure Enclave / Windows Hello) creates/signs credentials.
 * 3. Server cryptographically validates attestation / assertion signatures and consumes challenges.
 * 4. Legitimate Supabase-authenticated sessions are returned upon verified biometric authentication.
 * 5. Zero biometric images, facial scans, or camera video are ever captured, transmitted, or stored.
 */

import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

/**
 * Check if WebAuthn is supported in current browser & environment.
 */
export function isWebAuthnSupported() {
  return typeof window !== 'undefined' &&
    typeof window.PublicKeyCredential !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    Boolean(navigator.credentials?.create) &&
    Boolean(navigator.credentials?.get);
}

/**
 * Check if platform authenticator (Touch ID, Face ID, Windows Hello, Android Biometric) is available.
 */
export async function isPlatformAuthenticatorAvailable() {
  if (!isWebAuthnSupported()) return false;
  try {
    if (typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
    return false;
  } catch (err) {
    console.warn('Error checking platform authenticator availability:', err);
    return false;
  }
}

/**
 * Detect operating system / device platform name and biometric type for friendly UI badges.
 */
export function getDeviceBiometricInfo() {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const platform = typeof navigator !== 'undefined' ? (navigator.userAgentData?.platform || navigator.platform || '') : '';

  if (/Win/i.test(platform) || /Windows/i.test(userAgent)) {
    return {
      os: 'Windows',
      biometricName: 'Windows Hello / PIN',
      icon: 'windows',
      defaultDeviceName: 'Windows Hello Device',
    };
  }

  if (/Mac/i.test(platform) || /Macintosh/i.test(userAgent)) {
    return {
      os: 'macOS',
      biometricName: 'Touch ID / Apple Passkey',
      icon: 'apple',
      defaultDeviceName: 'MacBook / Mac Device',
    };
  }

  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return {
      os: 'iOS',
      biometricName: 'Face ID / Touch ID',
      icon: 'apple',
      defaultDeviceName: 'iPhone / iPad',
    };
  }

  if (/Android/i.test(userAgent)) {
    return {
      os: 'Android',
      biometricName: 'Fingerprint / Face Unlock',
      icon: 'android',
      defaultDeviceName: 'Android Device',
    };
  }

  return {
    os: 'Device',
    biometricName: 'Biometrics / Security Key',
    icon: 'key',
    defaultDeviceName: 'Personal Device',
  };
}

/**
 * Register a new passkey with server-side challenge generation and attestation verification.
 */
export async function registerDevicePasskey({ user, deviceName }) {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported on this browser or device.');
  }

  if (!user || !user.id || !user.email) {
    throw new Error('Valid user context is required to register a passkey.');
  }

  const defaultDevice = getDeviceBiometricInfo();
  const friendlyName = deviceName?.trim() || defaultDevice.defaultDeviceName;

  // 1. Fetch registration options with server-generated challenge
  const optRes = await fetch('/api/passkey/register-options', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user }),
  });

  if (!optRes.ok) {
    const errData = await optRes.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to initialize server-side passkey registration.');
  }

  const optionsJSON = await optRes.json();

  // 2. Prompt device authenticator (Face ID / Touch ID / Windows Hello)
  let attestationResponse;
  try {
    attestationResponse = await startRegistration({ optionsJSON });
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      throw new Error('Passkey registration was cancelled or timed out.');
    } else if (err.name === 'InvalidStateError') {
      throw new Error('This authenticator is already registered for your account.');
    }
    throw new Error(err.message || 'Biometric registration failed.');
  }

  // 3. Send attestation response to server for cryptographic verification and challenge consumption
  const verifyRes = await fetch('/api/passkey/register-verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user,
      response: attestationResponse,
      deviceName: friendlyName,
      challenge: optionsJSON.challenge,
    }),
  });

  if (!verifyRes.ok) {
    const errData = await verifyRes.json().catch(() => ({}));
    throw new Error(errData.error || 'Server rejected passkey attestation.');
  }

  const verifyData = await verifyRes.json();

  return {
    credentialId: attestationResponse.id,
    deviceName: friendlyName,
    biometricType: defaultDevice.biometricName,
    createdAt: new Date().toISOString(),
    ...verifyData.passkey,
  };
}

/**
 * Authenticate using a registered passkey with server-side challenge and signature verification.
 */
export async function authenticateWithDevicePasskey() {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported in this environment.');
  }

  // 1. Fetch authentication options with server-generated challenge
  const optRes = await fetch('/api/passkey/auth-options', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  if (!optRes.ok) {
    const errData = await optRes.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to fetch passkey authentication challenge from server.');
  }

  const optionsJSON = await optRes.json();

  // 2. Prompt device biometric authenticator (Windows Hello, Face ID, Touch ID)
  let assertionResponse;
  try {
    assertionResponse = await startAuthentication({ optionsJSON });
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      throw new Error('Biometric verification was cancelled.');
    }
    throw new Error(err.message || 'Biometric authentication failed.');
  }

  // 3. Send assertion to server for cryptographic signature verification and challenge consumption
  const verifyRes = await fetch('/api/passkey/auth-verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      response: assertionResponse,
      challenge: optionsJSON.challenge,
    }),
  });

  if (!verifyRes.ok) {
    const errData = await verifyRes.json().catch(() => ({}));
    throw new Error(errData.error || 'Server rejected biometric passkey verification.');
  }

  const verifyData = await verifyRes.json();

  return {
    verified: true,
    credentialId: assertionResponse.id,
    userId: verifyData.userId,
    userEmail: verifyData.userEmail,
    session: verifyData.session,
  };
}
