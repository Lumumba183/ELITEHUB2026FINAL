import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your ELITEHUB account. Access your dashboard, messages, and wallet.",
};

export default function LoginPage() {
  return (
    <SignIn
      appearance={{
        elements: {
          rootBox: "w-full",
          card: "glass bg-[#14141E] border border-white/10 rounded-2xl shadow-none",
          headerTitle: "text-[#F5E6D3] font-display",
          headerSubtitle: "text-[#A09B8C]",
          socialButtonsBlockButton: "glass border-white/10 text-[#F5E6D3] hover:bg-white/10",
          formFieldLabel: "text-[#F5E6D3]",
          formFieldInput: "bg-[#1A1A2E] border-white/10 text-[#F5E6D3] focus:ring-[#E11D48]",
          formButtonPrimary: "bg-[#E11D48] hover:bg-[#E11D48]/90 text-white",
          footerActionText: "text-[#A09B8C]",
          footerActionLink: "text-[#E11D48] hover:text-[#E11D48]/80",
          dividerLine: "bg-white/10",
          dividerText: "text-[#A09B8C]",
          identityPreviewText: "text-[#F5E6D3]",
          identityPreviewEditButton: "text-[#E11D48]",
          formFieldWarningText: "text-[#E11D48]",
          alertText: "text-[#E11D48]",
          formFieldSuccessText: "text-green-400",
          input: "bg-[#1A1A2E] border-white/10 text-[#F5E6D3]",
        },
      }}
      redirectUrl="/dashboard"
    />
  );
}
