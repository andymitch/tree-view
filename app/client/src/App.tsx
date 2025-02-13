import { ThemeToggle } from "./components/theme-toggle";
import { DataProvider } from "./lib/context";
import { DraggableWrapper } from "./components/draggable";
import {
    CollapseAllButton,
    ExpandAllButton,
    TreeContextProvider,
    TreeView,
} from "./components/tree";
import { AddRootItem } from "./components/add-root-item";

function App() {
    return (
        <DataProvider>
            <TreeContextProvider>
                <DraggableWrapper>
                    <div className="m-2 gap-2 flex flex-col">
                        <div className="flex gap-2 mb-2 items-center">
                            <ThemeToggle />
                            <ExpandAllButton />
                            <CollapseAllButton />
                            <AddRootItem />
                        </div>
                        <TreeView />
                    </div>
                </DraggableWrapper>
            </TreeContextProvider>
        </DataProvider>
    );
}

export default App;
