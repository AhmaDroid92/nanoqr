import React, { useEffect } from 'react';

const AdUnit = ({ slotId, label, width, height, className, layout = "auto" }) => {

    useEffect(() => {
        if (slotId) {
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.error("AdSense error", e);
            }
        }
    }, [slotId]);

    return (
        <div
            className={`bg-gray-100 border border-gray-200 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-400 overflow-hidden relative ${className}`}
            style={{ width: width || '100%', height: height || 'auto', minHeight: height }}
        >
            {/* If slotId is present, we would inject the Ad script here */}
            {slotId ? (
                <div className="w-full h-full bg-white text-center">
                    <ins className="adsbygoogle"
                        style={{ display: 'block' }}
                        data-ad-client="ca-pub-8756237259583117"
                        data-ad-slot={slotId}
                        data-ad-format={layout}
                        data-full-width-responsive="true"></ins>
                    {/* Fallback label during dev if ads don't load immediately */}
                    <span className="text-[10px] text-gray-300 absolute bottom-1 right-2 pointer-events-none">Ad</span>
                </div>
            ) : (
                <>
                    <span className="text-xs font-semibold uppercase tracking-wider">Ad Space</span>
                    {width && height && <span className="text-[10px] opacity-75">{width}x{height}</span>}
                </>
            )}
        </div>
    );
};

export default AdUnit;
