export interface ICard {
    type: 'activity' | 'menu'
    title: string;
    imageUrl?: string;
    description?: string;
    onButtonClick?: () => void;
    vertEllipsisIconAction?: () => void;
}