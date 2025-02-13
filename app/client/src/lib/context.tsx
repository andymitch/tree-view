import { createContext, useState, useContext, useEffect, useMemo } from "react";
import { FlatNode, TreeNode } from "./types";
import * as api from "./handlers";
import { buildTree } from "./utils";

interface DataContextType {
    data: FlatNode[];
    trees: TreeNode[];
}

const DataContext = createContext<DataContextType>({ data: [], trees: [] });
export const useData = () => useContext<DataContextType>(DataContext);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
    const [data, setData] = useState<FlatNode[]>([]);

    const onAddItem = (item: FlatNode) => {
        setData((prev) => [...prev, item]);
    };

    const onRemoveItem = (id: number) => {
        setData((prev) => [...prev.filter((item) => item.id !== id)]);
    };

    const onUpdateItem = (item: FlatNode) => {
        setData((prev) => [...prev.map((i) => (i.id === item.id ? item : i))]);
    };

    const watchWithRetry = async (retryCount = 3) => {
        try {
            await api.watchData({ onAddItem, onRemoveItem, onUpdateItem });
        } catch (error) {
            if (retryCount <= 0) throw error;
            setTimeout(() => watchWithRetry(retryCount - 1), 1000);
        }
    };

    useEffect(() => {
        api.getData().then(setData);
        watchWithRetry().catch(console.error);
    }, []);

    const trees = useMemo(() => buildTree(data), [data]);

    return (
        <DataContext.Provider value={{ data, trees }}>
            {children}
        </DataContext.Provider>
    );
};
