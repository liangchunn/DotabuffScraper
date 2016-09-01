# DotabuffScraper
Scrapes matchup data from dotabuff.com using Node.js

## Data structure
### Backbone
```
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
```
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
```
git clone https://github.com/liangchunn/DotabuffScraper
cd DotabuffScraper
npm install
```

## Run
```
npm start
```
