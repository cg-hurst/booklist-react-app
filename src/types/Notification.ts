export interface NotificationMessage {
  id: number;
  message: string;
  type: "success" | "error";
  timestamp: Date;
}