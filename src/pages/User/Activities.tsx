import { useState, useMemo } from 'react';
import { Card } from '../../components/Card/Card';
import ChooseMeals from '../../assets/ChooseMeal.svg';
import AllMeals from '../../assets/AllMeals.svg';
import { TitleBar } from '../../components/TitleBar/TitleBar';
import MealForeground from '../../assets/MealForeground.jpg';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/useAuth/useAuth';
import { days } from '../../utils/Enums/DayOfWeek';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import { useWeeklySelectionsQuery } from '../../api/useApiQueries';

// Predefined vibrant colors to act as dynamic backgrounds if dominant color extraction is too slow
const bgColors = [
  '#1c4e80', // Monday
  '#2E5B53', // Tuesday
  '#80391E', // Wednesday
  '#5C2E5D', // Thursday
  '#1B4332', // Friday
  '#3B2A50', // Saturday
  '#4E3B31', // Sunday
];

export function UserActivities() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const selectionsQuery = useWeeklySelectionsQuery(profile?.user?.id, today);

  const defaultCarouselIndex = useMemo(() => {
    const currentDayIndex = new Date().getDay() - 1; // 0 for Monday
    return currentDayIndex >= 0 && currentDayIndex < 5 ? currentDayIndex : 0;
  }, []);

  const [activeIndex, setActiveIndex] = useState(defaultCarouselIndex);

  const carouselItems = useMemo(() => {
    const mealSelections = selectionsQuery.data?.mealSelections ?? {};
    return days.map((day) => {
      const selection = mealSelections[day.toUpperCase()];
      return {
        day,
        mealName: selection?.mealName || 'Not Selected',
        imageUrl: selection?.mealImagePath || MealForeground,
      };
    });
  }, [selectionsQuery.data]);

  const activeBgColor = bgColors[activeIndex % bgColors.length];

  return (
    <div
      className="h-full w-full max-w-md mx-auto bg-white flex flex-col relative overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: activeBgColor }}
    >
      {/* Background color extension for top status bar area on iOS */}
      <div
        className="absolute top-0 left-0 right-0 h-10 -translate-y-full transition-colors duration-500"
        style={{ backgroundColor: activeBgColor }}
      ></div>

      <section className="h-[55vh] relative shrink-0">
        {/* TitleBar overlaid so it doesn't slide */}
        <div className="absolute top-0 left-0 right-0 pt-1.5 z-20 pointer-events-auto text-msTextPrimary drop-shadow-md bg-white pb-2">
          <TitleBar />
        </div>

        <div className="w-full h-full pt-16 pb-4">
          <Swiper
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={1.2}
            initialSlide={defaultCarouselIndex}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            coverflowEffect={{
              rotate: 0,
              stretch: 10,
              depth: 100,
              modifier: 1,
              slideShadows: true,
            }}
            pagination={{ clickable: true }}
            modules={[EffectCoverflow, Pagination]}
            className="w-full h-full"
          >
            {carouselItems.map((item, i) => (
              <SwiperSlide key={i} className="rounded-3xl overflow-hidden shadow-xl bg-white">
                <div className="w-full h-full relative">
                  <img
                    src={item.imageUrl}
                    alt={item.mealName}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>

                  {/* Content positioned bottom left */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-white pointer-events-none">
                    <div className="bg-red-600 text-white text-sm font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded w-fit mb-3 shadow-md">
                      {item.day}
                    </div>
                    <h1 className="text-3xl font-black leading-tight tracking-tight text-white mb-4 drop-shadow-lg line-clamp-2">
                      {item.mealName}
                    </h1>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      <section className="flex-1 gap-y-6 flex flex-col bg-[#fbfbfb] pt-6 rounded-t-lg shadow-[0_-4px_10px_rgba(0,0,0,0.05)] relative z-10">
        <h3 className="text-msDeepBlue font-bold text-[18px] mx-4 mb-1.5">Activities</h3>
        <Card
          type="activity"
          title="Select My Meal"
          description="Select meals you want to eat for the week."
          imageUrl={ChooseMeals}
          onButtonClick={() => {
            navigate('/select-meal');
          }}
        />
        <Card
          type="activity"
          title="Select Meal for Someone"
          description="Choose a meal on behalf of another user."
          imageUrl={AllMeals}
          onButtonClick={() => {
            navigate('/select-meal?forSomeone=true');
          }}
        />
      </section>
    </div>
  );
}
