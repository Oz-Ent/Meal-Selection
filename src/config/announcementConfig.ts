
export interface AnnouncementContent {
  id?: string | number;
  title: string;
  description: string;
  img?: string;
  tag?: string;
}

export interface AnnouncementVersion {
  version: number;
  announcements: AnnouncementContent[];
}

export const ANNOUNCEMENT_VERSION_GLOBAL = 1;

export const ANNOUNCEMENT_VERSION: AnnouncementVersion[] = [
  {
    version: 1,
    announcements: [
      {
        title: "Auto-Submission",
        description: "Toggle the auto-submit in your user preferences to auto submit your preset when the selection window opens",
        
      },
      {
        title: "Dark Mode",
        description: "Customize the app to your preference with our new dark mode feature",
        
      },
      {
        title: "Notifications",
        description: "Allow push notifications to get notified when you prefer",
        
      },
      {
        title: "All in One",
        description: "Install the app to your home screen to make it easier to access",
        
      },
    ],
  },
];