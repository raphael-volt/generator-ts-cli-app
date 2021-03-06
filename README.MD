# CLI tools generator

Create a cli TypeScript project.

## Install
```bash
npm install -g generator-ts-cli-app
```

## Usage: tscliapp \<command\> [options]
```txt
  
  Commands:

    new [directory]     Create a cli TypeScript application.
    n [directory]
    update [directory]  Update an existing cli application.
    u [directory]
    spec <file>         Generate a chai test-case. Add spec.ts extension if missing.
    s <file>
    help [cmd]          display help for [cmd]

  CLI TypeScript application generator.

  Options:

    -h, --help         output usage information
    -V, --version      output the version number
    -o, --override     Always replace existing content (update command only).
    -s, --skipscripts  Exit without run build and test.
    
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

