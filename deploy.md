1. `npm run package-deployed` (uses previously-generated .happ file)
2. `npm run hash-webhapp` (you will need the output for the tool curation list)
2. Write changelog

# Publish to Github
1. Push
2. Create new release; upload .webhapp file; copy .webhapp URL

# Publish to Tool Curation
1. `git clone https://github.com/Zequez/weave-tool-curation`
2. `git remote add upstream https://github.com/lightningrodlabs/weave-tool-curation/`
3. `git fetch upstream && git checkout main && git reset --hard upstream/main`
4. Add gamez version to 0.13/modify/tool-list-0.13.ts
5. `npm run write-lists`
6. `npm run test`