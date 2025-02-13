import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { FlatNode, TreeNode } from "./types";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function buildTree(data: Array<FlatNode>): TreeNode[] {
    const map = new Map<number, TreeNode>();
    const roots: TreeNode[] = [];

    for (const item of data) {
        const node: TreeNode = {
            id: item.id,
            name: item.name,
            children: [],
        };
        map.set(item.id, node);
    }

    for (const item of data) {
        const node = map.get(item.id)!;
        if (typeof item.parent === "number") {
            const parent = map.get(item.parent);
            if (parent) parent.children.push(node);
            else roots.push(node);
        } else roots.push(node);
    }

    return roots;
}
