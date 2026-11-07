import React, {ChangeEvent, FormEvent} from "react";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import {RootState} from "../../store/store";
import {setEditableCollection} from "../../store/slices/collectionsSlice";
import updateCollectionAction from "../../store/actions/collections/updateCollectionAction";
import createCollectionAction from "../../store/actions/collections/createCollectionAction";
import {Box, FormControl, FormLabel, Input} from "components/ui";

const CollectionForm = () => {
    const editableCollection = useAppSelector((state: RootState) => state.collections.editableCollection);

    const dispatch = useAppDispatch();

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        dispatch(editableCollection.id ? updateCollectionAction() : createCollectionAction());

        dispatch(setEditableCollection(null));
    }

    return (
        <form
            onSubmit={onSubmit}
        >
            <Box>
                <FormControl>
                    <FormLabel>
                        Title
                    </FormLabel>

                    <Input
                        placeholder="Choose unique name"
                        value={editableCollection.title}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => dispatch(setEditableCollection({
                            title: e.target.value,
                            id: editableCollection.id
                        }))}
                    />
                </FormControl>
            </Box>
        </form>
    )
}

export default CollectionForm;
