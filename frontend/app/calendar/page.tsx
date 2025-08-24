"use client";

import { useState, useEffect } from 'react';


interface TaskObject {
    id: number;
    user_id: string;
    name: string;
    start_timestamptz: string;
    end_timestamptz: string;
    recurrence: string;
    recurrence_time_required: number;
    recurrence_time_done: number;
}

interface EventObject {
    id: number;
    task_id: number;
    title: string;
    start: string;
    end: string;
    isDone: boolean;
}

export default function Calendar() { 
    // const [tasks, setTasks] = useState<TaskObject[]>([]);
    const [events, setEvents] = useState<EventObject[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const fetchEvents = async () => {
            const response = await fetch('api/load', {
          credentials: 'include'
        });
            const data = await response.json();
            setEvents(data);
        };
        fetchEvents();
    }, []);
    

    const toggleComplete = async (id: number) => {
        const event = events.find(e => e.id === id);
        if (!event) return;

        // Optimistically update the UI
        setEvents(prev => prev.map(event => 
            event.id === id ? { ...event, isDone: !event.isDone } : event
        ));

        try {
            await fetch('/api/events/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ eventId: id, isDone: !event.isDone })
            });
        } catch (error) {
            console.error('Failed to toggle event completion:', error);

            // Revert the change if the request fails
            setEvents(prev => prev.map(event => 
                event.id === id ? { ...event, isDone: event.isDone } : event
            ));
        }
    };

    // Calendar helper functions
    // const getDaysInMonth = (date: Date) => {
    //     return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    // };

    // const getFirstDayOfMonth = (date: Date) => {
    //     return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    // };

    const getEventsForDate = (date: Date) => {
        return events.filter(event => {
            const eventDate = new Date(event.start);
            return eventDate.toDateString() === date.toDateString();
        });
    };

    const getStartOfWeek = (date: Date) => {
        const day = date.getDay();
        const diff = date.getDate() - day;
        return new Date(date.setDate(diff));
    };

    const renderCalendarWeek = () => {
        const startOfWeek = getStartOfWeek(currentDate);
        const days = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const dayEvents = getEventsForDate(date);

            days.push(
                <div key={i} className="h-120 border border-stone-500 p-1 overflow-y-auto text-stone-600">
                    <div className="font-semibold text-sm mb-1">{date.toLocaleDateString('en-US', { day: 'numeric' })}</div>
                    <div className="space-y-1">
                        {dayEvents.map(event => (
                            <div key={event.id} className="bg-emerald-100 p-1 rounded text-xs">
                                <div className="flex flex-col">
                                    <div className={`font-medium ${event.isDone ? 'line-through text-black' : 'text-black'}`}>
                                        {event.title}
                                    </div>
                                    <div className="text-stone-500 text-xs">
                                        {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={event.isDone} 
                                        onChange={() => toggleComplete(event.id)}
                                        className="h-4 w-4 mt-1 flex-shrink-0"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return days;
    };

    const navigateWeek = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setDate(prev.getDate() - 7);
            } else {
                newDate.setDate(prev.getDate() + 7);
            }
            return newDate;
        });
    };

    return (
        <div className="min-h-screen bg-stone-100 p-6 font-serif">
            <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-6">
                    <button 
                        onClick={() => navigateWeek('prev')}
                        className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600"
                    >
                        Previous
                    </button>
                    <h1 className="text-3xl font-bold text-stone-600">
                        Week of {getStartOfWeek(currentDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </h1>
                    <button 
                        onClick={() => navigateWeek('next')}
                        className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600"
                    >
                        Next
                    </button>
                </div>
                
                {/* Calendar Header */}
                <div className="grid grid-cols-7 gap-0 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="p-2 text-center font-semibold bg-stone-50 border border-stone-500 text-stone-600">
                            {day}
                        </div>
                    ))}
                </div>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-0">
                    {renderCalendarWeek()}
                </div>
            </div>
        </div>
    );
}