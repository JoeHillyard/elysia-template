import {describe, expect, it} from 'bun:test'
import {Elysia} from 'elysia'
import {app} from "../src";
import {treaty} from "@elysiajs/eden";

const server = app
const api = treaty(app)

describe('Elysia', () => {
	it('return a response', async () => {


		const response = await server
			.handle(new Request('http://localhost/hi'))
			.then((res) => res.text())

		expect(response).toBe('Hi Elysia')
	})

	it('eden test', async () => {
		const { data, error } = await api.hi.get()

		expect(data).toBe('Hi Elysia')
	})
})