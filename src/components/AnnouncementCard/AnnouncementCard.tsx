import type { AnnouncementItem } from '../../context/announcementContext';
import announcementIcon from "../../assets/AnnouncementsIcon.webp"

export interface AnnouncementCardProps {
  announcement: AnnouncementItem;
  className?: string;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center text-center font-sans ${className}`}
      data-testid="announcement-card"
    >
      <div className="relative mb-5 flex h-40 w-full  items-center justify-center overflow-hidden rounded-2xl">
        <img
          src={announcement.img ?? announcementIcon}
          alt={announcement.title}
          className="h-full w-full object-contain drop-shadow-sm transition-transform duration-300 hover:scale-105"
        />
      </div>


      {/* Title */}
      <h3 className="mb-2 text-2xl font-bold text-text-primary tracking-tight leading-snug max-w-sm">
        {announcement.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-text-secondary  max-w-sm">
        {announcement.description}
      </p>
    </div>
  );
};

export default AnnouncementCard;
