
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { ChevronDown, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const LAYOUTS_STORAGE_KEY = "ghost-trading-layouts";

interface SavedLayouts {
    activeLayout: string;
    layouts: {
        [key: string]: {
            layouts: ReactGridLayout.Layout[];
            widgetGroups: Record<string, string[]>;
        }
    };
}

const getSavedLayouts = (): SavedLayouts => {
    if (typeof window === 'undefined') {
        return { activeLayout: 'Default', layouts: { 'Default': { layouts: [], widgetGroups: {} } } };
    }
    const data = localStorage.getItem(LAYOUTS_STORAGE_KEY);
    return data ? JSON.parse(data) : { activeLayout: 'Default', layouts: { 'Default': { layouts: [], widgetGroups: {} } } };
};

interface LayoutDropdownProps {
    currentLayouts: ReactGridLayout.Layout[];
    onLayoutChange: (config: { layouts: ReactGridLayout.Layout[], widgetGroups: Record<string, string[]> }) => void;
    widgetGroups: Record<string, string[]>;
    onWidgetGroupsChange: (groups: Record<string, string[]>) => void;
}

export function LayoutDropdown({ currentLayouts, onLayoutChange, widgetGroups, onWidgetGroupsChange }: LayoutDropdownProps) {
    const { toast } = useToast();
    const [savedData, setSavedData] = useState<SavedLayouts>({ activeLayout: 'Default', layouts: {} });
    const [showDropdown, setShowDropdown] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const layouts = getSavedLayouts();
        // Ensure default layout exists if storage is empty
        if (!layouts.layouts.Default) {
            layouts.layouts.Default = { layouts: currentLayouts, widgetGroups: widgetGroups };
            localStorage.setItem(LAYOUTS_STORAGE_KEY, JSON.stringify(layouts));
        }
        setSavedData(layouts);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCreate = () => {
        const name = prompt("Enter new layout name:");
        if (name && !savedData.layouts[name]) {
            const newLayoutData = { layouts: currentLayouts, widgetGroups };
            const updated: SavedLayouts = {
                ...savedData,
                activeLayout: name,
                layouts: { ...savedData.layouts, [name]: newLayoutData }
            };
            setSavedData(updated);
            localStorage.setItem(LAYOUTS_STORAGE_KEY, JSON.stringify(updated));
            onLayoutChange(newLayoutData);
            toast({ title: `Layout "${name}" created and activated.` });
            setShowDropdown(false);
        } else if (name) {
            toast({ title: `Layout name "${name}" already exists.`, variant: "destructive" });
        }
    };

    const handleSwitch = (name: string) => {
        const layoutToLoad = savedData.layouts[name];
        if (layoutToLoad) {
            const updated = { ...savedData, activeLayout: name };
            setSavedData(updated);
            localStorage.setItem(LAYOUTS_STORAGE_KEY, JSON.stringify(updated));
            onLayoutChange(layoutToLoad);
            toast({ title: `Switched to layout "${name}".` });
        }
        setShowDropdown(false);
    };

    const handleSave = () => {
        const updatedLayout = { layouts: currentLayouts, widgetGroups };
        const updated: SavedLayouts = {
            ...savedData,
            layouts: { ...savedData.layouts, [savedData.activeLayout]: updatedLayout }
        };
        setSavedData(updated);
        localStorage.setItem(LAYOUTS_STORAGE_KEY, JSON.stringify(updated));
        toast({ title: `Layout "${savedData.activeLayout}" saved.` });
        setShowDropdown(false);
    };

    const handleDelete = (name: string) => {
        if (name === "Default") {
            toast({ title: "Cannot delete the Default layout.", variant: "destructive" });
            return;
        }
        if (window.confirm(`Are you sure you want to delete the layout "${name}"?`)) {
            const updated = { ...savedData };
            delete updated.layouts[name];
            
            const newActiveLayout = savedData.activeLayout === name ? "Default" : savedData.activeLayout;
            updated.activeLayout = newActiveLayout;
            
            setSavedData(updated);
            localStorage.setItem(LAYOUTS_STORAGE_KEY, JSON.stringify(updated));
            
            if (savedData.activeLayout === name) {
                onLayoutChange(updated.layouts.Default);
            }

            toast({ title: `Layout "${name}" deleted.` });
            setShowDropdown(false);
        }
    };

    return (
        <div className="relative ml-4" ref={ref}>
            <Button
                variant="ghost"
                className="px-3 py-1 text-white text-sm flex items-center h-8 hover:bg-white/10"
                onClick={() => setShowDropdown(s => !s)}
            >
                {savedData.activeLayout}
                <ChevronDown size={16} className={cn("ml-2 text-muted-foreground transition-transform", showDropdown && "rotate-180")} />
            </Button>
            {showDropdown && (
                <div className="absolute mt-2 left-0 bg-[#181818e6] border border-white/10 rounded-lg w-56 z-50 p-1 backdrop-blur-md">
                    <button className="w-full text-sm font-medium px-3 py-2 text-left hover:bg-white/10 rounded-md text-white" onClick={handleCreate}>
                        + Create New Layout
                    </button>
                    <button className="w-full text-sm font-medium px-3 py-2 text-left hover:bg-white/10 rounded-md text-white" onClick={handleSave}>
                        💾 Save Current Layout
                    </button>
                    <div className="border-t border-white/10 my-1" />
                    <div className="max-h-48 overflow-y-auto">
                        {Object.keys(savedData.layouts).map((name) => (
                            <div key={name} className="flex items-center group">
                                <button
                                    className="w-full text-sm font-medium px-3 py-2 text-left hover:bg-white/10 rounded-md text-white"
                                    onClick={() => handleSwitch(name)}
                                >
                                    {name}
                                </button>
                                {name !== "Default" && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100"
                                      onClick={() => handleDelete(name)}
                                    >
                                      <Trash2 size={14} className="text-destructive" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
