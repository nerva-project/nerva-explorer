"use client";

// SVG icons for the explorer - matching Font Awesome style of the original

export function SunIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 1l1 3h-2l1-3zm0 19l1 3h-2l1-3zM4.2 4.2L6.6 6.6 5.2 8 2.8 5.6l1.4-1.4zm15.6 0l1.4 1.4L18.8 8l-1.4-1.4 2.4-2.4zM1 12l3-1v2L1 12zm19 0l3 1h-3v-1zM4.2 19.8L2.8 18.4 5.2 16l1.4 1.4-2.4 2.4zm15.6 0l-2.4-2.4 1.4-1.4 2.4 2.4-1.4 1.4z" />
    </svg>
  );
}

export function MoonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 3a9 9 0 1 0 9 9c0-.5 0-1-.1-1.4-1 .7-2.2 1.1-3.5 1.1-3.4 0-6-2.7-6-6 0-1.4.4-2.6 1.1-3.6-.5 0-1-.1-1.5-.1z" />
    </svg>
  );
}

export function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
    </svg>
  );
}

export function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M18.3 5.7L12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7l1.4-1.4L10.6 10.6l6.3-6.3 1.4 1.4z" />
    </svg>
  );
}

export function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  );
}

export function ExternalLinkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M14 3h7v7h-2V6.4l-9 9L8.6 14l9-9H14V3zM5 5h5v2H7v10h10v-3h2v5H5V5z" />
    </svg>
  );
}

export function CubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M3 6l9-4 9 4v12l-9 4-9-4V6zm9-1.8L5.5 6.6 12 9l6.5-2.4L12 4.2zM5 8.4v8.2l6 2.6V11L5 8.4zM13 19.2l6-2.6V8.4L13 11v8.2z" />
    </svg>
  );
}

export function ExchangeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M7 7h13l-3-3 1.4-1.4L24 8l-5.6 5.4L17 12l3-3H7V7zM17 17H4l3 3-1.4 1.4L0 16l5.6-5.4L7 12l-3 3h13v2z" />
    </svg>
  );
}

export function ChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M3 3h2v18H3V3zm4 8h2v10H7V11zm4-6h2v16h-2V5zm4 9h2v7h-2v-7zm4-4h2v11h-2V10z" />
    </svg>
  );
}

export function NetworkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.2L19.5 8 12 11.8 4.5 8 12 4.2zM4 9.4l7 3.5v7.2l-7-3.5V9.4zm9 10.7v-7.2l7-3.5v7.2l-7 3.5z" />
    </svg>
  );
}

export function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 10.6l4 2.3-.8 1.3-4.5-2.6V6h1.3v6.6z" />
    </svg>
  );
}

export function HashrateIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M3 12l4-8 4 8-4 8-4-8zm10 0l4-8 4 8-4 8-4-8z" />
    </svg>
  );
}

export function CoinsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 2C6.48 2 2 4.69 2 8s4.48 6 10 6 10-2.69 10-6-4.48-6-10-6zm0 10c-5.52 0-10-2.69-10-6 0-1.06.5-2.04 1.36-2.86C4.7 4.46 8.05 6 12 6s7.3-1.54 8.64-2.86C21.5 5.96 22 6.94 22 8c0 3.31-4.48 6-10 6zm0 4c-5.52 0-10-2.69-10-6v2c0 3.31 4.48 6 10 6s10-2.69 10-6v-2c0 3.31-4.48 6-10 6zm0 4c-5.52 0-10-2.69-10-6v2c0 3.31 4.48 6 10 6s10-2.69 10-6v-2c0 3.31-4.48 6-10 6z" />
    </svg>
  );
}

export function CopyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z" />
    </svg>
  );
}

export function ArrowUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 4l8 8h-5v8h-6v-8H4l8-8z" />
    </svg>
  );
}

export function ArrowDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 20l-8-8h5V4h6v8h5l-8 8z" />
    </svg>
  );
}

export function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M7.4 8.6L12 13.2l4.6-4.6L18 10l-6 6-6-6 1.4-1.4z" />
    </svg>
  );
}

export function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
    </svg>
  );
}

export function DownloadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M5 20h14v-2H5v2zM12 2l5 6h-3v6h-4V8H7l5-6z" />
    </svg>
  );
}

export function RefreshIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M17.65 6.35A8 8 0 1 0 19.73 14h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
    </svg>
  );
}

export function CodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
    </svg>
  );
}

export function ToolsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1 .1-1.4z" />
    </svg>
  );
}

export function ZapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z" />
    </svg>
  );
}

export function DatabaseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 3C7 3 3 4.79 3 7s4 4 9 4 9-1.79 9-4-4-4-9-4zm0 6c-3.31 0-6-.94-6-2s2.69-2 6-2 6 .94 6 2-2.69 2-6 2zM3 9v4c0 2.21 4 4 9 4s9-1.79 9-4V9c0 2.21-4 4-9 4s-9-1.79-9-4zm0 6v4c0 2.21 4 4 9 4s9-1.79 9-4v-4c0 2.21-4 4-9 4s-9-1.79-9-4z" />
    </svg>
  );
}
