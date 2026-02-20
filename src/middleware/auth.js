/**
 * Authentication Middleware - Enterprise API Security
 * Validates API keys and enforces access control
 */

const crypto = require('crypto');

/**
 * Validate API key from request header
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function authenticateAPI(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const authHeader = req.headers['authorization'];
  
  // Check for API key in header
  if (!apiKey && !authHeader) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Missing x-api-key header or Authorization header',
      code: 'MISSING_AUTH'
    });
  }

  try {
    // API Key authentication (for device gateways)
    if (apiKey) {
      const validKeys = (process.env.VALID_API_KEYS || '').split(',').filter(k => k.trim());
      
      if (validKeys.length === 0) {
        console.warn('Warning: VALID_API_KEYS not configured in environment');
        // In development, allow pass-through if no keys configured
        if (process.env.NODE_ENV === 'development') {
          req.org_id = 'ORG-DEV-DEFAULT';
          req.auth_type = 'dev_bypass';
          return next();
        }
        return res.status(500).json({
          error: 'Server configuration error',
          message: 'Authentication not properly configured',
          code: 'AUTH_NOT_CONFIGURED'
        });
      }

      // Validate API key
      if (!validKeys.includes(apiKey)) {
        return res.status(403).json({
          error: 'Invalid API key',
          message: 'The provided API key is not valid',
          code: 'INVALID_API_KEY'
        });
      }

      // Extract organization ID from API key prefix
      // Format: ghpk_<org_id>_<random>
      const match = apiKey.match(/^ghpk_([^_]+)_/);
      req.org_id = match ? match[1] : 'ORG-DEFAULT';
      req.auth_type = 'api_key';
      
      return next();
    }

    // JWT/Bearer token authentication (for web dashboards/admins)
    // TODO: Implement JWT validation when needed
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // For now, return not implemented
      return res.status(501).json({
        error: 'JWT authentication not yet implemented',
        message: 'Use x-api-key header for API authentication',
        code: 'JWT_NOT_IMPLEMENTED'
      });
    }

    // No valid authentication method
    return res.status(401).json({
      error: 'Invalid authentication method',
      message: 'Use x-api-key header with valid API key',
      code: 'INVALID_AUTH_METHOD'
    });

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      error: 'Authentication failed',
      message: error.message,
      code: 'AUTH_ERROR'
    });
  }
}

/**
 * Role-Based Access Control (RBAC) middleware
 * Restricts access based on user roles
 * @param {Array<string>} allowedRoles - Array of roles that can access the endpoint
 * @returns {Function} Express middleware function
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user_role || 'viewer'; // Default to viewer

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This endpoint requires one of these roles: ${allowedRoles.join(', ')}`,
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: allowedRoles,
        userRole
      });
    }

    next();
  };
}

/**
 * Generate a new API key for an organization
 * @param {string} orgId - Organization identifier
 * @returns {string} Generated API key
 */
function generateAPIKey(orgId) {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `ghpk_${orgId}_${randomBytes}`;
}

/**
 * Hash an API key for secure storage
 * @param {string} apiKey - Plain API key
 * @returns {string} SHA256 hash of the API key
 */
function hashAPIKey(apiKey) {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Verify if a plain API key matches a stored hash
 * @param {string} plainKey - Plain API key to verify
 * @param {string} storedHash - Stored hash to compare against
 * @returns {boolean} True if key matches hash
 */
function verifyAPIKey(plainKey, storedHash) {
  const plainHash = hashAPIKey(plainKey);
  return crypto.timingSafeEqual(
    Buffer.from(plainHash, 'hex'),
    Buffer.from(storedHash, 'hex')
  );
}

module.exports = {
  authenticateAPI,
  requireRole,
  generateAPIKey,
  hashAPIKey,
  verifyAPIKey
};