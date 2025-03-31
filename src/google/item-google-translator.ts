import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { GameTranslationType, Languages, TranslateItem } from './types';
import { BaseGoogleTranslator } from './base-google-translator';

export class ItemGoogleTranslator extends BaseGoogleTranslator {
  constructor(
    protected readonly cache: Partial<
      Record<Languages, Partial<Record<Languages, Record<string, string>>>>
    >,
    protected readonly type: GameTranslationType,
  ) {
    super(cache, type);

    this.outPutName = `${this.type}.zip`;
  }

  async translate(from: Languages, to: Languages) {
    const fromFile = this.resolveFileName(from);
    const itemFile = readFileSync(fromFile).toString('utf-8');

    console.log(
      `Reading file ${fromFile}, read: ${!!itemFile}, chars: ${
        itemFile.length
      }`,
    );
    if (!itemFile) throw new Error(`Not enough lines to translate`);

    const itemsToTranslate = this.getUniqueItems(itemFile);
    const translatedItems = await this.translateItems(
      itemsToTranslate,
      from,
      to,
    );

    const populated = this.populateItems(translatedItems, from, to);

    await this.saveTranslatedItems(populated, to);
  }

  private populateItems(
    items: Array<TranslateItem>,
    from: Languages,
    to: Languages,
  ): Array<TranslateItem> {
    const newItems: Array<TranslateItem> = [];

    for (const item of items) {
      item.translated = item.translated
        .split(' ')
        .map(this.capitalize)
        .join(' ')
        .replace('[empty]', '');

      if (!this.isCached(item.sanitized, from, to))
        this.addToCache(item.sanitized, item.translated, from, to);

      if (this.isTabbed()) {
        if (this.type === GameTranslationType.ITEM_DESC) {
          item.translated = `${item.rest}\t${item.original}\t${item.translated}`;
        } else {
          item.translated = `${item.original}\t${item.translated}${
            item?.rest ? `\t${item.rest}` : ''
          }`;
        }

        newItems.push(item);
        continue;
      }

      if (this.type === GameTranslationType.ITEM_DESCRIPTION) {
        item.translated = `${item.original}\t${item.translated
          .split(' || ')
          .join('\t')}`;

        newItems.push(item);
        continue;
      }

      newItems.push(item);

      if (this.type === GameTranslationType.LOCALE_STRING) continue;

      const isUpgradable = (item.sanitized.match(/\+\d/g) ?? []).length > 0;
      if (isUpgradable && !this.isItemException(item.sanitized.toLowerCase())) {
        const populated = new Array(9).fill(null).map((_, index) => ({
          original: item.original.replace(/\+\d/g, `+${index + 1}`),
          sanitized: item.sanitized.replace(/\+\d/g, `+${index + 1}`),
          translated: item?.translated?.replace(/\+\d/g, `+${index + 1}`),
        }));

        newItems.push(...populated);
      }
    }

    return newItems;
  }

  private capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  private async saveTranslatedItems(
    items: Array<TranslateItem>,
    to: Languages,
  ): Promise<void> {
    const saveLocation = this.resolveFileName(to);
    const textToSave = items.map((i) => i.translated).join('\n');

    console.log(
      `Saving ${items.length} items to: ${saveLocation}, chars: ${textToSave.length}`,
    );
    writeFileSync(saveLocation, textToSave, { encoding: 'utf-8' });

    // await this.addToZip(saveLocation);
  }

