/**
 * Template function
 * Takes strings like 'Your site is now available on {url}' and interpolates them with passed in data
 * Will ignore double or triple braces like {{get}} or {{{helpername}}}
 * Can handle escaped braces e.g. \\{\\{{helpername}\\}\\}
 * But there's a simple bare minimum escaping needed to make {{{helpername}}} work e.g. {\\{{helpername}}}
 */
declare function tpl(string: string, data?: object | null): string;
export = tpl;
