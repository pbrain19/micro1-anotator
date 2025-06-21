export const promptTemplate = (tasker_opinion: string, context: string) => `
I need you to help me evaluate the response of an tecnical expert. 
Do you agree with the following preference opinion: ${tasker_opinion}?

Context: ${context}


Try to focus on functionality, correctness, and technical correctness.

If there is a minor improvement just rewrite the preference opinion.

You may need to doublecheck online resources for certain documentation references for specific technoligies.

`;
