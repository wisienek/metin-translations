import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import {
  GameTranslationType,
  Languages,
  WebsiteTranslationType,
} from './src/google/types';
import { WebsiteGoogleTranslator } from './src/google/website-google-translator';
import { ItemGoogleTranslator } from './src/google/item-google-translator';

(async () => {
  try {
    const CACHE_FILE_PATH = resolve(__dirname, 'data', 'cache.json');
    if (!existsSync(CACHE_FILE_PATH))
      writeFileSync(CACHE_FILE_PATH, JSON.stringify({}), { encoding: 'utf-8' });

    const cache: Partial<
      Record<Languages, Partial<Record<Languages, Record<string, string>>>>
    > = JSON.parse(readFileSync(CACHE_FILE_PATH, 'utf-8'));

    const translatingFile = GameTranslationType.ITEM_DESC;
    const fromLanguage = Languages.POLISH;
    const translatingType = WebsiteTranslationType.LAYOUT;

    const langsToTranslate = [
      // Languages.ENGLISH,
      Languages.CZECH,
      Languages.GERMAN,
      Languages.ITALIAN,
      Languages.HUNGARIAN,
      Languages.PORTUGUESE,
      Languages.ROMANIAN,
      Languages.SPANISH,
      Languages.TURKISH,
    ];

    await Promise.all(
      langsToTranslate.map(
        (lang) =>
          new ItemGoogleTranslator(cache, translatingFile).translate(
            fromLanguage,
            lang,
          ),
        // new WebsiteTranslator(cache, translatingType).translate(
        //   fromLanguage,
        //   lang,
        // ),
      ),
    );

    console.log(`Finished all translations, saving cache!`);

    writeFileSync(CACHE_FILE_PATH, JSON.stringify(cache, null, 2), {
      encoding: 'utf-8',
    });
  } catch (error) {
    console.error(`Outside error`, error);
    writeFileSync(
      join(__dirname, 'error.json'),
      JSON.stringify(error, null, 2),
    );
  }
})();
