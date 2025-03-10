import {integer, jsonb, pgTable, varchar} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";
import {baseColumns} from "./shared";


export const organisationTable = pgTable('organisations', {
	...baseColumns,
	name: varchar()
})


export const organisationRelations = relations(organisationTable, ({one, many}) => ({
	projects: many(projectTable)
}))


/*------------------------------------------------------------------*/


export const projectTable = pgTable('projects', {
	...baseColumns,
	name: varchar(),

	organisationId: integer().references(() => organisationTable.id)
})

export const projectRelations = relations(projectTable, ({one}) => ({
	organisation: one(organisationTable, {
		fields: [projectTable.organisationId],
		references: [organisationTable.id]
	})
}))


/*------------------------------------------------------------------*/


export  const surveyorTable = pgTable('surveyors', {
	firstName: varchar(),
	lastName: varchar(),
	email: varchar(),
	password: varchar(),
})


/*------------------------------------------------------------------*/


export const formTable = pgTable('forms', {
	...baseColumns,
	name: varchar(),
	schema: jsonb()
})

export const formRelations = relations(formTable, ({many}) => ({
	widgets: many(formWidgetTable)
}))


/*------------------------------------------------------------------*/

const formWidgetTable = pgTable('formWidget', {
	...baseColumns,
	formId: integer().references(() => formTable.id),
	widgetId: integer().references(() => widgetTable.id),
})

export const formWidgetRelations = relations(formWidgetTable, ({one}) => ({
	widget: one(widgetTable, {
		fields: [formWidgetTable.widgetId],
		references: [widgetTable.id]
	}),
	form: one(formTable, {
		fields: [formWidgetTable.formId],
		references: [formTable.id]
	})
}))


/*------------------------------------------------------------------*/


export const widgetTable = pgTable('widgets', {
	...baseColumns,
	name: varchar(),
	schema: jsonb()
})


/*------------------------------------------------------------------*/
