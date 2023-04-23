import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import {
  GameTranslationType,
  Languages,
  WebsiteTranslationType,
} from './src/types';
import { WebsiteTranslator } from './src/website-translator';

(async () => {
  try {
    const cache: Partial<
      Record<Languages, Partial<Record<Languages, Record<string, string>>>>
    > = JSON.parse(
      readFileSync(resolve(__dirname, 'data', 'cache.json'), 'utf-8'),
    );

    const translatingFile = GameTranslationType.LOCALE_GAME;
    const fromLanguage = Languages.POLISH;
    const translatingType = WebsiteTranslationType.INCLUDES;

    const langsToTranslate = [
      // Languages.ENGLISH,
      Languages.CZECH,
      Languages.GERMAN,
      Languages.ITALIAN,
      Languages.HUNGARIAN,
      Languages.PORTUGUESE,
      // Languages.ROMANIAN,
      Languages.SPANISH,
      Languages.TURKISH,
    ];

    await Promise.all(
      langsToTranslate.map((lang) =>
        new WebsiteTranslator(cache, translatingType).translate(
          fromLanguage,
          lang,
        ),
      ),
    );

    console.log(`Finished all translations, saving cache!`);

    writeFileSync(
      resolve(__dirname, 'cache.json'),
      JSON.stringify(cache, null, 2),
    );
  } catch (error) {
    console.error(`Outside error`, error);
  }
})();
