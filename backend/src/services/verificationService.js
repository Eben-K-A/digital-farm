import pool from '../config/database.js';
import { generateOTP, validateIdFormat, validateMobileMoneyName } from '../utils/validators.js';

export async function initiateVerification(userId) {
  // Check if user is a farmer
  const userResult = await pool.query(
    'SELECT id, user_type FROM users WHERE id = $1',
    [userId]
  );

  if (userResult.rows.length === 0) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const user = userResult.rows[0];
  if (user.user_type !== 'farmer') {
    const error = new Error('Only farmers can initiate verification');
    error.status = 403;
    throw error;
  }

  // Get farmer ID
  const farmerResult = await pool.query(
    'SELECT id FROM farmers WHERE user_id = $1',
    [userId]
  );

  if (farmerResult.rows.length === 0) {
    const error = new Error('Farmer profile not found');
    error.status = 404;
    throw error;
  }

  const farmerId = farmerResult.rows[0].id;

  // Check if verification already exists
  const existingVerification = await pool.query(
    'SELECT id, status FROM farmer_verifications WHERE farmer_id = $1',
    [farmerId]
  );

  if (existingVerification.rows.length > 0 && existingVerification.rows[0].status === 'pending') {
    const error = new Error('Verification already in progress');
    error.status = 409;
    throw error;
  }

  // Create new verification
  const result = await pool.query(
    `INSERT INTO farmer_verifications (farmer_id, user_id, full_name, farm_name, region, district, town_community, gps_address, mobile_money_name, mobile_money_number, account_holder_name)
     VALUES ($1, $2, '', '', '', '', '', '', '', '', '')
     RETURNING id, farmer_id, current_step, status`,
    [farmerId, userId]
  );

  return result.rows[0];
}

export async function submitVerificationStep(userId, step, data) {
  // Get farmer verification
  const verificationResult = await pool.query(
    `SELECT * FROM farmer_verifications WHERE user_id = $1`,
    [userId]
  );

  if (verificationResult.rows.length === 0) {
    const error = new Error('Verification not found');
    error.status = 404;
    throw error;
  }

  const verification = verificationResult.rows[0];

  // Validate step data
  const validationError = validateStepData(step, data);
  if (validationError) {
    const error = new Error(validationError.message);
    error.status = 422;
    error.details = validationError.details;
    throw error;
  }

  // Update based on step
  if (step === 0) {
    // Personal Information
    await pool.query(
      `UPDATE farmer_verifications 
       SET full_name = $1, date_of_birth = $2, national_id_number = $3, national_id_type = $4, phone_number = $5
       WHERE id = $6`,
      [data.full_name, data.date_of_birth, data.national_id_number, data.national_id_type, data.phone_number, verification.id]
    );

    // Validate ID format
    if (validateIdFormat(data.national_id_number, data.national_id_type)) {
      await pool.query(
        `UPDATE farmer_verifications SET id_format_valid = true WHERE id = $1`,
        [verification.id]
      );
    }
  } else if (step === 1) {
    // Farm Details
    await pool.query(
      `UPDATE farmer_verifications 
       SET farm_name = $1, region = $2, district = $3, town_community = $4, gps_address = $5, 
           farming_types = $6, produce_categories = $7, farm_size = $8, years_of_experience = $9
       WHERE id = $10`,
      [
        data.farm_name, data.region, data.district, data.town_community, data.gps_address,
        JSON.stringify(data.farming_types || []), JSON.stringify(data.produce_categories || []),
        data.farm_size, data.years_of_experience, verification.id
      ]
    );
  } else if (step === 2) {
    // Banking Details
    await pool.query(
      `UPDATE farmer_verifications 
       SET mobile_money_name = $1, mobile_money_number = $2, account_holder_name = $3, preferred_payment_method = $4
       WHERE id = $5`,
      [data.mobile_money_name, data.mobile_money_number, data.account_holder_name, data.preferred_payment_method, verification.id]
    );

    // Check mobile money name match
    const phoneResult = await pool.query(
      'SELECT full_name FROM farmer_verifications WHERE id = $1',
      [verification.id]
    );

    const phoneVerification = phoneResult.rows[0];
    if (validateMobileMoneyName(data.mobile_money_name, phoneVerification.full_name)) {
      await pool.query(
        `UPDATE farmer_verifications SET mobile_money_name_matched = true WHERE id = $1`,
        [verification.id]
      );
    }
  } else if (step === 3) {
    // Documents (skip for now - would handle file uploads)
    // This would normally handle S3 uploads
    if (data.documents) {
      const updates = [];
      const params = [];
      let paramCount = 1;

      if (data.documents.ghana_card_front) {
        updates.push(`ghana_card_front_url = $${paramCount++}`);
        params.push(data.documents.ghana_card_front);
      }
      if (data.documents.ghana_card_back) {
        updates.push(`ghana_card_back_url = $${paramCount++}`);
        params.push(data.documents.ghana_card_back);
      }
      if (data.documents.farm_photo_1) {
        updates.push(`farm_photo_1_url = $${paramCount++}`);
        params.push(data.documents.farm_photo_1);
      }
      if (data.documents.farm_photo_2) {
        updates.push(`farm_photo_2_url = $${paramCount++}`);
        params.push(data.documents.farm_photo_2);
      }

      params.push(verification.id);

      if (updates.length > 0) {
        await pool.query(
          `UPDATE farmer_verifications SET ${updates.join(', ')} WHERE id = $${paramCount}`,
          params
        );
      }
    }
  } else if (step === 4) {
    // OTP Verification - handled separately
    // This would verify the OTP code sent to phone
  } else if (step === 5) {
    // Compliance
    await pool.query(
      `UPDATE farmer_verifications 
       SET confirm_ownership = $1, agree_to_terms = $2, consent_to_verification = $3
       WHERE id = $4`,
      [data.confirm_ownership, data.agree_to_terms, data.consent_to_verification, verification.id]
    );
  }

  // Update current step
  await pool.query(
    `UPDATE farmer_verifications SET current_step = $1 WHERE id = $2`,
    [step + 1, verification.id]
  );

  return {
    verification_id: verification.id,
    current_step: step + 1,
    status: verification.status,
  };
}

