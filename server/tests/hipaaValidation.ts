/**
 * server/tests/hipaaValidation.ts
 * HONEST HIPAA readiness gate.
 *
 * This does NOT certify compliance. It verifies that the enterprise CONTROL
 * WIRING exists in the codebase (so CI can run offline), and it explicitly
 * reports the human/legal/infra controls that remain outstanding. It exits 0
 * when the wiring is present, because that's all a build can honestly attest —
 * never claiming a BAA is signed or that the system is "HIPAA secure."
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const thisDir = path.dirname(fileURLToPath(import.meta.url));

function verifyHipaaReadiness() {
  console.log('🚀 HIPAA readiness gate (wiring verification — NOT a compliance certification)...');

  const cfgPath = path.join(thisDir, '../hipaa/mockConfig.json');
  if (!fs.existsSync(cfgPath)) {
    console.error('❌ FAILURE: server/hipaa/mockConfig.json is missing.');
    process.exit(1);
  }
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  if (!cfg.mockExecutionEnvironment) {
    console.error('❌ FAILURE: mockExecutionEnvironment flag not set.');
    process.exit(1);
  }

  // Real static check: the files that implement each wired control must exist.
  const required: Record<string, string> = {
    auditLogger: '../hipaa/auditLogger.ts',
    rbac: '../hipaa/rbac.ts',
    tenantIsolationRules: '../../supabase/migrations/0002_enterprise.sql',
    outputValidation: '../defense/outputValidator.ts',
    inputFilter: '../defense/inputFilter.ts',
  };
  const missing: string[] = [];
  for (const [name, rel] of Object.entries(required)) {
    if (!fs.existsSync(path.join(thisDir, rel))) missing.push(`${name} (${rel})`);
  }
  if (missing.length > 0) {
    console.error(`❌ FAILURE: control wiring missing: ${missing.join(', ')}`);
    process.exit(1);
  }

  const outstanding = Object.entries(cfg.humanOrInfraRequired || {}).map(([k]) => k);

  console.log('🟢 HIPAA WIRING CHECK PASSED — controls are wired in code.');
  console.log('⚠️  NOT compliance evidence. Outstanding human/infra controls (must be completed off-code):');
  for (const item of outstanding) console.log(`     • ${item}: ${cfg.humanOrInfraRequired[item]}`);
  process.exit(0);
}

verifyHipaaReadiness();
