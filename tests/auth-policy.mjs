import assert from 'node:assert/strict';
import { assertStrongPassword, isStrongPassword, passwordRequirements } from '../src/utils/passwordPolicy.ts';
import { canAccessRoles } from '../src/utils/accessPolicy.ts';

for (const password of ['123456', '123456789012', 'somenteletras', 'SOMENTELETRAS', 'SemNumeroAqui!', 'SemSimbolo123', 'semmaiuscula1!', 'SEMMINUSCULA1!', 'Curta1!']) {
  assert.equal(isStrongPassword(password), false, 'weak passwords must be rejected');
  assert.throws(() => assertStrongPassword(password), /8 caracteres/);
}
for (const password of ['UmaFraseLonga9!', 'Outra frase forte 7#', 'Abcdef1!']) {
  assert.equal(isStrongPassword(password), true);
  assert.doesNotThrow(() => assertStrongPassword(password));
}
assert.equal(passwordRequirements('            ').filter(rule => rule.met).length, 1, 'spaces do not count as symbols');
assert.equal(isStrongPassword('Abcdefghij1é'), false, 'accented letters do not replace the symbol required by Supabase');
assert.equal(isStrongPassword('Abcde1!'), false, 'seven characters remain too short even with all required character types');
assert.equal(isStrongPassword('Abcdef1!'), true, 'eight characters are accepted when all requirements are met');
assert.equal(canAccessRoles('candidato', false, ['empresa']), false);
assert.equal(canAccessRoles('empresa', false, ['candidato']), false);
assert.equal(canAccessRoles(null, false, ['empresa']), false, 'unresolved roles must not gain access');
assert.equal(canAccessRoles('admin', false, ['admin']), false, 'the profile role alone cannot grant administrator access');
assert.equal(canAccessRoles('candidato', false, ['admin']), false);
assert.equal(canAccessRoles('empresa', false, ['empresa']), true);
assert.equal(canAccessRoles('candidato', false, ['candidato']), true);
assert.equal(canAccessRoles('candidato', true, ['admin']), true, 'confirmed administration membership is authoritative');
assert.equal(canAccessRoles(null, false), true, 'shared authenticated pages do not require a specific role');
console.log('PASS: password requirements and account role restrictions.');
