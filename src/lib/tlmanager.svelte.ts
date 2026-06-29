import type { Event, VisibleEvent } from './types';

const sampleEvents: Event[] = [
	{
		id: 1,
		title: 'Event 1',
		description: 'Description for Event 1',
		wikiUrl: 'https://en.wikipedia.org/wiki/Event_1',
		viewPriority: 1,
		importance: 0.5,
		tagIds: [1, 2],
		startDate: new Date('2023-01-01'),
		endDate: new Date('2023-05-01'),
		precision: 'day',
		isBce: false,
		dateDisplay: 'January 1, 2023'
	},
	{
		id: 2,
		title: 'Event 2',
		description: 'Description for Event 2',
		wikiUrl: 'https://en.wikipedia.org/wiki/Event_2',
		viewPriority: 2,
		importance: 0.8,
		tagIds: [2, 3],
		startDate: new Date('2023-02-01'),
		endDate: new Date('2023-02-03'),
		precision: 'day',
		isBce: false,
		dateDisplay: 'February 1, 2023'
	},
    {
        id: 3,
        title: 'Event 3',
        description: 'Description for Event 3',
        wikiUrl: 'https://en.wikipedia.org/wiki/Event_3',
        viewPriority: 3,
        importance: 0.9,
        tagIds: [1, 3],
        startDate: new Date('2023-03-01'),
        endDate: null, // Point event
        precision: 'day',
        isBce: false,
        dateDisplay: 'March 1, 2023'
    },
	{
		id: 4,
		title: 'Event 4',
		description: 'Description for Event 4',
		wikiUrl: 'https://en.wikipedia.org/wiki/Event_4',
		viewPriority: 4,
		importance: 0.3,
		tagIds: [1, 2, 3],
		startDate: new Date('2023-11-01'),
		endDate: new Date('2023-11-15'),
		precision: 'day',
		isBce: false,
		dateDisplay: 'April 1, 2023'
	}
];

export class TLManager {
	events: Event[];
	height: number;
	width: number;
	startViewportDate: Date;
	endViewportDate: Date;
	zoomLevel: number;
	tl: HTMLDivElement;
	public visibleEvents: VisibleEvent[] = $state([]);
    tlDivs: Map<number, {div: HTMLDivElement, shouldDelete: boolean}> = new Map();
    private resizeObserver: ResizeObserver;
	private scrollObserver: IntersectionObserver;

	public resizeWatcher() {
		this.height = this.tl.clientHeight;
		this.width = this.tl.clientWidth;
		//todo: add debouncing
		this.updateVisible();
        console.log(`resizeWatcher called, new width: ${this.width}, new height: ${this.height}`);
	}

	constructor(tl: HTMLDivElement) {
		this.events = $state([]);
		for (const event of sampleEvents) {
			this.events.push(event);
		}
		this.tl = tl;
		this.height = this.tl.clientHeight;
		this.width = this.tl.clientWidth;
		this.startViewportDate = new Date('2023-01-01');
		this.endViewportDate = new Date('2023-12-31');
		this.zoomLevel = 1;

        this.resizeObserver = new ResizeObserver(() => {
            this.resizeWatcher();
        });
		this.resizeObserver.observe(this.tl);
		
		this.tl.addEventListener('wheel', (e) => {
			e.preventDefault();
			this.handleScroll(e.deltaX, e.deltaY);
			this.updateVisible();
		});
		
		
		
        this.updateVisible();
	}

    public destroy() {
        this.resizeObserver.disconnect();
    }

	public handleScroll(deltaX: number, deltaY: number) {
		console.log(`x: ${deltaX}, y: ${deltaY}`);
		if (deltaY !== 0) {
			const zoomBy = 1 + deltaY * 0.001; // Adjust zoom sensitivity as needed
			
			this.zoomLevel *= zoomBy;
			const midDate = new Date((this.startViewportDate.getTime() + this.endViewportDate.getTime()) / 2);
			const totalTime = this.endViewportDate.getTime() - this.startViewportDate.getTime();
			const newTotalTime = totalTime * zoomBy;
			this.startViewportDate = new Date(midDate.getTime() - newTotalTime / 2);
			this.endViewportDate = new Date(midDate.getTime() + newTotalTime / 2);
		}
		if (deltaX !== 0) {
			const totalTime = this.endViewportDate.getTime() - this.startViewportDate.getTime();
			const timePerPixel = totalTime / this.width;
			const timeShift = deltaX * timePerPixel;
			this.startViewportDate = new Date(this.startViewportDate.getTime() + timeShift);
			this.endViewportDate = new Date(this.endViewportDate.getTime() + timeShift);
		}
	}

	public updateVisible() {
        this.visibleEvents.length = 0; //clear this, might be a better way to reuse
		for (const event of this.events) {
			if (event.startDate >= this.startViewportDate) {
				//event is visible
				const startX = this.dateToX(event.startDate);
				if (event.endDate) {
					const endX = this.dateToX(event.endDate);
					if (endX - startX < 10) {
						//this is too small to show as a range, just do point
						this.visibleEvents.push({
							...event,
							x: startX,
							width: null
						});
					} else {
						this.visibleEvents.push({
							...event,
							x: startX,
							width: endX - startX
						});
					}
				} else {
                    this.visibleEvents.push({
                        ...event,
                        x: startX,
                        width: null
                    });

                }
			}
		}

        for (const event of this.visibleEvents) {
            let tlEventElement: HTMLDivElement | undefined;
            let wasFromMap = false;
            if (this.tlDivs.has(event.id)) {
                //update existing div
                const record = this.tlDivs.get(event.id);
                tlEventElement = record?.div;
                wasFromMap = true;

            } else {
                tlEventElement = document.createElement('div');
                tlEventElement.classList.add('tl-event');
                tlEventElement.id = `tl-event-${event.id}`;

            } if (!tlEventElement) {
                console.error(`somewthing really weird happened`);
                continue;
            }

            tlEventElement.style.left = `${event.x}px`;
            //todo: different styles for point vs range events
            if (event.width) {
                tlEventElement.style.width = `${event.width}px`;
            } else {
                tlEventElement.style.width = `2px`; //point event
            }
            this.tl.appendChild(tlEventElement);
            if (!wasFromMap) {
                this.tlDivs.set(event.id, {div: tlEventElement, shouldDelete: false});
            } else {
                this.tlDivs.get(event.id)!.shouldDelete = false;
            }
        }
        for (const [id, record] of this.tlDivs) {
            if (record.shouldDelete) {
                this.tl.removeChild(record.div);
                this.tlDivs.delete(id);
            } else {
                record.shouldDelete = true;
            }
        }
	}

	dateToX(date: Date): number {
		const totalTime = this.endViewportDate.getTime() - this.startViewportDate.getTime();
		const timeSinceStart = date.getTime() - this.startViewportDate.getTime();
		const percentage = timeSinceStart / totalTime;
		return percentage * this.width;
	}
}
