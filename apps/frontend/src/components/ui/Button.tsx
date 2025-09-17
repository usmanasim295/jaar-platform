"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "inline";
  className?: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  className,
  children,
  ...props
}) => {
  const baseStyles =
    "h-[60px] px-6 rounded-xl text-[16px] leading-[100%] font-semibold transition duration-200";

  const variants = {
    primary: `bg-(--primary) text-(--white) ${baseStyles}`,
    secondary: `bg-(--light-grey) text-(--grey-text) ${baseStyles}`,
    inline: "text-(--primary) font-semibold typo-small",
  };

  return (
    <button
      className={`${variants[variant]} ${className} cursor-pointer`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
