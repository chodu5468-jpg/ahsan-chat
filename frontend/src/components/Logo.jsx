// The mark is two offset, overlapping forms — a quiet nod to two people
// in conversation — built from plain shapes rather than an emoji or a
// literal speech-bubble icon.
function Mark({ size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="2" y="6" width="24" height="24" rx="7" fill="var(--color-accent)" />
      <rect
        x="14"
        y="12"
        width="24"
        height="24"
        rx="7"
        fill="var(--color-highlight)"
        opacity="0.92"
      />
    </svg>
  );
}

export default function Logo({ size = 'md', className = '' }) {
  const markSize = size === 'lg' ? 40 : size === 'sm' ? 24 : 30;
  const textClass = size === 'lg' ? 'logo-text logo-text--lg' : 'logo-text';

  return (
    <div className={`logo ${className}`}>
      <Mark size={markSize} />
      <span className={textClass}>
        Ahsan<span className="logo-text__dot">.</span>Dev
      </span>
    </div>
  );
}
