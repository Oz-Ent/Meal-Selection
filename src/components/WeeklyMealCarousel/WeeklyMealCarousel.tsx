import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';

import eggPanCorner from '../../assets/banner/egg_pan_corner.png';
import chiliPeppers from '../../assets/banner/chili_peppers.png';
import greenLeafGarnish from '../../assets/banner/green_leaf_garnish.png';
import defaultMealBowl from '../../assets/banner/default_meal_bowl.png';
import MealForeground from '../../assets/MealForeground.jpg';

export interface CarouselMealItem {
  day: string;
  dayName: string;
  mealName: string;
  imageUrl: string;
  hasSelection: boolean;
  isUnavailable: boolean;
  isHoliday: boolean;
  isToday: boolean;
}

interface WeeklyMealCarouselProps {
  items: CarouselMealItem[];
  defaultIndex?: number;
  onEdit?: () => void;
}

export function WeeklyMealCarousel({
  items,
  defaultIndex = 0,
  onEdit,
}: WeeklyMealCarouselProps) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  const handleEditClick = () => {
    if (onEdit) {
      onEdit();
    } else {
      navigate('/select-meal');
    }
  };

  const fallbackBowl = defaultMealBowl || MealForeground;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-[#212327] shadow-xl text-white select-none border border-slate-800">
      {/* Background Subtle Ripple / Wave Lines */}
      <svg
        className="absolute inset-0 w-full h-full opacity-15 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 500 240"
        preserveAspectRatio="none"
      >
        <path
          d="M-50,60 C80,20 180,100 300,50 C400,10 460,90 550,60"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
        />
        <path
          d="M-50,110 C90,70 190,150 310,100 C410,60 470,140 550,110"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
        />
        <path
          d="M-50,160 C100,120 200,200 320,150 C420,110 480,190 550,160"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
        />
        <path
          d="M-50,210 C110,170 210,250 330,200 C430,160 490,240 550,210"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
        />
      </svg>

      {/* Decorative Corner: Fried Egg in Skillet (Top-Right) */}
      <div className="absolute -top-3 -right-3 w-16 h-16 sm:w-20 sm:h-20 pointer-events-none z-10 drop-shadow-md">
        <img
          src={eggPanCorner}
          alt=""
          className="w-full h-full object-contain"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>

      {/* Decorative Corner: Chili Peppers (Bottom-Left) */}
      <div className="absolute -bottom-2.5 -left-2.5 w-12 h-12 sm:w-16 sm:h-16 pointer-events-none z-10 drop-shadow-md">
        <img
          src={chiliPeppers}
          alt=""
          className="w-full h-full object-contain"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>

      {/* Decorative Corner: Green Basil / Mint Leaves (Bottom-Right) */}
      <div className="absolute -bottom-2 -right-2 w-14 h-14 sm:w-18 sm:h-18 pointer-events-none z-10 drop-shadow-md">
        <img
          src={greenLeafGarnish}
          alt=""
          className="w-full h-full object-contain"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>

      {/* Main Swiper Carousel */}
      <Swiper
        slidesPerView={1}
        initialSlide={defaultIndex}
        onSlideChange={(swiper: SwiperType) => setActiveIndex(swiper.realIndex)}
        className="w-full relative z-10"
      >
        {items.map((item, i) => {
          const displayImage =
            item.imageUrl && item.imageUrl !== MealForeground
              ? item.imageUrl
              : fallbackBowl;

          return (
            <SwiperSlide
              key={i}
              className="flex flex-col items-center justify-between pt-5 pb-2 px-6 text-center"
            >
              {/* Day Badge with Edit Icon */}
              <button
                type="button"
                onClick={handleEditClick}
                className="group inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-xs font-medium text-slate-200 transition-all cursor-pointer shadow-xs active:scale-95"
                aria-label={`Edit selection for ${item.dayName}`}
              >
                <span>{item.day}</span>
                <Pencil
                  size={11}
                  className="text-slate-300 group-hover:text-white transition-colors"
                />
              </button>

              {/* Meal Name */}
              <h2 className="mt-3 text-sm sm:text-base font-bold text-white max-w-sm mx-auto min-h-11 flex items-center justify-center px-4 leading-snug tracking-tight">
                {item.mealName}
              </h2>

              {/* Meal Bowl Image with Realistic Under-Shadow */}
              <div
                onClick={handleEditClick}
                className="relative my-2 flex h-32 w-32 sm:h-36 sm:w-36 items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105"
              >
                <img
                  src={displayImage}
                  alt={item.mealName}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = fallbackBowl;
                  }}
                  className="h-full w-full object-contain rounded-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)]"
                />
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Pagination Dots (5 Days) */}
      <div className="relative z-10 flex items-center justify-center gap-1.5 pb-4 pt-1">
        {items.map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              activeIndex === idx
                ? 'h-1.5 w-4 bg-white shadow-xs'
                : 'h-1.5 w-1.5 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
