import React, {FunctionComponent, ReactElement} from "react";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import {RootState} from "../../store/store";
import {Collection} from "../../models/collection";
import {setEditableComponent} from "../../store/slices/collectionsSlice";
import createComponentAction from "../../store/actions/collections/createComponentAction";
import updateComponentAction from "../../store/actions/collections/updateComponentAction";
import {Box, FormControl, FormLabel, Select, Textarea} from "components/ui";

const ComponentForm: FunctionComponent<{}> = (props: {}): ReactElement | null => {
    const editableComponent = useAppSelector((state: RootState) => state.collections.editableComponent);
    const collections = useAppSelector((state: RootState) => state.collections.collections);

    const dispatch = useAppDispatch();

    const onSubmit = (e) => {
        e.preventDefault();

        dispatch(editableComponent.id ? updateComponentAction() : createComponentAction());

        dispatch(setEditableComponent(null));
    }

    return (
        <form
            onSubmit={onSubmit}
        >
            <Box>
                <FormControl>
                    <FormLabel>
                        Collection
                    </FormLabel>

                    <Select
                        value={{
                            label: collections[editableComponent.collectionId].title,
                            value: editableComponent.collectionId
                        }}
                        onChange={(value) => dispatch(setEditableComponent({
                            ...editableComponent,
                            collectionId: value.value
                        }))}
                        options={[
                            ...Object.values(collections).map((item: Collection) => ({
                                label: item.title,
                                value: item.id
                            }))
                        ]}
                    />
                </FormControl>
            </Box>

            <Box
                mt="5"
            >
                <FormControl>
                    <FormLabel>
                        Title
                    </FormLabel>

                    <Textarea
                        placeholder="Choose unique name"
                        value={editableComponent.name}
                        onChange={e => dispatch(setEditableComponent({...editableComponent, name: e.target.value}))}
                    />
                </FormControl>
            </Box>

            <Box
                mt="5"
            >
                <FormControl>
                    <FormLabel>
                        Description (max 140 characters)
                    </FormLabel>

                    <Textarea
                        placeholder="Component Best Practice"
                        value={editableComponent.description}
                        onChange={e => dispatch(setEditableComponent({
                            ...editableComponent,
                            description: e.target.value
                        }))}
                    />
                </FormControl>
            </Box>
        </form>
    )
}
export default ComponentForm;