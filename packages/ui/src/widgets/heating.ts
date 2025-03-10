import {Type} from "@sinclair/typebox";

export const HeatingWidget = {
	id: 'choice',
	label: 'Heating',
	schema: Type.Union([
		Type.Object(
			{
				['q-1']: Type.String()
			},
			{title: 'Yes', description: 'Heating yes description'}
		),
		Type.Object(
			{
				['q-2']: Type.String(),
				['q-3']: Type.Number({minimum: 1})
			},
			{title: 'No', description: 'Heating no description'}
		)
	], {title: 'Heater?', 'description': 'Heater desc..'}),
}


export const HeatingBoilerType = {
	id: 'heatingBoilerType',
	label: 'Boiler Type',
	schema: Type.String({
		title: 'Boiler Type',
		description: 'Select the type of boiler present in building',
		enum: ['gas', 'electric'],
	})
}