export async function submitVerification(userId) {
  // Get verification
  const verificationResult = await pool.query(
    `SELECT * FROM farmer_verifications WHERE user_id = $1`,
    [userId]
  );

  if (verificationResult.rows.length === 0) {
    const error = new Error('Verification not found');
    error.status = 404;
    throw error;
  }

  const verification = verificationResult.rows[0];

  // Check if all required fields are filled
  if (!verification.full_name || !verification.farm_name || !verification.mobile_money_name) {
    const error = new Error('Incomplete verification form');
    error.status = 400;
    throw error;
  }

  // Check compliance
  if (!verification.confirm_ownership || !verification.agree_to_terms || !verification.consent_to_verification) {
    const error = new Error('Must agree to all terms');
    error.status = 400;
    throw error;
  }

  // Run Level 1 checks
  const level1Result = await runLevel1Checks(verification.id);

  // Mark as submitted
  await pool.query(
    `UPDATE farmer_verifications 
     SET status = 'pending', submitted_at = NOW(), level_1_status = $1
     WHERE id = $2`,
    [level1Result.status, verification.id]
  );

  return {
    verification_id: verification.id,
    status: 'pending',
    level_1_status: level1Result.status,
    submitted_at: new Date().toISOString(),
  };
}

export async function getVerificationStatus(userId) {
  const result = await pool.query(
    `SELECT id, status, current_step, level_1_status, otp_verified, id_format_valid, mobile_money_name_matched, 
            submitted_at, approved_at, rejected_at, rejection_reason
     FROM farmer_verifications WHERE user_id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    const error = new Error('Verification not found');
    error.status = 404;
    throw error;
  }

  const verification = result.rows[0];
  return {
    verification_id: verification.id,
    status: verification.status,
    current_step: verification.current_step,
    level_1_status: verification.level_1_status,
    otp_verified: verification.otp_verified,
    id_format_valid: verification.id_format_valid,
    mobile_money_name_matched: verification.mobile_money_name_matched,
    submitted_at: verification.submitted_at,
    approved_at: verification.approved_at,
    rejected_at: verification.rejected_at,
    rejection_reason: verification.rejection_reason,
  };
}

export async function sendOTP(userId, phoneNumber) {
  // Check if OTP request is too frequent
  const recentOtp = await pool.query(
    `SELECT * FROM otp_verifications WHERE user_id = $1 AND created_at > NOW() - INTERVAL '1 minute'`,
    [userId]
  );

  if (recentOtp.rows.length > 0) {
    const error = new Error('Please wait before requesting another OTP');
    error.status = 429;
    throw error;
  }

  // Generate OTP
  const otpCode = generateOTP(6);

  // Save OTP to database
  await pool.query(
    `INSERT INTO otp_verifications (user_id, phone_number, otp_code)
     VALUES ($1, $2, $3)`,
    [userId, phoneNumber, otpCode]
  );

  // In production, send via Twilio or similar
  // For demo, we'll just return the OTP
  console.log(`[Demo] OTP for ${phoneNumber}: ${otpCode}`);

  return {
    message: `OTP sent to ${phoneNumber}`,
    demo_otp: otpCode, // Remove in production
    expires_in: 600,
  };
}

export async function verifyOTP(userId, otpCode) {
  // Get recent OTP
  const otpResult = await pool.query(
    `SELECT * FROM otp_verifications WHERE user_id = $1 AND otp_code = $2 AND is_verified = false
     ORDER BY created_at DESC LIMIT 1`,
    [userId, otpCode]
  );

  if (otpResult.rows.length === 0) {
    const error = new Error('Invalid OTP code');
    error.status = 401;
    throw error;
  }

  const otp = otpResult.rows[0];

  // Check expiration
  if (new Date() > new Date(otp.expires_at)) {
    const error = new Error('OTP expired');
    error.status = 410;
    throw error;
  }

  // Check attempts
  if (otp.attempts >= otp.max_attempts) {
    const error = new Error('Too many OTP attempts');
    error.status = 429;
    throw error;
  }

  // Mark as verified
  await pool.query(
    `UPDATE otp_verifications SET is_verified = true, verified_at = NOW() WHERE id = $1`,
    [otp.id]
  );

  // Update farmer verification
  await pool.query(
    `UPDATE farmer_verifications SET otp_verified = true, otp_verified_at = NOW() WHERE user_id = $1`,
    [userId]
  );

  return {
    message: 'OTP verified successfully',
    phone_verified: true,
  };
}

async function runLevel1Checks(verificationId) {
  const verification = await pool.query(
    'SELECT * FROM farmer_verifications WHERE id = $1',
    [verificationId]
  );

  const v = verification.rows[0];

  // All checks should be done already, just confirm
  const allChecksPassed = v.id_format_valid && v.otp_verified;

  return {
    status: allChecksPassed ? 'passed' : 'failed',
    checks: {
      id_format_valid: v.id_format_valid,
      otp_verified: v.otp_verified,
      mobile_money_name_matched: v.mobile_money_name_matched,
    },
  };
}

function validateStepData(step, data) {
  if (step === 0) {
    if (!data.full_name) return { message: 'Full name required', details: { field: 'full_name' } };
    if (!data.date_of_birth) return { message: 'Date of birth required', details: { field: 'date_of_birth' } };
    if (!data.national_id_number) return { message: 'ID number required', details: { field: 'national_id_number' } };
    if (!validateIdFormat(data.national_id_number, data.national_id_type || 'ghana_card')) {
      return { message: 'Invalid ID format', details: { field: 'national_id_number' } };
    }
  } else if (step === 1) {
    if (!data.farm_name) return { message: 'Farm name required', details: { field: 'farm_name' } };
    if (!data.region) return { message: 'Region required', details: { field: 'region' } };
    if (!data.gps_address) return { message: 'GPS address required', details: { field: 'gps_address' } };
  } else if (step === 2) {
    if (!data.mobile_money_name) return { message: 'Mobile money name required', details: { field: 'mobile_money_name' } };
    if (!data.mobile_money_number) return { message: 'Mobile money number required', details: { field: 'mobile_money_number' } };
    if (!data.account_holder_name) return { message: 'Account holder name required', details: { field: 'account_holder_name' } };
  }
  return null;
}
