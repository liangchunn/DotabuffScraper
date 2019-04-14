# DotabuffScraper

Scrapes Dota 7.21 matchup data from DOTABUFF.com using RxJS

## Usage
```sh
# clone the repo
git clone https://github.com/liangchunn/DotabuffScraper.git

# change working dir
cd DotabuffScraper

# install dependencies
yarn

# build the source
yarn build

# run the code, and the result JSON will be emitted
node build/index.js
```

## Data Structure
```ts
type HeroName = string
type MatchupHeroName = string

type ResultType = Record<HeroName, Record<MatchupHeroName, number>>
```

Example:
```
{
 "ancient-apparition": {
    "anti-mage": 3.822,
    "phantom-lancer": 3.25,
    "lycan": 3.1062,
    "storm-spirit": 3.0888,
    "broodmother": 2.5598,
    "huskar": -5.5224,
    "...": ...,
 },
 "arc-warden": {
    "broodmother": 8.7522,
    "meepo": 6.4986,
    "lycan": 4.914,
    "phantom-lancer": 4.026,
    "naga-siren": 3.9557,
    "venomancer": -4.0473,
    "...": ...,
 }
}
```