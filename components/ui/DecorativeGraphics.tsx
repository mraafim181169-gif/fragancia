'use client';

import React from 'react';

export function CurvedLineDecoration({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none select-none ${className}`}
      viewBox="0 0 300 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 80 C 70 10, 140 120, 290 40"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        strokeLinecap="round"
        className="opacity-25"
      />
      <circle cx="10" cy="80" r="3" fill="currentColor" className="opacity-40" />
      <circle cx="290" cy="40" r="3" fill="currentColor" className="opacity-40" />
    </svg>
  );
}

export function WaveGraphic({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none select-none ${className}`}
      viewBox="0 0 400 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 30 Q 100 0, 200 30 T 400 30"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        className="opacity-20"
      />
      <path
        d="M0 38 Q 100 8, 200 38 T 400 38"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeDasharray="3 5"
        strokeLinecap="round"
        className="opacity-15"
      />
    </svg>
  );
}

export function GeometricAestheticAccent({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none select-none flex items-center gap-1.5 opacity-30 ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span className="w-6 h-[1px] bg-current" />
      <span className="w-1.5 h-1.5 rounded-full border border-current" />
    </div>
  );
}

export function DottedConnector({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none select-none hidden md:block ${className}`}
      width="120"
      height="24"
      viewBox="0 0 120 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 12 C 40 4, 80 20, 116 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        strokeLinecap="round"
        className="opacity-30"
      />
      <circle cx="116" cy="12" r="2.5" fill="currentColor" className="opacity-50" />
    </svg>
  );
}
