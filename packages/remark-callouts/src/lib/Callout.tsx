import { useRef } from "react";

const Callout = ({ className, children }) => {
    // If it's not a foldable callout, just render it as a blockquote
    if (!className.includes("callout-foldable")) {
        return <blockquote className={className}>{children}</blockquote>;
    }
    
    const elem = useRef(null);

    const handleClick = () => {
        elem.current.classList.toggle("callout-folded");
    };

    return (
        <blockquote className={className} ref={elem} onClick={handleClick}>{children}</blockquote>
    );
};

export { Callout };