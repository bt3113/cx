import sharp from 'sharp';
const D='/tmp/claude-0/-home-user-ms/95cd0512-5894-5540-a425-6b434e98f9ab/scratchpad';
async function main(){
  const p = await sharp('public/media/portrait/alex-den.png').resize({height:600}).png().toBuffer();
  const m = await sharp(p).metadata();
  // check over a mid-grey so any residual background box is obvious
  await sharp({create:{width:(m.width??300)+160,height:640,channels:4,background:'#3a3a44'}})
    .composite([{input:p,left:80,top:20}]).png().toFile(`${D}/v-portrait.png`);
  console.log('ok');
}
main().catch(e=>{console.error(e);process.exit(1);});
