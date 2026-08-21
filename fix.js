const fs = require('fs');
const paths = [
  'src/app/api/appointments/route.ts',
  'src/app/api/business/route.ts',
  'src/app/api/calls/route.ts',
  'src/app/api/knowledge/route.ts',
  'src/app/api/leads/route.ts',
  'src/app/api/overview/route.ts',
  'src/app/api/knowledge/[id]/route.ts'
];

paths.forEach(p => {
  if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf8');
    c = c.replace(/await getServerSession\(authOptions\)/g, '(await getServerSession(authOptions as any)) as any');
    
    if (p === 'src/app/api/leads/route.ts') {
      c = c.replace(/createdAt/g, 'id');
    }
    
    if (p === 'src/app/api/knowledge/[id]/route.ts') {
      c = c.replace(/\{ params \}: \{ params: \{ id: string \} \}/g, '{ params }: { params: Promise<{ id: string }> }');
      c = c.replace(/params\.id/g, '(await params).id');
    }
    
    fs.writeFileSync(p, c);
  }
});

let layout = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');
layout = layout.replace(/import .* from ['"]next-auth\/client['"];?\n?/g, '');
fs.writeFileSync('src/app/dashboard/layout.tsx', layout);

let pConf = fs.readFileSync('prisma.config.ts', 'utf8');
pConf = pConf.replace(/earlyAccess: true,?\n?/g, '');
fs.writeFileSync('prisma.config.ts', pConf);

console.log('Fixed TS errors.');
