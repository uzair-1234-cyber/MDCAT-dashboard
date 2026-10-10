import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import type { Request } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'mediprep-sindh-board-jwt-secret-key-2025-secure';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'auth_users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'auth_sessions.json');
const USERS_DIR = path.join(DATA_DIR, 'users');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(USERS_DIR)) fs.mkdirSync(USERS_DIR, { recursive: true });

export interface AuthUserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  salt: string;
  aspirantType: string;
  targetExam: string;
  targetYear: string;
  dreamMedicalCollege: string;
  personalMotto: string;
  createdAt: string;
  lastLoginAt?: string;
  avatarUrl?: string;
}

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  aspirantType: string;
  targetExam: string;
  targetYear: string;
  dreamMedicalCollege: string;
  personalMotto: string;
  createdAt: string;
  lastLoginAt?: string;
  avatarUrl?: string;
}

interface SessionRecord {
  userId: string;
  createdAt: string;
  expiresAt: string;
}

class AuthManager {
  private users: Map<string, AuthUserRecord> = new Map();
  private sessions: Map<string, SessionRecord> = new Map();

  constructor() {
    this.loadUsers();
    this.loadSessions();
    this.ensureBootstrapUsers();
  }

  private loadUsers() {
    try {
      if (fs.existsSync(USERS_FILE)) {
        const raw = fs.readFileSync(USERS_FILE, 'utf-8');
        const list: AuthUserRecord[] = JSON.parse(raw);
        if (Array.isArray(list)) {
          list.forEach((u) => this.users.set(u.id, u));
        }
      }
    } catch (err) {
      console.error('[AuthManager] Error loading users:', err);
    }
  }

  private saveUsers() {
    try {
      const list = Array.from(this.users.values());
      fs.writeFileSync(USERS_FILE, JSON.stringify(list, null, 2), 'utf-8');
    } catch (err) {
      console.error('[AuthManager] Error saving users:', err);
    }
  }

  private loadSessions() {
    try {
      if (fs.existsSync(SESSIONS_FILE)) {
        const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
        const obj = JSON.parse(raw);
        const now = Date.now();
        Object.entries(obj).forEach(([token, sess]: [string, any]) => {
          if (sess && sess.userId && new Date(sess.expiresAt).getTime() > now) {
            this.sessions.set(token, sess);
          }
        });
      }
    } catch (err) {
      console.error('[AuthManager] Error loading sessions:', err);
    }
  }

