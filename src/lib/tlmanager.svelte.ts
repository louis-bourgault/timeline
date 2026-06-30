import type { Event, Tag, VisibleEvent } from './types';

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
	events: Event[] = $state([]);
	height: number;
	width: number;
	startViewportDate: Date;
	endViewportDate: Date;
	zoomLevel: number;
	tl: HTMLDivElement;
	public visibleEvents: VisibleEvent[] = $state([]);
	tlDivs: Map<number, { div: HTMLDivElement }> = new Map();
	tickerDivs: Map<string, { div: HTMLDivElement }> = new Map();
	private resizeObserver: ResizeObserver;
	private hoverTimeout: number | null = null;
	private hoveredEventId: number | null = null;
	hb: HTMLDivElement | null = null;
	visibleTags: Tag[] = $state([]);


	public resizeWatcher() {
		this.height = this.tl.clientHeight;
		this.width = this.tl.clientWidth;
		//todo: add debouncing
		this.updateVisible();
		console.log(`resizeWatcher called, new width: ${this.width}, new height: ${this.height}`);
	}

	constructor(tl: HTMLDivElement) {
		if (!document) {
			return;
		}
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

	public handleHover(eventId: number) {
		if (this.hoverTimeout !== null) {
			clearTimeout(this.hoverTimeout);
		}
		if (this.hb?.id === `tl-hover-brief-${eventId}`) {
			this.hoveredEventId = eventId;
			return;
		}
		this.hoveredEventId = eventId;
		if (this.hb && this.hb.id !== `tl-hover-brief-${eventId}`) {
			this.hb.remove();
			this.hb = null;
		}
		this.hoverTimeout = window.setTimeout(() => {
			if (this.hoveredEventId !== eventId) {
				return;
			}
			this.openHoverWindow(eventId);
		}, 500);
	}

	public handleExitHover(eventId?: number) {
		if (eventId !== undefined && this.hoveredEventId !== eventId) {
			return;
		}
		if (this.hoverTimeout !== null) {
			clearTimeout(this.hoverTimeout);
			this.hoverTimeout = null;
		}
		if (this.hb) {
			this.hb.remove();
			this.hb = null;
		}
		if (eventId === undefined || this.hoveredEventId === eventId) {
			this.hoveredEventId = null;
		}
	}

	public getEventById(eventId: number): Event | undefined {
		return this.events.find((event) => event.id === eventId);
	}

	public openHoverWindow(eventId: number) {
		console.log("you've been over this event long enough to show some info!", eventId);
		this.hoverTimeout = null;
		const tlEvent = document.getElementById(`tl-event-${eventId}`);
		const eventDetails = this.getEventById(eventId);
		if (!tlEvent) {
			console.error(`could not find tlEvent for event ${eventId}`);
			return;
		}
		if (!eventDetails) {
			console.error(`could not find eventDetails for event ${eventId}`);
			return;
		}
		const tlLocation = tlEvent?.getBoundingClientRect();
		if (!tlLocation) {
			console.error(`could not find tlLocation for event ${eventId}`);
			return;
		}

		const hoverBriefLoc = tlLocation.y - 200
		this.hb = document.createElement('div');
		this.hb.classList.add('tl-hover-brief');
		this.hb.id = `tl-hover-brief-${eventId}`;
		this.hb.style.position = 'absolute';
		this.hb.style.left = `${tlLocation.x}px`;
		this.hb.style.top = `${hoverBriefLoc}px`;
		let h3Hover = document.createElement('h3');
		h3Hover.innerHTML = eventDetails.title;
		this.hb.appendChild(h3Hover);
		let pHover = document.createElement('p');
		pHover.innerHTML = eventDetails.description ?? '';
		this.hb.appendChild(pHover);
		let aHover = document.createElement('a');
		aHover.href = eventDetails.wikiUrl ?? '#';
		aHover.target = '_blank';
		aHover.innerHTML = 'See on Wikipedia ';
		this.hb.appendChild(aHover);
		document.body.appendChild(this.hb);
		this.hb.addEventListener('mouseleave', (e) => {
			//if they're just moving from hovering over this to hovering over the tl-event, don't close it
			const newTarget = (e.relatedTarget as HTMLElement | null)?.closest('.tl-event') as HTMLElement | null;
			if (newTarget) {
				console.log(`user is hovering over the tl-event, not exiting hover`);
				return;
			}
			this.handleExitHover(eventId);
		});
		
	}

	public destroy() {
		this.resizeObserver.disconnect();
	}

	public handleScroll(deltaX: number, deltaY: number) {
		if (deltaY !== 0) {
			const zoomBy = 1 + deltaY * 0.001; // Adjust zoom sensitivity as needed

			this.zoomLevel *= zoomBy;
			const midDate = new Date(
				(this.startViewportDate.getTime() + this.endViewportDate.getTime()) / 2
			);
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
		let divsToKeep = new Set<number>();
		for (const event of this.events) {
			const eventEnd = event.endDate ?? event.startDate;

			if (eventEnd <= this.startViewportDate || event.startDate >= this.endViewportDate) {
				console.log(`event ${event.id} is not visible`);
				continue;
			} else {
				//event is visible
				let startX = this.dateToX(event.startDate);
				let osWidth = 0;
				if (startX < 0) {
					startX = 0;
					osWidth = this.dateToX(event.startDate) - startX;
					console.log(`oswidth: ${osWidth}`);
				}

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
							width: endX - startX + Math.floor(osWidth) //oswidth is negative
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
				tlEventElement.addEventListener('mouseenter', () => {
					this.handleHover(event.id);
				});
				tlEventElement.addEventListener('mouseleave', (e) => {
					const newTarget = (e.relatedTarget as HTMLElement | null)?.closest('.tl-hover-brief') as HTMLElement | null;
					if (newTarget) {
						console.log(`user is hovering over the hover window, not exiting hover`);
						return;
					}
					this.handleExitHover(event.id);
				});
			}
			if (!tlEventElement) {
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
				this.tlDivs.set(event.id, { div: tlEventElement });
				divsToKeep.add(event.id);
			} else {
				divsToKeep.add(event.id);
			}
		}
		for (const [id, record] of this.tlDivs) {
			if (!divsToKeep.has(id)) {
				//remove this div from the DOM and the map
				record.div.remove();
				this.tlDivs.delete(id);
				//actually delete the div from the dom
				document.getElementById(`tl-event-${id}`)?.remove();
			}
		}

		//add tickers for where we are
		let tickersToAdd: Date[] = [];
		const timeWidth = this.endViewportDate.getTime() - this.startViewportDate.getTime();
		let tickerSpecificity: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | undefined =
			undefined;
		if (timeWidth < 1000 * 60 * 60 * 24 * 365 * 10) {
			//less than 10 years, show ticks for years
			tickerSpecificity = 'year';
			for (
				let year = this.startViewportDate.getFullYear();
				year <= this.endViewportDate.getFullYear();
				year++
			) {
				tickersToAdd.push(new Date(year, 0, 1));
			}
		}
		let tickerDivsToKeep = new Set<string>();
		for (const tickerDate of tickersToAdd) {
			const tickerX = this.dateToX(tickerDate);
			let tickerDiv: HTMLDivElement | undefined;
			if (this.tickerDivs.has(tickerDate.toISOString())) {
				tickerDiv = this.tickerDivs.get(tickerDate.toISOString())?.div;
			} else {
				tickerDiv = document.createElement('div');
				tickerDiv.classList.add('tl-ticker');
				tickerDiv.id = `tl-ticker-${tickerDate.toISOString()}`;
				//we wnat it ot be for intervals other than year in future
				if (tickerSpecificity === 'year') {
					tickerDiv.innerText = `${tickerDate.getFullYear()}`;
				}
			}
			if (!tickerDiv) {
				console.error(`something really weird happened with tickers`);
				continue;
			}
			tickerDiv.style.left = `${tickerX}px`;
			this.tl.appendChild(tickerDiv);
			this.tickerDivs.set(tickerDate.toISOString(), { div: tickerDiv });
			tickerDivsToKeep.add(tickerDate.toISOString());
		}
		for (const [isoDate, record] of this.tickerDivs) {
			if (!tickerDivsToKeep.has(isoDate)) {
				//remove this div from the DOM and the map
				record.div.remove();
				this.tickerDivs.delete(isoDate);
				//actually delete the div from the dom
				document.getElementById(`tl-ticker-${isoDate}`)?.remove();
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
