export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password) {
  // Min 8 characters, uppercase, lowercase, number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

export function validatePhoneNumber(phone) {
  // Ghana phone number format: 05XXXXXXXXX or 0XXXXXXXXXX
  const phoneRegex = /^0\d{9}$/;
  return phoneRegex.test(phone);
}

export function validateIdFormat(idNumber, idType) {
  if (idType === 'ghana_card') {
    // GHA-XXXXXXX-X format
    const ghanaCardRegex = /^GHA-\d{7}-\d$/;
    return ghanaCardRegex.test(idNumber);
  }
  // ECOWAS card: minimum length check
  return idNumber.length >= 10;
}

export function validateMobileMoneyName(momoName, fullName) {
  const momoNameLower = momoName.toLowerCase().trim();
  const fullNameLower = fullName.toLowerCase().trim();
  const nameParts = fullNameLower.split(/\s+/);
  
  return nameParts.some(part => 
    momoNameLower.includes(part) && part.length > 2
  );
}

export function getPasswordStrength(password) {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[@$!%*?&]/.test(password)) strength++;
  
  return strength;
}

export function generateOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

export function maskPhoneNumber(phone) {
  if (!phone) return '';
  return phone.substring(0, 3) + '****' + phone.substring(9);
}

export function maskIdNumber(id) {
  if (!id) return '';
  return id.substring(0, 4) + '****' + id.substring(id.length - 2);
}
