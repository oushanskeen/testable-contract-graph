const assert = require("assert");

type xToY = { x: any, y: any }
type TestInput = {
    name: string,
    fn: (input?: any) => any,
    xToY: xToY[],
    type: "unit" | "integration"

}
type TestResult = (true | Error) | Promise<(true | Error)>

async function diyTest(testInput: TestInput): Promise<TestResult[]> {
    const { name, fn, xToY, type } = testInput;

    const results: TestResult[] = [];

    for (let i = 0; i < xToY.length; i++) {
        const { x, y } = xToY[i]!;

        try {

            // console.log("[diyTest] started test: ", name)
            const raw = type === "unit" ? fn(x) : fn();
            const actualResult = raw ? await raw : raw;
            // console.log("[diyTest] continue test: ", name)

            assert.deepStrictEqual(actualResult, y);

            console.log(`✅ ${name} [${i}]`);
            results.push(true);

        } catch (err: unknown) {

            if (err instanceof Error) {
                console.error(`❌ ${name} [${i}]`);
                console.error("   " + err.message);
                results.push(err);               // <-- do NOT return early
            } else {
                console.error(`❌ ${name} [${i}] Unknown error`, err);
                results.push(new Error("Unknown error: " + err));
            }
        }
    }

    return results;
}


module.exports = { diyTest }