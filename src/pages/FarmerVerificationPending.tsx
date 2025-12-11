import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { useFarmerVerification } from "@/store/farmer-verification";
import { Clock, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

export default function FarmerVerificationPending() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getVerification } = useFarmerVerification();

  const farmerId = user?.id || "";
  const verification = getVerification(farmerId);

  useEffect(() => {
    if (!user || user.role !== "farmer") {
      navigate("/auth");
      return;
    }

    if (!verification) {
      navigate("/farmer-verification");
      return;
    }

    if (verification.status === "approved") {
      navigate("/dashboard");
      return;
    }

    if (verification.status === "rejected") {
      navigate("/farmer-verification");
      return;
    }
  }, [user, farmerId, verification, navigate]);

  if (!verification || !user) {
    return null;
  }

  const submissionDate = verification.submittedAt ? new Date(verification.submittedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-muted/20 py-12 px-4">
        <div className="container max-w-2xl">
          <Card variant="elevated" className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse bg-primary/20 rounded-full"></div>
                  <Clock className="h-16 w-16 text-primary relative z-10" />
                </div>
              </div>

              <h1 className="font-display text-3xl font-bold text-foreground mb-2">Verification Pending</h1>
              <p className="text-muted-foreground mb-6">
                Your farmer account has been submitted for verification
              </p>
            </div>

            {/* Status Timeline */}
            <div className="mb-8 space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div className="w-0.5 h-12 bg-muted"></div>
                </div>
                <div className="pb-6">
                  <p className="font-medium text-foreground">Account Created</p>
                  <p className="text-sm text-muted-foreground">Your farmer account has been set up</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div className="w-0.5 h-12 bg-muted"></div>
                </div>
                <div className="pb-6">
                  <p className="font-medium text-foreground">Information Submitted</p>
                  <p className="text-sm text-muted-foreground">Submitted on {submissionDate}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-foreground">Manual Verification in Progress</p>
                  <p className="text-sm text-muted-foreground">Our team is reviewing your documents (24-72 hours)</p>
                </div>
              </div>
            </div>

            {/* What We're Checking */}
            <div className="bg-muted/50 rounded-lg p-6 mb-8">
              <h3 className="font-medium text-foreground mb-4">What We're Verifying</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">✓</span>
                  <span>Your personal identity details against your ID</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">✓</span>
                  <span>Farm location and photos for authenticity</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">✓</span>
                  <span>Mobile Money name matches your legal name</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">✓</span>
                  <span>GPS coordinates correspond to actual farm location</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">✓</span>
                  <span>Business documents (if provided)</span>
                </li>
              </ul>
            </div>

            {/* Timeline */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-medium text-blue-900 mb-3">Expected Timeline</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex justify-between">
                  <span>✓ Level 1: Automated Checks</span>
                  <span className="font-medium">Completed</span>
                </div>
                <div className="flex justify-between">
                  <span>⏳ Level 2: Manual Review</span>
                  <span className="font-medium">24-72 hours</span>
                </div>
                <div className="flex justify-between">
                  <span>📧 Approval Notification</span>
                  <span className="font-medium">Via email</span>
                </div>
              </div>
            </div>

            {/* What You Can Do */}
            <div className="mb-8">
              <h3 className="font-medium text-foreground mb-4">While You Wait</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>You can browse the marketplace, but won't be able to list products until verification is approved</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Keep your contact information handy in case we need to clarify anything</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Make sure your phone is available to answer any verification calls</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/dashboard")} className="flex items-center gap-2">
                Go to Dashboard
              </Button>
              <Button variant="hero" onClick={() => navigate("/marketplace")} className="flex items-center gap-2">
                Browse Marketplace
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Contact Support */}
            <div className="mt-8 pt-8 border-t border-border text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Have questions about the verification process?
              </p>
              <Button variant="link" className="text-primary">
                Contact Support
              </Button>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
