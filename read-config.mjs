import { readFile } from 'node:fs/promises';
let property = JSON.parse(await readFile(new URL("./src/config.json", import.meta.url)));
process.argv.slice(2).forEach(descriptor => {property = property[descriptor]});
if (typeof property === "boolean") process.exitCode = +!property;
else {
  console.log(property);
  process.exitCode = 0;
}
