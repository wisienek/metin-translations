import {existsSync, readFileSync, writeFileSync} from 'fs';
import { resolve } from 'path';
import {
  GameTranslationType,
  Languages,
  WebsiteTranslationType,
} from './src/types';
import { WebsiteTranslator } from './src/website-translator';
import {ItemTranslator} from "./src/item-translator";

(async () => {
  try {
    const CACHE_FILE_PATH = resolve(__dirname, 'data', 'cache.json');
    if(!existsSync(CACHE_FILE_PATH))
      writeFileSync(CACHE_FILE_PATH, JSON.stringify({}));

    const cache: Partial<
      Record<Languages, Partial<Record<Languages, Record<string, string>>>>
    > = JSON.parse(
      readFileSync(CACHE_FILE_PATH, 'utf-8'),
    );

    const translatingFile = GameTranslationType.LOCALE_INTERFACE;
    const fromLanguage = Languages.POLISH;
    const translatingType = WebsiteTranslationType.LAYOUT;

    const langsToTranslate = [
      // Languages.ENGLISH,
      // Languages.CZECH,
      // Languages.GERMAN,
      // Languages.ITALIAN,
      // Languages.HUNGARIAN,
      // Languages.PORTUGUESE,
      // Languages.ROMANIAN,
      // Languages.SPANISH,
      Languages.TURKISH,
    ];

    await Promise.all(
      langsToTranslate.map((lang) =>
          new ItemTranslator(cache, translatingFile).translate(
              fromLanguage,
              lang,
          )
        // new WebsiteTranslator(cache, translatingType).translate(
        //   fromLanguage,
        //   lang,
        // ),
      ),
    );

    console.log(`Finished all translations, saving cache!`);

    writeFileSync(
        CACHE_FILE_PATH,
      JSON.stringify(cache, null, 2),
    );
  } catch (error) {
    console.error(`Outside error`, error);
  }
})();
