# Cantonese for Excel

This Excel Add-in provides formulas to facilitate working with Cantonese romanization in Excel.

These formulas do their best to convert the parts that they understand and leave things alone that they do not understand. This should allow you to intersperse English or 中文字 with your romanization and have them pass through correctly.

## Formulas

### Quick Reference

| Formula | Arguments | Description |
|---|---|---|
| [CANTONESE.JYUTPINGTOYALE](#CANTONESEJYUTPINGTOYALE) | string | Convert Jyutping to Yale |

### `CANTONESE.JYUTPINGTOYALE`

#### Usage Examples

| Cell Contents | Details |
|---|---|
| `=CANTONESE.JYUTPINGTOYALE("jyut6ping3")` | You may pass a string directly into this formula. |
| `=CANTONESE.JYUTPINGTOYALE(A1)` | You may pass a cell reference into this formula. |

#### Input

- The input string for this function may contain any amount of text.
- The input string does not have to be exclusively Jyutping and may contain English, 中文字, punctuation, and more.
- Your Jyutping elements may be adjacent or space separated.
- The input string may contain capitalization.

#### Output

- The output string is best effort. It will only transform things that it can confidently identify as Jyutping.
- Capitalization patterns are preserved, whether lower case, initial caps, or all caps.

***

## Add-in End-User License Agreement

[The Cantonese for Excel Add-in is offered under the End-User License Agreement specified here.](.legal/EULA.pdf)

## Add-in Privacy Policy

The Cantonese for Excel Add-in does not collect or make use of any user information or data.

The Cantonese for Excel Add-in loads assets from Content Delivery Networks provided by Microsoft and GitHub's GitHub Pages product. Each of these providers may receive your IP address when those requests are made.

## Build & Release Excel for Cantonese

```sh
git checkout master
git clean -fdx
npm ci
npm version patch
npm run build
git branch -D gh-pages
git checkout --orphan gh-pages
git rm -r --cached ./
git add -f dist
git commit -m "Release"
git push -f --set-upstream origin gh-pages
git checkout -f master
```

## Code License

The code in this repository is not licensed for reuse.
