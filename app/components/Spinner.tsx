import React from 'react';

export const Spinner = () => {
    return (
        <div className="flex-1 flex items-center justify-center">
            <div
                className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500"
                role="status"
            >
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    );
};
