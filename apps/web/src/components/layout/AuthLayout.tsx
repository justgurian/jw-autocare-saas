import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-retro-navy flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-checkerboard opacity-5" />

        <div className="relative z-10 text-center">
          <h1 className="font-display text-6xl text-white tracking-wider mb-4">
            JW AUTO CARE
          </h1>
          <p className="font-script text-3xl text-retro-mustard mb-8">
            AI Marketing Platform
          </p>

          <div className="max-w-md mx-auto">
            <p className="text-white/80 text-lg leading-relaxed">
              Generate stunning promotional content for your auto repair shop in seconds.
              Flyers, social posts, and more - powered by AI.
            </p>
          </div>

          {/* Decorative elements */}
          <div className="mt-12 flex justify-center gap-8">
            <div className="w-20 h-20 border-4 border-retro-red rounded-full flex items-center justify-center">
              <span className="font-display text-2xl text-white">500+</span>
            </div>
            <div className="w-20 h-20 border-4 border-retro-teal rounded-full flex items-center justify-center">
              <span className="font-display text-2xl text-white">45</span>
            </div>
            <div className="w-20 h-20 border-4 border-retro-mustard rounded-full flex items-center justify-center">
              <span className="font-display text-2xl text-white">10+</span>
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-8 text-sm text-white/60">
            <span>Images/mo</span>
            <span>Themes</span>
            <span>Tools</span>
          </div>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="w-full lg:w-1/2 bg-retro-cream flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
