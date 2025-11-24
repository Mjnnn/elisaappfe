export interface NotificationResponse {
    notificationId: number;
    title: string;
    content: string;
    imageUrl: string;
    sendTime: string; 
    type: string; 
    isRead: boolean;
}