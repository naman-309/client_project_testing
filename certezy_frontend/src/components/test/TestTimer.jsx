import { useState, useEffect } from "react";

export function TestTimer({ duration, onTimeUp }) {
    const [timeLeft, setTimeLeft] = useState(duration * 60); // convert minutes to seconds

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onTimeUp]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className={`test-timer ${timeLeft < 60 ? "warning" : ""}`}>
            <span>
                ⏱️ {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
        </div>
    );
}

export default TestTimer;
