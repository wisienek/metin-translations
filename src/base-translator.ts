import { TranslationServiceClient } from '@google-cloud/translate';
import { existsSync, readFileSync } from 'fs';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import {TranslateItem, Languages, GameTranslationType, WebsiteTranslationType} from './types';

dotenv.config();

export abstract class BaseTranslator {
  protected readonly shortcutsDefinition: Record<string, string> = {};
  protected readonly transactionClient = new TranslationServiceClient({
    keyFilename: resolve(__dirname, '..', 'google_cloud_key.json'),
  });

  protected outPutName: string;

  protected constructor(
    protected readonly cache: Partial<
      Record<Languages, Partial<Record<Languages, Record<string, string>>>>
    >,
    protected readonly type: GameTranslationType | WebsiteTranslationType
  ) {
    if (existsSync(this.resolveShortcutsFileName()))
      this.shortcutsDefinition = JSON.parse(
        readFileSync(this.resolveShortcutsFileName(), 'utf-8'),
      );
    else console.warn(`No shortcut file present!`);
  }

  abstract translate(from: Languages, to: Languages): Promise<void>;

  protected async translateItems(
    items: Array<TranslateItem>,
    from: Languages,
    to: Languages,
  ): Promise<Array<TranslateItem>> {
    const translatedItems: Promise<TranslateItem>[] = [];

    for (const item of items) {
      if (this.isCached(item.sanitized, from, to)) {
        translatedItems.push(
          new Promise<TranslateItem>((resolve) =>
            resolve({
              ...item,
              translated: this.getFromCache(item.sanitized, from, to),
            }),
          ),
        );
        continue;
      }

      if (!this.shouldTranslate(item, from, to)) {
        translatedItems.push(
          new Promise<TranslateItem>((resolve) =>
            resolve({ ...item, translated: item.sanitized } as TranslateItem),
          ),
        );
        continue;
      }

      const request = {
        parent: `projects/${process.env.PROJECT_NAME}/locations/global`,
        contents: [item.sanitized],
        mimeType: 'text/plain',
        sourceLanguageCode: from,
        targetLanguageCode: to,
      };

      translatedItems.push(
        this.transactionClient.translateText(request).then(([t]) => ({
          ...item,
          translated: t.translations[0].translatedText,
        })),
      );
    }

    return Promise.all(translatedItems);
  }

  protected replaceShortcuts(line: string): string {
    if (!this.shouldReplaceShortcuts(line)) return line;

    const shortcuts = line.match(/[\p{L}-]+\./gu) ?? [];
    let newLine = line;

    for (const shortcut of shortcuts) {
      const sanitizedShortcut = shortcut.replace('.', '').toLowerCase();

      if (this.shortcutsDefinition[sanitizedShortcut])
        newLine = newLine.replace(
          shortcut,
          this.shortcutsDefinition[sanitizedShortcut],
        );
    }

    return newLine;
  }

  protected isCached(item: string, from: Languages, to: Languages): boolean {
    const straight = this.cache?.[from]?.[to]?.[item];
    if (straight) return true;

    if (this.cache[to] && this.cache[to][from]) {
      const translations = Object.values(this.cache[to][from] ?? {}).map((i) =>
        i.toLowerCase(),
      );

      return !!translations.includes(item.toLowerCase());
    }

    return false;
  }

  protected getFromCache(item: string, from: Languages, to: Languages): string {
    if (this.cache?.[from]?.[to]?.[item]) return this.cache[from][to][item];

    if (this.cache[to] && this.cache[to][from]) {
      const translations = Object.values(this.cache[to][from] ?? {}).map((i) =>
        i.toLowerCase(),
      );

      if (translations.includes(item.toLowerCase())) {
        const entries = Object.entries(this.cache[to][from]);
        const found = entries.find(
          ([_, value]) => value.toLowerCase() === item.toLowerCase(),
        );

        return found[0];
      }
    }

    throw new Error(`GetFrom cache not found ${item}, ${from} -> ${to}`);
  }

  protected addToCache(
    item: string,
    translation: string,
    from: Languages,
    to: Languages,
  ) {
    if (!this.cache[from]) this.cache[from] = {};
    if (!this.cache[from][to]) this.cache[from][to] = {};

    this.cache[from][to][item] = translation;
  }

  protected async addToZip(savedFileLocation: string): Promise<void> {
    return;
    // const zipFileLocation = this.getArchiveFileName();
    // const existsZip = existsSync(zipFileLocation);
    //
    // existsZip
    //   ? await tar.create(
    //       {
    //         gzip: true,
    //         cwd: this.getDataFolder(),
    //         file: zipFileLocation,
    //       },
    //       [savedFileLocation],
    //     )
    //   : await tar.update(
    //       {
    //         gzip: true,
    //         cwd: this.getDataFolder(),
    //         file: zipFileLocation,
    //       },
    //       [savedFileLocation],
    //     );
    //
    // console.log(`${existsZip ? 'Upserted' : `Saved`} zip ${zipFileLocation}`);
  }

  protected getArchiveFileName(): string {
    return resolve(__dirname, 'output', this.outPutName);
  }

  resolveShortcutsFileName(): string {
    return resolve(this.getDataFolder(), 'shortcuts.json');
  }

  abstract getDataFolder(): string;

  abstract shouldReplaceShortcuts(line: string): boolean;

  abstract shouldTranslate(
    item: TranslateItem,
    from: Languages,
    to: Languages,
  ): boolean;
}
