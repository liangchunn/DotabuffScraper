/* eslint-env node */
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

var options = {
    filename: './matchup.json',
    patchVersion: '7.01'
};

var MAX_TRIES_REACHED = 'Maximum tries reached!';

function Scraper(options) {
    this.options = options;
    this.data = {};
    this.index = 0;
    this.tries = 0;
    this.maxTries = 15;
    this.fallbackURI = false;
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
    };
}

Scraper.prototype.fetch = function() {
    var self = this;
    var URI = (this.fallbackURI) ? '' : `?date=patch_${this.options.patchVersion}`;
    var heroName = this.heroes[this.index];

    if (self.tries >= self.maxTries) throw MAX_TRIES_REACHED;

    if (this.index < this.length) {
        this.URLWrapper.url = `http://www.dotabuff.com/heroes/${heroName}/matchups${URI}`;
        request(this.URLWrapper, function(error, response, body) {

            if (error || response.statusCode !== 200) {
                self.tries++;
                process.stdout.write(`Trying again [${self.tries}/${self.maxTries}] \n`);
                return self.fetch();
            }

            process.stdout.write(`Loaded data for ${heroName}. Processing... `);
            var $ = cheerio.load(body);
            self.data[heroName] = [];
            $('tbody tr').each(function() {
                if (!$('td', this).hasClass('talent-cell')) {
                    var newObject = {};
                    var advantagePercentage = Number($('td:nth-child(3)', this).attr('data-value'));
                    var name = $('td a', this).attr('href').replace('/heroes/', '');
                    newObject[name] = advantagePercentage;
                    self.data[heroName].push(newObject);
                }
            });
            process.stdout.write('Done! \n');
            self.tries = 0;
            self.index++;
            return self.fetch();
        });
    } else {
        process.stdout.write('Parsing complete! \n');
        this.validateJSON();
    }

};

Scraper.prototype.validateJSON = function() {
    var index = 0;
    var lengthCheck = this.length - 1;
    process.stdout.write('Validating captured data... \n');
    for (var property in this.data) {
        if (index > 1) {
            if (this.data[property].length !== lengthCheck) {
                process.stdout.write(`[ERR!] Something went wrong with validating ${this.heroes[index - 1]} \n`);
                process.stdout.write(`[ERR!] Expected length of ${lengthCheck} but instead got ${this.data[property].length} \n`);
                this.dumpFile();
                return;
            }
        }
        index++;
    }
    process.stdout.write('Successfully validated all objects! \n');
    this.saveFile();
};

Scraper.prototype.start = function() {
    var self = this;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    this.data['last-updated'] = dd + '/' + mm + '/' + yyyy;
    request({
            url: `http://www.dotabuff.com/heroes/abaddon/matchups?date=patch_${self.options.patchVersion}`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.A.B.C Safari/525.13'
            }
        },
        function(error, response) {
            if (response.statusCode !== 200) {
                process.stdout.write(`[ERR!] Error loading ${self.options.patchVersion}! Fallback to no versioning! \n`);
                self.fallbackURI = true;
                self.data['patch-version'] = '';
            } else {
                self.data['patch-version'] = self.options.patchVersion;
            }
            self.fetch();
        });
};

Scraper.prototype.saveFile = function() {
    var str = JSON.stringify(this.data, null);
    process.stdout.write('Saving file... \n');
    fs.writeFile(this.options.filename, str, function(error) {
        if (error) {
            throw error;
        } else {
            process.stdout.write('File was saved! \n');
        }
    });
};

Scraper.prototype.dumpFile = function() {
    var str = JSON.stringify(this.data, null);
    var filename = this.options.filename + '.dump';
    process.stdout.write(`Dumping ${filename}... \n`);
    fs.writeFile(filename, str, function(error) {
        if (error) {
            throw error;
        } else {
            process.stdout.write(`${filename} dumped. \n`);
        }
    });
};

(function() {
    fs.writeFile(options.filename, '', function(error) {
        if (error) {
            process.stdout.write('[ERR!] Write test failed. Verify if folder permissions are set correctly. \n');
            return;
        }
        process.stdout.write('Write test successful! \n');
        process.stdout.write(`Fetching data for game revision ${options.patchVersion} \n`);
        var scraper = new Scraper(options);
        scraper.start();
    });

})();
