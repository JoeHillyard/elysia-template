import {useMemo} from "react";
import {Box, Group, Tabs} from "@mantine/core";
import {useListState} from '@mantine/hooks';
import {Type} from '@sinclair/typebox';
import Form from "@rjsf/core";
import validator from '@rjsf/validator-ajv8';
import * as widgets from 'widgets'


export const FormBuilderPage = () => {

	const [enabledWidgets, widgetHandlers] = useListState([]);

	const generateSchema = useMemo(() => {

		const properties = {};

		enabledWidgets.forEach(widget => {
			Object.assign(properties, {[widget.id]: widget.schema});
		});

		const schema = Type.Object(properties, {
			title: '',
			description: ''
		});

		return JSON.stringify(schema, null, 2);
	}, [enabledWidgets]);

	return (
		<div>

			<Group>
				{Object.values(widgets)?.map((w, key) => {

					const enabled =  !!enabledWidgets?.find(ew => ew.id === w.id) as boolean

					 return (
						 <Box p={'xs'} key={key} style={{cursor: 'pointer'}} bd={enabled ? '2px solid green' : '2px solid #000'} onClick={() => {
							 if(enabled) {
								 widgetHandlers.filter((wh) => wh.id !== w.id)
							 } else {
								 widgetHandlers.append(w)
							 }
						 }}>
							 {w.label}
						 </Box>
					 )
				})}
			</Group>

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
					<Form schema={JSON.parse(generateSchema)} validator={validator}/>
				</Tabs.Panel>

				<Tabs.Panel value="schema">
					<pre>
						{generateSchema}
					</pre>
				</Tabs.Panel>
			</Tabs>
		</div>
	);
};