  private saveSessions() {
    try {
      const obj: Record<string, SessionRecord> = {};
      this.sessions.forEach((val, key) => {
        obj[key] = val;
      });
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (err) {
      console.error('[AuthManager] Error saving sessions:', err);
    }
  }

  private hashPassword(password: string): { salt: string; hash: string } {
    try {
      const hash = bcrypt.hashSync(password, 10);
      return { salt: 'bcrypt', hash };
    } catch {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.scryptSync(password, salt, 64).toString('hex');
      return { salt, hash };
    }
  }

  private verifyPassword(password: string, salt: string, storedHash: string): boolean {
    if (salt === 'bcrypt' || (storedHash && (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$')))) {
      try {
        return bcrypt.compareSync(password, storedHash);
      } catch {
        return false;
      }
    }
    try {
      const hash = crypto.scryptSync(password, salt, 64).toString('hex');
      return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
    } catch {
      return false;
    }
  }

  private toSafeUser(u: AuthUserRecord): SafeUser {
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      aspirantType: u.aspirantType,
      targetExam: u.targetExam,
      targetYear: u.targetYear,
      dreamMedicalCollege: u.dreamMedicalCollege,
      personalMotto: u.personalMotto,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
      avatarUrl: u.avatarUrl,
    };
  }

  public getUserDbPath(userId: string): string {
    const sanitized = userId.replace(/[^a-zA-Z0-9_\-]/g, '_');
    const userDir = path.join(USERS_DIR, sanitized);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    return path.join(userDir, 'mediprep_db.json');
  }

  private ensureBootstrapUsers() {
    // 1. Primary Aspirant
    const primaryId = 'usr_uzair_primary';
    const primaryEmail = 'uzairkorejo633@gmail.com';

    let hasPrimary = Array.from(this.users.values()).some(
      (u) => u.email.toLowerCase() === primaryEmail.toLowerCase()
    );

    if (!hasPrimary) {
      const { salt, hash } = this.hashPassword('password123');
      const primaryUser: AuthUserRecord = {
        id: primaryId,
        email: primaryEmail,
        name: 'Sindh Board Student',
        passwordHash: hash,
        salt,
        aspirantType: 'First-Year Sindh Board Medical Aspirant',
        targetExam: 'MDCAT / NUMS',
        targetYear: '2026',
        dreamMedicalCollege: 'Dow University of Health Sciences (DUHS) / King Edward',
        personalMotto: 'Discipline Today → Doctor Tomorrow.',
        createdAt: new Date().toISOString(),
      };
      this.users.set(primaryId, primaryUser);
    }

    this.saveUsers();
  }

  public register(payload: {
    name: string;
    email: string;
    password: string;
    aspirantType?: string;
    targetExam?: string;
    targetYear?: string;
    dreamMedicalCollege?: string;
    personalMotto?: string;
  }): { success: boolean; token?: string; user?: SafeUser; message?: string } {
    const name = String(payload.name || '').trim();
    const email = String(payload.email || '').trim().toLowerCase();
    const password = String(payload.password || '');

    if (!name || name.length < 2) {
      return { success: false, message: 'Please provide a valid full name (at least 2 letters).' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return { success: false, message: 'Please provide a valid email address.' };
    }

    if (!password || password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    // Check email uniqueness
    const existing = Array.from(this.users.values()).find((u) => u.email.toLowerCase() === email);
    if (existing) {
      return { success: false, message: 'An account with this email already exists. Please log in.' };
    }

    const id = `usr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const { salt, hash } = this.hashPassword(password);

    const newUser: AuthUserRecord = {
      id,
      email,
      name,
      passwordHash: hash,
      salt,
      aspirantType: payload.aspirantType?.trim() || 'First-Year Sindh Board Medical Aspirant',
      targetExam: payload.targetExam?.trim() || 'MDCAT / NUMS',
      targetYear: payload.targetYear?.trim() || '2026',
      dreamMedicalCollege: payload.dreamMedicalCollege?.trim() || 'Dow University of Health Sciences (DUHS)',
      personalMotto: payload.personalMotto?.trim() || 'Discipline Today → Doctor Tomorrow.',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    this.users.set(id, newUser);
    this.saveUsers();

    // Create session token
    const token = this.createSession(id);

    return {
      success: true,
      token,
      user: this.toSafeUser(newUser),
      message: 'Account created successfully! Welcome to Sindh Board XI.',
    };
  }

  public login(
    emailInput: string,
    passwordInput: string
  ): { success: boolean; token?: string; user?: SafeUser; message?: string } {
    const email = String(emailInput || '').trim().toLowerCase();
    const password = String(passwordInput || '');

    if (!email || !password) {
      return { success: false, message: 'Email and password are required.' };
    }

    const user = Array.from(this.users.values()).find((u) => u.email.toLowerCase() === email);
    if (!user) {
      return { success: false, message: 'Incorrect email or password. Please check your credentials.' };
    }

    const isValid = this.verifyPassword(password, user.salt, user.passwordHash);
    if (!isValid) {
      return { success: false, message: 'Incorrect email or password. Please check your credentials.' };
    }

    user.lastLoginAt = new Date().toISOString();
    this.saveUsers();

    const token = this.createSession(user.id);

    return {
      success: true,
      token,
      user: this.toSafeUser(user),
      message: 'Welcome back to your study workspace!',
    };
  }

  private createSession(userId: string): string {
    const user = this.users.get(userId);
    const token = jwt.sign(
      { userId, email: user?.email || '', name: user?.name || '' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
    this.sessions.set(token, {
      userId,
      createdAt: new Date().toISOString(),
      expiresAt,
    });
    this.saveSessions();
    return token;
  }

  public validateToken(token: string): SafeUser | null {
    if (!token) return null;

    // 1. Check in-memory / file session cache
    const sess = this.sessions.get(token);
    if (sess) {
      if (new Date(sess.expiresAt).getTime() < Date.now()) {
        this.sessions.delete(token);
        this.saveSessions();
      } else {
        const user = this.users.get(sess.userId);
        if (user) return this.toSafeUser(user);
      }
    }

    // 2. Decode JWT if token is formatted as JWT (starts with eyJ)
    if (token.startsWith('eyJ')) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded && (decoded.userId || decoded.id)) {
          const uid = decoded.userId || decoded.id;
          const user = this.users.get(uid);
          if (user) return this.toSafeUser(user);
          // Return valid safe user from JWT payload
          return {
            id: uid,
            email: decoded.email || '',
            name: decoded.name || (decoded.email ? decoded.email.split('@')[0] : 'Student'),
            aspirantType: 'First-Year Sindh Board Medical Aspirant',
            targetExam: 'MDCAT / NUMS',
            targetYear: '2026',
            dreamMedicalCollege: 'Dow University of Health Sciences (DUHS, Karachi)',
            personalMotto: 'Future Doctor in the making — Dedication, Focus, Success.',
            createdAt: new Date().toISOString(),
          };
        }
      } catch (_) {}
    }

    return null;
  }

  public logout(token: string): boolean {
    if (!token) return false;
    const deleted = this.sessions.delete(token);
    if (deleted) this.saveSessions();
    return deleted;
  }

  public getReqUser(req: Request): SafeUser | null {
    const authHeader = req.headers.authorization;
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.headers['x-auth-token']) {
      token = String(req.headers['x-auth-token']).trim();
    }

    if (token) {
      const user = this.validateToken(token);
      if (user) return user;
    }

    // Secondary check: trusted X-User-Id header if present
    const headerUserId = req.headers['x-user-id'];
    if (headerUserId && typeof headerUserId === 'string' && headerUserId.trim()) {
      const u = this.users.get(headerUserId.trim());
      if (u) return this.toSafeUser(u);
    }

    return null;
  }

  public getUserById(userId: string): SafeUser | null {
    const user = this.users.get(userId);
    return user ? this.toSafeUser(user) : null;
  }

  public updateProfile(
    userId: string,
    updates: Partial<SafeUser>
  ): { success: boolean; user?: SafeUser; message?: string } {
    const user = this.users.get(userId);
    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    if (updates.name !== undefined) user.name = String(updates.name).trim();
    if (updates.aspirantType !== undefined) user.aspirantType = String(updates.aspirantType).trim();
    if (updates.targetExam !== undefined) user.targetExam = String(updates.targetExam).trim();
    if (updates.targetYear !== undefined) user.targetYear = String(updates.targetYear).trim();
    if (updates.dreamMedicalCollege !== undefined)
      user.dreamMedicalCollege = String(updates.dreamMedicalCollege).trim();
    if (updates.personalMotto !== undefined) user.personalMotto = String(updates.personalMotto).trim();
    if (updates.avatarUrl !== undefined) user.avatarUrl = String(updates.avatarUrl);

    this.saveUsers();
    return {
      success: true,
      user: this.toSafeUser(user),
      message: 'Profile updated successfully!',
    };
  }

  public changePassword(
    userId: string,
    currentPass: string,
    newPass: string
  ): { success: boolean; message: string } {
    const user = this.users.get(userId);
    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    if (!this.verifyPassword(currentPass, user.salt, user.passwordHash)) {
      return { success: false, message: 'Current password is incorrect.' };
    }

    if (!newPass || newPass.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters long.' };
    }

    const { salt, hash } = this.hashPassword(newPass);
    user.salt = salt;
    user.passwordHash = hash;
    this.saveUsers();

    return { success: true, message: 'Password changed successfully.' };
  }

  public getAllUsers(): AuthUserRecord[] {
    return Array.from(this.users.values());
  }

  public getUserByEmail(email: string): AuthUserRecord | undefined {
    const norm = String(email || '').trim().toLowerCase();
    return Array.from(this.users.values()).find((u) => u.email.toLowerCase() === norm);
  }

  public importUser(u: AuthUserRecord) {
    this.users.set(u.id, u);
    this.saveUsers();
  }
}

export const authManager = new AuthManager();
