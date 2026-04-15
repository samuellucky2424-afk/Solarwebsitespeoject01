import React from 'react';
import {
    ORDER_FULFILLMENT_STEPS,
    formatFulfillmentStatus,
    getFulfillmentBadgeClasses,
    getFulfillmentDescription,
    getFulfillmentProgressIndex,
    normalizeFulfillmentStatus,
} from '../../src/lib/orderTracking';

interface OrderFulfillmentTrackerProps {
    status?: string | null;
    updatedAt?: string | null;
    className?: string;
}

const OrderFulfillmentTracker: React.FC<OrderFulfillmentTrackerProps> = ({
    status,
    updatedAt,
    className = '',
}) => {
    const currentStatus = normalizeFulfillmentStatus(status);
    const currentIndex = getFulfillmentProgressIndex(currentStatus);

    const formattedUpdatedAt = updatedAt
        ? new Date(updatedAt).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        : null;

    return (
        <div className={`rounded-3xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-black/20 ${className}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                        Delivery Tracking
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                        {formatFulfillmentStatus(currentStatus)}
                    </h3>
                </div>
                <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${getFulfillmentBadgeClasses(currentStatus)}`}>
                    {formatFulfillmentStatus(currentStatus)}
                </span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {ORDER_FULFILLMENT_STEPS.map((step, index) => {
                    const isComplete = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const isUpcoming = index > currentIndex;

                    const stateClasses = isCurrent
                        ? `${getFulfillmentBadgeClasses(step)} shadow-lg shadow-black/5 animate-pulse`
                        : isComplete
                            ? `${getFulfillmentBadgeClasses(step)} opacity-95`
                            : 'border-gray-200 bg-gray-50 text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400';

                    const markerClasses = isCurrent
                        ? 'bg-current text-white ring-4 ring-current/15'
                        : isComplete
                            ? 'bg-current text-white'
                            : 'bg-transparent text-current';

                    return (
                        <div
                            key={step}
                            className={`rounded-2xl border px-4 py-4 transition-all ${stateClasses}`}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <span className={`inline-flex size-8 items-center justify-center rounded-full border border-current text-xs font-black ${markerClasses}`}>
                                    {index + 1}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                                    {isCurrent ? 'Current' : isComplete ? 'Done' : 'Next'}
                                </span>
                            </div>
                            <p className="mt-4 text-sm font-bold">
                                {formatFulfillmentStatus(step)}
                            </p>
                            <p className={`mt-1 text-xs ${isUpcoming ? 'text-gray-500 dark:text-gray-400' : 'opacity-80'}`}>
                                {getFulfillmentDescription(step)}
                            </p>
                        </div>
                    );
                })}
            </div>

            {formattedUpdatedAt && (
                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                    Last updated: {formattedUpdatedAt}
                </p>
            )}
        </div>
    );
};

export default OrderFulfillmentTracker;
