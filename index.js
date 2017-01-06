/* eslint-env node */
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var colors = require('colors/safe');

var options = {
    filename: "./matchup.json",
    patchVersion: "7.01"
}

function Scraper(options) {
    this.options = options;
    this.data = {};
    this.index = 0;
    this.tries = 1;
    this.maxTries = 15;
    this.heroes = ['abaddon', 'alchemist', 'ancient-apparition', 'anti-mage', 'arc-warden', 'axe', 'bane', 'batrider', 'beastmaster', 'bloodseeker', 'bounty-hunter', 'brewmaster', 'bristleback', 'broodmother', 'centaur-warrunner',
        'chaos-knight',
        'chen', 'clinkz', 'clockwerk', 'crystal-maiden', 'dark-seer', 'dazzle', 'death-prophet', 'disruptor', 'doom', 'dragon-knight', 'drow-ranger', 'earth-spirit', 'earthshaker', 'elder-titan', 'ember-spirit', 'enchantress', 'enigma',
        'faceless-void', 'gyrocopter', 'huskar', 'invoker', 'io', 'jakiro', 'juggernaut', 'keeper-of-the-light', 'kunkka', 'legion-commander', 'leshrac', 'lich', 'lifestealer', 'lina', 'lion', 'lone-druid', 'luna', 'lycan', 'magnus',
        'medusa', 'meepo', 'mirana', 'monkey-king', 'morphling', 'naga-siren', 'natures-prophet', 'necrophos', 'night-stalker', 'nyx-assassin', 'ogre-magi', 'omniknight', 'oracle', 'outworld-devourer', 'phantom-assassin', 'phantom-lancer', 'phoenix',
        'puck', 'pudge',
        'pugna', 'queen-of-pain', 'razor', 'riki', 'rubick', 'sand-king', 'shadow-demon', 'shadow-fiend', 'shadow-shaman', 'silencer', 'skywrath-mage', 'slardar', 'slark', 'sniper', 'spectre', 'spirit-breaker', 'storm-spirit', 'sven',
        'techies', 'templar-assassin', 'terrorblade', 'tidehunter', 'timbersaw', 'tinker', 'tiny', 'treant-protector', 'troll-warlord', 'tusk', 'underlord', 'undying', 'ursa', 'vengeful-spirit', 'venomancer', 'viper', 'visage', 'warlock', 'weaver',
        'windranger', 'winter-wyvern', 'witch-doctor', 'wraith-king', 'zeus'
    ];
    this.length = this.heroes.length;
    this.URLWrapper = {
        url: '',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.A.B.C Safari/525.13'
        }
    }
    this.initalize();
    this.fetch();
}

Scraper.prototype.fetch = function() {
    var self = this;
    if (this.index < this.length) {
        this.URLWrapper.url = 'http://www.dotabuff.com/heroes/' + this.heroes[this.index] + '/matchups?date=patch_' + this.options.patchVersion;
        request(this.URLWrapper, function(error, response, body) {
            if (!error && response.statusCode === 200 && self.tries <= self.maxTries) {
                process.stdout.write('Loaded data for ' + self.heroes[self.index] + '. Processing... ');
                var $ = cheerio.load(body);
                self.data[self.heroes[self.index]] = [];
                $('tbody tr').each(function() {
                    if (!$('td', this).hasClass('talent-cell')) {
                        var newObj = {};
                        var winRate = Number($('td:nth-child(3)', this).attr('data-value'));
                        var name = $('td a', this).attr('href').replace('/heroes/', '');
                        newObj[name] = winRate;
                        self.data[self.heroes[self.index]].push(newObj);
                    }
                });
                self.index++;
                self.tries = 1;
                process.stdout.write(colors.green('SUCCESS') + '\n');
                return self.fetch();    // Call recursively one after another request
            } else if (response.statusCode === 404) {
                console.log(colors.bgRed("[CRITICAL]") + colors.red(' Error 404: URL invalid. Please check if version number exists!'));
            } else {
                if (self.tries <= self.maxTries) {
                    console.log(colors.bgYellow('[WARN]') + colors.yellow(' ' + error + ' Trying again for ' + self.heroes[self.index] + '... [' + self.tries + '/' + self.maxTries + ']'));
                    self.tries++;
                    return self.fetch();
                }
                console.log(colors.bgRed('[CRITICAL]') + colors.red(' Maximum tries reached. Please check your internet connection or try again later.'));
                self.dumpFile();
                return;
            }
        });
    } else {
        console.log(colors.green('Parsing complete!'));
        this.validateJSON();
    }
};

Scraper.prototype.validateJSON = function() {
    var index = 0;
    var lengthCheck = this.length - 1;
    console.log(colors.yellow('Validating captured data...'));
    for (var property in this.data) {
        if (index > 1) {
            if (this.data[property].length !== lengthCheck) {
                console.log(colors.bgRed('[CRITICAL]') + colors.red(' Something went wrong with validating ' + this.heroes[index - 1]));
                console.log(colors.bgRed('[CRITICAL]') + colors.red(' Expected length of ' + lengthCheck + ', but instead got ' + this.data[property].length));
                this.dumpFile();
                return;
            }
        }
        index++;
    }
    console.log(colors.green('Successfully validated all objects!'));
    this.saveFile();
};

Scraper.prototype.initalize = function() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    this.data['last-updated'] = dd + '/' + mm + '/' + yyyy;
    this.data['patch-version'] = this.options.patchVersion;
};

Scraper.prototype.saveFile = function() {
    var str = JSON.stringify(this.data, null);
    console.log(colors.yellow('Saving file...'));
    fs.writeFile(this.options.filename, str, function(error) {
        if (error) {
            console.log(colors.red(error));
        } else {
            console.log(colors.green('File was saved!'));
        }
    });
};

Scraper.prototype.dumpFile = function() {
    var str = JSON.stringify(this.data, null);
    var filename = this.options.filename + ".dump";
    console.log(colors.red('Dumping ' + filename + "..."));
    fs.writeFile(filename, str, function(error) {
        if (error) {
            console.log(colors.red(error));
        } else {
            console.log(colors.red(filename + ' dumped.'));
        }
    });
};

(function() {
    fs.writeFile(options.filename, '', function(error) {
        if (error) {
            console.log(colors.bgRed('[CRITICAL]') + colors.red(' Write test failed. Verify if folder permissions are set correctly!'));
            return console.log(colors.bgRed('[CRITICAL]') + ' ' + colors.red(error));
        }
        console.log(colors.green('Write test successful!'));
        console.log(colors.green('Fetching game revision ' + options.patchVersion));
        var scraper = new Scraper(options);
    });
})();
