import {Type} from '@sinclair/typebox';
import {Button, Checkbox, Group, Select, Tabs, TextInput} from "@mantine/core";
import Form from "@rjsf/core";
import validator from '@rjsf/validator-ajv8';
import {HeatingWidget} from "../widgets/heating.ts";
import {type FormField, useSchemaStore} from "@stores/schema.store.ts";
import {useForm} from '@mantine/form';

const fieldTypes = [
	{
		id: 'string',
		schema: Type.String(),
		label: 'Text Input'
	},
	{
		id: 'number',
		schema: Type.Number(),
		label: 'Number Input'
	},
	{
		id: 'boolean',
		schema: Type.Boolean(),
		label: 'Checkbox'
	},
	{
		id: 'array',
		schema: Type.Array(Type.String()),
		label: 'Array Input'
	}
];

const fieldTypeSelect = fieldTypes.map(type => ({
	label: type.label,
	value: type.id
}))

export const WidgetBuilderPage = () => {

	const {formFields, addFormField, removeFormField} = useSchemaStore()

	const form = useForm<FormField>({
		mode: 'controlled',
		initialValues: {
			name: '',
			type: 'string',
			required: false
		}
	});

	const addField = (values: typeof form.values) => {

		console.log(values)

		const selectedType = fieldTypes.find(ft => ft.id === values.type);

		const newField = {
			schema: selectedType ? selectedType.schema : Type.String(),
			...values,
			id: `field-${Date.now()}`
		};

		addFormField(newField);
		form.reset()
	};

	const generateSchema = () => {
		const properties = formFields.reduce((acc, field) => {
			acc[field.name] = field.schema;
			return acc;
		}, {});

		const requiredFields = formFields
			.filter(field => field.required)
			.map(field => field.name);

		const schema = Type.Object(properties, {
			title: '',
			description: '',
			required: requiredFields
		});

		return JSON.stringify(schema, null, 2);
	};


	return (
		<div>

			<form onSubmit={form.onSubmit(addField)}>

				<Group>
					<TextInput label="Field Name" {...form.getInputProps('name')} />

					<Select label="Type" data={fieldTypeSelect}
							{...form.getInputProps('type')}
					/>

					<Checkbox label="Required"{...form.getInputProps('required', {type: 'checkbox'})} />

					<Button type={'submit'}>
						Add Field
					</Button>
				</Group>
			</form>


			<div>
				{formFields.map((field, index) => (
					<Group>
						<span>{field.name}</span>
						-
						<span> {field.type} {field.required ? ' (Required)' : ''} </span>
						<Button size={'xs'} variant={'outline'} onClick={() => removeFormField(field.id)}>
							Delete
						</Button>
					</Group>
				))}
			</div>

			<Tabs defaultValue="form">
				<Tabs.List>
					<Tabs.Tab value="form">
						Form
					</Tabs.Tab>
					<Tabs.Tab value="schema">
						Schema
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value="form">
					<Form schema={formFields.length > 0 ? JSON.parse(generateSchema()) : {}} validator={validator}/>
				</Tabs.Panel>

				<Tabs.Panel value="schema">
					<pre>
						{generateSchema()}
					</pre>
				</Tabs.Panel>
			</Tabs>
		</div>
	);
};