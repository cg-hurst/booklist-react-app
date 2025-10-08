import type { NotificationMessage } from "../types/Notification";
import { forwardRef, useImperativeHandle, useState } from "react";

export interface NotificationFunctions {
    addNotification: (message: string, type: "success" | "error") => void;
}

export const Notifications = forwardRef<NotificationFunctions>((props, ref) => {

    const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

    // Expose addNotification method to parent component via ref
    const addNotification = (message: string, type: "success" | "error") => {
        const newNotification: NotificationMessage = {
            id: Date.now(), // Unique ID based on timestamp
            message,
            type,
            timestamp: new Date(),
        };
        setNotifications((prev) => [...prev, newNotification]);

        const duration = 5000;;
        setTimeout(() => {
            removeNotification(newNotification.id);
        }, duration);
    }

    const removeNotification = (id: number) => {
        setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    }

    useImperativeHandle(ref, () => ({
        addNotification
    }));

    return (

        <div className="fixed bottom-0 right-0 m-4 p-4 w-64 pointer-events-none">

            {notifications.map((notification) => (
                <div key={notification.id} className={`mb-2 notification p-2 min-h-16 rounded pointer-events-auto ${notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'} border`}>
                    <p className="text-sm">{notification.message}</p>
                </div>
            ))}


        </div>
    );
});


