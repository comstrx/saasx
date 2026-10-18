import { catalogueFacts } from "engine/spec";
import { bench, featureFacts, run } from "engine/tooling";
import { endpoints } from "../src/api/features/index.ts";
import { validateSpec } from "../src/lib/spec/surface.ts";
import { composeMessages, installedSpecs, loadSpec, root } from "../tools/core/index.ts";

const facts = await featureFacts(`${root}/src/features`);
const catalogue = catalogueFacts(endpoints);

for ( const identity of installedSpecs() ) {

    const { folder } = await loadSpec(identity);
    const config = (await import(`${folder}/config/index.ts`)).default as unknown;
    const schema = (await import(`${folder}/schema/index.ts`)).default as unknown;
    const messages = composeMessages(`${folder}/brand/messages`);

    bench(`compile the ${identity} spec`, () => validateSpec(identity, config, schema, messages, facts, catalogue));
    bench(`compose the ${identity} messages`, () => composeMessages(`${folder}/brand/messages`));

}

await run();
