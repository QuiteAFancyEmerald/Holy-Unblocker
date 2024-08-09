module.exports = {
  printWidth: 80, // Wrap lines at 80 characters
  tabWidth: 2, // Use 2 spaces per indentation level
  useTabs: false, // Use spaces instead of tabs
  semi: true, // Add a semicolon at the end of every statement
  singleQuote: true, // Use single quotes instead of double quotes
  quoteProps: 'as-needed', // Only add quotes around object properties where required
  jsxSingleQuote: false, // Use double quotes in JSX
  trailingComma: 'es5', // Add trailing commas where valid in ES5 (objects, arrays, etc.)
  bracketSpacing: true, // Print spaces between brackets in object literals
  jsxBracketSameLine: false, // Put the `>` of a multi-line JSX element at the end of the last line
  arrowParens: 'always', // Always include parentheses around arrow function arguments
  htmlWhitespaceSensitivity: 'css', // Respect the default value of CSS display property
  endOfLine: 'lf', // Use line feed only (\n) for newlines
  embeddedLanguageFormatting: 'auto', // Format embedded code if Prettier can automatically identify it
  proseWrap: 'preserve', // Do not wrap prose (including comments)
};