  private getUniqueItems(fileString: string): Array<TranslateItem> {
    const toTranslate = [];
    const lines = fileString.split('\n');
    const linesLength = lines.length;

    const unique = new Set<string>();

    for (let i = 0; i < linesLength; i++) {
      const line = lines[i];
      if (line.length === 0) continue;

      const sanitizedLine = this.replaceShortcuts(line);

      if (this.type === GameTranslationType.ITEM) {
        if (this.isItemException(sanitizedLine.toLowerCase())) {
          toTranslate.push(this.getPreparedItem(line, sanitizedLine));
          continue;
        }

        const hasPlus = (sanitizedLine.match(/\+\d/g) ?? []).length > 0;
        const withoutPlus = sanitizedLine.replace(/\+\d/g, '+0');

        if (hasPlus) unique.add(withoutPlus);

        if (sanitizedLine !== withoutPlus && hasPlus) {
          if (unique.has(withoutPlus)) continue;

          toTranslate.push(this.getPreparedItem(line, withoutPlus));
          continue;
        }
      }

      if (this.isTabbed()) {
        let tabName: string, middle: string, rest: string | string[];
        if (this.type === GameTranslationType.ITEM_DESC) {
          [rest, tabName, middle] = line.split('\t', 3);
        } else {
          [tabName, middle, ...rest] = line.split('\t');
        }
        if (middle?.length === 0 || middle?.trim().length === 0) {
          console.error(line);

          toTranslate.push({
            ...this.getPreparedItem(tabName, '[empty]'),
            rest: Array.isArray(rest) ? rest?.join('\t') : rest,
          });
          continue;
          // throw new Error(`Not enough characters to translate! (line ${i})`);
        }

        toTranslate.push({
          ...this.getPreparedItem(tabName, middle),
          rest: Array.isArray(rest) ? rest?.join('\t') : rest,
        });
        continue;
      }

      if (this.type === GameTranslationType.ITEM_DESCRIPTION) {
        const [id, ...rest] = line.split('\t');
        const joined = rest.join(' || ');

        if (
          rest?.length === 0 ||
          joined.trim().replace('||', '').length === 0
        ) {
          console.error(line);
          throw new Error(`Not enough characters to translate! (line ${i})`);
        }

        toTranslate.push(this.getPreparedItem(id, joined));
        continue;
      }

      toTranslate.push(this.getPreparedItem(line, sanitizedLine));
    }

    return toTranslate;
  }

  private getPreparedItem(original: string, sanitized: string): TranslateItem {
    return {
      original,
      sanitized,
    };
  }

  shouldReplaceShortcuts(line: string): boolean {
    return !this.isLocale();
  }

  private isItemException(item: string): boolean {
    return (
      item.indexOf('wedka') > -1 ||
      item.indexOf('wodny kamień') > -1 ||
      item.indexOf('kamien duszy') > -1 ||
      item.indexOf('kamień duszy') > -1
    );
  }

  shouldTranslate(
    item: TranslateItem,
    from: Languages,
    to: Languages,
  ): boolean {
    return !(
      this.type === GameTranslationType.MOB &&
      this.isMobException(item.sanitized.toLowerCase())
    );
  }

  private isMobException(item: string): boolean {
    return (
      item.indexOf('mario') > -1 ||
      item.indexOf('ah-yu') > -1 ||
      item.indexOf('yonah') > -1 ||
      item.indexOf('yu-rang') > -1 ||
      item.indexOf('deokbae') > -1 ||
      item.indexOf('yu-hwan') > -1 ||
      item.indexOf('uriel') > -1
    );
  }

  resolveFileName(language: Languages): string {
    const prefix = this.isLocale() ? `${this.type}` : `${this.type}_proto`;

    return resolve(this.getDataFolder(), `${prefix}_${language}.txt`);
  }

  isTabbed(): boolean {
    return [
      GameTranslationType.LOCALE_GAME,
      GameTranslationType.LOCALE_INTERFACE,
      GameTranslationType.LOCALE_CLIENT,
      GameTranslationType.EXTENDED_PET_SKILL,
      GameTranslationType.LOCALE_STRING,
      GameTranslationType.ITEM_DESC,
    ].includes(this.type);
  }

  isLocale() {
    return (
      this.type.indexOf('locale') > -1 ||
      this.type === GameTranslationType.ITEM_DESCRIPTION ||
      this.type === GameTranslationType.EXTENDED_PET_SKILL ||
      this.type === GameTranslationType.ITEM_DESC
    );
  }

  getDataFolder(): string {
    return resolve(__dirname, '..', '..', 'data', this.type);
  }
}
