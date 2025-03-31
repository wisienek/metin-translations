import { join } from 'path';
import { readdirSync, readFileSync, writeFileSync } from 'fs';

const servers = ['mariner', 'metin5', 'pandora', 'yitian'] as const;

enum FileTypes {
  BASE = 'base',
  PROTO = 'proto',
  filtered = 'filtered',
  DUPES = 'dupes',
}

const getFileIdsPath = (server: string) =>
  join(__dirname, 'data', 'cpp', `${server}_${FileTypes.PROTO}.txt`);

const getFileBasePath = (server: string) =>
  join(__dirname, 'data', 'cpp', `${server}_${FileTypes.BASE}.txt`);

const getFilteredSavePath = (server: string) =>
  join(__dirname, 'data', 'cpp', `${server}_${FileTypes.filtered}.txt`);

const getDupesSavePath = (server: string) =>
  join(__dirname, 'data', 'cpp', `${server}_${FileTypes.DUPES}.txt`);

const filterIdsOnList = (server: string) => {
  console.log(`Will try server ${server}`);

  const availableIds = new Set<string>();

  console.log(`Will read ids`);
  const ids = readFileSync(getFileIdsPath(server), 'utf-8').split('\n');

  console.log(`Will add read ids`);
  ids.forEach((id) => {
    const cleanedId = id.replace(/\r|\n/g, '');
    availableIds.add(cleanedId);
  });

  console.log(`Will read baseFile to filter`);
  const baseFile = readFileSync(getFileBasePath(server), 'utf-8');

  const lines = baseFile.split('\n');
  console.log(`Will map out and filter ${lines.length} lines`);

  const filteredLines = lines.filter((line) => {
    const matched = line.match(/\{\s*(\d+)/);
    const stringId = `${matched[1]}`;

    return availableIds.has(stringId);
  });

  console.log(`After filtering it's ${filteredLines.length} lines, saving`);
  writeFileSync(getFilteredSavePath(server), filteredLines.join('\n'), {
    encoding: 'utf-8',
  });

  console.log(`Done ${server}`);
};

const displayDupes = (server: string) => {
  console.log(`Will try server ${server}`);
  const baseFile = readFileSync(getFilteredSavePath(server), 'utf-8');

  const lines = baseFile.split('\n');
  console.log(`Will map out and filter ${lines.length} lines`);

  const filteredLines = lines.filter((line, index, array) => {
    const matched = line.match(/\{\s*(\d+)/);
    if (!matched) return false;

    const stringId = `${matched[1]}`;

    return array.some((otherLine, otherIndex) => {
      if (index !== otherIndex) {
        const otherMatched = otherLine.match(/\{\s*(\d+)/);
        if (otherMatched) {
          const otherStringId = `${otherMatched[1]}`;
          return stringId === otherStringId;
        }
      }
      return false;
    });
  });

  console.log(`Filtered list: ${filteredLines.length} lines`);
  writeFileSync(getDupesSavePath(server), filteredLines.join('\n'), {
    encoding: 'utf-8',
  });

  console.log(`Done ${server}`);
};

const listDupesFromLocale = () => {
  const lgame = readFileSync(
    join(__dirname, 'data', 'dupes', 'locale_game.txt'),
    'utf-8',
  );
  const linterface = readFileSync(
    join(__dirname, 'data', 'dupes', 'locale_interface.txt'),
    'utf-8',
  );

  const repeated = new Set<string>();

  const lgameLines = lgame.split('\n');

  for (const line of lgameLines) {
    const indexedLine = line.split('\t')[0];

    if (
      linterface.toLocaleLowerCase().indexOf(indexedLine.toLocaleLowerCase()) >
      -1
    ) {
      repeated.add(line);
    }
  }

  console.log(`Found all repeated locales: ${[...repeated].length}`);

  writeFileSync(
    join(__dirname, 'data', 'dupes', 'locale_dupes.txt'),
    [...repeated].join('\n'),
  );
};

const getEnums = () => {
  const regex = /localeInfo\.(\w+)/g;
  const readFile = readFileSync(
    join(__dirname, 'data', 'dupes', 'nowe_locale_game.txt'),
    'utf-8',
  );

  const matched = new Set<string>();

  console.log(`Will start matching`);

  let match: any[];
  while ((match = regex.exec(readFile)) !== null) {
    const result = match[1];
    matched.add(`localInfo.${result}`);
  }

  console.log(`Found all matched enums: ${[...matched].length}`);

  writeFileSync(
    join(__dirname, 'data', 'dupes', 'locale_info_enums.txt'),
    [...matched].join('\n'),
  );
};

const sortFiles = () => {
  const sortingDir = readdirSync(join(__dirname, 'data', 'sorting'));

  for (const sortingFileName of sortingDir) {
    console.log(`Will sort ${sortingFileName}`);
    const data = readFileSync(
      join(__dirname, 'data', 'sorting', sortingFileName),
      'utf-8',
    );

    const lines = data.split('\n');

    const sortedLines = lines.sort((a, b) => {
      const matchedA = a.match(/\{\s*(\d+)/);
      const matchedB = b.match(/\{\s*(\d+)/);

      const idA = Number(matchedA[1]);
      const idB = Number(matchedB[1]);

      return idA - idB;
    });

    console.log(`Done sorting lines ${sortingFileName}`);

    writeFileSync(
      join(__dirname, 'data', 'sorting', sortingFileName),
      sortedLines.join('\n'),
    );
  }
};

(async () => {
  try {
    sortFiles();
  } catch (error) {
    console.log(error);
  }
})();
