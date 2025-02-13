export interface TreeNode {
    id: number;
    name: string;
    children: TreeNode[];
}

export interface FlatNode {
    id: number;
    name: string;
    parent: number | null;
}
