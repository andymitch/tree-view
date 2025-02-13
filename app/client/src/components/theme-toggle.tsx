import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
    const [isDarkTheme, setIsDarkTheme] = useState<boolean>(
        window.matchMedia("(prefers-color-scheme: dark)").matches,
    );

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(isDarkTheme ? "dark" : "light");
    }, [isDarkTheme]);

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => setIsDarkTheme((prev) => !prev)}
        >
            <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Sun className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
