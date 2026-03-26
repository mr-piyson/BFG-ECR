import { LoginForm } from '@/components/auth/login-form';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="min-h-screen grid items-center justify-center relative overflow-hidden bg-[#020617]">
      {/* Visual background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-indigo-500/10 blur-[100px] animate-pulse delay-700" />
        <div className="absolute bottom-[0%] left-[20%] w-[30%] h-[20%] rounded-full bg-sky-500/10 blur-[100px] animate-pulse delay-1000" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Noise overlay */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <filter id="noiseFilter">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.65"
                numOctaves="3"
                stitchTiles="stitch"
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
          </svg>
        </div>
      </div>

      <div className="z-10 px-4 w-full">
        <Suspense
          fallback={
            <div className="flex flex-col items-center gap-4 text-white/40">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm">Loading login...</span>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>

      <footer className="absolute bottom-6 left-0 w-full text-center z-10 px-4">
        <p className="text-white/20 text-[10px] tracking-widest uppercase">
          &copy; 2025 BFG International — All Rights Reserved
        </p>
      </footer>
    </main>
  );
}
