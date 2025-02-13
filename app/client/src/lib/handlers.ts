import { FlatNode } from "./types";

export const getData = async (): Promise<FlatNode[]> => {
    try {
        const res = await fetch("/api/items");
        const data = await res.json();
        return data;
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const watchData = async ({
    onAddItem,
    onRemoveItem,
    onUpdateItem,
}: {
    onAddItem: (item: FlatNode) => void;
    onRemoveItem: (id: number) => void;
    onUpdateItem: (item: FlatNode) => void;
}): Promise<void> => {
    try {
        const res = await fetch("/api/items/watch");
        const reader = res.body?.getReader();
        if (!reader) throw new Error("No reader available");

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const item = JSON.parse(new TextDecoder().decode(value));
            switch (item.type) {
                case "add":
                    onAddItem(item.data);
                    break;
                case "remove":
                    onRemoveItem(item.id);
                    break;
                case "update":
                    onUpdateItem(item.data);
                    break;
                case "error":
                    throw new Error(item.message);
            }
        }
    } catch (error) {
        console.error(error);
    }
};

export const addItem = async (
    name: string,
    parent: number | null,
): Promise<number> => {
    try {
        const res = await fetch("/api/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, parent }),
        });
        const data = await res.json();
        return data.id;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const removeItem = async (id: number): Promise<void> => {
    try {
        await fetch(`/api/items/${id}`, { method: "DELETE" });
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const renameItem = async (id: number, name: string) =>
    await updateItem({ id, name });

export const moveItem = async (id: number, parent: number | null) =>
    await updateItem({ id, parent });

const updateItem = async ({
    id,
    name,
    parent,
}: {
    id: number;
    name?: string;
    parent?: number | null;
}): Promise<void> => {
    try {
        await fetch(`/api/items/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, parent }),
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// const sample_data: FlatNode[] = [
//     {
//         id: 1,
//         name: "Item 1",
//         parent: null,
//     },
//     {
//         id: 2,
//         name: "Item 2",
//         parent: null,
//     },
//     {
//         id: 3,
//         name: "Item 3",
//         parent: 1,
//     },
//     {
//         id: 4,
//         name: "Item 4",
//         parent: 1,
//     },
//     {
//         id: 5,
//         name: "Item 5",
//         parent: 3,
//     },
//     {
//         id: 6,
//         name: "Item 6",
//         parent: 3,
//     },
// ];

// class StubbedAPI {
//     data: FlatNode[];
//     subscriptions: ((data: FlatNode[]) => void) | null;

//     constructor() {
//         this.data = sample_data;
//         this.subscriptions = null;
//     }

//     async getData(): Promise<FlatNode[]> {
//         fetch("/api/data")
//             .then((response) => response.json())
//             .then(console.log)
//             .catch(console.error);
//         return this.data;
//     }

//     subscribe(onChange: (data: FlatNode[]) => void): void {
//         this.subscriptions = onChange;
//     }

//     unsubscribe(): void {
//         this.subscriptions = null;
//     }

//     private notifySubscribers(): void {
//         this.subscriptions?.(this.data);
//     }

//     async addNode(parent: number | null, name: string): Promise<void> {
//         const newNode: FlatNode = {
//             id: this.data.length + 1,
//             name,
//             parent,
//         };
//         this.data.push(newNode);
//         this.notifySubscribers();
//     }

//     async removeNode(id: number): Promise<void> {
//         const index = this.data.findIndex((node) => node.id === id);
//         if (index !== -1) {
//             this.data.splice(index, 1);
//             this.notifySubscribers();
//         }
//     }

//     async renameNode(id: number, newName: string): Promise<void> {
//         const node = this.data.find((node) => node.id === id);
//         if (node) {
//             node.name = newName;
//             this.notifySubscribers();
//         }
//     }

//     async moveNode(id: number, newParent: number | null): Promise<void> {
//         const node = this.data.find((node) => node.id === id);
//         if (node) {
//             node.parent = newParent;
//             this.notifySubscribers();
//         }
//     }
// }

// export const api = new StubbedAPI();
