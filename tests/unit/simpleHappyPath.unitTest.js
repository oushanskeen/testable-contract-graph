const { diyTest } = require("../../dist/modules/diyTest")
const { tcgcore } = require("../../dist/tcgcore.js")

const mermaidGraphFileName = "src/testable-contract-graph/contractGraph.md"
const specFolder = "src/testable-contract-graph/verifications"
const testGraphFilePath = __dirname + "/../testGraph1.md"

async function run() {


    const getMermaidGraphTable = [
        {
            x: testGraphFilePath,
            y: '```mermaid\n' +
                '    stateDiagram-v2\n' +
                '        isCredentialsKnown --> isGitlabContainerAvailable: ⬇️require\n' +
                '```'
        }
    ];
    await diyTest({
        name: "[simpleHappyPath.unitTest.js]: getMermaidGraph f: ",
        fn: tcgcore().getMermaidGraph,
        xToY: getMermaidGraphTable,
        type: "unit"
    })

    const getRequirementsTable = [
        {
            x: getMermaidGraphTable[0]["y"],
            y: ["        isCredentialsKnown --> isGitlabContainerAvailable: ⬇️require"]
        },
    ];
    await diyTest({
        name: "[simpleHappyPath.unitTest.js]: getRequirements f: ",
        fn: tcgcore().getRequirements,
        xToY: getRequirementsTable,
        type: "unit"
    })

    const getDependenciesTable = [
        {
            x: getRequirementsTable[0]["y"],
            y: [["isCredentialsKnown", "isGitlabContainerAvailable"]]
        },
    ];
    await diyTest({
        name: "[simpleHappyPath.unitTest.js]: getDependencies f: ",
        fn: tcgcore().getDependencies,
        xToY: getDependenciesTable,
        type: "unit"
    })


    const getSpecDataTable = [
        {
            x: __dirname + "/../../src/testable-contract-graph/verifications",
            y: [
                {
                    "name": "isGitlabContainerAvailable",
                    "description": "tba",
                    "tests": [
                        {
                            "file": "isGitlabContainerAvailable.sh"
                        }
                    ]
                },
                {
                    "name": "isLocalRepoGitlabUIAvailable",
                    "description": "tba",
                    "tests": [
                        {
                            "file": "isLocalRepoGitlabUIAvailable.sh"
                        }
                    ]
                },
                {
                    "name": "isCredentialsKnown",
                    "description": "tba",
                    "tests": [
                        {
                            "file": "isCredentialsKnown.sh"
                        }
                    ]
                }
            ]
        },
    ];
    await diyTest({
        name: "[simpleHappyPath.unitTest.js]: getSpecData f: ",
        fn: tcgcore().getSpecData,
        xToY: getSpecDataTable,
        type: "unit"
    })

    const getTestsDataTable = [
        {
            x: getSpecDataTable[0]["y"],
            y: [
                'isGitlabContainerAvailable.sh',
                'isLocalRepoGitlabUIAvailable.sh',
                'isCredentialsKnown.sh'
            ]
        }
    ]
    await diyTest({
        name: "[simpleHappyPath.unitTest.js]: getTests f: ",
        fn: tcgcore().getTests,
        xToY: getTestsDataTable,
        type: "unit"
    })

    const getVerificationsTable = [
        {
            // x: getTestsDataTable[0]["y"],
            x: {
                dependencies: [...getDependenciesTable[0]["y"]],
                specFolder: __dirname + "/../../src/testable-contract-graph/verifications"
            }
            ,
            y: [
                {
                    result: 'pass',
                    testFileName: 'isGitlabContainerAvailable.sh'
                },
                {
                    result: 'pass',
                    testFileName: 'isCredentialsKnown.sh'
                }
            ]
        }
    ]
    await diyTest({
        name: "[simpleHappyPath.unitTest.js]: getVerifications f: ",
        fn: tcgcore().getVerifications,
        xToY: getVerificationsTable,
        type: "unit"
    })

    const addVerificationResultToMermaidTable = [
        {
            x: {
                mermaidGraphFileName: testGraphFilePath,
                verificationData: getVerificationsTable[0]["y"]
            },
            y: '```mermaid\n' +
                '    stateDiagram-v2\n' +
                '        ✅isCredentialsKnown --> ✅isGitlabContainerAvailable: ⬇️require\n' +
                '```'
        }
    ]
    await diyTest({
        name: "[simpleHappyPath.unitTest.js]: addVerificationResultToMermaid f: ",
        fn: tcgcore().addVerificationResultToMermaid,
        xToY: addVerificationResultToMermaidTable,
        type: "unit"
    })

    const writeOutVerificationResultTable = [
        {
            x: {
                filePath: __dirname + "/../testGraph1-verified.md",
                data: addVerificationResultToMermaidTable[0]["y"]
            },
            y: '```mermaid\n' +
               '    stateDiagram-v2\n' +
               '        ✅isCredentialsKnown --> ✅isGitlabContainerAvailable: ⬇️require\n' +
               '```'
        }
    ]
    diyTest({
        name: "[simpleHappyPath.unitTest.js]: writeOutVerificationResult f: ",
        fn: tcgcore().writeOutVerificationResult,
        xToY: writeOutVerificationResultTable,
        type: "unit"
    })

}
run()