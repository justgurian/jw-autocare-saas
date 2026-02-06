import { Link } from 'react-router-dom';
import {
  Sparkles,
  Film,
  Newspaper,
  Star,
  Image,
  ArrowRight,
} from 'lucide-react';

export default function ThemeShowcase() {
  return (
    <div className="card-retro border-4 border-black bg-gradient-to-br from-retro-cream to-white overflow-hidden">
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <Sparkles className="text-retro-red" size={24} />
            <span className="bg-retro-red text-white px-3 py-1 text-xs font-heading uppercase">New Feature</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl tracking-wide text-retro-navy mb-2">
            48 NOSTALGIC THEMES
          </h2>
          <p className="text-gray-600 mb-4">
            Create eye-catching flyers with retro styles from the golden age of automotive advertising
          </p>

          {/* Theme Categories */}
          <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-6">
            <div className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 border-2 border-red-300">
              <Sparkles size={18} />
              <span className="font-heading text-sm">COMIC BOOKS</span>
            </div>
            <div className="flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 border-2 border-teal-300">
              <Film size={18} />
              <span className="font-heading text-sm">MOVIE POSTERS</span>
            </div>
            <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 border-2 border-amber-300">
              <Newspaper size={18} />
              <span className="font-heading text-sm">MAGAZINES</span>
            </div>
          </div>

          {/* Era Pills */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-heading border border-gray-300">1950s</span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-heading border border-gray-300">1960s</span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-heading border border-gray-300">1970s</span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-heading border border-gray-300">1980s</span>
          </div>

          <Link
            to="/tools/promo-flyer"
            className="inline-flex items-center gap-3 bg-retro-red text-white px-8 py-4 font-display text-xl uppercase border-4 border-black shadow-retro hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            <Image size={24} />
            EXPLORE THEMES
            <ArrowRight size={20} />
          </Link>
        </div>

        {/* Theme Preview Grid */}
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-red-500 to-red-700 border-4 border-black flex items-center justify-center text-white">
            <div className="text-center">
              <Sparkles size={24} className="mx-auto mb-1" />
              <span className="text-xs font-heading">SUPERHERO</span>
            </div>
          </div>
          <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-amber-400 to-amber-600 border-4 border-black flex items-center justify-center text-white">
            <div className="text-center">
              <Film size={24} className="mx-auto mb-1" />
              <span className="text-xs font-heading">DRIVE-IN</span>
            </div>
          </div>
          <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-teal-500 to-teal-700 border-4 border-black flex items-center justify-center text-white">
            <div className="text-center">
              <Newspaper size={24} className="mx-auto mb-1" />
              <span className="text-xs font-heading">HOT ROD</span>
            </div>
          </div>
          <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-purple-500 to-purple-700 border-4 border-black flex items-center justify-center text-white">
            <div className="text-center">
              <Star size={24} className="mx-auto mb-1" />
              <span className="text-xs font-heading">NEON</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
