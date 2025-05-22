import {treaty} from "@elysiajs/eden";
import type {App} from "@template/api/src";

export const otherClient = treaty<App>('localhost:3000')
