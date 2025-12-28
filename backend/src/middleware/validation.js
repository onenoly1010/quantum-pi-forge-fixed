/**
 * Validation Middleware
 * Input validation and sanitization
 */

/**
 * Validate Ethereum address format
 */
export function validateEthereumAddress(address) {
  if (!address || typeof address !== 'string') {
    return { valid: false, error: 'Address is required' };
  }
  
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return { valid: false, error: 'Invalid Ethereum address format' };
  }
  
  return { valid: true };
}

/**
 * Validate staking amount
 */
export function validateStakingAmount(amount, min = 0.01, max = 10000) {
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return { valid: false, error: 'Amount must be a valid number' };
  }
  
  if (numAmount < min) {
    return { valid: false, error: `Amount must be at least ${min}` };
  }
  
  if (numAmount > max) {
    return { valid: false, error: `Amount cannot exceed ${max}` };
  }
  
  // Check for reasonable decimal places (18 for ERC20)
  const decimals = amount.toString().split('.')[1]?.length || 0;
  if (decimals > 18) {
    return { valid: false, error: 'Too many decimal places' };
  }
  
  return { valid: true, amount: numAmount };
}

/**
 * Validate transaction hash format
 */
export function validateTransactionHash(hash) {
  if (!hash || typeof hash !== 'string') {
    return { valid: false, error: 'Transaction hash is required' };
  }
  
  if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
    return { valid: false, error: 'Invalid transaction hash format' };
  }
  
  return { valid: true };
}

/**
 * Sanitize string input
 */
export function sanitizeString(input, maxLength = 1000) {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove potential XSS vectors
    .trim();
}

/**
 * Express middleware: Validate staking request body
 */
export function validateStakingRequest(req, res, next) {
  const { userAddress, amount } = req.body;
  
  // Validate address
  const addressValidation = validateEthereumAddress(userAddress);
  if (!addressValidation.valid) {
    return res.status(400).json({
      success: false,
      error: addressValidation.error,
      field: 'userAddress',
    });
  }
  
  // Validate amount
  const amountValidation = validateStakingAmount(amount);
  if (!amountValidation.valid) {
    return res.status(400).json({
      success: false,
      error: amountValidation.error,
      field: 'amount',
    });
  }
  
  // Attach validated data
  req.validatedData = {
    userAddress: userAddress.toLowerCase(),
    amount: amountValidation.amount,
  };
  
  next();
}

/**
 * Express middleware: Validate address parameter
 */
export function validateAddressParam(req, res, next) {
  const { address } = req.params;
  
  const validation = validateEthereumAddress(address);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: validation.error,
    });
  }
  
  req.validatedAddress = address.toLowerCase();
  next();
}

export default {
  validateEthereumAddress,
  validateStakingAmount,
  validateTransactionHash,
  sanitizeString,
  validateStakingRequest,
  validateAddressParam,
};
