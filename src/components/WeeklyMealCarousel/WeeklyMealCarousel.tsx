import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Pencil } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';

import jollofBowlIcon from '../../assets/lunch selection/JollofBowl 2.svg';
import friedEggIcon from '../../assets/lunch selection/fried_egg.svg';
import pepperIcon from '../../assets/lunch selection/pepper.svg';
import leafIcon from '../../assets/lunch selection/leaf.svg';
import MealForeground from '../../assets/MealForeground.webp';

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
  items?: CarouselMealItem[];
  defaultIndex?: number;
  onEdit?: () => void;
  isLoading?: boolean;
}

export function WeeklyMealCarousel({
  items = [],
  defaultIndex = 0,
  onEdit,
  isLoading = false,
}: WeeklyMealCarouselProps) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

  const handleEditClick = () => {
    if (onEdit) {
      onEdit();
    } else {
      navigate('/select-meal');
    }
  };

  const fallbackBowl = jollofBowlIcon || MealForeground;

  return (
    <div
      className="relative w-full min-h-[260px] sm:min-h-[290px] flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#2e3034] via-[#242629] to-[#1c1d1f] shadow-2xl text-white select-none border border-white/10"
      {...(isLoading ? { 'aria-busy': 'true', role: 'status', 'aria-label': 'Loading selections' } : {})}
    >
      {/* Background Topographic / Wave Lines Pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 600 300"
        preserveAspectRatio="none"
      >
        <path
          d="M-50,40 C100,10 200,90 350,40 C450,10 520,70 650,30"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
        />
        <path
          d="M-50,80 C120,40 220,130 360,70 C460,30 540,110 650,80"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
        />
        <path
          d="M-50,130 C90,80 200,170 340,120 C450,80 530,160 650,130"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
        />
        <path
          d="M-50,180 C130,130 230,220 370,160 C470,120 540,210 650,170"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
        />
        <path
          d="M-50,230 C110,180 210,260 350,210 C460,160 520,250 650,220"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
        />
        <path
          d="M-50,270 C140,220 240,290 380,250 C480,210 550,280 650,260"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
        />
      </svg>

      {/* Decorative Corner: Fried Egg in Skillet (Top-Right) */}
      <div className="absolute top-0 right-0 w-20 h-16 sm:w-28 sm:h-22 pointer-events-none z-20 overflow-visible">
        <img
          src={friedEggIcon}
          alt=""
          className="w-full h-full object-contain object-top-right scale-110"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>

      {/* Decorative Corner: Chili Peppers (Bottom-Left) */}
      <div className="absolute -bottom-1 left-0 w-16 h-14 sm:w-20 sm:h-18 pointer-events-none z-20">
        <img
          src={pepperIcon}
          alt=""
          className="w-full h-full object-contain object-bottom-left scale-110"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>

      {/* Decorative Corner: Green Basil / Mint Leaves (Bottom-Right) */}
      <div className="absolute -bottom-1 right-0 w-16 h-16 sm:w-22 sm:h-22 pointer-events-none z-20">
        <img
          src={leafIcon}
          alt=""
          className="w-full h-full object-contain object-bottom-right scale-110"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>

      {isLoading ? (
        /* Loading Progress Indicator */
        <div
          data-testid="carousel-loading-indicator"
          className="relative z-10 flex flex-1 flex-col items-center justify-center gap-3.5 py-10 px-6 text-center"
        >
          {/* Animated Spinner with Soft Glowing Aura */}
          <div className="relative flex items-center justify-center">
            <div className="absolute h-14 w-14 rounded-full bg-primary/20 animate-ping opacity-30" />
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/15 shadow-inner">
              <Loader2 className="h-6 w-6 animate-spin text-primary" data-testid="carousel-spinner" />
            </div>
          </div>

          {/* Status Text */}
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm font-semibold tracking-tight text-white">Loading your selections</p>
            <p className="text-xs text-slate-400">Fetching this week's meal plan...</p>
          </div>

          {/* Animated Progress Bar */}
          <div
            className="w-44 h-1.5 bg-white/10 rounded-full overflow-hidden relative mt-1"
            aria-hidden="true"
          >
            <div className="h-full bg-gradient-to-r from-primary via-primary-hover to-primary rounded-full w-full animate-pulse" />
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col flex-1 justify-between w-full">
          {/* Main Swiper Carousel */}
          <Swiper
            slidesPerView={1}
            initialSlide={defaultIndex}
            onSwiper={setSwiperInstance}
            onSlideChange={(swiper: SwiperType) => setActiveIndex(swiper.realIndex)}
            className="w-full flex-1"
          >
            {items.map((item, i) => {
              const displayImage =
                item.imageUrl && item.imageUrl !== MealForeground
                  ? item.imageUrl
                  : fallbackBowl;

              return (
                <SwiperSlide
                  key={i}
                  className="!flex !flex-col !items-center !justify-center w-full"
                >
                  <div className="w-full flex flex-col items-center justify-center pt-4 pb-1 px-6 text-center">
                    {/* Day Badge with Edit Icon */}
                    <button
                      type="button"
                      onClick={handleEditClick}
                      className="group inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#383a3f]/80 hover:bg-[#484a50] backdrop-blur-md border border-white/15 text-xs sm:text-sm font-medium text-slate-200 transition-all cursor-pointer shadow-sm active:scale-95 mx-auto"
                      aria-label={`Edit selection for ${item.dayName}`}
                    >
                      <span>{item.day}</span>
                      <Pencil
                        size={12}
                        className="text-slate-300 group-hover:text-white transition-colors"
                      />
                    </button>

                    {/* Meal Name */}
                    <h2 className="mt-2.5 mb-1 text-sm sm:text-base md:text-lg font-bold text-white max-w-md mx-auto min-h-10 flex items-center justify-center px-4 leading-snug tracking-tight text-center">
                      {item.mealName}
                    </h2>

                    {/* Meal Bowl Image Centered with Realistic Under-Shadow */}
                    <div
                      onClick={handleEditClick}
                      className="relative mx-auto my-1 flex h-32 w-48 sm:h-36 sm:w-56 md:h-40 md:w-64 items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105"
                    >
                      <img
                        src={displayImage}
                        alt={item.mealName}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = fallbackBowl;
                        }}
                        className="max-h-full max-w-full object-contain mx-auto drop-shadow-[0_14px_24px_rgba(0,0,0,0.75)]"
                      />
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Pagination Dots (5 Days) */}
          <div className="relative z-20 flex items-center justify-center gap-2 pb-3.5 pt-0.5">
            {items.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => swiperInstance?.slideTo(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  activeIndex === idx
                    ? 'h-2 w-2 bg-white ring-2 ring-white/30 shadow-[0_0_6px_rgba(255,255,255,0.7)]'
                    : 'h-1.5 w-1.5 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
