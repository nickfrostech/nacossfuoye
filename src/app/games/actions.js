'use server';

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerAuthClient } from '@/utils/supabase/server';
import { getGameBySlug, isGameReleased } from './games';

// In-memory set of used session IDs to prevent token replay attacks
const usedSessionIds = new Set();

// Periodically clean up old session IDs to prevent memory growth
if (typeof setInterval !== 'undefined') {
   setInterval(() => {
      if (usedSessionIds.size > 5000) {
         usedSessionIds.clear();
      }
   }, 15 * 60 * 1000);
}

/**
 * Creates a cryptographically signed game session token using a private server secret.
 * The client receives the signed token but never has access to the server salt.
 */
export async function createGameSession(game_slug) {
   if (!game_slug || typeof game_slug !== 'string') {
      return { success: false, error: 'Invalid game slug' };
   }

   const isDev = process.env.NODE_ENV !== 'production';
   const game = getGameBySlug(game_slug);
   if ((!game || !isGameReleased(game)) && !isDev) {
      return { success: false, error: 'This game has not been released yet.' };
   }

   const secret = process.env.GAME_SALT || process.env.GAME_SECRET || 'nacoss_arcade_secure_salt';
   const sessionId = crypto.randomUUID();
   const timestamp = Date.now();

   // Payload format: sessionId:game_slug:timestamp
   const payload = `${sessionId}:${game_slug}:${timestamp}`;
   const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
   const sessionToken = `${payload}:${signature}`;

   return { success: true, sessionToken };
}

/**
 * Validates the HMAC signature, single-use token, elapsed duration, and saves the score.
 */
export async function submitScore(data, sessionToken) {
   // Validate server action session context
   try {
      const authClient = await createServerAuthClient();
      await authClient.auth.getUser();
   } catch {
      // Allow unauthenticated arcade players to submit leaderboard scores
   }

   if (!data || typeof data !== 'object' || !data.game_slug || !data.gaming_name || typeof data.score !== 'number' || !Number.isFinite(data.score)) {
      return { success: false, error: 'Invalid score payload' };
   }

   const isDev = process.env.NODE_ENV !== 'production';
   const game = getGameBySlug(data.game_slug);
   if ((!game || !isGameReleased(game)) && !isDev) {
      return { success: false, error: 'This game has not been released yet.' };
   }

   if (!sessionToken || typeof sessionToken !== 'string') {
      return { success: false, error: 'Missing security session token' };
   }

   const parts = sessionToken.split(':');
   if (parts.length !== 4) {
      return { success: false, error: 'Invalid session token format' };
   }

   const [sessionId, tokenSlug, tokenTimeStr, clientSig] = parts;
   const tokenTime = parseInt(tokenTimeStr, 10);

   if (tokenSlug !== data.game_slug) {
      return { success: false, error: 'Session token does not match game' };
   }

   const secret = process.env.GAME_SALT || process.env.GAME_SECRET || 'nacoss_arcade_secure_salt';
   const expectedPayload = `${sessionId}:${tokenSlug}:${tokenTimeStr}`;
   const expectedSig = crypto.createHmac('sha256', secret).update(expectedPayload).digest('hex');

   // Timing-safe HMAC comparison
   if (!crypto.timingSafeEqual(Buffer.from(clientSig, 'hex'), Buffer.from(expectedSig, 'hex'))) {
      console.error('Cheating detected! Invalid HMAC signature.');
      return { success: false, error: 'Security verification failed' };
   }

   // Prevent token replay attacks: each session token can only be submitted once
   if (usedSessionIds.has(sessionId)) {
      return { success: false, error: 'Game session already submitted' };
   }
   usedSessionIds.add(sessionId);

   const elapsedMs = Date.now() - tokenTime;

   // Enforce realistic minimum game duration (at least 200ms elapsed since session created)
   if (elapsedMs < 200) {
      console.error('Cheating detected! Session completed impossibly fast:', elapsedMs);
      return { success: false, error: 'Game completed impossibly fast' };
   }

   // Expire session tokens after 30 minutes
   if (elapsedMs > 30 * 60 * 1000) {
      return { success: false, error: 'Game session expired. Please play again.' };
   }

   // Initialize Supabase client
   // We MUST use the service key to bypass Row Level Security on the server side
   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
   const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

   if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase environment variables missing. SUPABASE_SERVICE_ROLE_KEY is required.");
      return { success: false, error: 'Server misconfiguration' };
   }

   const supabase = createClient(supabaseUrl, supabaseKey);

   const cleanName = data.gaming_name.trim();

   // 1. Check if the player already has a score for this game
   const { data: existingRecords, error: fetchError } = await supabase
      .from('game_scores')
      .select('id, score')
      .eq('game_slug', data.game_slug)
      .ilike('gaming_name', cleanName)
      .order('score', { ascending: false });

   if (fetchError) {
      console.error('Supabase Fetch Error:', fetchError);
      return { success: false, error: fetchError.message };
   }

   const bestExisting = existingRecords?.[0];

   if (bestExisting) {
      // 2. If new score is higher, update it. If not, ignore it.
      if (data.score > bestExisting.score) {
         const { error: updateError } = await supabase
            .from('game_scores')
            .update({ score: data.score, level: data.level, gaming_name: cleanName })
            .eq('id', bestExisting.id);

         if (updateError) {
            console.error('Supabase Update Error:', updateError);
            return { success: false, error: updateError.message };
         }
      }

      // Automatically clean up any duplicate rows for this player if they exist
      if (existingRecords.length > 1) {
         const duplicateIds = existingRecords.slice(1).map((r) => r.id);
         await supabase.from('game_scores').delete().in('id', duplicateIds);
      }
   } else {
      // 3. No existing score found, insert a new row
      const { error: insertError } = await supabase.from('game_scores').insert({
         game_slug: data.game_slug,
         gaming_name: cleanName,
         level: data.level,
         score: data.score
      });

      if (insertError) {
         console.error('Supabase Insert Error:', insertError);
         return { success: false, error: insertError.message };
      }
   }

   return { success: true };
}

export async function getLeaderboard(game_slug) {
   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
   const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

   if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase environment variables missing");
      return [];
   }

   const supabase = createClient(supabaseUrl, supabaseKey);

   // Fetch top scores ordered by score descending
   const { data, error } = await supabase
      .from('game_scores')
      .select('gaming_name, level, score')
      .eq('game_slug', game_slug)
      .order('score', { ascending: false })
      .limit(30);

   if (error) {
      console.error('Supabase Fetch Error (Leaderboard):', error);
      return [];
   }

   // Deduplicate by player name so each player appears only once with their highest score
   const seen = new Set();
   const uniqueLeaderboard = [];
   for (const row of (data || [])) {
      const key = row.gaming_name?.trim().toLowerCase();
      if (key && !seen.has(key)) {
         seen.add(key);
         uniqueLeaderboard.push(row);
         if (uniqueLeaderboard.length === 10) break;
      }
   }

   return uniqueLeaderboard;
}
