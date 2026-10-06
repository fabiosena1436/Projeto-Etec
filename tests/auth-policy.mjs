import assert from 'node:assert/strict';
import { assertStrongPassword, isStrongPassword, passwordRequirements } from '../src/utils/passwordPolicy.ts';
import { changeAccountPassword } from '../src/utils/changeAccountPassword.ts';
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

const authUser={id:'account-1',email:'account@example.com'};
function passwordClient(options={}) {
  const calls=[];
  return {calls,
    async getUser(){calls.push('user');return {data:{user:options.user??authUser},error:options.expired?{message:'expired'}:null};},
    async signInWithPassword(input){calls.push('verify');assert.equal(input.email,authUser.email);return {data:{user:options.verifiedUser??authUser,session:options.noSession?null:{user:authUser}},error:options.invalid?{code:'invalid_credentials',message:'Invalid login credentials'}:null};},
    async updateUser(input){calls.push('update');assert.equal(input.current_password,'123456');assert.equal(input.password,'Abcdef1!');return {error:options.updateError?{message:'Server refused change'}:null};}
  };
}
const valid=passwordClient();
await changeAccountPassword(valid,authUser.id,'123456','Abcdef1!');
assert.deepEqual(valid.calls,['user','verify','update'],'legacy weak current password may be upgraded only after verification');
for(const options of [{invalid:true},{expired:true},{user:{id:'another',email:authUser.email}},{verifiedUser:{id:'another',email:authUser.email}},{noSession:true}]) {
  const client=passwordClient(options);
  await assert.rejects(changeAccountPassword(client,authUser.id,'123456','Abcdef1!'));
  assert.equal(client.calls.includes('update'),false,'failed session/current password verification must never update a password');
}
const weak=passwordClient();await assert.rejects(changeAccountPassword(weak,authUser.id,'123456','short'),/8 caracteres/);assert.equal(weak.calls.length,0);
const reused=passwordClient();await assert.rejects(changeAccountPassword(reused,authUser.id,'Abcdef1!','Abcdef1!'),/diferente/);assert.equal(reused.calls.length,0);
const missing=passwordClient();await assert.rejects(changeAccountPassword(missing,authUser.id,'','Abcdef1!'),/senha atual/);assert.equal(missing.calls.length,0);
await assert.rejects(changeAccountPassword(passwordClient({updateError:true}),authUser.id,'123456','Abcdef1!'),/Server refused/,'server rejection must not be reported as success');
console.log('PASS: password requirements, account role restrictions and verified password change.');
