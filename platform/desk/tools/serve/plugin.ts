import { aliasPlugin, compiled } from "../bundle/alias.ts";

export default aliasPlugin(compiled("development").aliases);
