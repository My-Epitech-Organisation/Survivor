// types/event.ts

export interface Event {
    id: number;
    name: string;
    dates: string;
    location: string;
    description: string;
    event_type: string;
    target_audience: string;
    pictureURL: string;
}

export interface CalendarEvent extends Event {
    parsedDate: Date;
}
