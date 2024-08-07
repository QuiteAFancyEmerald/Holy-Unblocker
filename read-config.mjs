import { readFile } from 'node:fs/promises';

//  Parse the config file to grab a property value from it.
let property = JSON.parse(await readFile(new URL("./src/config.json", import.meta.url)));
//  Combine all descriptors (from command line arguments) to get the property value.
process.argv.slice(2).forEach(descriptor => {property = property[descriptor]});

//  Return a boolean if it's true or false.
if (typeof property === "boolean") process.exitCode = +!property;
//  Otherwise, return a stringified version to the stream.
else {
  console.log(property);
  process.exitCode = 0;
}
