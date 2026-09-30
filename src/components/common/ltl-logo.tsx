interface LtlLogoProps {
  size?: number;
  showText?: boolean;
  showPartner?: boolean;
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  subtitleClassName?: string;
}

export function LtlLogo({
  size = 40,
  showText = false,
  showPartner = false,
  className = "",
  imageClassName = "",
  textClassName = "text-foreground",
  subtitleClassName = "text-muted-foreground",
}: LtlLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official LTL Logo Badge */}
      <div
        className="relative grid place-items-center rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-border/50 transition-transform duration-200 hover:scale-105 overflow-hidden shrink-0"
        style={{ width: size + 8, height: size + 8 }}
      >
        <img
          src="/ltllogo.jpg"
          alt="LTL Transformers Official Logo"
          className={`h-full w-full object-contain ${imageClassName}`}
          loading="eager"
        />
      </div>

      {/* Partner Logo if requested */}
      {showPartner && (
        <div
          className="relative hidden sm:grid place-items-center rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-border/50 overflow-hidden shrink-0"
          style={{ height: size + 8 }}
        >
          <img
            src="/partnerlogo.JPG"
            alt="EDL / Partner Logo"
            className="h-full w-auto max-w-[120px] object-contain"
            loading="eager"
          />
        </div>
      )}

      {showText && (
        <div className="min-w-0 flex flex-col justify-center text-left leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`text-base font-bold tracking-tight ${textClassName}`}>
              LTL TRANSFORMERS
            </span>
            <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-sky-600 dark:bg-sky-400/15 dark:text-sky-400 uppercase">
              PORTAL
            </span>
          </div>
          <span className={`text-[11px] font-medium tracking-normal mt-0.5 opacity-80 ${subtitleClassName}`}>
            Lanka Transformers Limited · Grid Infrastructure
          </span>
        </div>
      )}
    </div>
  );
}
