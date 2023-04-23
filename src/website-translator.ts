import {
  existsSync,
  mkdir,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
import { fromFile } from 'php-array-reader';
import { resolve } from 'path';
import { Languages, TranslateItem, WebsiteTranslationType } from './types';
import { BaseTranslator } from './base-translator';

type StringOrNumber = String | Number;

export class WebsiteTranslator extends BaseTranslator {
  constructor(
    protected readonly cache: Partial<
      Record<Languages, Partial<Record<Languages, Record<string, string>>>>
    >,
    protected readonly type: WebsiteTranslationType,
  ) {
    super(cache);

    this.outPutName = 'website';
  }

  async translate(from: Languages, to: Languages): Promise<void> {
    const files = readdirSync(this.getLangFolder(from));

    for (const originalFile of files) {
      console.log(`Will translate ${originalFile} file`);

      const isPhpFile = this.isPhpFile(
        resolve(this.getLangFolder(from), originalFile),
      );

      console.log(`PHP?: ${isPhpFile}`);

      const toTranslate = isPhpFile
        ? this.readPhpFile(from, originalFile)
        : this.readJSFile(from, originalFile);

      console.log(
        `Read file to translate with ${
          Object.keys(toTranslate).length
        } records`,
      );

      const preparedItems = this.prepareItemsToTranslate(toTranslate);

      console.log(`Prepared items to translate`);

      const translated = await this.translateItems(preparedItems, from, to);

      console.log(`Translated items`);

      this.saveTranslatedItems(translated, from, to, originalFile);

      console.log(`Saved Translated items`);
    }
  }

  private saveTranslatedItems(
    items: TranslateItem[],
    from: Languages,
    to: Languages,
    fileName: string,
  ) {
    const isPhp = this.isPhpFile(resolve(this.getLangFolder(from), fileName));
    const isJs = this.isJsFile(resolve(this.getLangFolder(from), fileName));
    const fileString: string[] = [];

    isJs && fileString.push(`LANG = {`);
    isPhp && fileString.push('<?php', 'return [');

    items.forEach((item) => {
      const fixed = item.translated.replace(`""`, `"`);
      const isParsed = this.isJSONFormatted(fixed);
      const key = item.rest;
      const value: string | StringOrNumber[] = isParsed
        ? this.parseJsonFormatted(fixed)
        : fixed;

      if (!this.isCached(item.sanitized, from, to))
        this.addToCache(item.sanitized, fixed, from, to);

      const toPush = this.getStringToPush(key, value, isPhp);
      // if (key === 'account_registration_success_activation_needed')
      //   console.dir({ item, value, toPush, isParsed });

      fileString.push(toPush);
    });

    isPhp && fileString.push('];');
    isJs && fileString.push(`}`);

    const outputFileName = isJs
      ? `${to}.js`
      : fileName.replace(`.${from}`, `.${to}`);

    const outputLangFolder = this.getLangFolder(to);
    if (!existsSync(outputLangFolder)) mkdirSync(outputLangFolder);

    const outputFileLocation = resolve(outputLangFolder, outputFileName);

    const replacer = `'`;
    const finalString = fileString
      .join('\n')
      .replace(`„`, replacer)
      .replace(`”`, replacer)
      .replace(`'[`, `[`)
      .replace(`]'`, `]`)
      .replace(`"`, replacer);

    writeFileSync(outputFileLocation, finalString);
  }

  private getStringToPush(
    key: string,
    value: string | StringOrNumber[],
    isPhp: boolean,
  ): string {
    const mappedValue = Array.isArray(value)
      ? `[${value.map((v) =>
          isNaN(+v) ? `'${(v as string).replace(`\'`, `\\'`)}'` : v,
        )}]`
      : `'${value.replace(`\'`, `\\'`)}'`;

    return isPhp
      ? `\t'${key}' => ${mappedValue},`
      : `\t${key}: ${mappedValue},`;
  }

  private parseJsonFormatted(line: string): StringOrNumber[] {
    const parsed: Array<unknown> = JSON.parse(line);
    return parsed.map((value) => {
      if (!isNaN(+value)) return +value as number;
      return value as string;
    });
  }

  private isJSONFormatted(line: string): boolean {
    try {
      JSON.parse(line);
      return true;
    } catch (er) {
      return false;
    }
  }

  private prepareItemsToTranslate(
    items: Record<string, unknown>,
  ): Array<TranslateItem> {
    return Object.keys(items).map((key) => {
      const original: string = Array.isArray(items[key])
        ? (JSON.stringify(items[key] as unknown[]) as string)
        : (items[key] as string);

      const sanitized = this.shouldReplaceShortcuts(original)
        ? this.replaceShortcuts(original)
        : original;

      const item: TranslateItem = { original, sanitized, rest: key };

      return item;
    });
  }

  private readPhpFile(from: Languages, name: string): Record<string, unknown> {
    const location = resolve(this.getLangFolder(from), name);
    if (!this.isPhpFile(location))
      throw new Error(`Not a php file ${location}`);

    return fromFile(location);
  }

  private readJSFile(from: Languages, name: string): Record<string, unknown> {
    const location = resolve(this.getLangFolder(from), name);
    if (!this.isJsFile(location)) throw new Error(`Not a js file ${location}`);

    const prefix = 'LANG = ';
    const readBuffer = readFileSync(location, { encoding: 'utf-8' });

    const sanitizedFileBuffer = readBuffer.replace(prefix, 'module.exports = ');
    const tempLocation = location.replace('.js', '_temp.js');
    writeFileSync(tempLocation, sanitizedFileBuffer);

    const LANG = require(tempLocation);
    rmSync(tempLocation);

    return LANG;
  }

  private isJsFile(location: string): boolean {
    return existsSync(location) && location.endsWith('.js');
  }

  private isPhpFile(location: string): boolean {
    const exists = existsSync(location);
    const mimeTypeCorrect = location.endsWith('.php');
    return exists && mimeTypeCorrect;
  }

  private getLangFolder(from: Languages): string {
    return resolve(this.getDataFolder(), this.type, 'lang', from);
  }

  getDataFolder(): string {
    return resolve(__dirname, '..', 'pkg');
  }

  shouldReplaceShortcuts(line: string): boolean {
    return true;
  }

  shouldTranslate(
    item: TranslateItem,
    from: Languages,
    to: Languages,
  ): boolean {
    return true;
  }
}
