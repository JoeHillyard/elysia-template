import {create} from "zustand/index";
import { type TSchema } from '@sinclair/typebox';

export type FormField = {
	id: string;
	name: string;
	type: 'string'
	required: boolean;
	schema: TSchema
}

type SchemaStore = {
	formFields: FormField[]
	addFormField: (field: FormField) => void
	removeFormField: (id: string) => void
}

export const useSchemaStore = create<SchemaStore>()((set) => ({
	formFields: [],
	addFormField: (newField) => set((state) => ({
		formFields: [...state.formFields, newField]
	})),
	removeFormField: (id) => set((state) => ({
		formFields: state.formFields.filter((f) => f.id !== id)
	}))
}))
