const crypto = require('crypto');

// OAuth2Client is provided by Backend/server.js, keeping this folder independent.
function createGoogleAuth(OAuth2Client) {
  const sessions = new Map();
  const sessionLifetimeMs = 8 * 60 * 60 * 1000;

  function getGoogleClient() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) throw new Error('GOOGLE_CLIENT_ID is missing. Add it to Backend/.env.');
    return new OAuth2Client(clientId);
  }

  async function signInWithGoogle(credential) {
    const ticket = await getGoogleClient().verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const profile = ticket.getPayload();

    if (!profile.email || !profile.email_verified) {
      throw new Error('Google did not return a verified email address.');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const user = { name: profile.name || profile.email, email: profile.email, picture: profile.picture || '' };
    sessions.set(token, { user, expiresAt: Date.now() + sessionLifetimeMs });
    return { token, user };
  }

  function getUserFromRequest(request) {
    const authorization = request.headers.authorization || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
    const session = sessions.get(token);

    if (!session || session.expiresAt < Date.now()) {
      sessions.delete(token);
      return null;
    }
    return session.user;
  }

  function deleteSession(request) {
    const authorization = request.headers.authorization || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
    sessions.delete(token);
  }

  setInterval(() => {
    const now = Date.now();
    for (const [token, session] of sessions) if (session.expiresAt < now) sessions.delete(token);
  }, 60 * 60 * 1000).unref();

  return { signInWithGoogle, getUserFromRequest, deleteSession };
}

module.exports = { createGoogleAuth };
