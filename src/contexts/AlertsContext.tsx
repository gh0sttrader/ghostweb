
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Alert } from '@/types';
import { useToast } from '@/hooks/use-toast';

const ALERTS_STORAGE_KEY = 'ghost-trading-alerts';

interface AlertsContextType {
    alerts: Alert[];
    addAlert: (alert: Alert) => void;
    removeAlert: (alertId: string) => void;
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

export const AlertsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const { toast } = useToast();

    // Load alerts from localStorage on initial render
    useEffect(() => {
        try {
            const savedAlerts = localStorage.getItem(ALERTS_STORAGE_KEY);
            if (savedAlerts) {
                setAlerts(JSON.parse(savedAlerts));
            }
        } catch (error) {
            console.error("Failed to load alerts from localStorage", error);
        }
    }, []);

    // Save alerts to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
        } catch (error) {
            console.error("Failed to save alerts to localStorage", error);
        }
    }, [alerts]);

    // Dummy logic to trigger alerts for demonstration
    useEffect(() => {
        const interval = setInterval(() => {
            alerts.forEach(alert => {
                if (alert.status === 'active' && Math.random() < 0.1) { // 10% chance to trigger an alert
                    toast({
                        title: `🔔 Alert Triggered for ${alert.symbol}`,
                        description: `Condition met: ${alert.condition.metric} ${alert.condition.operator} ${alert.condition.value}`,
                        variant: 'success',
                        duration: 5000,
                    });
                    // In a real app, you might change the status or remove the alert
                }
            });
        }, 15000); // Check every 15 seconds

        return () => clearInterval(interval);
    }, [alerts, toast]);

    const addAlert = (alertToAdd: Alert) => {
        setAlerts(prevAlerts => {
            const existingIndex = prevAlerts.findIndex(a => a.id === alertToAdd.id || a.symbol === alertToAdd.symbol);
            if (existingIndex > -1) {
                const newAlerts = [...prevAlerts];
                newAlerts[existingIndex] = alertToAdd;
                return newAlerts;
            }
            return [...prevAlerts, alertToAdd];
        });
    };

    const removeAlert = (alertId: string) => {
        setAlerts(prevAlerts => prevAlerts.filter(a => a.id !== alertId));
    };

    return (
        <AlertsContext.Provider value={{ alerts, addAlert, removeAlert }}>
            {children}
        </AlertsContext.Provider>
    );
};

export const useAlertsContext = () => {
    const context = useContext(AlertsContext);
    if (context === undefined) {
        throw new Error('useAlertsContext must be used within an AlertsProvider');
    }
    return context;
};
