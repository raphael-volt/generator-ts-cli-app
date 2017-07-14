# CLI tools generator

Create a cli TypeScript project.

## Install
```bash
npm install -g generator-ts-cli-app
```

## Usage: tscliapp \<command\> [options]
```txt
  
  Commands:

    new [directory]
    n [directory]
    update [directory]
    u [directory]

  CLI TypeScript application generator.

  Options:

    -h, --help         output usage information
    -V, --version      output the version number
    -o, --override     Always replace existing content (update command only)
    -s, --skipscripts  Exit without run build and test
```

## Scripts

### Build

```bash
npm run build
npm run watch:build
```

### Test

```bash
npm run test
npm run watch:test
```

