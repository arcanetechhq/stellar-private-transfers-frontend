import React from "react";

interface CardProperties {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProperties) {
  return (
    <div
      className={`${className}`}
      style={{
        backgroundColor: "#FCFCFB",
        borderRadius: "12px",
        border: "1px solid #E5E4DF",
        boxShadow:
          "0 1px 2px rgba(16, 24, 40, 0.03), 0 1px 3px rgba(16, 24, 40, 0.04)",
      }}
    >
      {children}
    </div>
  );
}

interface CardHeaderProperties {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProperties) {
  return (
    <div
      className={`px-6 py-4 ${className}`}
      style={{ borderBottom: "1px solid #ECEBE7" }}
    >
      {children}
    </div>
  );
}

interface CardContentProperties {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProperties) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}