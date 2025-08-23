"use client";

import { useState, useEffect } from 'react';


interface CalendarEvent {
    id: string;
    summary: string;
    start: string;
    end: string; // ISO date string
    complete: boolean;
}

export default function Calendar() { const [events, setEvents] = useState<CalendarEvent[]>([]);

useEffect(() => { // Replace this with a fetch from your backend if needed. // For demonstration, we'll use some sample data. 
    const sampleEvents: CalendarEvent[] = [
        { id: '1', summary: 'Task A', start: new Date().toISOString(), end: new Date().toISOString(), complete: false, },
        { id: '2', summary: 'Task B', start: new Date().toISOString(), end: new Date().toISOString(), complete: false, },
    ];
    setEvents(sampleEvents);
}, []);

const toggleComplete = (id: string) => { setEvents(prev => prev.map(event => event.id === id ? { ...event, complete: !event.complete } : event )); };

return (
    <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
            <h1 className="text-3xl font-bold text-center mb-6">Your Calendar</h1>
            <div className="space-y-4">
                {events.map(event => (
                    <div key={event.id} className="flex items-center justify-between border p-4 rounded-md">
                        <div>
                            <h2 className="font-semibold text-xl">{event.summary}</h2>
                            <p className="text-gray-600">Start: {new Date(event.start).toLocaleString()}</p>
                            <p className="text-gray-600">End: {new Date(event.end).toLocaleString()}</p>
                        </div>
                        <div>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" checked={event.complete} onChange={() => toggleComplete(event.id)} className="h-5 w-5" />
                                <span className="text-gray-800">Done</span>
                            </label>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

}