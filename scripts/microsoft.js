const fs = require("node:fs/promises");
const path = "../third_party/fluentui-emoji/assets";

/*
    ? 1. We first read the directory of assets, and push them to the assets array.
    ? 2. Once we do that, we go through all of them and read the metadata.json file which should house the unicode name of the emoji
    ? 3. once we do that, we push the unicode name and the path to the /Color/<emojiname>.svg to a new array. Since Microsoft is weird,
    ?    the emoji name is not the unicode one
    ? 4. Once we do that, copy that file to anew folder called "output/microsoft" and rename it to the unicode name
    ? 5. Done
*/


/**
 * @typedef {object} parsedData
 * @property {string} cldr
 * @property {string} fromVersion
 * @property {string} glyph
 * @property {string[]} glyphAsUtfInEmoticons
 * @property {string} group
 * @property {string[]} keywords
 * @property {string[]} mappedToEmoticons
 * @property {string} tts
 * @property {string} unicode
 * @property {string[]} unicodeSkintones
*/

/**
 * @type {Array<string>}
 */
const assets = [];
const skinTones = [
    {
        name: 'Default',
        code: ''
    },
    {
        name: 'Light',
        code: '1F3FB'
    },
    {
        name: 'Medium-Light',
        code: '1F3FC'
    },
    {
        name: 'Medium',
        code: '1F3FD'
    },
    {
        name: 'Medium-Dark',
        code: '1F3FE'
    },
    {
        name: 'Dark',
        code: '1F3FF'
    }
]

const start = async () => {
    try {
        await fs.access("../output/fluentui-emoji");
    } catch (e) {
        await fs.mkdir("../output").catch(() => {});
        await fs.mkdir("../output/fluentui-emoji").catch(() => {});
    }

    const files = await fs.readdir(path);

    for (let file of files) {
        assets.push(file);
    }

    /**
     * @type {Array<{name: string, path: string}>}
     */
    const emojiData = [];

    for (let asset of assets) {
        const data = await fs.readFile(`${path}/${asset}/metadata.json`, "utf-8");

        /**
         * @type {parsedData}
         */
        const parsed = JSON.parse(data);

        if (parsed.unicodeSkintones) {
            for (let skin of skinTones) {
                const fileName = await fs.readdir(`${path}/${asset}/${skin.name}/Color`);

                if (fileName.length > 0) {
                    emojiData.push({
                        name: `${parsed.unicode}-${skin.code}`,
                        path: `${path}/${asset}/${skin.name}/Color/${fileName[0]}`
                    });
                }
            }
        } else {
            const fileName = await fs.readdir(`${path}/${asset}/Color`);
            if (fileName.length > 0) {
                emojiData.push({
                    name: parsed.unicode,
                    path: `${path}/${asset}/Color/${fileName[0]}`
                });
            }
        }

    }

    for (let emoji of emojiData) {
        const name = emoji.name.replaceAll(' ', '-').toLowerCase().replace(/^-|-$/g, '');

        await fs.copyFile(emoji.path, `../output/fluentui-emoji/${name}.svg`);
    }

    console.log("Done");
};

start();