interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { width: '24px', height: '24px' },
  md: { width: '32px', height: '32px' },
  lg: { width: '48px', height: '48px' }
};

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const dimensions = sizes[size];
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src="/src/assets/images/logo.PNG"
        alt="First Step School Connect"
        style={dimensions}
        className="object-contain"
        loading="eager"
      />
      {/* <span className="font-semibold text-foreground">
        First Step School Connect
      </span> */}
    </div>
  );
}
