import React from "react";

interface StepCardProperties {
  title: string;
  description: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

export function StepCard({
  title,
  description,
  headerAction,
  children,
}: StepCardProperties) {
  return (
    <div
      className="rounded-xl bg-white p-6"
      style={{ border: "1px solid #E6E8EC" }}
    >
      {headerAction ? (
        <div className="mb-4 flex items-center justify-between">
          <h2
            className="font-semibold"
            style={{ fontSize: "18px", lineHeight: "28px", color: "#1B1D22" }}
          >
            {title}
          </h2>
          {headerAction}
        </div>
      ) : (
        <h2
          className="mb-4 font-semibold"
          style={{ fontSize: "18px", lineHeight: "28px", color: "#1B1D22" }}
        >
          {title}
        </h2>
      )}
      <p
        className="mb-6"
        style={{ fontSize: "14px", lineHeight: "20px", color: "#6B7280" }}
      >
        {description}
      </p>
      {children}
    </div>
  );
}
