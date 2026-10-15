import { catalogueFacts } from "engine/spec";
import { bench, featureFacts, run } from "engine/tooling";
import { endpoints } from "../src/api/features/index.ts";
import { validateSpec } from "../src/lib/spec/surface.ts";
import { composeMessages, installedSpecs, root } from "../tools/core/index.ts";

const facts = await featureFacts(`${root}/src/features`);
const catalogue = catalogueFacts(endpoints);

for ( const identity of installedSpecs() ) {

    const folder = `${root}/specs/${identity}`;
    const [config, schema] = (await Promise.all([import(`${folder}/config/index.ts`), import(`${folder}/schema/index.ts`)])) as [{ default: unknown }, { default: unknown }];
    const messages = composeMessages(`${folder}/brand/messages`);

    bench(`compile the ${identity} spec`, () => validateSpec(identity, config.default, schema.default, messages, facts, catalogue));
    bench(`compose the ${identity} messages`, () => composeMessages(`${folder}/brand/messages`));

}

await run();
