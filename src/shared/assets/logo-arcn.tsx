import svgPaths from "./svg-hfdip5v5p6";

const FULL_VIEWBOX = "0 0 852 206";
const MARK_VIEWBOX = "0 0 196 208";

export type ArcnVariant = "full" | "mark";

export type ArcnProperties = {
  variant?: ArcnVariant;
  className?: string;
};

function LogoPath({ id, d }: { id: string; d: string }) {
  return <path d={d} fill="var(--fill-0, black)" id={id} />;
}

function ArcnMarkPaths() {
  return (
    <>
      <LogoPath id="Vector" d={svgPaths.pe267e00} />
      <LogoPath id="Vector_2" d={svgPaths.p14e79e00} />
      <LogoPath id="Vector_3" d={svgPaths.pfc7d700} />
    </>
  );
}

function ArcnFullPaths() {
  return (
    <g clipPath="url(#clip0_1_536)" id="лого_arcn 2">
      <ArcnMarkPaths />
      <LogoPath id="Vector_4" d={svgPaths.p3b0e8db1} />
      <LogoPath id="Vector_5" d={svgPaths.p39d07f00} />
      <LogoPath id="Vector_6" d={svgPaths.p1117e500} />
      <LogoPath id="Vector_7" d={svgPaths.p3f5dae00} />
      <LogoPath id="Vector_8" d={svgPaths.p8ce9080} />
      <LogoPath id="Vector_9" d={svgPaths.p13b55112} />
    </g>
  );
}

export default function Arcn({
  variant = "full",
  className = "relative size-full",
}: ArcnProperties) {
  const isMark = variant === "mark";

  return (
    <div className={className} data-name={isMark ? "logo_arcn_mark" : "logo_arcn_full"}>
      <svg
        className="absolute block size-full"
        fill="none"
        preserveAspectRatio={isMark ? "xMidYMid meet" : "none"}
        viewBox={isMark ? MARK_VIEWBOX : FULL_VIEWBOX}
      >
        {isMark ? <ArcnMarkPaths /> : <ArcnFullPaths />}
        {isMark ? undefined : (
          <defs>
            <clipPath id="clip0_1_536">
              <rect fill="white" height="206" width="852" />
            </clipPath>
          </defs>
        )}
      </svg>
    </div>
  );
}

export function ArcnMark(properties: Omit<ArcnProperties, "variant">) {
  return <Arcn {...properties} variant="mark" />;
}
