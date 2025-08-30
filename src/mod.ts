export * from './index.ts';





// @ts-ignore not in Node.js yet
if (import.meta.main) {

    await import('./cli/bin.ts');

}

