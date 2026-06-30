import { ClerkProvider } from "@clerk/nextjs";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-gradient-crimson mb-2">
            ELITEHUB
          </h1>
          <p className="text-[#A09B8C]">
            Premium Companion Marketplace
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
