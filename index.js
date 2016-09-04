/* eslint-env node */
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var colors = require('colors/safe');


// Initialization
var heroes = ['abaddon', 'alchemist', 'ancient-apparition', 'anti-mage', 'arc-warden', 'axe', 'bane', 'batrider', 'beastmaster', 'bloodseeker', 'bounty-hunter', 'brewmaster', 'bristleback', 'broodmother', 'centaur-warrunner',
    'chaos-knight',
    'chen', 'clinkz', 'clockwerk', 'crystal-maiden', 'dark-seer', 'dazzle', 'death-prophet', 'disruptor', 'doom', 'dragon-knight', 'drow-ranger', 'earth-spirit', 'earthshaker', 'elder-titan', 'ember-spirit', 'enchantress', 'enigma',
    'faceless-void', 'gyrocopter', 'huskar', 'invoker', 'io', 'jakiro', 'juggernaut', 'keeper-of-the-light', 'kunkka', 'legion-commander', 'leshrac', 'lich', 'lifestealer', 'lina', 'lion', 'lone-druid', 'luna', 'lycan', 'magnus',
    'medusa', 'meepo', 'mirana', 'morphling', 'naga-siren', 'natures-prophet', 'necrophos', 'night-stalker', 'nyx-assassin', 'ogre-magi', 'omniknight', 'oracle', 'outworld-devourer', 'phantom-assassin', 'phantom-lancer', 'phoenix',
    'puck', 'pudge',
    'pugna', 'queen-of-pain', 'razor', 'riki', 'rubick', 'sand-king', 'shadow-demon', 'shadow-fiend', 'shadow-shaman', 'silencer', 'skywrath-mage', 'slardar', 'slark', 'sniper', 'spectre', 'spirit-breaker', 'storm-spirit', 'sven',
    'techies', 'templar-assassin', 'terrorblade', 'tidehunter', 'timbersaw', 'tinker', 'tiny', 'treant-protector', 'troll-warlord', 'tusk', 'underlord', 'undying', 'ursa', 'vengeful-spirit', 'venomancer', 'viper', 'visage', 'warlock', 'weaver',
    'windranger', 'winter-wyvern', 'witch-doctor', 'wraith-king', 'zeus'
];
var data = {};
var index = 0;
var tries = 1;
var maxTries = 15;
var length = heroes.length;
var options = {
    url: '',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.A.B.C Safari/525.13'
    }
};
var filename = "./matchup.json";


// Date stuff
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth() + 1;
var yyyy = today.getFullYear();
if (dd < 10) dd = '0' + dd;
if (mm < 10) mm = '0' + mm;
data['last-updated'] = dd + '/' + mm + '/' + yyyy;

function SCRAPE() {
    if (index < heroes.length) {

        options.url = 'http://www.dotabuff.com/heroes/' + heroes[index] + '/matchups';

        request(options, function(error, response, body) {
            if (!error && response.statusCode === 200 && tries <= maxTries) {
                process.stdout.write('Loaded data for ' + heroes[index] + '. Processing... ');
                var $ = cheerio.load(body);
                data[heroes[index]] = [];
                $('tbody tr').each(function() {
                    var newObj = {};
                    var name = $('td a', this).attr('href').replace('/heroes/', '');
                    var winRate = Number($('td:nth-child(3)', this).attr('data-value'));
                    newObj[name] = winRate;
                    data[heroes[index]].push(newObj);
                });
                index++;
                tries = 0;
                process.stdout.write(colors.green('SUCCESS') + '\n');
                return SCRAPE();
            } else {
                if (tries <= maxTries) {
                    console.log(colors.bgYellow('[WARN]') + colors.yellow(' ' + error + ' Trying again for '+heroes[index]+'... [' + tries + '/' + maxTries + ']'));
                    tries++;
                    return SCRAPE();
                }
                console.log(colors.bgRed('[CRITICAL]') + colors.red(' Maximum tries reached. Please check your internet connection or try again later.'));
                return;
            }
        });
    } else {
        console.log(colors.green('Parsing complete!'));
        validateJSON();
    }
}

function validateJSON() {

    var index = 0;
    var lengthCheck = length - 1;

    console.log(colors.yellow('Validating captured data...'));

    for (var property in data) {
        if (index > 0) {
            if (data[property].length !== lengthCheck) {
                console.log(colors.bgRed('[CRITICAL]') + colors.red(' Something went wrong with validating ' + heroes[index - 1]));
                console.log(colors.bgRed('[CRITICAL]') + colors.red(' Expected length of ' + lengthCheck + ', but instead got ' + data[property].length));
                return;
            }
        }
        index++;
    }
    console.log(colors.green('Successfully validated all objects!'));
    saveFile();

}

function saveFile() {

    var str = JSON.stringify(data, null);

    console.log(colors.yellow('Saving file...'));

    fs.writeFile(filename, str, function(error) {
        if (error) {
            return console.log(colors.red(error));
        }
        console.log(colors.green('File was saved!'));
    });

}

(function() {
    fs.writeFile(filename, '', function(error) {
        if (error) {
            console.log(colors.bgRed('[CRITICAL]') + colors.red(' Write test failed. Verify if folder permissions are set correctly!'));
            return console.log(colors.bgRed('[CRITICAL]') + ' ' + colors.red(error));
        }
        console.log(colors.green('Write test successful!'));
        SCRAPE();
    });
})();
