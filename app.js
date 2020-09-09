/**
 * Variables n shit
 */
const { exec }  = require("child_process");
const fs        = require('fs');
const cheerio   = require('cheerio');
const request   = require('request');
const searchUrl = "https://eu.finalfantasyxiv.com/lodestone/playguide/db/item/?patch=&db_search_category=item&category2=&q={ITEM_NAME}";
const itemUrl   = "https://eu.finalfantasyxiv.com";

// ---------------------------------------
// Arguments
// ---------------------------------------

let [start, size] = process.argv.slice(2);
start = parseInt(start);
size = parseInt(size);
let end = start + size;

// ---------------------------------------
// Functions
// ---------------------------------------

const getPageContents = (url, callback) => {
    url = encodeURI(url);
    exec(`php get_page.php "${url}"`, (error, stdout, stderr) => {
        callback(stdout);
    });
};

const getItemIconUrl = (url, callback) => {
    // parse search page
    getPageContents(url, html => {
        let $       = cheerio.load(html);
        let pageUrl = itemUrl + $('.db-table__txt--detail_link').attr('href');

        // parse item page
        getPageContents(pageUrl, html => {
            let $       = cheerio.load(html);
            let iconUrl = $('.db-view__item__icon__item_image').attr('src');
            callback(iconUrl);
        });
    })
};

// ---------------------------------------
// Exec
// ---------------------------------------

// Make dir folder if it doesn't exist
fs.mkdirSync('img/', { recursive: true });


// grab ItemData.json file
console.log("Reading ItemData.json file");
var item_data = JSON.parse(fs.readFileSync('ItemData.json', 'utf8'));


// remove entries we don't care about
console.log(`Reducing the item list to: ${start} and ${end}`);
item_data = item_data.splice(start, (end - start));

// set total
const total = item_data.length;
console.log(item_data);
console.log(`${item_data.length} entries`);

if (item_data.length <= 0) {
    console.log("Nothing to download for this range.");
    return;
}

// begin downloading icons
let current = 0;

const doshit = () => {
    current++;

    if (item_data.length <= 0) {
        console.log("Finished all icons!!!");
        return;
    }

    // we always get 0 because we remove entries as we work through them
    let item     = item_data[0];
    let url      = searchUrl.replace('{ITEM_NAME}', item.name_en);
    let filename = `img/${item.name_en} Icon.png`;

    console.log(`- (${current}/${total}) ${item.name_en}`);

    // get the item icon url
    getItemIconUrl(url, itemIconUrl => {
        // download and save the icon
        request.get({
            url: itemIconUrl,
            encoding: 'binary'
        }, function (err, response, body) {
            fs.writeFile(filename, body, 'binary', (error) => {
                if (error) {
                    console.error(err);
                }

                item_data.splice(0, 1);
                doshit();
            });
        });

    });
};

doshit();
