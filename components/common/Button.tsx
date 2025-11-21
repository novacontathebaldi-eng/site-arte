import React, { forwardRef, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
type ButtonSize = 'sm' | 'md' | 'lg';

const variantClasses = {
  primary: 'bg-brand-black text-brand-white hover:bg-black/90 dark:bg-brand-white dark:text-brand-black dark:hover:bg-white/90 shadow-md hover:shadow-lg',
  secondary: 'bg-brand-gold text-brand-black hover:bg-yellow-500 shadow-sm',
  tertiary: 'bg-white/10 dark:bg-black/10 border border-brand-black/10 dark:border-white/10 text-brand-black dark:text-brand-white hover:bg-black/5 dark:hover:bg-white/10 backdrop-blur-sm',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs tracking-wide',
  md: 'px-6 py-2.5 text-sm tracking-wide',
  lg: 'px-8 py-3 text-base tracking-wider',
};

type AsProp<C extends React.ElementType> = {
  as?: C;
};

type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);

type PolymorphicComponentProp<
  C extends React.ElementType,
  Props = {}
> = React.PropsWithChildren<Props & AsProp<C>> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

type PolymorphicButtonProps<C extends React.ElementType> = PolymorphicComponentProp<C, ButtonProps>;

const Button = forwardRef(<C extends React.ElementType = 'button'>(
  {
    as,
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    ...rest
  }: PolymorphicButtonProps<C>,
  ref: React.Ref<any>
) => {
  const Component = as || 'button';
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <Component
      ref={ref}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
});

export default Button;