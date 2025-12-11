import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/store/auth";
import { useFarmerVerification } from "@/store/farmer-verification";
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Loader } from "lucide-react";

const GHANA_REGIONS = [
  "Ashanti",
  "Ahafo",
  "Bono",
  "Bono East",
  "Central",
  "Eastern",
  "Greater Accra",
  "North East",
  "Northern",
  "Oti",
  "Savannah",
  "Upper East",
  "Upper West",
  "Volta",
  "Western",
  "Western North",
];

const FARMING_TYPES = ["Crops", "Livestock", "Mixed", "Aquaculture"];
const PRODUCE_CATEGORIES = [
  "Cereals",
  "Vegetables",
  "Fruits",
  "Spices",
  "Roots & Tubers",
  "Legumes",
  "Dairy",
  "Meat",
  "Fish",
  "Poultry",
];
const PAYMENT_METHODS = ["Mobile Money", "Bank Transfer", "Cash"];

interface ValidationErrors {
  [key: string]: string;
}

export default function FarmerVerification() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createVerification, getVerification, updatePersonalInfo, updateFarmDetails, updateBankingDetails, updateDocumentUploads, updateComplianceAgreements, updateStep, submitVerification } = useFarmerVerification();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  const farmerId = user?.id || "";
  const verification = getVerification(farmerId);

  useEffect(() => {
    if (!user || user.role !== "farmer") {
      navigate("/auth");
      return;
    }

    if (!verification) {
      createVerification(farmerId, user.email);
    } else if (verification.status === "approved") {
      navigate("/dashboard");
      return;
    } else if (verification.status === "pending" && verification.submittedAt) {
      navigate("/farmer-verification-pending");
      return;
    } else if (verification.status === "rejected") {
      // Allow farmers to retry verification
      return;
    }
  }, [user, farmerId, verification, createVerification, navigate]);

  if (!verification || !user) {
    return null;
  }

  const validateIdFormat = (idNumber: string, idType: string) => {
    if (idType === "ghana_card") {
      const ghanaCardRegex = /^GHA-\d{7}-\d$/;
      return ghanaCardRegex.test(idNumber);
    }
    return idNumber.length >= 10;
  };

  const validateMobileMoneyName = (momoName: string, fullName: string) => {
    const momoNameLower = momoName.toLowerCase().trim();
    const fullNameLower = fullName.toLowerCase().trim();
    const nameParts = fullNameLower.split(" ");

    return nameParts.some((part) => momoNameLower.includes(part));
  };

  const validateStep = (stepNum: number): boolean => {
    const newErrors: ValidationErrors = {};

    if (stepNum === 0) {
      if (!verification.personalInfo.fullName) newErrors.fullName = "Full name is required";
      if (!verification.personalInfo.phoneNumber) newErrors.phoneNumber = "Phone number is required";
      if (!verification.personalInfo.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
      if (!verification.personalInfo.nationalIdNumber) newErrors.nationalIdNumber = "ID number is required";
      if (!validateIdFormat(verification.personalInfo.nationalIdNumber, verification.personalInfo.nationalIdType)) {
        newErrors.nationalIdNumber = "Invalid ID format. Ghana Card: GHA-XXXXXXX-X";
      }
    } else if (stepNum === 1) {
      if (!verification.farmDetails.farmName) newErrors.farmName = "Farm name is required";
      if (!verification.farmDetails.region) newErrors.region = "Region is required";
      if (!verification.farmDetails.district) newErrors.district = "District is required";
      if (!verification.farmDetails.townCommunity) newErrors.townCommunity = "Town/Community is required";
      if (!verification.farmDetails.gpsAddress) newErrors.gpsAddress = "GPS address is required";
      if (!verification.farmDetails.farmingTypes || verification.farmDetails.farmingTypes.length === 0) {
        newErrors.farmingTypes = "Select at least one farming type";
      }
      if (!verification.farmDetails.produceCategories || verification.farmDetails.produceCategories.length === 0) {
        newErrors.produceCategories = "Select at least one produce category";
      }
    } else if (stepNum === 2) {
      if (!verification.bankingDetails.mobileMoneyName) newErrors.mobileMoneyName = "Mobile Money name is required";
      if (!verification.bankingDetails.mobileMoneyNumber) newErrors.mobileMoneyNumber = "Mobile Money number is required";
      if (!verification.bankingDetails.accountHolderName) newErrors.accountHolderName = "Account holder name is required";
      if (!validateMobileMoneyName(verification.bankingDetails.mobileMoneyName, verification.personalInfo.fullName)) {
        newErrors.mobileMoneyValidation = "Mobile Money name must match your full name";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!verification.phoneNumber) {
      toast.error("Phone number required", {
        description: "Please fill in your phone number first.",
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
      toast.success("OTP sent", {
        description: `OTP has been sent to ${verification.phoneNumber}. Use code: 123456`,
      });
    }, 1000);
  };

  const handleVerifyOtp = () => {
    if (otpCode === "123456") {
      setOtpVerified(true);
      toast.success("OTP verified", {
        description: "Your phone number has been verified.",
      });
    } else {
      toast.error("Invalid OTP", {
        description: "Please check the code and try again.",
      });
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      updateStep(farmerId, currentStep + 1);
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      updateStep(farmerId, currentStep - 1);
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    if (!verification.complianceAgreements.confirmOwnership || !verification.complianceAgreements.agreeToTerms || !verification.complianceAgreements.consentToVerification) {
      toast.error("Please agree to all terms", {
        description: "You must accept all agreements to proceed.",
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      submitVerification(farmerId);
      setLoading(false);
      toast.success("Verification submitted", {
        description: "Your application is being reviewed.",
      });
      navigate("/farmer-verification-pending");
    }, 1500);
  };

  const steps = [
    { title: "Personal Information", icon: "👤" },
    { title: "Farm Details", icon: "🌾" },
    { title: "Banking Details", icon: "💳" },
    { title: "Documents", icon: "📄" },
    { title: "OTP Verification", icon: "🔐" },
    { title: "Compliance", icon: "✅" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-muted/20 py-12 px-4">
        <div className="container max-w-2xl">
          <Card variant="elevated" className="p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">Farmer Verification</h1>
              <p className="text-muted-foreground">Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex gap-2 mb-4">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 h-2 rounded-full transition-colors ${
                      idx <= currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="mb-8 space-y-6">
              {/* Step 0: Personal Information */}
              {currentStep === 0 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={verification.personalInfo.fullName}
                      onChange={(e) => updatePersonalInfo(farmerId, { fullName: e.target.value })}
                      className={errors.fullName ? "border-destructive" : ""}
                    />
                    {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number (MoMo) *</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="0501234567"
                        value={verification.personalInfo.phoneNumber}
                        onChange={(e) => updatePersonalInfo(farmerId, { phoneNumber: e.target.value })}
                        className={errors.phoneNumber ? "border-destructive" : ""}
                      />
                      {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={verification.personalInfo.dateOfBirth}
                        onChange={(e) => updatePersonalInfo(farmerId, { dateOfBirth: e.target.value })}
                        className={errors.dateOfBirth ? "border-destructive" : ""}
                      />
                      {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={verification.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idType">ID Type *</Label>
                    <Select value={verification.personalInfo.nationalIdType} onValueChange={(value: any) => updatePersonalInfo(farmerId, { nationalIdType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ghana_card">Ghana Card (GHA-XXXXXXX-X)</SelectItem>
                        <SelectItem value="ecowas_card">ECOWAS Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationalIdNumber">ID Number *</Label>
                    <Input
                      id="nationalIdNumber"
                      type="text"
                      placeholder={verification.personalInfo.nationalIdType === "ghana_card" ? "GHA-1234567-8" : "Enter ID number"}
                      value={verification.personalInfo.nationalIdNumber}
                      onChange={(e) => updatePersonalInfo(farmerId, { nationalIdNumber: e.target.value })}
                      className={errors.nationalIdNumber ? "border-destructive" : ""}
                    />
                    {errors.nationalIdNumber && <p className="text-sm text-destructive">{errors.nationalIdNumber}</p>}
                  </div>
                </div>
              )}

              {/* Step 1: Farm Details */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="farmName">Farm Name / Business Name *</Label>
                    <Input
                      id="farmName"
                      type="text"
                      placeholder="Enter your farm name"
                      value={verification.farmDetails.farmName}
                      onChange={(e) => updateFarmDetails(farmerId, { farmName: e.target.value })}
                      className={errors.farmName ? "border-destructive" : ""}
                    />
                    {errors.farmName && <p className="text-sm text-destructive">{errors.farmName}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="region">Region *</Label>
                      <Select value={verification.farmDetails.region} onValueChange={(value) => updateFarmDetails(farmerId, { region: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          {GHANA_REGIONS.map((region) => (
                            <SelectItem key={region} value={region}>
                              {region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.region && <p className="text-sm text-destructive">{errors.region}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="district">District *</Label>
                      <Input
                        id="district"
                        type="text"
                        placeholder="Enter district"
                        value={verification.farmDetails.district}
                        onChange={(e) => updateFarmDetails(farmerId, { district: e.target.value })}
                        className={errors.district ? "border-destructive" : ""}
                      />
                      {errors.district && <p className="text-sm text-destructive">{errors.district}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="townCommunity">Town / Community *</Label>
                    <Input
                      id="townCommunity"
                      type="text"
                      placeholder="Enter town or community"
                      value={verification.farmDetails.townCommunity}
                      onChange={(e) => updateFarmDetails(farmerId, { townCommunity: e.target.value })}
                      className={errors.townCommunity ? "border-destructive" : ""}
                    />
                    {errors.townCommunity && <p className="text-sm text-destructive">{errors.townCommunity}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gpsAddress">GPS Address (GhanaPostGPS) *</Label>
                    <Input
                      id="gpsAddress"
                      type="text"
                      placeholder="GA-123-4567 or coordinates"
                      value={verification.farmDetails.gpsAddress}
                      onChange={(e) => updateFarmDetails(farmerId, { gpsAddress: e.target.value })}
                      className={errors.gpsAddress ? "border-destructive" : ""}
                    />
                    {errors.gpsAddress && <p className="text-sm text-destructive">{errors.gpsAddress}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label>Type of Farming *</Label>
                    <div className="space-y-2">
                      {FARMING_TYPES.map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={verification.farmDetails.farmingTypes.includes(type.toLowerCase() as any)}
                            onCheckedChange={(checked) => {
                              const farmingTypes = verification.farmDetails.farmingTypes;
                              if (checked) {
                                updateFarmDetails(farmerId, { farmingTypes: [...farmingTypes, type.toLowerCase()] });
                              } else {
                                updateFarmDetails(farmerId, { farmingTypes: farmingTypes.filter((t) => t !== type.toLowerCase()) });
                              }
                            }}
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                    {errors.farmingTypes && <p className="text-sm text-destructive">{errors.farmingTypes}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label>Produce Categories *</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {PRODUCE_CATEGORIES.map((category) => (
                        <label key={category} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={verification.farmDetails.produceCategories.includes(category)}
                            onCheckedChange={(checked) => {
                              const produceCategories = verification.farmDetails.produceCategories;
                              if (checked) {
                                updateFarmDetails(farmerId, { produceCategories: [...produceCategories, category] });
                              } else {
                                updateFarmDetails(farmerId, { produceCategories: produceCategories.filter((c) => c !== category) });
                              }
                            }}
                          />
                          <span className="text-sm">{category}</span>
                        </label>
                      ))}
                    </div>
                    {errors.produceCategories && <p className="text-sm text-destructive">{errors.produceCategories}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="farmSize">Farm Size (optional)</Label>
                      <Input
                        id="farmSize"
                        type="text"
                        placeholder="e.g., 2.5 acres"
                        value={verification.farmDetails.farmSize}
                        onChange={(e) => updateFarmDetails(farmerId, { farmSize: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="yearsOfExperience">Years of Experience (optional)</Label>
                      <Input
                        id="yearsOfExperience"
                        type="text"
                        placeholder="e.g., 5 years"
                        value={verification.farmDetails.yearsOfExperience}
                        onChange={(e) => updateFarmDetails(farmerId, { yearsOfExperience: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Banking Details */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <div className="flex gap-2">
                      <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Mobile Money Verification</p>
                        <p>Your Mobile Money name must match your ID name for verification</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobileMoneyName">Mobile Money Name *</Label>
                    <Input
                      id="mobileMoneyName"
                      type="text"
                      placeholder="Name registered with MoMo provider"
                      value={verification.bankingDetails.mobileMoneyName}
                      onChange={(e) => updateBankingDetails(farmerId, { mobileMoneyName: e.target.value })}
                      className={errors.mobileMoneyName || errors.mobileMoneyValidation ? "border-destructive" : ""}
                    />
                    {errors.mobileMoneyName && <p className="text-sm text-destructive">{errors.mobileMoneyName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobileMoneyNumber">Mobile Money Number *</Label>
                    <Input
                      id="mobileMoneyNumber"
                      type="tel"
                      placeholder="0501234567"
                      value={verification.bankingDetails.mobileMoneyNumber}
                      onChange={(e) => updateBankingDetails(farmerId, { mobileMoneyNumber: e.target.value })}
                      className={errors.mobileMoneyNumber ? "border-destructive" : ""}
                    />
                    {errors.mobileMoneyNumber && <p className="text-sm text-destructive">{errors.mobileMoneyNumber}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                    <Input
                      id="accountHolderName"
                      type="text"
                      placeholder="Name on your account"
                      value={verification.bankingDetails.accountHolderName}
                      onChange={(e) => updateBankingDetails(farmerId, { accountHolderName: e.target.value })}
                      className={errors.accountHolderName ? "border-destructive" : ""}
                    />
                    {errors.accountHolderName && <p className="text-sm text-destructive">{errors.accountHolderName}</p>}
                  </div>

                  {errors.mobileMoneyValidation && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800">{errors.mobileMoneyValidation}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="preferredPaymentMethod">Preferred Payment Method *</Label>
                    <Select value={verification.bankingDetails.preferredPaymentMethod} onValueChange={(value) => updateBankingDetails(farmerId, { preferredPaymentMethod: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 3: Documents */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Please upload clear photos of your documents. This helps us verify your identity quickly.
                  </p>

                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <p className="text-sm font-medium text-foreground mb-2">📷 Ghana Card - Front</p>
                      <p className="text-xs text-muted-foreground mb-4">Upload a clear photo of the front of your card</p>
                      <Button variant="outline" className="w-full">
                        Choose File
                      </Button>
                    </div>

                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <p className="text-sm font-medium text-foreground mb-2">📷 Ghana Card - Back</p>
                      <p className="text-xs text-muted-foreground mb-4">Upload a clear photo of the back of your card</p>
                      <Button variant="outline" className="w-full">
                        Choose File
                      </Button>
                    </div>

                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <p className="text-sm font-medium text-foreground mb-2">📸 Farm Photo #1</p>
                      <p className="text-xs text-muted-foreground mb-4">Photo of your farm entrance or overview</p>
                      <Button variant="outline" className="w-full">
                        Choose File
                      </Button>
                    </div>

                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <p className="text-sm font-medium text-foreground mb-2">📸 Farm Photo #2</p>
                      <p className="text-xs text-muted-foreground mb-4">Photo of products currently available</p>
                      <Button variant="outline" className="w-full">
                        Choose File
                      </Button>
                    </div>

                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <p className="text-sm font-medium text-foreground mb-2">📄 Business Registration (Optional)</p>
                      <p className="text-xs text-muted-foreground mb-4">If you have business registration documents</p>
                      <Button variant="outline" className="w-full">
                        Choose File
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: OTP Verification */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div className="flex gap-2">
                      {otpVerified ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-green-800">
                            <p className="font-medium">Phone Verified</p>
                            <p>Your phone number has been verified successfully</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-green-800">
                            <p className="font-medium">Phone Verification Required</p>
                            <p>We'll send a code to {verification.personalInfo.phoneNumber}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {!otpSent && !otpVerified && (
                    <Button onClick={handleSendOtp} disabled={loading} className="w-full">
                      {loading ? "Sending..." : "Send OTP Code"}
                    </Button>
                  )}

                  {otpSent && !otpVerified && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="otpCode">Enter OTP Code *</Label>
                        <Input
                          id="otpCode"
                          type="text"
                          placeholder="000000"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          maxLength={6}
                          className="text-center text-2xl tracking-widest"
                        />
                        <p className="text-xs text-muted-foreground text-center">Demo OTP: 123456</p>
                      </div>

                      <Button onClick={handleVerifyOtp} disabled={otpCode.length !== 6} className="w-full">
                        Verify OTP
                      </Button>

                      <Button variant="ghost" onClick={() => setOtpSent(false)} className="w-full">
                        Send New Code
                      </Button>
                    </>
                  )}

                  {otpVerified && (
                    <div className="flex items-center justify-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                  )}
                </div>
              )}

              {/* Step 5: Compliance */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Please review and accept the following before submitting your verification
                  </p>

                  <div className="space-y-4">
                    <label className="flex items-start gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50">
                      <Checkbox
                        checked={verification.complianceAgreements.confirmOwnership}
                        onCheckedChange={(checked) =>
                          updateComplianceAgreements(farmerId, { confirmOwnership: checked as boolean })
                        }
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Confirm Ownership/Right to Sell</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          I confirm that I own or have the right to sell the farm products listed above
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50">
                      <Checkbox
                        checked={verification.complianceAgreements.agreeToTerms}
                        onCheckedChange={(checked) =>
                          updateComplianceAgreements(farmerId, { agreeToTerms: checked as boolean })
                        }
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Terms &amp; Conditions</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          I agree to the FarmConnect Terms of Service and understand that I must follow all platform rules
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50">
                      <Checkbox
                        checked={verification.complianceAgreements.consentToVerification}
                        onCheckedChange={(checked) =>
                          updateComplianceAgreements(farmerId, { consentToVerification: checked as boolean })
                        }
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Consent to Verification</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          I consent to FarmConnect verifying my identity and farm details through various methods
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mt-6">
                    <p className="text-sm text-blue-800">
                      <strong>Next Steps:</strong> Once you submit, our verification team will review your application within 24-72 hours. You'll receive a notification with the results.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 0 || loading}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentStep === steps.length - 1 ? (
                <Button type="button" variant="hero" onClick={handleSubmit} disabled={loading} className="flex items-center gap-2">
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Verification
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button type="button" variant="hero" onClick={handleNextStep} disabled={loading} className="flex items-center gap-2">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
