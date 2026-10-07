import fs from 'fs';
import path from 'path';
import ts from 'typescript';

function loadTsModule(filePath: string, exportVarName: string): any {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace image imports with string constants
  content = content.replace(/import\s+(\w+)\s+from\s+['"]@\/assets\/([^'"]+)['"];?/g, 'const $1 = "/assets/$2";');
  // Remove types imports
  content = content.replace(/import\s+type\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '');
  content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]\.\/gamingZones['"];?/g, 'const { $1 } = { gamingZones: [] };');
  content += '\nexports.sportsTurfs = typeof sportsTurfs !== "undefined" ? sportsTurfs : [];\n';

  // Transpile TypeScript to CommonJS JavaScript using official TypeScript compiler
  const result = ts.transpileModule(content, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      removeComments: true,
    },
  });

  const exportsObj: any = {};
  const moduleObj = { exports: exportsObj };
  const requireFn = (id: string) => {
    return {};
  };

  const fn = new Function('exports', 'module', 'require', result.outputText);
  fn(exportsObj, moduleObj, requireFn);

  return moduleObj.exports[exportVarName] || exportsObj[exportVarName];
}

try {
  console.log('Transpiling and loading sports turfs...');
  const sportsTurfs = loadTsModule(path.resolve('../src/data/turfs.ts'), 'sportsTurfs');
  console.log(`Loaded ${sportsTurfs?.length || 0} sports turfs.`);

  console.log('Transpiling and loading gaming zones...');
  const gamingZones = loadTsModule(path.resolve('../src/data/gamingZones.ts'), 'gamingZones');
  console.log(`Loaded ${gamingZones?.length || 0} gaming zones.`);

  console.log('Transpiling and loading tournaments...');
  const tournaments = loadTsModule(path.resolve('../src/data/tournaments.ts'), 'tournaments');
  console.log(`Loaded ${tournaments?.length || 0} tournaments.`);

  console.log('Transpiling and loading users...');
  const mockUsers = loadTsModule(path.resolve('../src/data/mock-users.ts'), 'mockUsers');
  console.log(`Loaded ${mockUsers?.length || 0} mock users.`);

  console.log('Transpiling and loading support tickets...');
  const supportTickets = loadTsModule(path.resolve('../src/data/supportTickets.ts'), 'mockSupportTickets');
  console.log(`Loaded ${supportTickets?.length || 0} support tickets.`);

  const seedData = {
    turfs: [...(sportsTurfs || []), ...(gamingZones || [])],
    tournaments: tournaments || [],
    users: mockUsers || [],
    supportTickets: supportTickets || [],
  };

  const outFile = path.resolve('./src/data/seedData.json');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(seedData, null, 2), 'utf8');

  console.log(`\n✅ Generated seedData.json successfully!
- Total Venues: ${seedData.turfs.length} (Sports: ${sportsTurfs?.length}, Gaming: ${gamingZones?.length})
- Tournaments: ${seedData.tournaments.length}
- Users/Owners: ${seedData.users.length}
- Support Tickets: ${seedData.supportTickets.length}`);
} catch (err: any) {
  console.error('Extraction error:', err);
}
