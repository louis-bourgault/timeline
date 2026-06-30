export type Event = {
    id: number;
    title: string;
    description: string | null;
    wikiUrl: string | null;
    viewPriority: number;
    importance: number;
    tagIds: number[];
    startDate: Date;
    endDate: Date | null;
    precision: 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year' | 'decade' | 'century' | 'millennium' | 'era';
    isBce: boolean;
    dateDisplay: string | null;
}

export type VisibleEvent = Event & {
    x: number;
    width: number | null; //if null, its a point event (a range event can be shown as a point event if we're too far zoomed out.)
}

export type Tag = {
    id: number;
    name: string;
    color: string | null;
}