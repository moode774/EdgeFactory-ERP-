import React, { useState, useRef, useEffect, useCallback } from 'react';

interface AutoCompleteInputProps {
    value: string;
    onChange: (value: string) => void;
    suggestions: string[];
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export const AutoCompleteInput: React.FC<AutoCompleteInputProps> = ({
    value,
    onChange,
    suggestions,
    placeholder,
    className = '',
    disabled = false,
}) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize the textarea based on content
    const adjustHeight = useCallback(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.max(textarea.scrollHeight, 36)}px`;
        }
    }, []);

    useEffect(() => {
        adjustHeight();
    }, [value, adjustHeight]);

    useEffect(() => {
        // Filter suggestions based on current value
        if (value.trim() === '') {
            setFilteredSuggestions(suggestions.slice(0, 8));
        } else {
            const filtered = suggestions
                .filter(s => s.toLowerCase().includes(value.toLowerCase()))
                .slice(0, 8);
            setFilteredSuggestions(filtered);
        }
    }, [value, suggestions]);

    useEffect(() => {
        // Close suggestions when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (suggestion: string) => {
        onChange(suggestion);
        setShowSuggestions(false);
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setShowSuggestions(true);
                        adjustHeight();
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`${className} resize-none overflow-hidden leading-tight`}
                    autoComplete="off"
                    rows={1}
                    style={{ minHeight: '36px' }}
                />
            </div>

            {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mb-2 bottom-full bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] max-h-60 overflow-y-auto transform transition-all duration-200 ease-out origin-bottom animate-in fade-in slide-in-from-bottom-2">
                    <div className="px-1 py-1">
                        {filteredSuggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleSelect(suggestion)}
                                className="group w-full text-left px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-white transition-all duration-200 flex items-center justify-between"
                            >
                                <span className="font-medium text-slate-700 group-hover:text-blue-700 transition-colors text-xs tracking-wide">
                                    {suggestion}
                                </span>
                                {index === 0 && value.trim() === '' && (
                                    <span className="flex items-center gap-1 bg-amber-50 text-amber-600 text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-100/50 shadow-sm">
                                        <span className="text-amber-500">★</span> Popular
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
