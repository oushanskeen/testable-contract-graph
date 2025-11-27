// tcg-core.ts

const { spawn } = require("child_process");
const fs = require("fs/promises");
const path = require("path");

type FileName = string
type GraphContent = string
type RequirementString = string
type DependencyPair = [Requirement: string, Dependency: string]
type SpecFolder = string
type SpecData = {
    description: string,
    tests: { file: string }[]
};
type TestFileName = string
type VerificationResult = "pass" | "fail";
type VerificationData = { testFileName: TestFileName; result: VerificationResult | Error };

const memory: any = {}
const tcgcore = (mermaidGraphFileName: FileName, specFolder: SpecFolder) => {

    const getMermaidGraph = async (mermaidGraphFileName: FileName): Promise<GraphContent> => {
        const markdownContent = await fs.readFile(mermaidGraphFileName, "utf-8")
        // TODO: process this and other correspondent invariant asserts
        // console.assert(
        //     markdownContent.includes(
        //         '        classDef added fill:#f7d070,color:#000,stroke-width:1px \n' +
        //         '        classDef started fill:#87cefa,color:#000,stroke-width:1px \n' +
        //         '        classDef finished fill:#8fbc8f,color:#000,stroke-width:1px\n'
        //     ),
        //     "missing classDefs (expected to have 3): " +
        //      markdownContent
        // )
        return markdownContent
    }

    const getRequirements = (markdownContent: GraphContent): RequirementString[] => {
        return markdownContent
            .split("\n")
            .filter(s => s.includes("require"))
    }

    const getDependencies = (deps: RequirementString[]): DependencyPair[] => {
        // TODO: replace inline type setting
        return deps
            .map(e => e.split(":")[0])
            .map(e => e?.split("-->").map(e => e.trim()) as [string, string])
    }

    const getSpecData = async (specFolder: SpecFolder): Promise<SpecData[]> => {
        const specPath = path.join(specFolder + "/verifications.json");
        const specContent = await fs.readFile(specPath, "utf-8");
        const specData = JSON.parse(specContent);
        return specData
    }

    const getTests = (specData: SpecData[]): TestFileName[] => {
        return specData.flatMap(spec => spec.tests.map(t => t.file));
    }

    const getVerifications = async (
        testFileNames: TestFileName[],
        dependencies: DependencyPair[],
        specFolder: SpecFolder
    ): Promise<VerificationData[]> => {

        async function runScriptInteractive(scriptPath: TestFileName): Promise<VerificationResult> {
            return new Promise((resolve, reject) => {
                const safePath = scriptPath.replace(/(["\s'$`\\])/g, '\\$1');
                const child = spawn("bash", [safePath], {
                    stdio: "inherit",
                    shell: true
                });
                child.on("exit", (code: any) => {
                    const result = code === 0 ? "pass" : "fail";
                    resolve(result);
                });

                child.on("error", (err: Error) => reject(err));
            });
        }

        const results: any[] = [];

        // TODO: depsGraph
        // TODO: re-visit
        // Build dependency graph
        const depsGraph = (() => {
            const keys = [...new Set(dependencies.flatMap(e => e))];

            // initialize accumulator
            const acc: any = {};
            keys.forEach(k => acc[k] = []);

            // fill dependencies
            dependencies.forEach(([from, to]) => {
                acc[from].push(to);
            });

            return acc;
        })();
        // TODO: topoSortedFileNames
        // TODO: re-visit
        // Topological sort
        const topoSortedFileNames = (() => {
            const visited = new Set<string>();
            const result: string[] = [];

            const visit = (node: string) => {
                if (visited.has(node)) return;
                visited.add(node);

                const deps = depsGraph[node] || [];
                deps.forEach(visit);

                result.push(node);
            };

            Object.keys(depsGraph).forEach(visit);

            return result
        })();

        const topoSortedTestFileNames = topoSortedFileNames.map((dep: any) => dep + ".sh")
        for (const testFileName of topoSortedTestFileNames) {

            const scriptPath = path.join(specFolder, testFileName);
            try {
                const output = await runScriptInteractive(scriptPath);
                results.push({
                    testFileName: testFileName,
                    result: output
                });
            } catch (err) {
                results.push({
                    testFileName: testFileName,
                    result: err
                });
            }
        }


        return results;
    };
    const addVerificationResultToMermaid = async (
        { mermaidGraphFileName, verificationData }:
            {
                mermaidGraphFileName: FileName,
                verificationData: VerificationData[]
            }): Promise<GraphContent> => {
        let graphContent = await getMermaidGraph(mermaidGraphFileName)
        const data = verificationData
        data.forEach(({ testFileName, result }) => {
            const fileBase = testFileName.split("/").pop()!
            const requirementName = fileBase.split(".")[0]
            const verificationResultIcon = result == "pass" ? "✅" : result == "fail" ? "❌" : "❓"
            graphContent = graphContent.replace(
                new RegExp(`\\b${requirementName}\\b`, "g"),
                `${verificationResultIcon}${requirementName}`
            );
        })
        return graphContent
    }

    async function writeOutVerificationResult({ filePath, data }: { filePath: string, data: string }): Promise<string> {
        try {
            await fs.writeFile(filePath, data, "utf8");
            const content = await fs.readFile(filePath, "utf8");
            return content;
        } catch (err) {
            console.error("Error in writeReadFile:", err);
            throw err;
        }
    }

    const memo = (key: any, fn: any) => {
        if (memory[key]) {
            // console.log("[memo] CACHE HIT:", key)
            return memory[key]
        } else {
            // console.log("[memo] CACHE MISS:", key)
            // TODO: like it
            const resolvedValue = Promise.resolve().then(fn)
            memory[key] = resolvedValue
            return resolvedValue
        }
    }
    const $ = {
        getMermaidGraph: getMermaidGraph,
        getRequirements: getRequirements,
        getDependencies: getDependencies,
        getSpecData: getSpecData,
        getTests: getTests,
        getVerifications: getVerifications,
        addVerificationResultToMermaid: addVerificationResultToMermaid,
        writeOutVerificationResult: writeOutVerificationResult,

        mermaidGraph_v: () =>
            memo("mermaidGraph", () => {
                return $.getMermaidGraph(mermaidGraphFileName)
            }),
        requirements_v: () =>
            memo("requirements", async () => {
                const graph = await $.mermaidGraph_v()
                return $.getRequirements(graph)
            }),
        dependencies_v: () =>
            memo("dependencies", async () => {
                const req = await $.requirements_v()
                return $.getDependencies(req)
            }),
        specs_v: () =>
            memo("specs", () => {
                return $.getSpecData(specFolder)
            }),
        tests_v: () => memo("tests", async () => {
            const specs = await $.specs_v()
            return $.getTests(specs)
        }),
        verifications_v: () =>
            memo("verifications", async () => {
                const tests = await $.tests_v()
                const deps = await $.dependencies_v()
                return $.getVerifications(tests, deps, specFolder)
            }),
        verifiedMemaidRequirements_v: () =>
            memo("verifiedMermaid", async () => {
                const ver = await $.verifications_v()
                return $.addVerificationResultToMermaid({
                    mermaidGraphFileName,
                    verificationData: ver
                })
            }),
        verifiedMemaidRequirementsFromFile_v: () =>
            memo("writeVerified", async () => {
                const verified = await $.verifiedMemaidRequirements_v()
                return $.writeOutVerificationResult({
                    filePath: mermaidGraphFileName.split(".")[0] + "-verified.md",
                    data: verified
                })
            })
    }
    return $
}

module.exports = { tcgcore }