import { startMock } from "../test/mock.js";
const m = await startMock(Number(process.env.PORT || 8799));
console.log("MOCK", m.url);
