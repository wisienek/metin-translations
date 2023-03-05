import { existsSync, mkdir, mkdirSync, readdirSync, writeFileSync } from 'fs';
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
      if (!originalFile.includes('email')) continue;
      console.log(`Will translate ${originalFile} file`);

      const toTranslate = this.readPhpFile(from, originalFile);
      const preparedItems = this.prepareItemsToTranslate(toTranslate);

      const translated = await this.translateItems(preparedItems, from, to);

      this.saveTranslatedItems(translated, from, to, originalFile);
    }
  }

  private saveTranslatedItems(
    items: TranslateItem[],
    from: Languages,
    to: Languages,
    fileName: string,
  ) {
    const isPhp = this.isPhpFile(resolve(this.getLangFolder(from), fileName));
    const fileString: string[] = [];

    isPhp && fileString.push('<?php', 'return [');

    items.forEach((item) => {
      const isParsed = this.isJSONFormatted(item.translated);
      const key = item.rest;
      const value: string | StringOrNumber[] = isParsed
        ? this.parseJsonFormatted(item.translated)
        : item.translated;

      if (key)

        fileString.push(
          `'${key}' => ${
            Array.isArray(value)
              ? `[${value.map((v) => (isNaN(+v) ? `'${v}'` : v))}]`
              : `'${value}'`
          },`,
        );
    });

    isPhp && fileString.push('];');

    const outputFileName = fileName.replace(`.${from}`, `.${to}`);

    const outputLangFolder = this.getLangFolder(to);
    if (!existsSync(outputLangFolder)) mkdirSync(outputLangFolder);

    const outputFileLocation = resolve(outputLangFolder, outputFileName);
    writeFileSync(outputFileLocation, fileString.join('\n'));
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

  private isPhpFile(location: string): boolean {
    return existsSync(location) && location.endsWith('.php');
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
