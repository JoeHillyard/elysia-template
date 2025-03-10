import {createEdenTreatyReactQuery} from "@ap0nia/eden-react-query";
import {treaty} from "@elysiajs/eden";
import type {App} from "@game-builder/api/src";

export const client = createEdenTreatyReactQuery<App>()
export const otherClient = treaty<App>('localhost:3000')
