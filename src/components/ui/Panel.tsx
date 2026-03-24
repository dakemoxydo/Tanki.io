import React from 'react';

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'solid' | 'translucent' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Panel: React.FC<PanelProps> = ({
  children,
  variant = 'solid',
  padding = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-xl overflow-hidden';
  
  const variants = {
    solid: 'bg-slate-800 border border-slate-700',
    translucent: 'bg-black/50 backdrop-blur-sm border border-white/10',
    glass: 'bg-white/5 backdrop-blur-md border border-white/20 shadow-xl',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${className}`} {...props}>
      {children}
    </div>
  );
};
