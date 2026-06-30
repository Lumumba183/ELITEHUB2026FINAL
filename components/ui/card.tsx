import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn("glass rounded-2xl p-6", className)}>
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ title, value, icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#E11D48]/10 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-xs text-[#A09B8C]">{title}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {trend && (
        <p className={`text-sm mt-1 ${trendUp ? "text-green-400" : "text-[#E11D48]"}`}>
          {trend}
        </p>
      )}
    </div>
  );
}
