import {ChangeEvent, useCallback, useMemo, useReducer, useState} from "react";
import ColumnContainer from "../column/ColumnContainer";
import {Button, Grid} from "@mui/material";
import {DragDropContext, DraggableLocation, Droppable, DropResult} from "react-beautiful-dnd";
import TagGroup from "../Task/entity/TagGroup";
import Task from "../Task/entity/Task";
import {filterTasksByTag, columnReducer, ColumnActionType} from "./ColumnStateManager";
import {sampleTagGroup, taskSample} from "./SampleBuilder";
import ColumnHeaderContainer from "../column/ColumnHeaderContainer";
import AddIcon from "@mui/icons-material/Add";
type Props = {
    projectId: string;
}

const BoardBodyContainer = (props: Props) => {

    const sampleGroups =() => {
        return [sampleTagGroup("Todo"), sampleTagGroup("in discussion"), sampleTagGroup("in progress"), sampleTagGroup("finished")]
    }

    const [tagGroups, setTagGroups] = useState<TagGroup[]>(sampleGroups);

    const sampleTasks = useMemo(() => [
        taskSample("11111", tagGroups[0]),
        taskSample("22222", tagGroups[1]),
        taskSample("33333", tagGroups[2]),
        taskSample("44444", tagGroups[3])
    ], []);

    const initialColumns = useMemo(() => filterTasksByTag(sampleTasks, tagGroups), [sampleTasks, tagGroups]);

    // need to rebuild state management.
    // only tagGroups should be held here and columns should be managed in ColumnContainer.
    // FIXME
    const [columns, setColumns] = useReducer(columnReducer, initialColumns);

    const onChangeTitle = useCallback((event: ChangeEvent<HTMLInputElement>, id: string, index: number) => {
        setColumns({type: ColumnActionType.changeTitle, payload: event.target.value, id: id, index: index});
    }, []);

    const onChangeDescription = useCallback((event: ChangeEvent<HTMLInputElement>, id: string, index: number) => {
        setColumns({type: ColumnActionType.changeDescription, payload: event.target.value, id: id, index: index});
    }, []);

    const onClickAdd = useCallback((index: number, tagGroup?: TagGroup ) => {
        const task = new Task(crypto.randomUUID(), "title", "desc");
        task.tagGroup = tagGroup;
        setColumns({type: ColumnActionType.addTask, payload: task, index: index});
    }, []);

    const reorder = useCallback((list: Task[], startIndex: number, endIndex: number) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
    }, []);

    const moveBetweenColumns = useCallback((
        originArr: Task[],
        destinationArr: Task[],
        origin: DraggableLocation,
        destination: DraggableLocation
    ) => {
        const originClone = Array.from(originArr);
        const destClone = Array.from(destinationArr);
        const [removed] = originClone.splice(origin.index, 1);
        removed.tagGroup = tagGroups[+destination.droppableId];
        console.log(removed.tagGroup);
        destClone.splice(destination.index, 0, removed);
        return {origin: originClone, goal: destClone};
    }, [tagGroups]);

    const onClickRemove = useCallback((taskId: string, columnNum: number) => {
        setColumns({type: ColumnActionType.remove, payload: taskId, index: columnNum})
    }, []);

    const onDragEnd = useCallback((result: DropResult) => {
        const { source, destination } = result;

        if (!destination) return;

        const from = +source.droppableId;
        const to = +destination.droppableId;
        // const { column, rowIndex } = findRowByTagGroupId(columns, from || to);
        // console.log(column);
        // if (!column) return;
        if (from === to) {
            const newColumnOrder = reorder(columns[from], source.index, destination.index);
            const newColumns = [...columns];
            newColumns[from] = newColumnOrder;
            setColumns({payload: newColumns, type: ColumnActionType.replace});
        } else {
            const result = moveBetweenColumns(columns[from], columns[to], source, destination);
            const newColumns = [...columns];
            newColumns[from] = result.origin;
            newColumns[to] = result.goal;
            setColumns({type: ColumnActionType.replace, payload: newColumns});
        }
    }, [columns, moveBetweenColumns, reorder]);

// FIXME: droppableId should be tagGroupId
    return (
        <Grid container direction={'row'}>
            <DragDropContext onDragEnd={onDragEnd}>
                {columns.length ? (columns.map((column, index) => {

                    //const tagGroup = column[0].tagGroup;
                    return (
                        <Droppable droppableId={`${index}`} key={index}>
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    style={{marginRight: 10}}
                                >
                                    <Grid
                                        item
                                        xs={'auto'}
                                        sx={{ borderRadius: 2}}
                                        //key={tagGroup?.groupId || 'no tag'}
                                        style={{
                                            marginLeft: 10,
                                            marginTop: 10,
                                            marginBottom: 4,
                                            backgroundColor: "lightgray",
                                            paddingTop: 4,
                                        }}
                                    >
                                        <ColumnHeaderContainer name={tagGroups[index].groupName}/>
                                        <ColumnContainer
                                            tagGroup={tagGroups[index]}
                                            columnIndex={index}
                                            onChangeDescription={onChangeDescription}
                                            onChangeTitle={onChangeTitle}
                                            onClickAdd={onClickAdd}
                                            tasks={column}
                                            onClickRemove={onClickRemove}
                                        />
                                    </Grid>
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    );
                })) : null}
            </DragDropContext>
            <Grid
                item
                xs={'auto'}
                //key={tagGroup?.groupId || 'no tag'}
                style={{
                    margin: "auto",
                    padding: 'auto',
                    width: 400,
                }}
                // alignItems={'center'}
                // alignContent={'center'}
                // alignSelf={"center"}
                // onMouseOver={}
            >
                <div
                    style={{
                        margin: 'auto',
                        padding: 'auto',
                    }}
                >
                <Button
                    variant={'outlined'}
                    color={"info"}
                    style={{
                        width: 300,
                        height: 150,
                    }}
                ><AddIcon />  Add Column</Button>
                </div>
            </Grid>

        </Grid>
    );
}

export default BoardBodyContainer;
