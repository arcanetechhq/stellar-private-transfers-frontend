import React from "react";

type PageHeadingProperties = {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
};

export function PageHeading({
  title,
  subtitle,
  action,
}: PageHeadingProperties) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="mb-1 font-semibold"
            style={{
              fontSize: "32px",
              lineHeight: "40px",
              color: "#121826",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: "16px",
              lineHeight: "24px",
              color: "#667085",
            }}
          >
            {subtitle}
          </p>
        </div>
        {action}
      </div>
    </div>
  );
}
