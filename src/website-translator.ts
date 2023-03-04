import { BaseTranslator } from './base-translator';
import { Languages, TranslateItem, WebsiteTranslationType } from './types';
import { resolve } from 'path';

export class WebsiteTranslator extends BaseTranslator {
  constructor(
    protected readonly cache: Partial<
      Record<Languages, Partial<Record<Languages, Record<string, string>>>>
    >,
    private type: WebsiteTranslationType,
  ) {
    super(cache);

    this.outPutName = 'website';
  }

  protected translate(from: Languages, to: Languages): Promise<void> {
    return Promise.resolve(undefined);
  }


  private parsePhpFile() {

  }

  getDataFolder(): string {
    return resolve(__dirname, '..', 'pkg', this.type);
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
