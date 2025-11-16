import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from './icons/Icons';

interface DatePickerProps {
    selectedDate: string;
    onChange: (date: string) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onChange }) => {
    const getInitialDate = (dateString: string) => {
        if (!dateString) return new Date();
        const parts = dateString.split('-').map(Number);
        const date = new Date(parts[0], parts[1] - 1, parts[2]);
        return isNaN(date.getTime()) ? new Date() : date;
    };
    
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(getInitialDate(selectedDate));
    const datePickerRef = useRef<HTMLDivElement>(null);

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const changeMonth = (amount: number) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + amount);
        setViewDate(newDate);
    };

    const handleDateSelect = (day: number) => {
        const selectedMonth = month + 1;
        const formattedMonth = selectedMonth < 10 ? `0${selectedMonth}` : selectedMonth;
        const formattedDay = day < 10 ? `0${day}` : day;
        const newDateString = `${year}-${formattedMonth}-${formattedDay}`;
        onChange(newDateString);
        setIsOpen(false);
    };

    const renderDays = () => {
        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="text-center p-2"></div>);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            const isSelected = selectedDate && getInitialDate(selectedDate).toDateString() === currentDate.toDateString();
            const isToday = new Date().toDateString() === currentDate.toDateString();

            let className = "text-center p-2 rounded-full cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-700";
            if (isSelected) {
                className += " bg-primary-600 text-white font-bold";
            } else if (isToday) {
                className += " bg-gray-200 dark:bg-gray-600";
            } else {
                className += " text-gray-700 dark:text-gray-300";
            }

            days.push(
                <div key={day} className={className} onClick={() => handleDateSelect(day)}>
                    {day}
                </div>
            );
        }
        return days;
    };

    return (
        <div className="relative" ref={datePickerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-left flex justify-between items-center"
            >
                <span>{selectedDate || 'Select a date'}</span>
                <CalendarIcon className="w-5 h-5 text-gray-400" />
            </button>
            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex justify-between items-center mb-2">
                        <button type="button" onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>
                        <div className="font-semibold text-gray-800 dark:text-white">
                            {monthNames[month]} {year}
                        </div>
                        <button type="button" onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-sm">
                        {daysOfWeek.map(day => (
                            <div key={day} className="font-bold text-center text-gray-500 dark:text-gray-400 p-2">{day}</div>
                        ))}
                        {renderDays()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePicker;