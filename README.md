# DotabuffScraper
Scrapes matchup data from dotabuff.com using Node.js

## Data structure
### Backbone
```json
{
    'last-updated' : "dd/mm/yyyy",
    'hero': [{
        'matchup': advantage
    }, {
        '...': ...
    }],
    ...
}
```

### Example
```json
{
    'last-updated': '01/09/2016',
    'abaddon': [{
        'silencer': 2.7672
    }, {
        'pudge': 2.1537
    }, {
        '...: ...
    }],
    ...
}
```

## Installation
```shell
git clone https://github.com/liangchunn/DotabuffScraper
cd DotabuffScraper
npm install
```

## Run
```shell
npm start
```
When everything is complete, look for `matchup.json` in the root directory of the project.
