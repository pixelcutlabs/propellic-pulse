import { brand } from "@/lib/brand";

interface LayeredArrowGradientProps {
  children: React.ReactNode;
  className?: string;
}

export default function LayeredArrowGradient({ children, className = "" }: LayeredArrowGradientProps) {
  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundColor: brand.secondary }}
    >
      {/* Background gradient layers */}
      <div 
        className="absolute inset-0 opacity-90"
        style={{
          background: `linear-gradient(135deg, ${brand.shadeDeep} 0%, ${brand.primary} 50%, ${brand.accent} 100%)`,
        }}
      />
      
      {/* Arrow pattern overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.3'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10" style={{ color: brand.bg }}>
        {children}
      </div>
      
      {/* Subtle shadow at bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{
          background: `linear-gradient(to bottom, transparent, ${brand.shadePunch}20)`,
        }}
      />
    </div>
  );
}