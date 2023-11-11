export interface Thread {
    id: string;
    [key: string]: any;
}
type Reminder = Record<string, any>;
export declare function formatEventReminders(reminder: Reminder): {
    reminderID: any;
    eventCreatorID: any;
    time: any;
    eventType: any;
    locationName: any;
    locationCoordinates: any;
    locationPage: any;
    eventStatus: any;
    note: any;
    repeatMode: any;
    eventTitle: any;
    triggerMessage: any;
    secondsToNotifyBefore: any;
    allowsRsvp: any;
    relatedEvent: any;
    members: any;
};
export declare function formatThreadGraphQLResponse(data: Record<string, any>): any;
export declare function formatThreadList(data: Thread[]): any[];
export {};
