// Session Management Service
// Handles session timeout, activity tracking, and auto-logout

const SESSION_CONFIG = {
    TIMEOUT_DURATION: 15 * 60 * 1000, // 15 minutes in milliseconds
    WARNING_BEFORE_TIMEOUT: 2 * 60 * 1000, // 2 minutes warning
    CHECK_INTERVAL: 60 * 1000, // Check every minute
};

const STORAGE_KEYS = {
    LAST_ACTIVITY: 'secure_last_activity',
    SESSION_START: 'secure_session_start',
};

class SessionManager {
    constructor() {
        this.timeoutTimer = null;
        this.warningTimer = null;
        this.checkInterval = null;
        this.onTimeout = null;
        this.onWarning = null;
    }

    // Initialize session management
    init(onTimeoutCallback, onWarningCallback) {
        this.onTimeout = onTimeoutCallback;
        this.onWarning = onWarningCallback;

        // Set session start time
        this.setSessionStart();

        // Update last activity
        this.updateActivity();

        // Start monitoring
        this.startMonitoring();

        // Add activity listeners
        this.addActivityListeners();
    }

    // Set session start time
    setSessionStart() {
        const now = new Date().getTime();
        localStorage.setItem(STORAGE_KEYS.SESSION_START, now.toString());
    }

    // Update last activity timestamp
    updateActivity() {
        const now = new Date().getTime();
        localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, now.toString());

        // Reset timers
        this.resetTimers();
    }

    // Get last activity timestamp
    getLastActivity() {
        const lastActivity = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
        return lastActivity ? parseInt(lastActivity, 10) : new Date().getTime();
    }

    // Get session start time
    getSessionStart() {
        const sessionStart = localStorage.getItem(STORAGE_KEYS.SESSION_START);
        return sessionStart ? parseInt(sessionStart, 10) : new Date().getTime();
    }

    // Get time since last activity
    getTimeSinceLastActivity() {
        const now = new Date().getTime();
        const lastActivity = this.getLastActivity();
        return now - lastActivity;
    }

    // Get session duration
    getSessionDuration() {
        const now = new Date().getTime();
        const sessionStart = this.getSessionStart();
        return now - sessionStart;
    }

    // Check if session has timed out
    isTimedOut() {
        return this.getTimeSinceLastActivity() >= SESSION_CONFIG.TIMEOUT_DURATION;
    }

    // Check if warning should be shown
    shouldShowWarning() {
        const timeSinceActivity = this.getTimeSinceLastActivity();
        const timeUntilTimeout = SESSION_CONFIG.TIMEOUT_DURATION - timeSinceActivity;
        return timeUntilTimeout <= SESSION_CONFIG.WARNING_BEFORE_TIMEOUT && timeUntilTimeout > 0;
    }

    // Reset all timers
    resetTimers() {
        // Clear existing timers
        if (this.timeoutTimer) clearTimeout(this.timeoutTimer);
        if (this.warningTimer) clearTimeout(this.warningTimer);

        // Set warning timer
        const timeUntilWarning = SESSION_CONFIG.TIMEOUT_DURATION - SESSION_CONFIG.WARNING_BEFORE_TIMEOUT;
        this.warningTimer = setTimeout(() => {
            if (this.onWarning && !this.isTimedOut()) {
                this.onWarning();
            }
        }, timeUntilWarning);

        // Set timeout timer
        this.timeoutTimer = setTimeout(() => {
            if (this.onTimeout) {
                this.onTimeout();
            }
        }, SESSION_CONFIG.TIMEOUT_DURATION);
    }

    // Start monitoring session
    startMonitoring() {
        // Check session status periodically
        this.checkInterval = setInterval(() => {
            if (this.isTimedOut()) {
                this.handleTimeout();
            } else if (this.shouldShowWarning()) {
                if (this.onWarning) {
                    this.onWarning();
                }
            }
        }, SESSION_CONFIG.CHECK_INTERVAL);
    }

    // Stop monitoring
    stopMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        if (this.timeoutTimer) {
            clearTimeout(this.timeoutTimer);
            this.timeoutTimer = null;
        }
        if (this.warningTimer) {
            clearTimeout(this.warningTimer);
            this.warningTimer = null;
        }
    }

    // Handle timeout
    handleTimeout() {
        this.stopMonitoring();
        this.removeActivityListeners();
        if (this.onTimeout) {
            this.onTimeout();
        }
    }

    // Add activity listeners
    addActivityListeners() {
        // Track user activity
        const activityEvents = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click',
        ];

        this.activityHandler = () => {
            this.updateActivity();
        };

        // Throttle activity updates (max once per 30 seconds)
        let lastUpdate = 0;
        this.throttledActivityHandler = () => {
            const now = Date.now();
            if (now - lastUpdate > 30000) {
                lastUpdate = now;
                this.updateActivity();
            }
        };

        activityEvents.forEach((event) => {
            document.addEventListener(event, this.throttledActivityHandler, true);
        });
    }

    // Remove activity listeners
    removeActivityListeners() {
        const activityEvents = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click',
        ];

        activityEvents.forEach((event) => {
            document.removeEventListener(event, this.throttledActivityHandler, true);
        });
    }

    // Extend session (user clicked "Stay logged in")
    extendSession() {
        this.updateActivity();
    }

    // End session (logout)
    endSession() {
        this.stopMonitoring();
        this.removeActivityListeners();
        localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);
        localStorage.removeItem(STORAGE_KEYS.SESSION_START);
    }

    // Get formatted time remaining
    getTimeRemaining() {
        const timeSinceActivity = this.getTimeSinceLastActivity();
        const timeRemaining = SESSION_CONFIG.TIMEOUT_DURATION - timeSinceActivity;

        if (timeRemaining <= 0) return '0:00';

        const minutes = Math.floor(timeRemaining / 60000);
        const seconds = Math.floor((timeRemaining % 60000) / 1000);

        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Export singleton instance
const sessionManager = new SessionManager();

export default sessionManager;
export { SESSION_CONFIG };
