import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  initiateVerification,
  submitVerificationStep,
  submitVerification,
  getVerificationStatus,
  sendOTP,
  verifyOTP,
} from '../services/verificationService.js';

const router = express.Router();

/**
 * POST /api/v1/farmers/verify/initiate
 * Start farmer verification
 */
router.post('/initiate', authenticate, requireRole(['farmer']), asyncHandler(async (req, res) => {
  const verification = await initiateVerification(req.user.user_id);

  res.status(201).json({
    success: true,
    data: {
      verification_id: verification.id,
      farmer_id: verification.farmer_id,
      current_step: verification.current_step,
      total_steps: 6,
      status: verification.status,
      message: 'Verification started. Please complete all steps.',
    },
  });
}));

/**
 * POST /api/v1/farmers/verify/step/:step
 * Submit verification step
 */
router.post('/step/:step', authenticate, requireRole(['farmer']), asyncHandler(async (req, res) => {
  const stepNum = parseInt(req.params.step);

  if (isNaN(stepNum) || stepNum < 0 || stepNum > 5) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_STEP',
        message: 'Invalid step number. Must be 0-5.',
      },
    });
  }

  const result = await submitVerificationStep(req.user.user_id, stepNum, req.body);

  res.json({
    success: true,
    data: {
      verification_id: result.verification_id,
      current_step: result.current_step,
      status: result.status,
      message: `Step ${stepNum} completed. Proceed to next step.`,
    },
  });
}));

/**
 * POST /api/v1/farmers/verify/otp/send
 * Send OTP code
 */
router.post('/otp/send', authenticate, requireRole(['farmer']), asyncHandler(async (req, res) => {
  const { phone_number } = req.body;

  if (!phone_number) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'Phone number is required',
      },
    });
  }

  const result = await sendOTP(req.user.user_id, phone_number);

  res.json({
    success: true,
    data: {
      message: result.message,
      expires_in: result.expires_in,
      demo_otp: result.demo_otp, // Remove in production
    },
  });
}));

/**
 * POST /api/v1/farmers/verify/otp/verify
 * Verify OTP code
 */
router.post('/otp/verify', authenticate, requireRole(['farmer']), asyncHandler(async (req, res) => {
  const { otp_code } = req.body;

  if (!otp_code) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'OTP code is required',
      },
    });
  }

  const result = await verifyOTP(req.user.user_id, otp_code);

  res.json({
    success: true,
    data: result,
  });
}));

/**
 * GET /api/v1/farmers/verify/status
 * Get verification status
 */
router.get('/status', authenticate, requireRole(['farmer']), asyncHandler(async (req, res) => {
  const verification = await getVerificationStatus(req.user.user_id);

  res.json({
    success: true,
    data: verification,
  });
}));

/**
 * POST /api/v1/farmers/verify/submit
 * Submit verification (final step)
 */
router.post('/submit', authenticate, requireRole(['farmer']), asyncHandler(async (req, res) => {
  const result = await submitVerification(req.user.user_id);

  res.status(201).json({
    success: true,
    data: {
      verification_id: result.verification_id,
      status: result.status,
      level_1_status: result.level_1_status,
      submitted_at: result.submitted_at,
      message: 'Verification submitted. Our team will review within 24-72 hours.',
    },
  });
}));

export default router;
